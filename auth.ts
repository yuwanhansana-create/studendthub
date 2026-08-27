import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, UserRecord } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'studenthub_development_jwt_secret_key_2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'MODERATOR';
}

export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: UserRecord): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function sanitizeUser(user: UserRecord, isSelfOrFriend: boolean = false) {
  // Determine avatar visibility
  const avatarSetting = user.avatarVisibility || 'PUBLIC';
  let safeAvatarUrl = user.avatarUrl;
  if (!isSelfOrFriend) {
    if (avatarSetting === 'PRIVATE' || avatarSetting === 'FRIENDS_ONLY') {
      safeAvatarUrl = ''; // fallback to initials avatar for privacy
    }
  }

  return {
    id: user.id,
    studentId: user.studentId,
    username: user.username,
    fullName: user.fullName,
    avatarUrl: safeAvatarUrl,
    avatarVisibility: avatarSetting,
    bio: user.bio,
    grade: user.gradeVisibility === 'PRIVATE' && !isSelfOrFriend ? undefined : user.grade,
    school: user.schoolVisibility === 'PRIVATE' && !isSelfOrFriend ? undefined : user.school,
    district: user.districtVisibility === 'PRIVATE' && !isSelfOrFriend ? undefined : user.district,
    province: user.districtVisibility === 'PRIVATE' && !isSelfOrFriend ? undefined : user.province,
    subjects: user.subjects || [],
    interests: user.interests || [],
    skills: user.skills || [],
    role: user.role,
    isSuspended: user.isSuspended,
    schoolVisibility: user.schoolVisibility,
    gradeVisibility: user.gradeVisibility,
    districtVisibility: user.districtVisibility || 'PUBLIC',
    allowMessagesFrom: user.allowMessagesFrom,
    allowRequestsFrom: user.allowRequestsFrom,
    preferredLanguage: user.preferredLanguage || 'en',
    createdAt: user.createdAt
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Authentication token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }

  const user = db.users.find(u => u.id === decoded.userId);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: User not found' });
    return;
  }

  if (user.isSuspended) {
    res.status(403).json({ error: 'Account has been suspended by administration. Please contact support.' });
    return;
  }

  req.user = user;
  next();
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) {
      const user = db.users.find(u => u.id === decoded.userId);
      if (user && !user.isSuspended) {
        req.user = user;
      }
    }
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden: Administrative privileges required' });
      return;
    }
    next();
  });
}
