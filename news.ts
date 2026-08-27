import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../auth.js';
import { dailyNewsService } from '../services/dailyNewsService.js';

export const newsRouter = Router();

export const EDUCATION_CATEGORIES = [
  'School Updates',
  'Examinations',
  'Scholarships',
  'Competitions',
  'ICT & Technology',
  'Education Policies',
  'International Education',
  'Student Opportunities'
];

// 1. Get Auto-Update Status
newsRouter.get('/sync-status', (req, res: Response): void => {
  try {
    const status = dailyNewsService.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve sync status' });
  }
});

// 2. Trigger Manual / On-Demand Sync for Daily Sri Lankan Education News
newsRouter.post('/sync', async (req, res: Response): Promise<void> => {
  try {
    const force = req.query.force === 'true' || req.body.force === true;
    const result = await dailyNewsService.runDailyUpdate(force);
    res.json({
      success: true,
      message: result.message,
      count: result.count,
      lastSyncAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Daily news sync error:', error);
    res.status(500).json({ error: 'Failed to synchronize Sri Lanka education news' });
  }
});

// 3. Get News Articles
newsRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const currentUserId = req.user?.id;
    const category = req.query.category ? String(req.query.category) : undefined;
    const search = req.query.q ? String(req.query.q).toLowerCase().trim() : undefined;
    const featuredOnly = req.query.featured === 'true';
    const savedOnly = req.query.saved === 'true';

    let articles = db.news.filter(a => a.isPublished);

    if (savedOnly && currentUserId) {
      const savedIds = db.savedNews.filter(s => s.userId === currentUserId).map(s => s.newsId);
      articles = articles.filter(a => savedIds.includes(a.id));
    }

    if (category && category !== 'All') {
      articles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(search) ||
        a.summary.toLowerCase().includes(search) ||
        a.content.toLowerCase().includes(search) ||
        a.source.toLowerCase().includes(search)
      );
    }

    if (featuredOnly) {
      articles = articles.filter(a => a.isFeatured);
    }

    // Sort newest first
    articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const formatted = articles.map(art => {
      const isSaved = currentUserId ? db.savedNews.some(s => s.userId === currentUserId && s.newsId === art.id) : false;
      return {
        ...art,
        isSaved
      };
    });

    res.json({
      categories: EDUCATION_CATEGORIES,
      articles: formatted
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Failed to retrieve education news' });
  }
});

// 2. Get Article Details
newsRouter.get('/:identifier', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { identifier } = req.params;
    const currentUserId = req.user?.id;

    const article = db.news.find(a => a.id === identifier || a.slug === identifier);
    if (!article || !article.isPublished) {
      res.status(404).json({ error: 'Article not found or not currently published' });
      return;
    }

    const isSaved = currentUserId ? db.savedNews.some(s => s.userId === currentUserId && s.newsId === article.id) : false;

    // Get related articles in same category
    const related = db.news
      .filter(a => a.id !== article.id && a.isPublished && a.category === article.category)
      .slice(0, 3);

    res.json({
      article: {
        ...article,
        isSaved
      },
      related
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Failed to retrieve article details' });
  }
});

// 3. Toggle Bookmark / Save Article
newsRouter.post('/:newsId/save', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { newsId } = req.params;

    const article = db.news.find(a => a.id === newsId);
    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    const savedIdx = db.savedNews.findIndex(s => s.userId === user.id && s.newsId === newsId);
    let isSavedNow = false;

    if (savedIdx === -1) {
      db.savedNews.push({
        id: db.generateId('sn'),
        userId: user.id,
        newsId,
        createdAt: new Date().toISOString()
      });
      isSavedNow = true;
    } else {
      db.savedNews.splice(savedIdx, 1);
      isSavedNow = false;
    }

    db.save();
    res.json({
      isSaved: isSavedNow,
      message: isSavedNow ? 'Article saved to your reading list' : 'Article removed from saved'
    });
  } catch (error) {
    console.error('Save news error:', error);
    res.status(500).json({ error: 'Failed to update saved news status' });
  }
});
