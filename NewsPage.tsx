import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Search,
  Bookmark,
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  Share2,
  Filter,
  Landmark,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Zap
} from 'lucide-react';
import { NewsArticle } from '../types/index.js';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { CategoryBadge } from '../components/common/Badge.js';
import { NewsSkeleton } from '../components/common/Skeleton.js';
import { useToast } from '../components/common/Toast.js';
import { GovPortalsView } from '../components/education/GovPortalsView.js';

interface NewsPageProps {
  onNavigate: (tab: string, param?: string) => void;
  initialSubTab?: 'news' | 'gov-portals';
}

const CATEGORIES = [
  'All',
  'Scholarships',
  'Examinations',
  'Competitions',
  'Student Opportunities',
  'Study Tips',
  'ICT & Technology',
  'Education Policies',
  'School Updates'
];

export const NewsPage: React.FC<NewsPageProps> = ({ onNavigate, initialSubTab = 'news' }) => {
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'news' | 'gov-portals'>(initialSubTab);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const loadSyncStatus = async () => {
    try {
      const res = await api.getNewsSyncStatus();
      if (res?.lastSyncAt) {
        setLastSyncTime(res.lastSyncAt);
      }
    } catch {}
  };

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await api.getNews({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        q: searchQuery.trim() || undefined,
        saved: showSavedOnly || undefined
      });
      setArticles(data.articles || []);
      loadSyncStatus();
    } catch (err: any) {
      error('Failed to load education news');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncDailyNews = async () => {
    setSyncing(true);
    try {
      const res = await api.syncDailyNews(true);
      success(res?.message || 'Synchronized latest Sri Lanka education news.');
      await loadNews();
    } catch (err: any) {
      error('Failed to synchronize daily news');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadNews();
    loadSyncStatus();
  }, [selectedCategory, showSavedOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadNews();
  };

  const handleToggleSave = async (article: NewsArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onNavigate('signin');
      return;
    }

    try {
      const res = await api.toggleSaveNews(article.id);
      setArticles(prev =>
        prev.map(a => (a.id === article.id ? { ...a, isSaved: res.isSaved } : a))
      );
      success(res.isSaved ? 'Article bookmarked' : 'Article removed from bookmarks');
    } catch (err: any) {
      error('Failed to bookmark article');
    }
  };

  const featuredArticle = articles.find(a => a.isFeatured) || articles[0];
  const gridArticles = articles.filter(a => a.id !== featuredArticle?.id || showSavedOnly);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Primary Section Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl max-w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('news')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'news'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Newspaper className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Education News & Updates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gov-portals')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'gov-portals'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Official Gov Education Websites</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded-full font-mono">
              gov.lk
            </span>
          </button>
        </div>

        {activeTab === 'news' && user && (
          <button
            type="button"
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs ${
              showSavedOnly
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-white' : ''}`} />
            <span>{showSavedOnly ? 'Showing Bookmarks' : 'Saved Articles'}</span>
          </button>
        )}
      </div>

      {/* Render Gov Portals Directory */}
      {activeTab === 'gov-portals' ? (
        <GovPortalsView />
      ) : (
        <>
          {/* Top Banner & Daily Sync Status */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-900/10 via-slate-50 to-emerald-900/10 dark:from-indigo-950/40 dark:via-slate-900 dark:to-emerald-950/40 border border-slate-200 dark:border-slate-800">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Auto Daily Update: Active
                </span>
                <span className="text-[11px] text-slate-400">
                  {lastSyncTime ? `Last synced: ${new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Daily updates 24/7'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <span>Sri Lanka Education News & Opportunities</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Auto-updated daily with DoENETS examination timetables, MOE circulars, UGC Z-Scores, and STEM scholarships.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSyncDailyNews}
                disabled={syncing}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing News...' : 'Sync Today\'s News'}</span>
              </button>
            </div>
          </div>

      {/* Search & Category Pills */}
      <div className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search news by topic, university, scholarship, or keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-20 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Hero Article (when not in search/saved view) */}
      {!loading && !showSavedOnly && !searchQuery && featuredArticle && (
        <div
          onClick={() => onNavigate('news-detail', featuredArticle.slug)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer grid lg:grid-cols-12 gap-0 group"
        >
          <div className="lg:col-span-7 h-64 lg:h-auto overflow-hidden">
            <img
              src={featuredArticle.coverImage}
              alt={featuredArticle.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
          </div>
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <CategoryBadge category={featuredArticle.category} />
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Featured Story
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-tight">
                {featuredArticle.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                {featuredArticle.summary}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
              <span>{featuredArticle.source}</span>
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-1 transition-transform">
                <span>Read Full Article</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Articles */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <NewsSkeleton key={i} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <Newspaper className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">No articles found</h4>
          <p className="text-xs text-slate-400">Try selecting a different category or adjusting your search keyword.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridArticles.map(article => (
            <article
              key={article.id}
              onClick={() => onNavigate('news-detail', article.slug)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <CategoryBadge category={article.category} />
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {article.summary}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                <span>{article.source}</span>
                <div className="flex items-center gap-2">
                  {user && (
                    <button
                      type="button"
                      onClick={e => handleToggleSave(article, e)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        article.isSaved ? 'text-indigo-600' : 'hover:text-slate-600'
                      }`}
                      title="Bookmark Article"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${article.isSaved ? 'fill-indigo-600' : ''}`} />
                    </button>
                  )}
                  <span>{new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
        </>
      )}

    </div>
  );
};
