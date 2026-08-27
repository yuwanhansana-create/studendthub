import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Newspaper,
  UserPlus,
  QrCode,
  ArrowRight,
  Check,
  Copy,
  Landmark,
  ExternalLink,
  FileCheck,
  BookOpen,
  Laptop,
  GraduationCap
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Avatar } from '../common/Avatar.js';
import { useToast } from '../common/Toast.js';

interface RightSidebarProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [trendingNews, setTrendingNews] = useState<any[]>([]);
  const [suggestedStudents, setSuggestedStudents] = useState<any[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    // Load trending news
    api.getNews({ featured: true })
      .then(res => setTrendingNews(res.articles.slice(0, 3)))
      .catch(console.error);

    // Load suggested students
    if (user) {
      api.searchStudents('')
        .then(res => {
          const suggestions = res.results
            .filter((s: any) => s.id !== user.id && s.friendStatus === 'NONE')
            .slice(0, 3);
          setSuggestedStudents(suggestions);
        })
        .catch(console.error);
    }
  }, [user]);

  const handleCopyId = () => {
    if (user?.studentId) {
      navigator.clipboard.writeText(user.studentId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      success('Student ID copied to clipboard');
    }
  };

  const handleConnect = async (studentId: string, studentName: string) => {
    setConnectingId(studentId);
    try {
      await api.sendFriendRequest(studentId);
      success(`Friend request sent to ${studentName}!`);
      setSuggestedStudents(prev => prev.filter(s => s.studentId !== studentId));
    } catch (err: any) {
      error(err.message || 'Failed to send friend request');
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <aside className="w-72 flex-shrink-0 hidden xl:block sticky top-20 h-[calc(100vh-5rem)] space-y-5 overflow-y-auto pl-1 pb-4">
      
      {/* Official ID Geometric Badge Card */}
      {user && (
        <div className="bg-indigo-600 dark:bg-indigo-700 rounded-2xl p-5 text-white shadow-md shadow-indigo-500/15 relative overflow-hidden">
          <div className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1 flex items-center justify-between">
            <span>OFFICIAL ID</span>
            <button
              type="button"
              onClick={handleCopyId}
              className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              title="Copy ID"
            >
              {copiedId ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3 text-white" />}
            </button>
          </div>
          <div className="text-2xl font-mono font-black mb-4 tracking-wider">
            {user.studentId}
          </div>
          <div className="flex justify-between items-end">
            <div className="text-[10px] uppercase font-bold tracking-wide opacity-90 leading-tight">
              <div>{user.fullName}</div>
              <div className="text-indigo-200 text-[9px] font-medium mt-0.5">
                {user.grade || 'STUDENT'} • {user.school || 'STUDENTHUB'}
              </div>
            </div>
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-xs">
              <QrCode className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* AI Study Assistant Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>AI Study Assistant</span>
          </h3>
          <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 px-2 py-0.5 rounded-full font-bold">
            PRO
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg text-xs text-slate-600 dark:text-slate-300 italic border border-slate-100 dark:border-slate-800 mb-3 leading-relaxed">
          "Explain quantum physics and calculus fundamentals simply..."
        </div>

        <button
          type="button"
          onClick={() => onNavigate('ai-assistant')}
          className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-900 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Open Assistant</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Official Gov Education Portals Quick Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Gov Education Portals</span>
          </h3>
          <button
            type="button"
            onClick={() => onNavigate('gov-portals')}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
          >
            Directory
          </button>
        </div>

        <div className="space-y-1.5">
          <a
            href="https://results.doenets.lk/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 transition-all group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileCheck className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  DoENETS Exam Results
                </p>
                <p className="text-[10px] text-slate-400 truncate">results.doenets.lk</p>
              </div>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </a>

          <a
            href="http://www.edupub.gov.lk/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 transition-all group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  EduPub Free Textbooks
                </p>
                <p className="text-[10px] text-slate-400 truncate">edupub.gov.lk</p>
              </div>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </a>

          <a
            href="https://www.e-thaksalawa.moe.gov.lk/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 transition-all group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Laptop className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  e-Thaksalawa National LMS
                </p>
                <p className="text-[10px] text-slate-400 truncate">e-thaksalawa.moe.gov.lk</p>
              </div>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </a>

          <a
            href="https://www.ugc.ac.lk/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 transition-all group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <GraduationCap className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  UGC University Admissions
                </p>
                <p className="text-[10px] text-slate-400 truncate">ugc.ac.lk</p>
              </div>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </a>
        </div>
      </div>

      {/* Latest in Education Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
            <Newspaper className="w-3.5 h-3.5 text-slate-400" />
            <span>Latest in Education</span>
          </h3>
          <button
            type="button"
            onClick={() => onNavigate('news')}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
          >
            All
          </button>
        </div>

        <div className="space-y-3">
          {trendingNews.length === 0 ? (
            <p className="text-xs text-slate-400">Loading articles...</p>
          ) : (
            trendingNews.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => onNavigate('news-detail', item.slug)}
                className={`flex gap-3 cursor-pointer group ${idx > 0 ? 'border-t border-slate-100 dark:border-slate-800 pt-3' : ''}`}
              >
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                  {item.coverImage ? (
                    <img src={item.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-500 text-xs font-bold">
                      {item.category?.slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold leading-tight text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">{item.category}</span>
                    <span>•</span>
                    <span>{new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Suggested Students Widget */}
      {user && suggestedStudents.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Suggested Students</span>
            </h4>
            <button
              type="button"
              onClick={() => onNavigate('search')}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Explore
            </button>
          </div>

          <div className="space-y-2.5">
            {suggestedStudents.map(student => (
              <div
                key={student.id}
                className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                  onClick={() => onNavigate('profile', student.studentId)}
                >
                  <Avatar src={student.avatarUrl} alt={student.fullName} size="sm" />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-indigo-600">
                      {student.fullName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {student.school || `@${student.username}`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={connectingId === student.studentId}
                  onClick={() => handleConnect(student.studentId, student.fullName)}
                  className="flex-shrink-0 px-2.5 py-1 text-[11px] font-bold rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  {connectingId === student.studentId ? '...' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </aside>
  );
};
