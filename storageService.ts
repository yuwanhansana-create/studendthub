import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface SavedFileMetadata {
  fileName: string;
  fileUrl: string;
  filePath: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

// Storage directory setup
const DATA_DIR = path.resolve(process.cwd(), '.data');
const UPLOADS_DIR = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.join(DATA_DIR, 'uploads', 'avatars');

// Allowed image MIME types and extensions
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

class StorageService {
  private isInitialized = false;

  public init(): void {
    if (this.isInitialized) return;
    try {
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }
      this.isInitialized = true;
    } catch (err) {
      console.error('Failed to initialize uploads directory:', err);
    }
  }

  /**
   * Validate image buffer magic numbers to prevent malicious non-image files
   */
  public detectMimeType(buffer: Buffer): string | null {
    if (!buffer || buffer.length < 12) return null;

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return 'image/png';
    }

    // WebP: RIFF ... WEBP
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return 'image/webp';
    }

    return null;
  }

  /**
   * Save an avatar image buffer securely
   */
  public async saveAvatar(
    buffer: Buffer,
    originalMime: string = '',
    prefix: string = 'avatar'
  ): Promise<SavedFileMetadata> {
    this.init();

    // 1. File Size Check
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File exceeds the maximum allowed size of 5 MB (size: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
    }

    if (buffer.length < 100) {
      throw new Error('Invalid or corrupted image file');
    }

    // 2. Strict Magic Number Content Inspection
    const detectedMime = this.detectMimeType(buffer);
    if (!detectedMime || !ALLOWED_MIME_TYPES.has(detectedMime)) {
      throw new Error('Unsupported or invalid image format. Only JPEG, PNG, and WebP images are allowed.');
    }

    // 3. Determine Extension
    let ext = '.webp';
    if (detectedMime === 'image/jpeg') ext = '.jpg';
    else if (detectedMime === 'image/png') ext = '.png';
    else if (detectedMime === 'image/webp') ext = '.webp';

    // 4. Generate Safe Filename (No Path Traversal, Randomized Cryptographic ID)
    const randomHash = crypto.randomBytes(8).toString('hex');
    const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || 'avatar';
    const fileName = `${safePrefix}_${Date.now()}_${randomHash}${ext}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    // 5. Write to Disk
    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/api/uploads/avatars/${fileName}`;

    return {
      fileName,
      fileUrl,
      filePath,
      mimeType: detectedMime,
      size: buffer.length,
      uploadedAt: new Date().toISOString()
    };
  }

  /**
   * Delete an avatar from disk
   */
  public async deleteAvatarByUrl(fileUrl: string): Promise<boolean> {
    try {
      if (!fileUrl || !fileUrl.startsWith('/api/uploads/avatars/')) {
        return false;
      }

      const fileName = path.basename(fileUrl);
      // Prevent path traversal
      if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
        return false;
      }

      const filePath = path.join(UPLOADS_DIR, fileName);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Error deleting avatar file:', err);
      return false;
    }
  }

  /**
   * Retrieve file path and mime info for streaming
   */
  public getAvatarPath(fileName: string): { filePath: string; mimeType: string } | null {
    this.init();

    // Sanitize filename
    const safeName = path.basename(fileName);
    if (safeName !== fileName || fileName.includes('..')) {
      return null;
    }

    const ext = path.extname(safeName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return null;
    }

    const filePath = path.join(UPLOADS_DIR, safeName);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    let mimeType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.webp') mimeType = 'image/webp';

    return { filePath, mimeType };
  }
}

export const storageService = new StorageService();
