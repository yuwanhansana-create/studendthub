import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  UserPlus,
  Heart,
  MessageCircle,
  Newspaper,
  Check,
  Sparkles
} from 'lucide-react';
import { Notification } from '../types/index.js';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/common/Toast.js';

interface NotificationsPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { refreshUser } = useAuth();
  const { success, error } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
    } catch (err: any) {
      error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
      refreshUser();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      refreshUser();
      success('All notifications marked as read');
    } catch (err: any) {
      error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      refreshUser();
      success('Notification deleted');
    } catch (err: any) {
      error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (n: Notification) => {
    handleMarkAsRead(n.id);
    if (n.link) {
      if (n.link.startsWith('/profile/')) {
        const id = n.link.replace('/profile/', '');
        onNavigate('profile', id);
      } else if (n.link.startsWith('/news/')) {
        const slug = n.link.replace('/news/', '');
        onNavigate('news-detail', slug);
      } else if (n.link === '/friends') {
        onNavigate('friends');
      } else if (n.link === '/feed') {
        onNavigate('feed');
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST':
        return <UserPlus className="w-4 h-4 text-indigo-600" />;
      case 'FRIEND_ACCEPTED':
        return <Check className="w-4 h-4 text-emerald-600" />;
      case 'POST_LIKE':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'POST_COMMENT':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'NEWS_ANNOUNCEMENT':
        return <Newspaper className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Activity Notifications</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Stay updated on friend requests, academic responses, and educational news
          </p>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Unread ({notifications.filter(n => !n.isRead).length})
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse h-16" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
          <Bell className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-400">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(n => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 shadow-xs ${
                !n.isRead
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80 hover:border-indigo-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs flex-shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {n.title}
                    </h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={e => handleDelete(n.id, e)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Delete notification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
