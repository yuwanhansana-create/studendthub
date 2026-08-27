import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, sanitizeUser, AuthenticatedRequest } from '../auth.js';

export const friendsRouter = Router();

// 1. Get My Friends List
friendsRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const friendships = db.friendships.filter(f => f.userId === user.id);
    const friendIds = friendships.map(f => f.friendId);

    const friends = db.users
      .filter(u => friendIds.includes(u.id) && !u.isSuspended)
      .map(friend => ({
        ...sanitizeUser(friend, true),
        friendshipSince: friendships.find(f => f.friendId === friend.id)?.createdAt
      }));

    res.json({ friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Failed to retrieve friends list' });
  }
});

// 2. Get Pending Requests (Received and Sent)
friendsRouter.get('/requests', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;

    // Received requests
    const received = db.friendRequests
      .filter(r => r.receiverId === user.id && r.status === 'PENDING')
      .map(r => {
        const sender = db.users.find(u => u.id === r.senderId);
        return {
          id: r.id,
          createdAt: r.createdAt,
          sender: sender ? sanitizeUser(sender, false) : null
        };
      })
      .filter(r => r.sender !== null);

    // Sent requests
    const sent = db.friendRequests
      .filter(r => r.senderId === user.id && r.status === 'PENDING')
      .map(r => {
        const receiver = db.users.find(u => u.id === r.receiverId);
        return {
          id: r.id,
          createdAt: r.createdAt,
          receiver: receiver ? sanitizeUser(receiver, false) : null
        };
      })
      .filter(r => r.receiver !== null);

    res.json({ received, sent, receivedRequests: received, sentRequests: sent });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to retrieve friend requests' });
  }
});

// 3. Send Friend Request
friendsRouter.post('/request/:targetId', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { targetId } = req.params;

    if (user.id === targetId) {
      res.status(400).json({ error: 'You cannot send a friend request to yourself' });
      return;
    }

    const targetUser = db.users.find(u => u.id === targetId || u.studentId === targetId);
    if (!targetUser) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    if (targetUser.isSuspended) {
      res.status(400).json({ error: 'Cannot send request to suspended account' });
      return;
    }

    // Check if blocked either way
    const isBlocked = db.blocks.some(b => 
      (b.userId === user.id && b.blockedUserId === targetUser.id) ||
      (b.userId === targetUser.id && b.blockedUserId === user.id)
    );
    if (isBlocked) {
      res.status(403).json({ error: 'Unable to send friend request to this user' });
      return;
    }

    // Check privacy settings
    if (targetUser.allowRequestsFrom === 'PRIVATE') {
      res.status(403).json({ error: 'This student has disabled new friend requests' });
      return;
    }

    // Check if already friends
    const alreadyFriends = db.friendships.some(f => f.userId === user.id && f.friendId === targetUser.id);
    if (alreadyFriends) {
      res.status(400).json({ error: 'You are already friends with this student' });
      return;
    }

    // Check if pending request exists
    const existingReq = db.friendRequests.find(r =>
      ((r.senderId === user.id && r.receiverId === targetUser.id) ||
       (r.senderId === targetUser.id && r.receiverId === user.id)) &&
      r.status === 'PENDING'
    );

    if (existingReq) {
      if (existingReq.senderId === user.id) {
        res.status(400).json({ error: 'Friend request already sent' });
        return;
      } else {
        // Reverse request exists: automatically accept!
        existingReq.status = 'ACCEPTED';
        existingReq.updatedAt = new Date().toISOString();

        db.friendships.push({
          id: db.generateId('fr'),
          userId: user.id,
          friendId: targetUser.id,
          createdAt: new Date().toISOString()
        });
        db.friendships.push({
          id: db.generateId('fr'),
          userId: targetUser.id,
          friendId: user.id,
          createdAt: new Date().toISOString()
        });

        // Notify target
        db.notifications.push({
          id: db.generateId('notif'),
          userId: targetUser.id,
          actorId: user.id,
          type: 'FRIEND_ACCEPTED',
          title: 'Friend Request Accepted',
          message: `${user.fullName} (${user.studentId}) is now your friend!`,
          link: `/profile/${user.studentId}`,
          isRead: false,
          createdAt: new Date().toISOString()
        });

        db.save();
        res.json({ message: `Connected with ${targetUser.fullName}! You are now friends.`, isFriendsNow: true });
        return;
      }
    }

    // Create new friend request
    const now = new Date().toISOString();
    db.friendRequests.push({
      id: db.generateId('freq'),
      senderId: user.id,
      receiverId: targetUser.id,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now
    });

    // Notify target user
    db.notifications.push({
      id: db.generateId('notif'),
      userId: targetUser.id,
      actorId: user.id,
      type: 'FRIEND_REQUEST',
      title: 'New Friend Request',
      message: `${user.fullName} (${user.studentId}) sent you a friend request.`,
      link: '/friends?tab=requests',
      isRead: false,
      createdAt: now
    });

    db.save();
    res.json({ message: `Friend request sent to ${targetUser.fullName}` });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// 4. Accept Friend Request
friendsRouter.post('/accept/:requestId', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { requestId } = req.params;

    const request = db.friendRequests.find(r => r.id === requestId && r.receiverId === user.id && r.status === 'PENDING');
    if (!request) {
      res.status(404).json({ error: 'Friend request not found or already processed' });
      return;
    }

    const sender = db.users.find(u => u.id === request.senderId);
    if (!sender) {
      res.status(404).json({ error: 'Sender user record not found' });
      return;
    }

    request.status = 'ACCEPTED';
    request.updatedAt = new Date().toISOString();

    // Create 2-way friendship
    const now = new Date().toISOString();
    if (!db.friendships.some(f => f.userId === user.id && f.friendId === sender.id)) {
      db.friendships.push({
        id: db.generateId('fr'),
        userId: user.id,
        friendId: sender.id,
        createdAt: now
      });
    }
    if (!db.friendships.some(f => f.userId === sender.id && f.friendId === user.id)) {
      db.friendships.push({
        id: db.generateId('fr'),
        userId: sender.id,
        friendId: user.id,
        createdAt: now
      });
    }

    // Send notification to sender
    db.notifications.push({
      id: db.generateId('notif'),
      userId: sender.id,
      actorId: user.id,
      type: 'FRIEND_ACCEPTED',
      title: 'Friend Request Accepted',
      message: `${user.fullName} (${user.studentId}) accepted your friend request.`,
      link: `/profile/${user.studentId}`,
      isRead: false,
      createdAt: now
    });

    db.save();
    res.json({ message: `Accepted friend request from ${sender.fullName}` });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

// 5. Reject Friend Request
friendsRouter.post('/reject/:requestId', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { requestId } = req.params;

    const request = db.friendRequests.find(r => r.id === requestId && r.receiverId === user.id && r.status === 'PENDING');
    if (!request) {
      res.status(404).json({ error: 'Friend request not found' });
      return;
    }

    request.status = 'REJECTED';
    request.updatedAt = new Date().toISOString();
    db.save();

    res.json({ message: 'Friend request declined' });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ error: 'Failed to decline friend request' });
  }
});

// 6. Cancel Sent Request
friendsRouter.post('/cancel/:targetId', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { targetId } = req.params;

    const targetUser = db.users.find(u => u.id === targetId || u.studentId.toUpperCase() === targetId.toUpperCase());
    const resolvedTargetId = targetUser ? targetUser.id : targetId;

    const request = db.friendRequests.find(r => 
      r.senderId === user.id && 
      (r.receiverId === resolvedTargetId || r.receiverId === targetId || r.id === targetId) && 
      r.status === 'PENDING'
    );

    if (!request) {
      res.status(404).json({ error: 'Pending request not found' });
      return;
    }

    request.status = 'CANCELLED';
    request.updatedAt = new Date().toISOString();
    db.save();

    res.json({ message: 'Friend request cancelled' });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ error: 'Failed to cancel friend request' });
  }
});

// 7. Remove Friend
friendsRouter.delete('/:targetId', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { targetId } = req.params;

    const targetUser = db.users.find(u => u.id === targetId || u.studentId.toUpperCase() === targetId.toUpperCase());
    const resolvedTargetId = targetUser ? targetUser.id : targetId;

    const idx1 = db.friendships.findIndex(f => f.userId === user.id && f.friendId === resolvedTargetId);
    if (idx1 !== -1) db.friendships.splice(idx1, 1);

    const idx2 = db.friendships.findIndex(f => f.userId === resolvedTargetId && f.friendId === user.id);
    if (idx2 !== -1) db.friendships.splice(idx2, 1);

    db.save();
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

// 8. List Blocked Users
friendsRouter.get('/blocked', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const blockRecords = db.blocks.filter(b => b.userId === user.id);
    const blockedIds = blockRecords.map(b => b.blockedUserId);

    const blockedUsers = db.users
      .filter(u => blockedIds.includes(u.id))
      .map(u => ({
        id: u.id,
        fullName: u.fullName,
        username: u.username,
        studentId: u.studentId,
        avatarUrl: u.avatarUrl
      }));

    res.json({ blockedUsers });
  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ error: 'Failed to retrieve blocked users' });
  }
});
