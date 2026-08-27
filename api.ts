const API_BASE = '/api';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('studenthub_token');
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem('studenthub_token', token);
    } else {
      localStorage.removeItem('studenthub_token');
    }
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('/') ? `${API_BASE}${endpoint}` : `${API_BASE}/${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let msg = data.error || `Request failed with status ${response.status}`;
    if (typeof msg === 'string' && msg.includes('ApiError:')) {
      try {
        const jsonMatch = msg.match(/ApiError:\s*(\{.*\})/);
        if (jsonMatch && jsonMatch[1]) {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed?.error?.message) {
            msg = parsed.error.message;
          }
        }
      } catch {}
    }
    throw new Error(msg);
  }

  return data as T;
}

export const api = {
  // Auth
  signUp: (payload: any) => apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  signIn: (payload: any) => apiRequest('/auth/signin', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiRequest('/auth/me'),
  forgotPassword: (payload: any) => apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) }),
  changePassword: (payload: any) => apiRequest('/auth/change-password', { method: 'POST', body: JSON.stringify(payload) }),

  // Users
  searchStudents: (params: { q?: string; district?: string; grade?: string } | string) => {
    if (typeof params === 'string') {
      return apiRequest(`/users/search?q=${encodeURIComponent(params)}`);
    }
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append('q', params.q);
    if (params.district) searchParams.append('district', params.district);
    if (params.grade) searchParams.append('grade', params.grade);
    return apiRequest(`/users/search?${searchParams.toString()}`);
  },
  getProfile: (identifier?: string) => {
    const cleanId = (identifier || '').trim();
    return apiRequest(`/users/profile/${encodeURIComponent(cleanId || 'me')}`);
  },
  updateProfile: (payload: any) => apiRequest('/users/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  updatePrivacy: (payload: any) => apiRequest('/users/privacy', { method: 'PUT', body: JSON.stringify(payload) }),
  blockUser: (userId: string) => apiRequest(`/users/${userId}/block`, { method: 'POST' }),
  unblockUser: (userId: string) => apiRequest(`/users/${userId}/unblock`, { method: 'POST' }),
  reportUser: (userId: string, payload: any) => apiRequest(`/users/${userId}/report`, { method: 'POST', body: JSON.stringify(payload) }),

  // Profile Photos & Uploads
  uploadAvatar: (image: string, avatarVisibility?: string) =>
    apiRequest('/uploads/avatar', { method: 'POST', body: JSON.stringify({ image, avatarVisibility }) }),
  removeAvatar: () => apiRequest('/uploads/avatar', { method: 'DELETE' }),
  uploadFounderPhoto: (image: string) =>
    apiRequest('/uploads/founder', { method: 'POST', body: JSON.stringify({ image }) }),
  removeFounderPhoto: () => apiRequest('/uploads/founder', { method: 'DELETE' }),
  getFounderConfig: () => apiRequest('/uploads/founder'),

  // Friends
  getFriends: () => apiRequest('/friends'),
  getRequests: () => apiRequest('/friends/requests'),
  sendFriendRequest: (targetId: string) => apiRequest(`/friends/request/${targetId}`, { method: 'POST' }),
  acceptFriendRequest: (requestId: string) => apiRequest(`/friends/accept/${requestId}`, { method: 'POST' }),
  rejectFriendRequest: (requestId: string) => apiRequest(`/friends/reject/${requestId}`, { method: 'POST' }),
  cancelFriendRequest: (targetId: string) => apiRequest(`/friends/cancel/${targetId}`, { method: 'POST' }),
  removeFriend: (targetId: string) => apiRequest(`/friends/${targetId}`, { method: 'DELETE' }),
  getBlockedUsers: () => apiRequest('/friends/blocked'),

  // Posts & Feed
  getFeed: (params: { filter?: string; category?: string; authorId?: string } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.filter) searchParams.append('filter', params.filter);
    if (params.category) searchParams.append('category', params.category);
    if (params.authorId) searchParams.append('authorId', params.authorId);
    return apiRequest(`/posts?${searchParams.toString()}`);
  },
  createPost: (payload: any) => apiRequest('/posts', { method: 'POST', body: JSON.stringify(payload) }),
  editPost: (postId: string, payload: any) => apiRequest(`/posts/${postId}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deletePost: (postId: string) => apiRequest(`/posts/${postId}`, { method: 'DELETE' }),
  toggleLike: (postId: string) => apiRequest(`/posts/${postId}/like`, { method: 'POST' }),
  addComment: (postId: string, payload: any) => apiRequest(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(payload) }),
  deleteComment: (postId: string, commentId: string) => apiRequest(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }),
  toggleSavePost: (postId: string) => apiRequest(`/posts/${postId}/save`, { method: 'POST' }),
  reportPost: (postId: string, payload: any) => apiRequest(`/posts/${postId}/report`, { method: 'POST', body: JSON.stringify(payload) }),

  // Messages
  getConversations: () => apiRequest('/messages/conversations'),
  startConversation: (targetUserId: string) => apiRequest(`/messages/start/${targetUserId}`, { method: 'POST' }),
  getMessages: (conversationId: string) => apiRequest(`/messages/${conversationId}`),
  sendMessage: (conversationId: string, payload: any) => apiRequest(`/messages/${conversationId}`, { method: 'POST', body: JSON.stringify(payload) }),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id: string) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'POST' }),
  deleteNotification: (id: string) => apiRequest(`/notifications/${id}`, { method: 'DELETE' }),

  // News
  getNews: (params: { category?: string; q?: string; featured?: boolean; saved?: boolean } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.append('category', params.category);
    if (params.q) searchParams.append('q', params.q);
    if (params.featured) searchParams.append('featured', 'true');
    if (params.saved) searchParams.append('saved', 'true');
    return apiRequest(`/news?${searchParams.toString()}`);
  },
  getNewsArticle: (identifier: string) => apiRequest(`/news/${identifier}`),
  toggleSaveNews: (newsId: string) => apiRequest(`/news/${newsId}/save`, { method: 'POST' }),
  getNewsSyncStatus: () => apiRequest('/news/sync-status'),
  syncDailyNews: (force = false) => apiRequest('/news/sync', { method: 'POST', body: JSON.stringify({ force }) }),

  // AI Assistant
  aiChat: (payload: { messages: Array<{ role: string; content: string }>; stream?: string; gradeLevel?: string; targetLanguage?: string }) =>
    apiRequest('/ai/chat', { method: 'POST', body: JSON.stringify(payload) }),
  askAssistant: (payload: { mode: string; topic?: string; text?: string; gradeLevel?: string; subject?: string; targetLanguage?: string }) =>
    apiRequest('/ai/assistant', { method: 'POST', body: JSON.stringify(payload) }),

  // Admin
  getAdminMetrics: () => apiRequest('/admin/metrics'),
  getAdminUsers: (q: string = '') => apiRequest(`/admin/users?q=${encodeURIComponent(q)}`),
  toggleSuspendUser: (userId: string, reason?: string) => apiRequest(`/admin/users/${userId}/toggle-suspend`, { method: 'POST', body: JSON.stringify({ reason }) }),
  deleteAdminUser: (userId: string) => apiRequest(`/admin/users/${userId}`, { method: 'DELETE' }),
  createNewsArticle: (payload: any) => apiRequest('/admin/news', { method: 'POST', body: JSON.stringify(payload) }),
  updateNewsArticle: (newsId: string, payload: any) => apiRequest(`/admin/news/${newsId}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteNewsArticle: (newsId: string) => apiRequest(`/admin/news/${newsId}`, { method: 'DELETE' }),
  getAdminReports: (status?: string) => apiRequest(`/admin/reports${status ? `?status=${status}` : ''}`),
  takeReportAction: (reportId: string, payload: { action: string; resolutionNotes?: string }) =>
    apiRequest(`/admin/reports/${reportId}/action`, { method: 'POST', body: JSON.stringify(payload) }),
  getAdminAuditLogs: () => apiRequest('/admin/audit-logs'),
};
