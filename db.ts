import fs from 'fs';
import path from 'path';

export interface UserRecord {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: 'STUDENT' | 'ADMIN' | 'MODERATOR';
  isSuspended: boolean;
  studentId: string; // e.g. "STU-7A42K9"
  fullName: string;
  avatarUrl: string;
  avatarVisibility?: 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';
  bio: string;
  grade: string;
  school: string;
  district?: string;
  province?: string;
  subjects?: string[];
  interests?: string[];
  skills?: string[];
  schoolVisibility: 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';
  gradeVisibility: 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';
  districtVisibility?: 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';
  allowMessagesFrom: 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';
  allowRequestsFrom: 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';
  preferredLanguage?: 'en' | 'si' | 'ta';
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequestRecord {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface FriendshipRecord {
  id: string;
  userId: string;
  friendId: string;
  createdAt: string;
}

export interface CommentRecord {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostRecord {
  id: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  category?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  likes: string[]; // array of userIds
  comments: CommentRecord[];
}

export interface SavedPostRecord {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface NotificationRecord {
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

export interface MessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationRecord {
  id: string;
  participantIds: string[];
  updatedAt: string;
  createdAt: string;
}

export interface NewsArticleRecord {
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
}

export interface SavedNewsRecord {
  id: string;
  userId: string;
  newsId: string;
  createdAt: string;
}

export interface BlockRecord {
  id: string;
  userId: string;
  blockedUserId: string;
  createdAt: string;
}

export interface ReportRecord {
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
}

export interface AuditLogRecord {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface FounderConfigRecord {
  photoUrl?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  friendRequests: FriendRequestRecord[];
  friendships: FriendshipRecord[];
  posts: PostRecord[];
  savedPosts: SavedPostRecord[];
  notifications: NotificationRecord[];
  conversations: ConversationRecord[];
  messages: MessageRecord[];
  news: NewsArticleRecord[];
  savedNews: SavedNewsRecord[];
  blocks: BlockRecord[];
  reports: ReportRecord[];
  auditLogs: AuditLogRecord[];
  founderConfig?: FounderConfigRecord;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'studenthub-db.json');

class DatabaseStore {
  private data: DatabaseSchema;
  private isInitialized = false;

  constructor() {
    this.data = {
      users: [],
      friendRequests: [],
      friendships: [],
      posts: [],
      savedPosts: [],
      notifications: [],
      conversations: [],
      messages: [],
      news: [],
      savedNews: [],
      blocks: [],
      reports: [],
      auditLogs: [],
      founderConfig: {
        photoUrl: '',
        updatedAt: new Date().toISOString()
      }
    };
  }

  public init() {
    if (this.isInitialized) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (e) {
      console.warn('Database file read warning, starting with current state:', e);
    }
    this.isInitialized = true;
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save database state:', e);
    }
  }

  // Getters
  get users() { return this.data.users; }
  get friendRequests() { return this.data.friendRequests; }
  get friendships() { return this.data.friendships; }
  get posts() { return this.data.posts; }
  get savedPosts() { return this.data.savedPosts; }
  get notifications() { return this.data.notifications; }
  get conversations() { return this.data.conversations; }
  get messages() { return this.data.messages; }
  get news() { return this.data.news; }
  get savedNews() { return this.data.savedNews; }
  get blocks() { return this.data.blocks; }
  get reports() { return this.data.reports; }
  get auditLogs() { return this.data.auditLogs; }
  get founderConfig() { return this.data.founderConfig || { photoUrl: '', updatedAt: new Date().toISOString() }; }

  // Setters for entire collections
  setUsers(users: UserRecord[]) { this.data.users = users; this.save(); }
  setNews(news: NewsArticleRecord[]) { this.data.news = news; this.save(); }
  setFounderConfig(config: FounderConfigRecord) { this.data.founderConfig = config; this.save(); }

  // Helper for generating unique non-sequential Student IDs (e.g. STU-7A42K9)
  generateStudentId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit easily confused chars like 0, O, 1, I
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const studentId = `STU-${code}`;
    // Ensure uniqueness
    const exists = this.data.users.some(u => u.studentId === studentId);
    if (exists) {
      return this.generateStudentId();
    }
    return studentId;
  }

  // Generate ID helper
  generateId(prefix: string = 'id'): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  }
}

export const db = new DatabaseStore();
db.init();
