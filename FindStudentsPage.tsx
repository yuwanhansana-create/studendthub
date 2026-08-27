import React, { useState, useEffect } from 'react';
import {
  Search,
  Users,
  UserPlus,
  UserCheck,
  Clock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  School,
  BookOpen,
  MapPin,
  Filter,
  X,
  GraduationCap
} from 'lucide-react';
import { User, FriendStatus } from '../types/index.js';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Avatar } from '../components/common/Avatar.js';
import { StudentIdBadge } from '../components/common/Badge.js';
import { useToast } from '../components/common/Toast.js';
import { DISTRICT_NAMES, SRI_LANKA_GRADE_LEVELS } from '../data/sriLankaData.js';

interface FindStudentsPageProps {
  onNavigate: (tab: string, param?: string) => void;
  initialQuery?: string;
}

export const FindStudentsPage: React.FC<FindStudentsPageProps> = ({
  onNavigate,
  initialQuery = ''
}) => {
  const { user, refreshUser } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [query, setQuery] = useState(initialQuery);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});

  const executeSearch = async () => {
    setLoading(true);
    try {
      const data = await api.searchStudents({
        q: query.trim(),
        district: selectedDistrict || undefined,
        grade: selectedGrade || undefined
      });
      setResults(data.results || []);
    } catch (err: any) {
      console.error(err);
      toastError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [selectedDistrict, selectedGrade]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const handleClearFilters = () => {
    setQuery('');
    setSelectedDistrict('');
    setSelectedGrade('');
  };

  const handleSendRequest = async (targetStudentId: string, studentName: string) => {
    if (!user) {
      info('Please sign in to send friend requests');
      onNavigate('signin');
      return;
    }

    setActionInProgress(prev => ({ ...prev, [targetStudentId]: true }));
    try {
      await api.sendFriendRequest(targetStudentId);
      setResults(prev =>
        prev.map(s =>
          s.studentId.toUpperCase() === targetStudentId.toUpperCase() || s.id === targetStudentId
            ? { ...s, friendStatus: 'SENT' as FriendStatus }
            : s
        )
      );
      success(`Friend request sent to ${studentName}!`);
      refreshUser();
    } catch (err: any) {
      toastError(err.message || 'Failed to send friend request');
    } finally {
      setActionInProgress(prev => ({ ...prev, [targetStudentId]: false }));
    }
  };

  const handleCancelRequest = async (targetId: string) => {
    setActionInProgress(prev => ({ ...prev, [targetId]: true }));
    try {
      await api.cancelFriendRequest(targetId);
      setResults(prev =>
        prev.map(s =>
          s.id === targetId || s.studentId.toUpperCase() === targetId.toUpperCase()
            ? { ...s, friendStatus: 'NONE' as FriendStatus }
            : s
        )
      );
      success('Friend request cancelled');
      refreshUser();
    } catch (err: any) {
      toastError(err.message || 'Failed to cancel request');
    } finally {
      setActionInProgress(prev => ({ ...prev, [targetId]: false }));
    }
  };

  const handleStartChat = async (targetUserId: string) => {
    try {
      const conv = await api.startConversation(targetUserId);
      onNavigate('messages', conv.conversation.id);
    } catch (err: any) {
      toastError(err.message || 'Could not start chat');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200/60 dark:border-indigo-800/60">
            <Users className="w-3.5 h-3.5" />
            <span>Sri Lankan Student Directory 🇱🇰</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Find Classmates & Study Partners
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Search students across all 25 districts using non-sequential <strong>Student IDs</strong> (e.g. <code>STU-7A42K9</code>), full names, or filter by academic stream.
          </p>
        </div>

        {/* Search Bar and Filter Controls */}
        <form onSubmit={handleSearchSubmit} className="space-y-3 pt-2">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search Student ID (e.g. STU-...), name, school or subjects..."
              className="w-full pl-12 pr-28 py-3.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all"
            >
              Search
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span className="font-semibold">Filter:</span>
            </div>

            {/* District Selector */}
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="">All Sri Lanka Districts (25)</option>
              {DISTRICT_NAMES.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Grade / Stream Selector */}
            <select
              value={selectedGrade}
              onChange={e => setSelectedGrade(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="">All Academic Streams / Grades</option>
              {SRI_LANKA_GRADE_LEVELS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {(query || selectedDistrict || selectedGrade) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search Results Count */}
      <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
        <span>{results.length} Students Found</span>
        {selectedDistrict && <span>District: {selectedDistrict}</span>}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              No matching students found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try searching with a full Student ID (e.g. <code>STU-7A42K9</code>) or removing filter constraints.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(student => {
            const isSelf = user?.id === student.id;
            const isFriend = student.friendStatus === 'FRIENDS' || (student.friendStatus as any) === 'ACCEPTED';
            const isPendingSent = student.friendStatus === 'SENT';
            const isPendingReceived = student.friendStatus === 'RECEIVED';
            const isBusy = actionInProgress[student.studentId] || actionInProgress[student.id];

            return (
              <div
                key={student.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:border-indigo-500 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Avatar, Name & Student ID */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => onNavigate('profile', student.studentId)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <Avatar
                        src={student.avatarUrl}
                        alt={student.fullName}
                        size="md"
                        showOnline={student.isOnline}
                      />
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {student.fullName}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          @{student.username}
                        </p>
                      </div>
                    </div>

                    <StudentIdBadge idCode={student.studentId} size="sm" />
                  </div>

                  {/* Sri Lankan District, School & Grade Metadata */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    {student.district && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{student.district} District {student.province ? `(${student.province})` : ''}</span>
                      </div>
                    )}
                    {student.school && (
                      <div className="flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{student.school}</span>
                      </div>
                    )}
                    {student.grade && (
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate font-medium">{student.grade}</span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {student.bio && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                      "{student.bio}"
                    </p>
                  )}

                  {/* Subject Badges */}
                  {student.subjects && student.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {student.subjects.slice(0, 3).map((sub, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                        >
                          {sub}
                        </span>
                      ))}
                      {student.subjects.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{student.subjects.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Action Controls */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onNavigate('profile', student.studentId)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Profile →
                  </button>

                  {!isSelf && (
                    <div className="flex items-center gap-1.5">
                      {isFriend ? (
                        <>
                          <button
                            onClick={() => handleStartChat(student.id)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat</span>
                          </button>
                          <span className="px-2 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Friend</span>
                          </span>
                        </>
                      ) : isPendingSent ? (
                        <button
                          disabled={isBusy}
                          onClick={() => handleCancelRequest(student.id)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Request Sent</span>
                        </button>
                      ) : isPendingReceived ? (
                        <button
                          onClick={() => onNavigate('friends')}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold flex items-center gap-1"
                        >
                          Respond
                        </button>
                      ) : (
                        <button
                          disabled={isBusy}
                          onClick={() => handleSendRequest(student.studentId, student.fullName)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all disabled:opacity-50"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Connect</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
