import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, sanitizeUser, AuthenticatedRequest } from '../auth.js';

export const messagesRouter = Router();

// 1. Get User's Conversations
messagesRouter.get('/conversations', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;

    // Find conversations where user is a participant
    const userConvs = db.conversations.filter(c => c.participantIds.includes(user.id));

    // Sort by recent activity
    userConvs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const result = userConvs.map(conv => {
      const otherUserId = conv.participantIds.find(id => id !== user.id);
      const otherUser = db.users.find(u => u.id === otherUserId);

      // Check if blocked
      const isBlocked = otherUserId ? db.blocks.some(b => 
        (b.userId === user.id && b.blockedUserId === otherUserId) ||
        (b.userId === otherUserId && b.blockedUserId === user.id)
      ) : false;

      // Messages
      const convMessages = db.messages.filter(m => m.conversationId === conv.id);
      const lastMessage = convMessages.length > 0 ? convMessages[convMessages.length - 1] : null;
      const unreadCount = convMessages.filter(m => m.senderId !== user.id && !m.isRead).length;

      return {
        id: conv.id,
        otherUser: otherUser ? sanitizeUser(otherUser, true) : null,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          isMine: lastMessage.senderId === user.id
        } : null,
        unreadCount,
        isBlocked,
        updatedAt: conv.updatedAt
      };
    }).filter(c => c.otherUser !== null);

    res.json({ conversations: result });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
});

// 2. Open or Create Conversation with Friend
messagesRouter.post('/start/:targetUserId', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { targetUserId } = req.params;

    if (user.id === targetUserId) {
      res.status(400).json({ error: 'Cannot message yourself' });
      return;
    }

    const targetUser = db.users.find(u => u.id === targetUserId || u.studentId === targetUserId);
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check block
    const isBlocked = db.blocks.some(b => 
      (b.userId === user.id && b.blockedUserId === targetUser.id) ||
      (b.userId === targetUser.id && b.blockedUserId === user.id)
    );
    if (isBlocked) {
      res.status(403).json({ error: 'Messaging is disabled with this user' });
      return;
    }

    // Check friendship or messaging settings
    const isFriend = db.friendships.some(f => f.userId === user.id && f.friendId === targetUser.id);
    if (targetUser.allowMessagesFrom === 'FRIENDS_ONLY' && !isFriend && user.role !== 'ADMIN') {
      res.status(403).json({ error: 'This student only allows messages from confirmed friends' });
      return;
    }

    // Find existing conversation
    let conv = db.conversations.find(c => 
      c.participantIds.includes(user.id) && c.participantIds.includes(targetUser.id)
    );

    if (!conv) {
      const now = new Date().toISOString();
      conv = {
        id: db.generateId('conv'),
        participantIds: [user.id, targetUser.id],
        createdAt: now,
        updatedAt: now
      };
      db.conversations.unshift(conv);
      db.save();
    }

    res.json({ conversationId: conv.id });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ error: 'Failed to open conversation' });
  }
});

// 3. Get Messages in a Conversation
messagesRouter.get('/:conversationId', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { conversationId } = req.params;

    const conv = db.conversations.find(c => c.id === conversationId && c.participantIds.includes(user.id));
    if (!conv) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const otherUserId = conv.participantIds.find(id => id !== user.id);
    const otherUser = db.users.find(u => u.id === otherUserId);

    const isBlocked = otherUserId ? db.blocks.some(b => 
      (b.userId === user.id && b.blockedUserId === otherUserId) ||
      (b.userId === otherUserId && b.blockedUserId === user.id)
    ) : false;

    // Fetch and mark unread messages as read
    const messages = db.messages.filter(m => m.conversationId === conversationId);
    for (const msg of messages) {
      if (msg.senderId !== user.id && !msg.isRead) {
        msg.isRead = true;
      }
    }
    db.save();

    res.json({
      conversationId: conv.id,
      otherUser: otherUser ? sanitizeUser(otherUser, true) : null,
      isBlocked,
      messages: messages.map(m => ({
        id: m.id,
        senderId: m.senderId,
        content: m.content,
        mediaUrl: m.mediaUrl,
        isRead: m.isRead,
        createdAt: m.createdAt,
        isMine: m.senderId === user.id
      }))
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// 4. Send Message
messagesRouter.post('/:conversationId', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { conversationId } = req.params;
    const { content, mediaUrl } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'Message cannot be empty' });
      return;
    }

    const conv = db.conversations.find(c => c.id === conversationId && c.participantIds.includes(user.id));
    if (!conv) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const otherUserId = conv.participantIds.find(id => id !== user.id);
    if (!otherUserId) {
      res.status(400).json({ error: 'Recipient unavailable' });
      return;
    }

    // Check if blocked
    const isBlocked = db.blocks.some(b => 
      (b.userId === user.id && b.blockedUserId === otherUserId) ||
      (b.userId === otherUserId && b.blockedUserId === user.id)
    );
    if (isBlocked) {
      res.status(403).json({ error: 'Cannot send message to this user' });
      return;
    }

    const now = new Date().toISOString();
    const newMessage = {
      id: db.generateId('msg'),
      conversationId,
      senderId: user.id,
      content: content.trim(),
      mediaUrl: mediaUrl || undefined,
      isRead: false,
      createdAt: now
    };

    db.messages.push(newMessage);
    conv.updatedAt = now;

    // Send notification to recipient
    db.notifications.push({
      id: db.generateId('notif'),
      userId: otherUserId,
      actorId: user.id,
      type: 'MESSAGE',
      title: `Message from ${user.fullName}`,
      message: `${user.fullName}: "${content.trim().slice(0, 40)}..."`,
      link: `/messages?conv=${conversationId}`,
      isRead: false,
      createdAt: now
    });

    db.save();

    res.status(201).json({
      message: {
        id: newMessage.id,
        senderId: newMessage.senderId,
        content: newMessage.content,
        mediaUrl: newMessage.mediaUrl,
        isRead: newMessage.isRead,
        createdAt: newMessage.createdAt,
        isMine: true
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});
