import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  User,
  Share2,
  Bookmark,
  Building,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { NewsArticle } from '../types/index.js';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { CategoryBadge } from '../components/common/Badge.js';
import { useToast } from '../components/common/Toast.js';

interface NewsDetailPageProps {
  slug: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const NewsDetailPage: React.FC<NewsDetailPageProps> = ({ slug, onNavigate }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getNewsArticle(slug)
      .then(res => {
        setArticle(res.article);
        setRelatedArticles(res.related || []);
      })
      .catch(err => {
        error(err.message || 'Article not found');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleToggleSave = async () => {
    if (!article) return;
    if (!user) {
      onNavigate('signin');
      return;
    }
    try {
      const res = await api.toggleSaveNews(article.id);
      setArticle({ ...article, isSaved: res.isSaved });
      success(res.isSaved ? 'Article bookmarked' : 'Article removed from bookmarks');
    } catch (err: any) {
      error('Failed to save article');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    success('Article link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-6">
        <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse" />
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-sm animate-pulse" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-md mx-auto p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Article Not Found</h3>
        <button
          type="button"
          onClick={() => onNavigate('news')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
        >
          Back to News
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      
      {/* Back Button */}
      <button
        type="button"
        onClick={() => onNavigate('news')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All News</span>
      </button>

      {/* Article Container */}
      <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs space-y-6">
        
        {/* Cover Photo */}
        <div className="h-64 sm:h-80 overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 sm:p-10 space-y-6">
          
          {/* Category & Action Controls */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CategoryBadge category={article.category} />
            
            <div className="flex items-center gap-2">
              {user && (
                <button
                  type="button"
                  onClick={handleToggleSave}
                  className={`p-2 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors ${
                    article.isSaved ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                  title="Bookmark Article"
                >
                  <Bookmark className={`w-4 h-4 ${article.isSaved ? 'fill-indigo-600' : ''}`} />
                </button>
              )}
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Share Article"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Headline Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 py-3 border-y border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-medium">
              <Building className="w-4 h-4 text-indigo-500" />
              <span>Source: {article.source}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>
                {new Date(article.publishedAt).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-500" />
              <span>Editor: {article.authorName}</span>
            </div>
          </div>

          {/* Summary Lead */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-sm font-semibold text-indigo-950 dark:text-indigo-200 leading-relaxed">
            {article.summary}
          </div>

          {/* Body Content */}
          <div className="text-slate-800 dark:text-slate-200 text-base leading-relaxed space-y-4 whitespace-pre-wrap font-sans">
            {article.content}
          </div>

        </div>
      </article>

      {/* Related News */}
      {relatedArticles.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
            Related Academic News
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {relatedArticles.map(rel => (
              <div
                key={rel.id}
                onClick={() => onNavigate('news-detail', rel.slug)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer space-y-2 shadow-xs"
              >
                <CategoryBadge category={rel.category} />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 hover:text-indigo-600 transition-colors">
                  {rel.title}
                </h4>
                <p className="text-xs text-slate-400">
                  {new Date(rel.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
