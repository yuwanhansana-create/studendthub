import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Layers,
  Flag,
  Newspaper,
  Plus,
  CheckCircle2,
  Trash2,
  Ban,
  ShieldCheck,
  Search,
  Check,
  AlertTriangle
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Avatar } from '../components/common/Avatar.js';
import { StudentIdBadge, RoleBadge, CategoryBadge } from '../components/common/Badge.js';
import { Modal } from '../components/common/Modal.js';
import { useToast } from '../components/common/Toast.js';

interface AdminPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'news' | 'users'>('overview');
  const [loading, setLoading] = useState(true);

  // New Article Form
  const [showCreateNewsModal, setShowCreateNewsModal] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCategory, setNewsCategory] = useState('Scholarships');
  const [newsCoverImage, setNewsCoverImage] = useState('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800');
  const [newsSource, setNewsSource] = useState('StudentHub Editorial');
  const [newsFeatured, setNewsFeatured] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [metricsData, reportsData, newsData, usersData] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminReports(),
        api.getNews({}),
        api.getAdminUsers('')
      ]);

      setStats(metricsData.metrics || metricsData.stats);
      setReports(reportsData.reports || []);
      setNewsList(newsData.articles || []);
      setUsersList(usersData.users || usersData.results || []);
    } catch (err: any) {
      error(err.message || 'Failed to load admin controls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleResolveReport = async (reportId: string, action: 'DISMISS' | 'DELETE_CONTENT' | 'BAN_USER') => {
    try {
      await api.takeReportAction(reportId, { action });
      setReports(prev => prev.map(r => (r.id === reportId ? { ...r, status: 'RESOLVED' } : r)));
      success(`Report handled: ${action}`);
      loadAdminData();
    } catch (err: any) {
      error(err.message || 'Failed to resolve report');
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createNewsArticle({
        title: newsTitle.trim(),
        summary: newsSummary.trim(),
        content: newsContent.trim(),
        category: newsCategory,
        coverImage: newsCoverImage.trim(),
        source: newsSource.trim(),
        isFeatured: newsFeatured
      });
      setShowCreateNewsModal(false);
      setNewsTitle('');
      setNewsSummary('');
      setNewsContent('');
      success('Article published successfully!');
      loadAdminData();
    } catch (err: any) {
      error(err.message || 'Failed to publish article');
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.deleteNewsArticle(articleId);
      setNewsList(prev => prev.filter(a => a.id !== articleId));
      success('Article deleted');
    } catch (err: any) {
      error(err.message || 'Failed to delete article');
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Admin Access Restricted</h3>
        <p className="text-xs text-slate-400">You must hold an administrator role to view this console.</p>
        <button
          type="button"
          onClick={() => onNavigate('feed')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Platform Admin & Moderation Console</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor platform metrics, resolve safety reports, and manage educational articles
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateNewsModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish News Article</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
            <span className="text-xs font-semibold text-slate-400">Registered Students</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalUsers}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
            <span className="text-xs font-semibold text-slate-400">Academic Posts</span>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {stats.totalPosts}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
            <span className="text-xs font-semibold text-slate-400">Pending Safety Reports</span>
            <div className="text-2xl font-extrabold text-amber-500">
              {stats.pendingReports}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
            <span className="text-xs font-semibold text-slate-400">Education News</span>
            <div className="text-2xl font-extrabold text-emerald-600">
              {stats.totalArticles}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Reports Queue ({reports.filter(r => r.status === 'PENDING').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('news')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'news'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Manage News ({newsList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Student Directory ({usersList.length})
        </button>
      </div>

      {/* TAB: Reports Queue */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">All Clear!</h4>
              <p className="text-xs text-slate-400">No moderation reports requiring review.</p>
            </div>
          ) : (
            reports.map(report => (
              <div
                key={report.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs">
                      {report.reason}
                    </span>
                    <span className="text-xs text-slate-400">
                      Reported by {report.reporter?.fullName} ({report.reporter?.studentId})
                    </span>
                  </div>

                  <span className={`text-xs font-bold ${
                    report.status === 'PENDING' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {report.status}
                  </span>
                </div>

                {report.details && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    "{report.details}"
                  </p>
                )}

                {report.status === 'PENDING' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleResolveReport(report.id, 'DISMISS')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold"
                    >
                      Dismiss Report
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolveReport(report.id, 'DELETE_CONTENT')}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 hover:bg-rose-100 text-xs font-semibold"
                    >
                      Delete Content
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: Manage News */}
      {activeTab === 'news' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {newsList.map(article => (
              <div
                key={article.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="h-28 rounded-xl overflow-hidden mb-2">
                    <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                  <CategoryBadge category={article.category} />
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1 line-clamp-2">
                    {article.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onNavigate('news-detail', article.slug)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteArticle(article.id)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                    title="Delete Article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Student Directory */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {usersList.map(u => (
              <div key={u.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar src={u.avatarUrl} alt={u.fullName} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{u.fullName}</span>
                      <StudentIdBadge idCode={u.studentId} size="sm" showCopy={false} />
                      <RoleBadge role={u.role} />
                    </div>
                    <span className="text-[11px] text-slate-400">@{u.username} • {u.school || 'No school'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('profile', u.studentId)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publish News Article Modal */}
      <Modal
        isOpen={showCreateNewsModal}
        onClose={() => setShowCreateNewsModal(false)}
        title="Publish Educational News Article"
        description="Share official notices, scholarships, or academic tips with the entire StudentHub community."
      >
        <form onSubmit={handleCreateArticle} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Article Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2026 National STEM Merit Scholarship Applications Open"
              value={newsTitle}
              onChange={e => setNewsTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={newsCategory}
                onChange={e => setNewsCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
              >
                <option value="Scholarships">Scholarships</option>
                <option value="Examinations">Examinations</option>
                <option value="Competitions">Competitions</option>
                <option value="Student Opportunities">Student Opportunities</option>
                <option value="Study Tips">Study Tips</option>
                <option value="ICT & Technology">ICT & Technology</option>
                <option value="Education Policies">Education Policies</option>
                <option value="School Updates">School Updates</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Source Credit
              </label>
              <input
                type="text"
                value={newsSource}
                onChange={e => setNewsSource(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              value={newsCoverImage}
              onChange={e => setNewsCoverImage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Summary Lead (1-2 sentences)
            </label>
            <textarea
              rows={2}
              required
              value={newsSummary}
              onChange={e => setNewsSummary(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Article Body
            </label>
            <textarea
              rows={5}
              required
              value={newsContent}
              onChange={e => setNewsContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={newsFeatured}
              onChange={e => setNewsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600"
            />
            <span>Set as Featured Story on News Hub</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateNewsModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700"
            >
              Publish Article
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
