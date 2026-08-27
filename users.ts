import { Router, Response } from 'express';
import { db, UserRecord } from '../db.js';
import { requireAuth, optionalAuth, sanitizeUser, AuthenticatedRequest } from '../auth.js';

export const usersRouter = Router();

// 1. Search Students (by Student ID, Username, School, District, or Stream)
usersRouter.get('/search', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const query = String(req.query.q || '').trim();
    const districtFilter = req.query.district ? String(req.query.district).trim() : '';
    const gradeFilter = req.query.grade ? String(req.query.grade).trim() : '';
    const currentUserId = req.user?.id;

    let matchedUsers = db.users.filter(u => {
      if (u.isSuspended) return false;
      if (currentUserId && u.id === currentUserId) return false;
      if (u.role === 'ADMIN') return false;

      // Check if blocked
      if (currentUserId) {
        const isBlocked = db.blocks.some(b => 
          (b.userId === currentUserId && b.blockedUserId === u.id) ||
          (b.userId === u.id && b.blockedUserId === currentUserId)
        );
        if (isBlocked) return false;
      }

      // Filter by district if specified
      if (districtFilter && districtFilter !== 'All' && districtFilter !== 'All Districts') {
        if (!u.district || u.district.toLowerCase() !== districtFilter.toLowerCase()) {
          return false;
        }
      }

      // Filter by grade if specified
      if (gradeFilter && gradeFilter !== 'All' && gradeFilter !== 'All Grades') {
        if (!u.grade || !u.grade.toLowerCase().includes(gradeFilter.toLowerCase())) {
          return false;
        }
      }

      if (!query) return true;

      const cleanQ = query.toUpperCase();
      // Match exact or partial Student ID (e.g. STU-7A42K9)
      if (u.studentId.toUpperCase().includes(cleanQ)) return true;
      // Match username
      if (u.username.toUpperCase().includes(cleanQ)) return true;
      // Match Full Name
      if (u.fullName.toUpperCase().includes(cleanQ)) return true;
      // Match School
      if (u.school && u.school.toUpperCase().includes(cleanQ)) return true;
      // Match District
      if (u.district && u.district.toUpperCase().includes(cleanQ)) return true;
      // Match Subjects
      if (u.subjects && u.subjects.some(s => s.toUpperCase().includes(cleanQ))) return true;

      return false;
    });

    const results = matchedUsers.slice(0, 30).map(u => {
      let friendStatus: 'NONE' | 'FRIENDS' | 'SENT' | 'RECEIVED' | 'BLOCKED' = 'NONE';
      if (currentUserId) {
        if (db.friendships.some(f => f.userId === currentUserId && f.friendId === u.id)) {
          friendStatus = 'FRIENDS';
        } else if (db.friendRequests.some(r => r.senderId === currentUserId && r.receiverId === u.id && r.status === 'PENDING')) {
          friendStatus = 'SENT';
        } else if (db.friendRequests.some(r => r.senderId === u.id && r.receiverId === currentUserId && r.status === 'PENDING')) {
          friendStatus = 'RECEIVED';
        }
      }

      return {
        ...sanitizeUser(u, friendStatus === 'FRIENDS'),
        friendStatus
      };
    });

    res.json({ results });
  } catch (error) {
    console.error('Student search error:', error);
    res.status(500).json({ error: 'Failed to search students' });
  }
});

// 2. Helper for retrieving profile data
function handleGetProfile(identifier: string | undefined, req: AuthenticatedRequest, res: Response): void {
  try {
    const rawId = (identifier || '').trim();
    const currentUserId = req.user?.id;

    let user: UserRecord | undefined;

    if (!rawId || rawId.toLowerCase() === 'me' || rawId.toLowerCase() === 'my' || rawId.toLowerCase() === 'self') {
      if (currentUserId) {
        user = db.users.find(u => u.id === currentUserId);
      }
      if (!user && req.user) {
        user = req.user;
      }
    } else {
      const cleanUpper = rawId.toUpperCase();
      const cleanLower = rawId.toLowerCase();
      const cleanAt = rawId.startsWith('@') ? rawId.slice(1).toLowerCase() : cleanLower;

      user = db.users.find(u =>
        u.id === rawId ||
        u.id.toLowerCase() === cleanLower ||
        u.studentId.toUpperCase() === cleanUpper ||
        u.username.toLowerCase() === cleanLower ||
        u.username.toLowerCase() === cleanAt
      );

      // If not found in memory db, check if current user matches
      if (!user && req.user) {
        if (
          req.user.studentId.toUpperCase() === cleanUpper ||
          req.user.id === rawId ||
          req.user.username.toLowerCase() === cleanLower
        ) {
          user = req.user;
        }
      }
    }

    if (!user) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }

    // Check blocked status
    let isBlocked = false;
    let hasBlockedTarget = false;
    if (currentUserId && currentUserId !== user.id) {
      hasBlockedTarget = db.blocks.some(b => b.userId === currentUserId && b.blockedUserId === user.id);
      const isBlockedByTarget = db.blocks.some(b => b.userId === user.id && b.blockedUserId === currentUserId);
      if (isBlockedByTarget) {
        res.status(403).json({ error: 'This profile is unavailable' });
        return;
      }
      isBlocked = hasBlockedTarget;
    }

    const isSelf = currentUserId === user.id;
    const isFriend = currentUserId ? db.friendships.some(f => f.userId === currentUserId && f.friendId === user.id) : false;

    let friendStatus: 'NONE' | 'FRIENDS' | 'SENT' | 'RECEIVED' | 'BLOCKED' = isFriend ? 'FRIENDS' : 'NONE';
    if (isBlocked) {
      friendStatus = 'BLOCKED';
    } else if (!isFriend && currentUserId) {
      if (db.friendRequests.some(r => r.senderId === currentUserId && r.receiverId === user.id && r.status === 'PENDING')) {
        friendStatus = 'SENT';
      } else if (db.friendRequests.some(r => r.senderId === user.id && r.receiverId === currentUserId && r.status === 'PENDING')) {
        friendStatus = 'RECEIVED';
      }
    }

    // Get stats
    const friendsCount = db.friendships.filter(f => f.userId === user.id).length;
    const userPosts = db.posts.filter(p => p.authorId === user.id);
    const postsCount = userPosts.length;

    // Mutual friends
    let mutualFriendsCount = 0;
    if (currentUserId && !isSelf) {
      const myFriends = new Set(db.friendships.filter(f => f.userId === currentUserId).map(f => f.friendId));
      const targetFriends = db.friendships.filter(f => f.userId === user.id).map(f => f.friendId);
      mutualFriendsCount = targetFriends.filter(id => myFriends.has(id)).length;
    }

    // Map user posts
    const sanitizedAuthor = sanitizeUser(user, isSelf || isFriend);
    const populatedPosts = userPosts
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(p => ({
        ...p,
        author: sanitizedAuthor,
        isLiked: currentUserId ? p.likes.includes(currentUserId) : false,
        isSaved: currentUserId ? db.savedPosts.some(s => s.userId === currentUserId && s.postId === p.id) : false,
        commentsCount: p.comments.length
      }));

    const sanitizedUserData = sanitizeUser(user, isSelf || isFriend);

    res.json({
      user: sanitizedUserData,
      profile: sanitizedUserData,
      isSelf,
      friendStatus,
      friendsCount,
      postsCount,
      posts: populatedPosts,
      mutualFriendsCount,
      hasBlockedTarget
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
}

// 2. Get Current User's Profile
usersRouter.get('/profile', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  handleGetProfile(undefined, req, res);
});

// 2b. Get User Profile by ID or Student ID
usersRouter.get('/profile/:identifier', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  handleGetProfile(req.params.identifier, req, res);
});

// 3. Update Profile
usersRouter.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { fullName, bio, grade, school, district, province, subjects, interests, skills, avatarUrl, preferredLanguage } = req.body;

    if (fullName && typeof fullName === 'string' && fullName.trim().length >= 2) {
      user.fullName = fullName.trim().slice(0, 80);
    }
    if (bio !== undefined && typeof bio === 'string') {
      user.bio = bio.trim().slice(0, 500);
    }
    if (grade && typeof grade === 'string') {
      user.grade = grade.trim().slice(0, 100);
    }
    if (school && typeof school === 'string') {
      user.school = school.trim().slice(0, 150);
    }
    if (district && typeof district === 'string') {
      user.district = district.trim().slice(0, 60);
    }
    if (province && typeof province === 'string') {
      user.province = province.trim().slice(0, 60);
    }
    if (Array.isArray(subjects)) {
      user.subjects = subjects.map(s => String(s).trim().slice(0, 80)).filter(Boolean).slice(0, 10);
    }
    if (Array.isArray(interests)) {
      user.interests = interests.map(s => String(s).trim().slice(0, 60)).filter(Boolean).slice(0, 15);
    }
    if (Array.isArray(skills)) {
      user.skills = skills.map(s => String(s).trim().slice(0, 60)).filter(Boolean).slice(0, 15);
    }
    if (preferredLanguage && ['en', 'si', 'ta'].includes(preferredLanguage)) {
      user.preferredLanguage = preferredLanguage;
    }
    if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.startsWith('http')) {
      user.avatarUrl = avatarUrl.slice(0, 500);
    }

    user.updatedAt = new Date().toISOString();
    db.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        ...sanitizeUser(user, true),
        email: user.email
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// 4. Update Privacy Settings
usersRouter.put('/privacy', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { schoolVisibility, gradeVisibility, districtVisibility, allowMessagesFrom, allowRequestsFrom } = req.body;

    if (['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE'].includes(schoolVisibility)) {
      user.schoolVisibility = schoolVisibility;
    }
    if (['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE'].includes(gradeVisibility)) {
      user.gradeVisibility = gradeVisibility;
    }
    if (['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE'].includes(districtVisibility)) {
      user.districtVisibility = districtVisibility;
    }
    if (['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE'].includes(allowMessagesFrom)) {
      user.allowMessagesFrom = allowMessagesFrom;
    }
    if (['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE'].includes(allowRequestsFrom)) {
      user.allowRequestsFrom = allowRequestsFrom;
    }

    user.updatedAt = new Date().toISOString();
    db.save();

    res.json({
      message: 'Privacy settings saved successfully',
      settings: {
        schoolVisibility: user.schoolVisibility,
        gradeVisibility: user.gradeVisibility,
        districtVisibility: user.districtVisibility,
        allowMessagesFrom: user.allowMessagesFrom,
        allowRequestsFrom: user.allowRequestsFrom
      }
    });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

// 5. Block User
usersRouter.post('/:userId/block', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { userId: targetUserId } = req.params;

    if (user.id === targetUserId) {
      res.status(400).json({ error: 'You cannot block yourself' });
      return;
    }

    const targetUser = db.users.find(u => u.id === targetUserId);
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Add block record if not existing
    const existingBlock = db.blocks.find(b => b.userId === user.id && b.blockedUserId === targetUserId);
    if (!existingBlock) {
      db.blocks.push({
        id: db.generateId('blk'),
        userId: user.id,
        blockedUserId: targetUserId,
        createdAt: new Date().toISOString()
      });
    }

    // Sever any friendships
    const f1Idx = db.friendships.findIndex(f => f.userId === user.id && f.friendId === targetUserId);
    if (f1Idx !== -1) db.friendships.splice(f1Idx, 1);

    const f2Idx = db.friendships.findIndex(f => f.userId === targetUserId && f.friendId === user.id);
    if (f2Idx !== -1) db.friendships.splice(f2Idx, 1);

    // Cancel pending friend requests
    const reqs = db.friendRequests.filter(r =>
      (r.senderId === user.id && r.receiverId === targetUserId) ||
      (r.senderId === targetUserId && r.receiverId === user.id)
    );
    for (const r of reqs) {
      r.status = 'CANCELLED';
    }

    db.save();
    res.json({ message: `Blocked ${targetUser.fullName}. They can no longer see your profile or message you.` });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// 6. Unblock User
usersRouter.post('/:userId/unblock', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { userId: targetUserId } = req.params;

    const blockIdx = db.blocks.findIndex(b => b.userId === user.id && b.blockedUserId === targetUserId);
    if (blockIdx !== -1) {
      db.blocks.splice(blockIdx, 1);
      db.save();
    }

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

// 7. Report User
usersRouter.post('/:userId/report', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { userId: targetUserId } = req.params;
    const { reason, details } = req.body;

    if (!reason) {
      res.status(400).json({ error: 'Please select a reason for reporting' });
      return;
    }

    db.reports.push({
      id: db.generateId('rep'),
      reporterId: user.id,
      targetType: 'USER',
      reportedUserId: targetUserId,
      reason,
      details: details || '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    db.save();
    res.json({ message: 'Report submitted. StudentHub safety moderators will review this promptly.' });
  } catch (error) {
    console.error('Report user error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});
