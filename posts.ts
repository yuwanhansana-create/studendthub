import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, optionalAuth, sanitizeUser, AuthenticatedRequest } from '../auth.js';

export const postsRouter = Router();

// Helper to format post with author and user interactions
function formatPost(post: any, currentUserId?: string) {
  const author = db.users.find(u => u.id === post.authorId);
  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;
  const isSaved = currentUserId ? db.savedPosts.some(s => s.userId === currentUserId && s.postId === post.id) : false;

  const formattedComments = (post.comments || []).map((c: any) => {
    const commentAuthor = db.users.find(u => u.id === c.authorId);
    return {
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      author: commentAuthor ? sanitizeUser(commentAuthor, false) : { id: c.authorId, fullName: 'Student', username: 'student', studentId: 'STU-000000', avatarUrl: '' },
      isOwner: currentUserId === c.authorId
    };
  });

  return {
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    category: post.category || 'General',
    isEdited: post.isEdited || false,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    likesCount: post.likes.length,
    commentsCount: formattedComments.length,
    comments: formattedComments,
    isLiked,
    isSaved,
    isOwner: currentUserId === post.authorId,
    author: author ? sanitizeUser(author, false) : { id: post.authorId, fullName: 'Former Student', username: 'student', studentId: 'STU-000000', avatarUrl: '' }
  };
}

// 1. Get Feed
postsRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const currentUserId = req.user?.id;
    const filter = String(req.query.filter || 'all'); // 'all', 'friends', 'saved', 'user'
    const category = req.query.category ? String(req.query.category) : undefined;
    const authorId = req.query.authorId ? String(req.query.authorId) : undefined;

    let filteredPosts = [...db.posts];

    // Filter out posts from blocked users
    if (currentUserId) {
      const blockedIds = db.blocks
        .filter(b => b.userId === currentUserId || b.blockedUserId === currentUserId)
        .map(b => (b.userId === currentUserId ? b.blockedUserId : b.userId));
      filteredPosts = filteredPosts.filter(p => !blockedIds.includes(p.authorId));
    }

    if (authorId) {
      filteredPosts = filteredPosts.filter(p => p.authorId === authorId);
    } else if (filter === 'friends' && currentUserId) {
      const friendIds = db.friendships.filter(f => f.userId === currentUserId).map(f => f.friendId);
      filteredPosts = filteredPosts.filter(p => friendIds.includes(p.authorId) || p.authorId === currentUserId);
    } else if (filter === 'saved' && currentUserId) {
      const savedIds = db.savedPosts.filter(s => s.userId === currentUserId).map(s => s.postId);
      filteredPosts = filteredPosts.filter(p => savedIds.includes(p.id));
    }

    if (category && category !== 'All') {
      filteredPosts = filteredPosts.filter(p => p.category === category);
    }

    // Sort newest first
    filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const formatted = filteredPosts.map(p => formatPost(p, currentUserId));
    res.json({ posts: formatted });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Failed to retrieve feed' });
  }
});

// 2. Create Post
postsRouter.post('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { content, imageUrl, category } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'Post content cannot be empty' });
      return;
    }

    const now = new Date().toISOString();
    const newPost = {
      id: db.generateId('post'),
      authorId: user.id,
      content: content.trim(),
      imageUrl: imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http') ? imageUrl : undefined,
      category: category && typeof category === 'string' ? category : 'General',
      isEdited: false,
      createdAt: now,
      updatedAt: now,
      likes: [],
      comments: []
    };

    db.posts.unshift(newPost);
    db.save();

    res.status(201).json({
      message: 'Post shared successfully',
      post: formatPost(newPost, user.id)
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// 3. Edit Post
postsRouter.put('/:postId', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { postId } = req.params;
    const { content, category } = req.body;

    const post = db.posts.find(p => p.id === postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (post.authorId !== user.id && user.role !== 'ADMIN') {
      res.status(403).json({ error: 'You do not have permission to edit this post' });
      return;
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'Post content cannot be empty' });
      return;
    }

    post.content = content.trim();
    if (category) post.category = category;
    post.isEdited = true;
    post.updatedAt = new Date().toISOString();

    db.save();
    res.json({ message: 'Post updated', post: formatPost(post, user.id) });
  } catch (error) {
    console.error('Edit post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// 4. Delete Post
postsRouter.delete('/:postId', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { postId } = req.params;

    const index = db.posts.findIndex(p => p.id === postId);
    if (index === -1) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const post = db.posts[index];
    if (post.authorId !== user.id && user.role !== 'ADMIN') {
      res.status(403).json({ error: 'You do not have permission to delete this post' });
      return;
    }

    db.posts.splice(index, 1);
    // Remove saved references
    const savedIdx = db.savedPosts.findIndex(s => s.postId === postId);
    if (savedIdx !== -1) db.savedPosts.splice(savedIdx, 1);

    db.save();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// 5. Toggle Like
postsRouter.post('/:postId/like', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { postId } = req.params;

    const post = db.posts.find(p => p.id === postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const likeIdx = post.likes.indexOf(user.id);
    let isLikedNow = false;

    if (likeIdx === -1) {
      post.likes.push(user.id);
      isLikedNow = true;

      // Notify post author if not self
      if (post.authorId !== user.id) {
        db.notifications.push({
          id: db.generateId('notif'),
          userId: post.authorId,
          actorId: user.id,
          type: 'POST_LIKE',
          title: 'New Like',
          message: `${user.fullName} liked your study post.`,
          link: `/feed#${post.id}`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    } else {
      post.likes.splice(likeIdx, 1);
      isLikedNow = false;
    }

    db.save();
    res.json({
      isLiked: isLikedNow,
      likesCount: post.likes.length
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Failed to update like status' });
  }
});

// 6. Add Comment
postsRouter.post('/:postId/comments', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({ error: 'Comment text cannot be empty' });
      return;
    }

    const post = db.posts.find(p => p.id === postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const now = new Date().toISOString();
    const newComment = {
      id: db.generateId('comm'),
      postId,
      authorId: user.id,
      content: content.trim(),
      createdAt: now,
      updatedAt: now
    };

    if (!post.comments) post.comments = [];
    post.comments.push(newComment);

    // Notify author if not self
    if (post.authorId !== user.id) {
      db.notifications.push({
        id: db.generateId('notif'),
        userId: post.authorId,
        actorId: user.id,
        type: 'POST_COMMENT',
        title: 'New Comment',
        message: `${user.fullName} commented: "${content.trim().slice(0, 45)}..."`,
        link: `/feed#${post.id}`,
        isRead: false,
        createdAt: now
      });
    }

    db.save();

    res.status(201).json({
      comment: {
        id: newComment.id,
        content: newComment.content,
        createdAt: newComment.createdAt,
        author: sanitizeUser(user, false),
        isOwner: true
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// 7. Delete Comment
postsRouter.delete('/:postId/comments/:commentId', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { postId, commentId } = req.params;

    const post = db.posts.find(p => p.id === postId);
    if (!post || !post.comments) {
      res.status(404).json({ error: 'Post or comments not found' });
      return;
    }

    const commIdx = post.comments.findIndex(c => c.id === commentId);
    if (commIdx === -1) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    const comm = post.comments[commIdx];
    if (comm.authorId !== user.id && post.authorId !== user.id && user.role !== 'ADMIN') {
      res.status(403).json({ error: 'You do not have permission to delete this comment' });
      return;
    }

    post.comments.splice(commIdx, 1);
    db.save();

    res.json({ message: 'Comment removed' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// 8. Toggle Save Post
postsRouter.post('/:postId/save', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { postId } = req.params;

    const post = db.posts.find(p => p.id === postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const savedIdx = db.savedPosts.findIndex(s => s.userId === user.id && s.postId === postId);
    let isSavedNow = false;

    if (savedIdx === -1) {
      db.savedPosts.push({
        id: db.generateId('sp'),
        userId: user.id,
        postId,
        createdAt: new Date().toISOString()
      });
      isSavedNow = true;
    } else {
      db.savedPosts.splice(savedIdx, 1);
      isSavedNow = false;
    }

    db.save();
    res.json({ isSaved: isSavedNow, message: isSavedNow ? 'Post saved to your bookmarks' : 'Post removed from saved' });
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({ error: 'Failed to update saved post status' });
  }
});

// 9. Report Post
postsRouter.post('/:postId/report', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { postId } = req.params;
    const { reason, details } = req.body;

    if (!reason) {
      res.status(400).json({ error: 'Please choose a reason for reporting' });
      return;
    }

    const post = db.posts.find(p => p.id === postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    db.reports.push({
      id: db.generateId('rep'),
      reporterId: user.id,
      targetType: 'POST',
      postId,
      reportedUserId: post.authorId,
      reason,
      details: details || '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    db.save();
    res.json({ message: 'Post reported to moderators. Thank you for keeping StudentHub safe.' });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({ error: 'Failed to submit post report' });
  }
});
