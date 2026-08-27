export type Role = 'STUDENT' | 'ADMIN' | 'MODERATOR';
export type Visibility = 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';
export type FriendStatus = 'NONE' | 'FRIENDS' | 'SENT' | 'RECEIVED' | 'BLOCKED';

export interface User {
  id: string;
  studentId: string; // e.g. "STU-7A42K9"
  username: string;
  fullName: string;
  email?: string;
  avatarUrl: string;
  avatarVisibility?: Visibility;
  bio?: string;
  grade?: string;
  school?: string;
  district?: string;
  province?: string;
  subjects?: string[];
  interests?: string[];
  skills?: string[];
  role: Role;
  isSuspended: boolean;
  schoolVisibility?: Visibility;
  gradeVisibility?: Visibility;
  districtVisibility?: Visibility;
  allowMessagesFrom?: Visibility;
  allowRequestsFrom?: Visibility;
  preferredLanguage?: 'en' | 'si' | 'ta';
  createdAt: string;
  friendStatus?: FriendStatus;
}

export interface PostComment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    fullName: string;
    username: string;
    studentId: string;
    avatarUrl: string;
  };
  isOwner?: boolean;
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  category: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  comments: PostComment[];
  isLiked: boolean;
  isSaved: boolean;
  isOwner: boolean;
  author: {
    id: string;
    fullName: string;
    username: string;
    studentId: string;
    avatarUrl: string;
    grade?: string;
    school?: string;
    district?: string;
  };
}

export interface FriendRequest {
  id: string;
  createdAt: string;
  sender?: User;
  receiver?: User;
}

export interface Notification {
  id: string;
  userId: string;
  actorId?: string;
  type: 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED' | 'POST_LIKE' | 'POST_COMMENT' | 'MESSAGE' | 'NEWS_ANNOUNCEMENT';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  isRead: boolean;
  createdAt: string;
  isMine: boolean;
}

export interface Conversation {
  id: string;
  otherUser: User;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    isMine: boolean;
  } | null;
  unreadCount: number;
  isBlocked: boolean;
  updatedAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  category: string;
  source: string;
  authorName: string;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  isSaved?: boolean;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'USER' | 'POST' | 'COMMENT';
  reportedUserId?: string;
  postId?: string;
  commentId?: string;
  reason: string;
  details?: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  actionTaken?: string;
  createdAt: string;
  updatedAt: string;
  reporter?: User | null;
  reportedUser?: User | null;
  postContent?: string | null;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  mode?: string;
  subject?: string;
}

