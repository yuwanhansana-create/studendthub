import express from 'express';
import { seedDatabaseIfEmpty } from './seed.js';
import { dailyNewsService } from './services/dailyNewsService.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { friendsRouter } from './routes/friends.js';
import { postsRouter } from './routes/posts.js';
import { messagesRouter } from './routes/messages.js';
import { notificationsRouter } from './routes/notifications.js';
import { newsRouter } from './routes/news.js';
import { aiRouter } from './routes/ai.js';
import { adminRouter } from './routes/admin.js';
import { uploadsRouter } from './routes/uploads.js';

export function createServerApp() {
  const app = express();

  // Basic security and parsing middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Seed data on startup
  seedDatabaseIfEmpty().then(() => {
    // Start automated daily news updater
    dailyNewsService.startAutoUpdateSchedule(12);
  }).catch(err => {
    console.error('Database seed error:', err);
    dailyNewsService.startAutoUpdateSchedule(12);
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'StudentHub Core API', timestamp: new Date().toISOString() });
  });

  // Mount API routers
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/friends', friendsRouter);
  app.use('/api/posts', postsRouter);
  app.use('/api/messages', messagesRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/news', newsRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/uploads', uploadsRouter);

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found` });
  });

  return app;
}
