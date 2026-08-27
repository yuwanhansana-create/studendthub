import { Router, Response } from 'express';
import { db, NewsArticleRecord } from '../db.js';
import { requireAdmin, sanitizeUser, AuthenticatedRequest } from '../auth.js';

export const adminRouter = Router();

// 1. Dashboard Metrics
adminRouter.get('/metrics', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const totalStudents = db.users.filter(u => u.role === 'STUDENT').length;
    const activeStudents = db.users.filter(u => !u.isSuspended).length;
    const totalPosts = db.posts.length;
    const totalFriendships = Math.floor(db.friendships.length / 2);
    const newsCount = db.news.length;
    const pendingReports = db.reports.filter(r => r.status === 'PENDING').length;
    const totalReports = db.reports.length;

    res.json({
      metrics: {
        totalStudents,
        activeStudents,
        totalPosts,
        totalFriendships,
        newsCount,
        pendingReports,
        totalReports
      }
    });
  } catch (error) {
    console.error('Get admin metrics error:', error);
    res.status(500).json({ error: 'Failed to retrieve admin dashboard metrics' });
  }
});

// 2. User Management: List Users
adminRouter.get('/users', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const search = req.query.q ? String(req.query.q).toLowerCase().trim() : '';

    let users = db.users.map(u => ({
      ...sanitizeUser(u, true),
      email: u.email,
      isSuspended: u.isSuspended,
      role: u.role
    }));

    if (search) {
      users = users.filter(u =>
        u.fullName.toLowerCase().includes(search) ||
        u.username.toLowerCase().includes(search) ||
        u.studentId.toLowerCase().includes(search) ||
        (u.email && u.email.toLowerCase().includes(search)) ||
        (u.school && u.school.toLowerCase().includes(search))
      );
    }

    res.json({ users });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// 3. User Management: Suspend / Restore User
adminRouter.post('/users/:userId/toggle-suspend', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const admin = req.user!;
    const { userId } = req.params;
    const { reason } = req.body;

    const target = db.users.find(u => u.id === userId);
    if (!target) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (target.role === 'ADMIN') {
      res.status(400).json({ error: 'Cannot suspend an administrator account' });
      return;
    }

    target.isSuspended = !target.isSuspended;
    target.updatedAt = new Date().toISOString();

    // Log action
    db.auditLogs.unshift({
      id: db.generateId('log'),
      adminId: admin.id,
      adminName: admin.fullName,
      action: target.isSuspended ? 'SUSPEND_USER' : 'RESTORE_USER',
      target: `User: ${target.fullName} (${target.studentId})`,
      details: reason || (target.isSuspended ? 'Account suspended for policy violations' : 'Account restored'),
      createdAt: new Date().toISOString()
    });

    db.save();

    res.json({
      message: `User ${target.fullName} ${target.isSuspended ? 'suspended' : 'restored'} successfully`,
      isSuspended: target.isSuspended
    });
  } catch (error) {
    console.error('Toggle suspend error:', error);
    res.status(500).json({ error: 'Failed to update user suspension state' });
  }
});

// 4. User Management: Delete User
adminRouter.delete('/users/:userId', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const admin = req.user!;
    const { userId } = req.params;

    const idx = db.users.findIndex(u => u.id === userId);
    if (idx === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const target = db.users[idx];
    if (target.role === 'ADMIN') {
      res.status(400).json({ error: 'Cannot delete an administrator account' });
      return;
    }

    db.users.splice(idx, 1);

    // Clean up posts, friendships, requests
    const remainingPosts = db.posts.filter(p => p.authorId !== userId);
    db.posts.length = 0;
    db.posts.push(...remainingPosts);

    const remainingFriendships = db.friendships.filter(f => f.userId !== userId && f.friendId !== userId);
    db.friendships.length = 0;
    db.friendships.push(...remainingFriendships);

    db.auditLogs.unshift({
      id: db.generateId('log'),
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'DELETE_USER',
      target: `Deleted user: ${target.fullName} (${target.studentId})`,
      createdAt: new Date().toISOString()
    });

    db.save();
    res.json({ message: 'User account and associated content permanently removed' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// 5. News Management: Create Article
adminRouter.post('/news', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const admin = req.user!;
    const { title, summary, content, category, coverImage, source, authorName, isFeatured, isPublished } = req.body;

    if (!title || !summary || !content || !category) {
      res.status(400).json({ error: 'Title, summary, content, and category are required' });
      return;
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const now = new Date().toISOString();
    const newArticle: NewsArticleRecord = {
      id: db.generateId('news'),
      title: title.trim(),
      slug,
      summary: summary.trim(),
      content: content.trim(),
      category: category.trim(),
      coverImage: coverImage && coverImage.startsWith('http')
        ? coverImage
        : 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
      source: source ? source.trim() : 'StudentHub News Desk',
      authorName: authorName ? authorName.trim() : admin.fullName,
      isFeatured: Boolean(isFeatured),
      isPublished: isPublished !== false,
      publishedAt: now,
      createdAt: now,
      updatedAt: now
    };

    db.news.unshift(newArticle);

    // Audit log
    db.auditLogs.unshift({
      id: db.generateId('log'),
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'CREATE_NEWS',
      target: `News Article: "${newArticle.title}"`,
      createdAt: now
    });

    db.save();
    res.status(201).json({ message: 'News article published', article: newArticle });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ error: 'Failed to create news article' });
  }
});

// 6. News Management: Update Article
adminRouter.put('/news/:newsId', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const admin = req.user!;
    const { newsId } = req.params;
    const { title, summary, content, category, coverImage, source, authorName, isFeatured, isPublished } = req.body;

    const article = db.news.find(a => a.id === newsId);
    if (!article) {
      res.status(404).json({ error: 'News article not found' });
      return;
    }

    if (title) article.title = title.trim();
    if (summary) article.summary = summary.trim();
    if (content) article.content = content.trim();
    if (category) article.category = category.trim();
    if (coverImage) article.coverImage = coverImage;
    if (source) article.source = source.trim();
    if (authorName) article.authorName = authorName.trim();
    if (isFeatured !== undefined) article.isFeatured = Boolean(isFeatured);
    if (isPublished !== undefined) article.isPublished = Boolean(isPublished);
    article.updatedAt = new Date().toISOString();

    db.auditLogs.unshift({
      id: db.generateId('log'),
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'UPDATE_NEWS',
      target: `News Article: "${article.title}"`,
      createdAt: new Date().toISOString()
    });

    db.save();
    res.json({ message: 'News article updated', article });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({ error: 'Failed to update news article' });
  }
});

// 7. News Management: Delete Article
adminRouter.delete('/news/:newsId', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const admin = req.user!;
    const { newsId } = req.params;

    const idx = db.news.findIndex(a => a.id === newsId);
    if (idx === -1) {
      res.status(404).json({ error: 'News article not found' });
      return;
    }

    const deleted = db.news.splice(idx, 1)[0];

    db.auditLogs.unshift({
      id: db.generateId('log'),
      adminId: admin.id,
      adminName: admin.fullName,
      action: 'DELETE_NEWS',
      target: `Deleted article: "${deleted.title}"`,
      createdAt: new Date().toISOString()
    });

    db.save();
    res.json({ message: 'News article deleted' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: 'Failed to delete news article' });
  }
});

// 8. Moderation: List Reports
adminRouter.get('/reports', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const status = req.query.status ? String(req.query.status) : undefined;

    let reports = [...db.reports];
    if (status && status !== 'ALL') {
      reports = reports.filter(r => r.status === status);
    }

    reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const formatted = reports.map(rep => {
      const reporter = db.users.find(u => u.id === rep.reporterId);
      const reportedUser = rep.reportedUserId ? db.users.find(u => u.id === rep.reportedUserId) : null;
      const post = rep.postId ? db.posts.find(p => p.id === rep.postId) : null;

      return {
        ...rep,
        reporter: reporter ? sanitizeUser(reporter, false) : null,
        reportedUser: reportedUser ? sanitizeUser(reportedUser, false) : null,
        postContent: post ? post.content : null
      };
    });

    res.json({ reports: formatted });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to retrieve reports' });
  }
});

// 9. Moderation: Take Action on Report
adminRouter.post('/reports/:reportId/action', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const admin = req.user!;
    const { reportId } = req.params;
    const { action, resolutionNotes } = req.body; // 'DISMISS', 'DELETE_POST', 'SUSPEND_USER'

    const report = db.reports.find(r => r.id === reportId);
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    if (action === 'DELETE_POST' && report.postId) {
      const postIdx = db.posts.findIndex(p => p.id === report.postId);
      if (postIdx !== -1) {
        db.posts.splice(postIdx, 1);
      }
      report.status = 'RESOLVED';
      report.actionTaken = `Post deleted by admin ${admin.fullName}. Note: ${resolutionNotes || 'Violated community guidelines'}`;
    } else if (action === 'SUSPEND_USER' && report.reportedUserId) {
      const user = db.users.find(u => u.id === report.reportedUserId);
      if (user) {
        user.isSuspended = true;
      }
      report.status = 'RESOLVED';
      report.actionTaken = `User suspended by admin ${admin.fullName}. Note: ${resolutionNotes || 'Severe policy violation'}`;
    } else if (action === 'DISMISS') {
      report.status = 'DISMISSED';
      report.actionTaken = `Dismissed after review by admin ${admin.fullName}. Note: ${resolutionNotes || 'No violation found'}`;
    } else {
      report.status = 'REVIEWED';
      report.actionTaken = resolutionNotes || 'Reviewed';
    }

    report.updatedAt = new Date().toISOString();

    db.auditLogs.unshift({
      id: db.generateId('log'),
      adminId: admin.id,
      adminName: admin.fullName,
      action: `MODERATION_${action}`,
      target: `Report ID: ${report.id} (${report.targetType})`,
      details: resolutionNotes || `Action: ${action}`,
      createdAt: new Date().toISOString()
    });

    db.save();
    res.json({ message: 'Moderation action applied successfully', report });
  } catch (error) {
    console.error('Moderation action error:', error);
    res.status(500).json({ error: 'Failed to apply moderation action' });
  }
});

// 10. Audit Logs
adminRouter.get('/audit-logs', requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const logs = [...db.auditLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ logs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});
