import React, { useState, useEffect } from 'react';
import {
  School,
  BookOpen,
  Calendar,
  UserPlus,
  UserCheck,
  MessageSquare,
  ShieldAlert,
  UserX,
  Flag,
  Sparkles,
  Settings,
  Layers,
  Heart,
  Bookmark,
  Share2,
  Clock,
  X
} from 'lucide-react';
import { User, Post, FriendStatus } from '../types/index.js';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Avatar } from '../components/common/Avatar.js';
import { StudentIdBadge, RoleBadge, CategoryBadge } from '../components/common/Badge.js';
import { Modal } from '../components/common/Modal.js';
import { useToast } from '../components/common/Toast.js';

interface ProfilePageProps {
  identifier: string; // studentId or username
  onNavigate: (tab: string, param?: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ identifier, onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const { success, error, info } = useToast();

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'saved'>('posts');

  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('INAPPROPRIATE_PROFILE');
  const [reportDetails, setReportDetails] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  // Resolve target identifier
  const cleanId = (identifier || '').trim();
  const isTargetingSelf = !cleanId || cleanId.toLowerCase() === 'me' || (user && (
    cleanId.toUpperCase() === user.studentId?.toUpperCase() ||
    cleanId === user.id ||
    cleanId.toLowerCase() === user.username?.toLowerCase()
  ));

  const loadProfileData = async () => {
    const targetId = cleanId || user?.studentId || user?.id || 'me';
    
    // If targeting self and we already have auth user, pre-fill
    if (isTargetingSelf && user && !profile) {
      setProfile(user);
    }

    setLoading(true);
    try {
      const data = await api.getProfile(targetId);
      const fetchedUser = data.profile || data.user;
      if (fetchedUser) {
        setProfile(fetchedUser);
      } else if (isTargetingSelf && user) {
        setProfile(user);
      }
      setPosts(data.posts || []);
      setFriendsCount(data.friendsCount || 0);
    } catch (err: any) {
      if (isTargetingSelf && user) {
        setProfile(user);
      } else {
        error(err.message || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [identifier, user?.id, user?.studentId]);

  const isSelf = user?.id === profile?.id;
  const status: FriendStatus = profile?.friendStatus || 'NONE';

  const handleSendFriendRequest = async () => {
    if (!profile) return;
    setActionBusy(true);
    try {
      await api.sendFriendRequest(profile.studentId);
      setProfile({ ...profile, friendStatus: 'SENT' });
      success(`Friend request sent to ${profile.fullName}!`);
      refreshUser();
    } catch (err: any) {
      error(err.message || 'Failed to send request');
    } finally {
      setActionBusy(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!profile) return;
    setActionBusy(true);
    try {
      await api.cancelFriendRequest(profile.id);
      setProfile({ ...profile, friendStatus: 'NONE' });
      success('Friend request cancelled');
      refreshUser();
    } catch (err: any) {
      error(err.message || 'Failed to cancel request');
    } finally {
      setActionBusy(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!profile) return;
    if (!confirm(`Are you sure you want to remove ${profile.fullName} from your friends?`)) return;
    setActionBusy(true);
    try {
      await api.removeFriend(profile.id);
      setProfile({ ...profile, friendStatus: 'NONE' });
      setFriendsCount(Math.max(0, friendsCount - 1));
      success(`Removed ${profile.fullName} from friends`);
      refreshUser();
    } catch (err: any) {
      error(err.message || 'Failed to remove friend');
    } finally {
      setActionBusy(false);
    }
  };

  const handleBlockUser = async () => {
    if (!profile) return;
    if (!confirm(`Block ${profile.fullName}? They will no longer be able to message or view your activity.`)) return;
    try {
      await api.blockUser(profile.id);
      success(`Blocked ${profile.fullName}`);
      onNavigate('feed');
    } catch (err: any) {
      error(err.message || 'Failed to block user');
    }
  };

  const handleStartChat = async () => {
    if (!profile) return;
    try {
      const res = await api.startConversation(profile.id);
      onNavigate('messages', res.conversation.id);
    } catch (err: any) {
      error(err.message || 'Unable to open messages');
    }
  };

  const handleReportUser = async () => {
    if (!profile) return;
    try {
      await api.reportUser(profile.id, {
        reason: reportReason,
        details: reportDetails.trim()
      });
      setShowReportModal(false);
      setReportDetails('');
      success('Profile reported to moderation team for investigation.');
    } catch (err: any) {
      error(err.message || 'Failed to submit report');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8 space-y-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
          <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="w-48 h-6 bg-slate-200 dark:bg-slate-800 rounded-sm" />
          <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded-sm" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-mono font-bold text-lg">
          ?
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Student Profile Not Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {cleanId ? `The requested ID or username "${cleanId}" does not exist.` : 'The requested student profile could not be loaded.'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          {user && (
            <button
              type="button"
              onClick={() => onNavigate('profile', user.studentId)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer transition-colors"
            >
              My Profile
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('search')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
          >
            Search Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      
      {/* Profile Banner Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        {/* Cover Background */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 relative">
          <div className="absolute top-4 right-4">
            <RoleBadge role={profile.role} />
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            <div className="relative">
              <Avatar
                src={profile.avatarUrl}
                alt={profile.fullName}
                size="2xl"
                className="ring-4 ring-white dark:ring-slate-900"
              />
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {isSelf ? (
                <button
                  type="button"
                  onClick={() => onNavigate('settings')}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  {status === 'FRIENDS' ? (
                    <>
                      <button
                        type="button"
                        onClick={handleStartChat}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Message</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveFriend}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 font-semibold text-xs transition-colors"
                        title="Remove Friend"
                      >
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                      </button>
                    </>
                  ) : status === 'SENT' ? (
                    <div className="flex items-center gap-1.5">
                      <span className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>Request Sent</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCancelRequest}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600"
                        title="Cancel Request"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={handleSendFriendRequest}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{actionBusy ? 'Sending...' : 'Add Friend'}</span>
                    </button>
                  )}

                  {/* Options Menu for other users */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(true)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Report Student"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleBlockUser}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Block Student"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Profile Name & Identity Badges */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {profile.fullName}
                </h2>
                <StudentIdBadge idCode={profile.studentId} size="md" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">@{profile.username}</p>
            </div>

            {profile.bio && (
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}

            {/* Academic & Platform Stats */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <School className="w-4 h-4 text-indigo-500" />
                <span>{profile.school || 'School hidden by student'}</span>
              </div>

              {profile.grade && (
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>{profile.grade}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
              </div>

              <div className="font-bold text-slate-900 dark:text-white">
                {friendsCount} {friendsCount === 1 ? 'Friend' : 'Friends'}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex items-center px-6 border-t border-slate-100 dark:border-slate-800 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'posts'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Posts ({posts.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            About & Identity
          </button>
        </div>
      </div>

      {/* Tab Content: Posts */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Layers className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-400">No posts published by this student yet.</p>
            </div>
          ) : (
            posts.map(post => (
              <div
                key={post.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <CategoryBadge category={post.category} />
                  <span className="text-[10px] text-slate-400">
                    {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {post.content}
                </p>

                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Attachment"
                    className="w-full max-h-72 object-cover rounded-2xl border border-slate-200 dark:border-slate-800"
                  />
                )}

                <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    <span>{post.likesCount} likes</span>
                  </span>
                  <span>{post.commentsCount} comments</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: About */}
      {activeTab === 'about' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Academic Details</h4>
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Educational Institution</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {profile.school || 'School hidden by privacy preference'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Level / Grade</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {profile.grade || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Student ID Security</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              StudentHub assigns unique non-sequential Student IDs so classmates can connect without exposing personal email addresses or phone numbers.
            </p>
            <StudentIdBadge idCode={profile.studentId} size="md" />
          </div>
        </div>
      )}

      {/* Report Student Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report Student Profile"
        description="Our moderation team reviews reports within 24 hours."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Report
            </label>
            <select
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
            >
              <option value="INAPPROPRIATE_PROFILE">Inappropriate bio, username or photo</option>
              <option value="IMPERSONATION">Impersonating someone else</option>
              <option value="HARASSMENT">Harassment or bullying</option>
              <option value="SPAM">Spam or solicitations</option>
              <option value="OTHER">Other safety issue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Details
            </label>
            <textarea
              rows={3}
              placeholder="Explain the reason for reporting this student..."
              value={reportDetails}
              onChange={e => setReportDetails(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowReportModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReportUser}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
            >
              Submit Report
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
