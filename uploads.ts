import { Router, Request, Response } from 'express';
import path from 'path';
import { db } from '../db.js';
import { requireAuth, sanitizeUser, AuthenticatedRequest } from '../auth.js';
import { storageService } from '../services/storageService.js';

export const uploadsRouter = Router();

// Helper to convert base64 or data URI to Buffer
function parseBase64Image(dataString: string): { buffer: Buffer; mimeType: string } {
  if (!dataString || typeof dataString !== 'string') {
    throw new Error('No image data provided');
  }

  const matches = dataString.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    return { buffer, mimeType };
  }

  // Raw base64 string
  try {
    const buffer = Buffer.from(dataString, 'base64');
    return { buffer, mimeType: '' };
  } catch {
    throw new Error('Failed to parse base64 image payload');
  }
}

// 1. Upload/Update Student Avatar (Authenticated)
uploadsRouter.post('/avatar', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { image, avatarVisibility } = req.body;

    if (!image) {
      res.status(400).json({ error: 'Image data is required (JPEG, PNG, or WebP up to 5 MB)' });
      return;
    }

    const { buffer, mimeType } = parseBase64Image(image);

    // Save avatar securely with storage service
    const savedMeta = await storageService.saveAvatar(
      buffer,
      mimeType,
      `stu_${user.studentId.replace(/[^a-zA-Z0-9]/g, '')}`
    );

    // Delete old custom uploaded avatar if it was stored locally
    if (user.avatarUrl && user.avatarUrl.startsWith('/api/uploads/avatars/')) {
      await storageService.deleteAvatarByUrl(user.avatarUrl);
    }

    user.avatarUrl = savedMeta.fileUrl;
    if (avatarVisibility && ['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE'].includes(avatarVisibility)) {
      user.avatarVisibility = avatarVisibility;
    }
    user.updatedAt = new Date().toISOString();
    db.save();

    res.json({
      success: true,
      message: 'Profile photo updated successfully',
      avatarUrl: savedMeta.fileUrl,
      user: sanitizeUser(user, true),
      metadata: {
        size: savedMeta.size,
        mimeType: savedMeta.mimeType,
        uploadedAt: savedMeta.uploadedAt
      }
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    res.status(400).json({ error: error.message || 'Failed to upload profile photo' });
  }
});

// 2. Remove Student Avatar (Authenticated)
uploadsRouter.delete('/avatar', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    if (user.avatarUrl && user.avatarUrl.startsWith('/api/uploads/avatars/')) {
      await storageService.deleteAvatarByUrl(user.avatarUrl);
    }

    user.avatarUrl = '';
    user.updatedAt = new Date().toISOString();
    db.save();

    res.json({
      success: true,
      message: 'Profile photo removed successfully',
      user: sanitizeUser(user, true)
    });
  } catch (error: any) {
    console.error('Avatar removal error:', error);
    res.status(500).json({ error: 'Failed to remove profile photo' });
  }
});

// 3. Upload/Update Founder Profile Photo
uploadsRouter.post('/founder', async (req: Request, res: Response): Promise<void> => {
  try {
    const { image } = req.body;

    if (!image) {
      res.status(400).json({ error: 'Image data is required (JPEG, PNG, or WebP up to 5 MB)' });
      return;
    }

    const { buffer, mimeType } = parseBase64Image(image);

    // Save avatar securely with storage service
    const savedMeta = await storageService.saveAvatar(
      buffer,
      mimeType,
      'founder_hansana'
    );

    // Delete old founder photo if stored locally
    const currentConfig = db.founderConfig;
    if (currentConfig?.photoUrl && currentConfig.photoUrl.startsWith('/api/uploads/avatars/')) {
      await storageService.deleteAvatarByUrl(currentConfig.photoUrl);
    }

    db.setFounderConfig({
      photoUrl: savedMeta.fileUrl,
      updatedAt: new Date().toISOString(),
      updatedBy: 'G. Yuwan Senithu Hansana'
    });

    res.json({
      success: true,
      message: 'Founder profile photo updated successfully',
      photoUrl: savedMeta.fileUrl,
      metadata: {
        size: savedMeta.size,
        mimeType: savedMeta.mimeType,
        uploadedAt: savedMeta.uploadedAt
      }
    });
  } catch (error: any) {
    console.error('Founder photo upload error:', error);
    res.status(400).json({ error: error.message || 'Failed to upload founder photo' });
  }
});

// 4. Remove Founder Profile Photo
uploadsRouter.delete('/founder', async (req: Request, res: Response): Promise<void> => {
  try {
    const currentConfig = db.founderConfig;
    if (currentConfig?.photoUrl && currentConfig.photoUrl.startsWith('/api/uploads/avatars/')) {
      await storageService.deleteAvatarByUrl(currentConfig.photoUrl);
    }

    db.setFounderConfig({
      photoUrl: '',
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Founder profile photo removed successfully'
    });
  } catch (error: any) {
    console.error('Founder photo removal error:', error);
    res.status(500).json({ error: 'Failed to remove founder photo' });
  }
});

// 5. Get Founder Info & Dynamic Photo
uploadsRouter.get('/founder', (req: Request, res: Response): void => {
  try {
    res.json({
      founderConfig: db.founderConfig
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve founder configuration' });
  }
});

// 6. Secure Image Streaming / Serving Endpoint
uploadsRouter.get('/avatars/:filename', (req: Request, res: Response): void => {
  try {
    const { filename } = req.params;
    const fileInfo = storageService.getAvatarPath(filename);

    if (!fileInfo) {
      res.status(404).json({ error: 'Image not found or invalid' });
      return;
    }

    // Secure HTTP response headers
    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    res.sendFile(fileInfo.filePath);
  } catch (error) {
    console.error('File serving error:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});
