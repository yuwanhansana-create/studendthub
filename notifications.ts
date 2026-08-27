import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';

export const notificationsRouter = Router();

// 1. Get Notifications
notificationsRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const notifs = db.notifications
      .filter(n => n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = notifs.filter(n => !n.isRead).length;

    res.json({
      notifications: notifs,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// 2. Mark Single Notification as Read
notificationsRouter.put('/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const notif = db.notifications.find(n => n.id === id && n.userId === user.id);
    if (notif) {
      notif.isRead = true;
      db.save();
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// 3. Mark All Notifications as Read
notificationsRouter.post('/read-all', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const userNotifs = db.notifications.filter(n => n.userId === user.id);

    for (const n of userNotifs) {
      n.isRead = true;
    }
    db.save();

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// 4. Delete Notification
notificationsRouter.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const index = db.notifications.findIndex(n => n.id === id && n.userId === user.id);
    if (index !== -1) {
      db.notifications.splice(index, 1);
      db.save();
    }

    res.json({ message: 'Notification removed' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});
