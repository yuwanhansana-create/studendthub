import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Clock,
  ShieldBan,
  MessageSquare,
  Check,
  X,
  Trash2,
  Search,
  School
} from 'lucide-react';
import { User, FriendRequest } from '../types/index.js';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Avatar } from '../components/common/Avatar.js';
import { StudentIdBadge } from '../components/common/Badge.js';
import { useToast } from '../components/common/Toast.js';

interface FriendsPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const FriendsPage: React.FC<FriendsPageProps> = ({ onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'friends' | 'received' | 'sent' | 'blocked'>('friends');
  const [friends, setFriends] = useState<User[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [friendsData, requestsData, blockedData] = await Promise.all([
        api.getFriends(),
        api.getRequests(),
        api.getBlockedUsers()
      ]);

      setFriends(friendsData.friends || []);
      setReceivedRequests(requestsData.receivedRequests || requestsData.received || []);
      setSentRequests(requestsData.sentRequests || requestsData.sent || []);
      setBlockedUsers(blockedData.blockedUsers || []);
    } catch (err: any) {
      console.error(err);
      error('Failed to load friends & requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcceptRequest = async (requestId: string, senderName?: string) => {
    try {
      await api.acceptFriendRequest(requestId);
      success(`Accepted friend request from ${senderName || 'student'}!`);
      refreshUser();
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await api.rejectFriendRequest(requestId);
      setReceivedRequests(prev => prev.filter(r => r.id !== requestId));
      success('Friend request declined');
      refreshUser();
    } catch (err: any) {
      error(err.message || 'Failed to decline request');
    }
  };

  const handleCancelSentRequest = async (targetUserId: string) => {
    try {
      await api.cancelFriendRequest(targetUserId);
      setSentRequests(prev => prev.filter(r => r.receiver?.id !== targetUserId));
      success('Sent request cancelled');
      refreshUser();
    } catch (err: any) {
      error(err.message || 'Failed to cancel request');
    }
  };

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    if (!confirm(`Are you sure you want to remove ${friendName} from your friends?`)) return;
    try {
      await api.removeFriend(friendId);
      setFriends(prev => prev.filter(f => f.id !== friendId));
      success(`Removed ${friendName} from friends`);
      refreshUser();
    } catch (err: any) {
      error(err.message || 'Failed to remove friend');
    }
  };

  const handleUnblockUser = async (userId: string, name: string) => {
    try {
      await api.unblockUser(userId);
      setBlockedUsers(prev => prev.filter(u => u.id !== userId));
      success(`Unblocked ${name}`);
    } catch (err: any) {
      error(err.message || 'Failed to unblock user');
    }
  };

  const handleStartChat = async (friendId: string) => {
    try {
      const res = await api.startConversation(friendId);
      onNavigate('messages', res.conversation.id);
    } catch (err: any) {
      error(err.message || 'Failed to open message conversation');
    }
  };

  const filteredFriends = friends.filter(
    f =>
      f.fullName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.studentId.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (f.school && f.school.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Friends & Study Connections</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your verified student network and pending requests
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('search')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Find by Student ID</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'friends'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All Friends ({friends.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'received'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Received</span>
          {receivedRequests.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {receivedRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'sent'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Sent ({sentRequests.length})</span>
        </button>

        {blockedUsers.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('blocked')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'blocked'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ShieldBan className="w-4 h-4" />
            <span>Blocked ({blockedUsers.length})</span>
          </button>
        )}
      </div>

      {/* TAB 1: All Friends */}
      {activeTab === 'friends' && (
        <div className="space-y-4">
          {friends.length > 3 && (
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter friends by name or Student ID..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          )}

          {filteredFriends.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {searchFilter ? 'No matching friends found' : 'No friends added yet'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Share your Student ID with classmates or search for theirs to connect.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('search')}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                Search Students
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredFriends.map(friend => (
                <div
                  key={friend.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div
                    className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                    onClick={() => onNavigate('profile', friend.studentId)}
                  >
                    <Avatar src={friend.avatarUrl} alt={friend.fullName} size="md" showOnline />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {friend.fullName}
                        </h4>
                        <StudentIdBadge idCode={friend.studentId} size="sm" showCopy={false} />
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {friend.school || friend.grade || `@${friend.username}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartChat(friend.id)}
                      className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                      title="Send Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveFriend(friend.id, friend.fullName)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove Friend"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Received Friend Requests */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {receivedRequests.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <UserCheck className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-400">No pending friend requests.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {receivedRequests.map(req => {
                const sender = req.sender;
                if (!sender) return null;

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => onNavigate('profile', sender.studentId)}
                    >
                      <Avatar src={sender.avatarUrl} alt={sender.fullName} size="md" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {sender.fullName}
                          </h4>
                          <StudentIdBadge idCode={sender.studentId} size="sm" showCopy={false} />
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {sender.school || sender.grade}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleAcceptRequest(req.id, sender.fullName)}
                        className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectRequest(req.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Sent Requests */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {sentRequests.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-400">No outgoing pending requests.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {sentRequests.map(req => {
                const receiver = req.receiver;
                if (!receiver) return null;

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div
                      className="flex items-center gap-3 min-w-0 cursor-pointer"
                      onClick={() => onNavigate('profile', receiver.studentId)}
                    >
                      <Avatar src={receiver.avatarUrl} alt={receiver.fullName} size="md" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {receiver.fullName}
                        </h4>
                        <StudentIdBadge idCode={receiver.studentId} size="sm" showCopy={false} />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCancelSentRequest(receiver.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Blocked Users */}
      {activeTab === 'blocked' && (
        <div className="space-y-3">
          {blockedUsers.map(u => (
            <div
              key={u.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar src={u.avatarUrl} alt={u.fullName} size="sm" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{u.fullName}</h4>
                  <p className="text-[10px] text-slate-400">@{u.username}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleUnblockUser(u.id, u.fullName)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-bold transition-colors"
              >
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
