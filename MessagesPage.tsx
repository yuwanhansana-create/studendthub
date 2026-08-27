import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Image as ImageIcon,
  UserCheck,
  ShieldAlert,
  Search,
  CheckCheck,
  Check,
  Lock,
  X
} from 'lucide-react';
import { Conversation, Message } from '../types/index.js';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Avatar } from '../components/common/Avatar.js';
import { StudentIdBadge } from '../components/common/Badge.js';
import { useToast } from '../components/common/Toast.js';

interface MessagesPageProps {
  initialConversationId?: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({
  initialConversationId,
  onNavigate
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data.conversations || []);
      if (!activeConversationId && data.conversations?.length > 0) {
        setActiveConversationId(data.conversations[0].id);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingConv(false);
    }
  };

  const loadMessages = async (convId: string) => {
    setLoadingMessages(true);
    try {
      const data = await api.getMessages(convId);
      setMessages(data.messages || []);
    } catch (err: any) {
      error('Failed to load message history');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId || (!textInput.trim() && !mediaUrlInput.trim())) return;

    const content = textInput.trim();
    const media = mediaUrlInput.trim() || undefined;

    setTextInput('');
    setMediaUrlInput('');
    setShowMediaInput(false);

    try {
      const res = await api.sendMessage(activeConversationId, {
        content,
        mediaUrl: media
      });

      setMessages(prev => [...prev, res.message]);
      loadConversations();
    } catch (err: any) {
      error(err.message || 'Failed to send message');
    }
  };

  const activeConv = conversations.find(c => c.id === activeConversationId);

  const filteredConversations = conversations.filter(c =>
    c.otherUser.fullName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.otherUser.studentId.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] min-h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row pb-12 sm:pb-0">
      
      {/* Left Sidebar: Conversations List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col ${
        activeConversationId ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Header & Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Direct Messages</span>
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              {conversations.length} Active
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
          {loadingConv ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <UserCheck className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-400">
                {conversations.length === 0
                  ? 'No conversations yet. Connect with classmates first!'
                  : 'No matching chats found.'}
              </p>
              {conversations.length === 0 && (
                <button
                  type="button"
                  onClick={() => onNavigate('friends')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  View Friends
                </button>
              )}
            </div>
          ) : (
            filteredConversations.map(c => {
              const isSelected = c.id === activeConversationId;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConversationId(c.id)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-l-4 border-indigo-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <Avatar src={c.otherUser.avatarUrl} alt={c.otherUser.fullName} size="md" showOnline />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {c.otherUser.fullName}
                      </h4>
                      {c.lastMessage && (
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {c.lastMessage ? c.lastMessage.content : 'No messages yet'}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Safety Footer note */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Friends-Only Protected Chat</span>
        </div>

      </div>

      {/* Right Column: Active Chat Thread */}
      <div className={`flex-1 flex flex-col h-full ${
        !activeConversationId ? 'hidden md:flex' : 'flex'
      }`}>
        {activeConv ? (
          <>
            {/* Chat Thread Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/30">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  ← Back
                </button>
                <Avatar
                  src={activeConv.otherUser.avatarUrl}
                  alt={activeConv.otherUser.fullName}
                  size="md"
                  showOnline
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {activeConv.otherUser.fullName}
                    </h4>
                    <StudentIdBadge idCode={activeConv.otherUser.studentId} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {activeConv.otherUser.school || activeConv.otherUser.grade || `@${activeConv.otherUser.username}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('profile', activeConv.otherUser.studentId)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline hidden sm:block"
              >
                View Profile
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {loadingMessages ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 w-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <p className="text-xs text-slate-400">
                    This is the start of your academic conversation with {activeConv.otherUser.fullName}.
                  </p>
                </div>
              ) : (
                messages.map(m => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-sm sm:max-w-md rounded-2xl p-3.5 text-xs sm:text-sm ${
                        m.isMine
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                      }`}
                    >
                      {m.mediaUrl && (
                        <img
                          src={m.mediaUrl}
                          alt="Attachment"
                          className="w-full rounded-xl mb-2 object-cover max-h-60"
                        />
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    </div>

                    <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                      <span>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {m.isMine && (
                        <span>
                          {m.isRead ? <CheckCheck className="w-3 h-3 text-indigo-500" /> : <Check className="w-3 h-3" />}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
            >
              {showMediaInput && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    placeholder="Attachment image URL (https://...)"
                    value={mediaUrlInput}
                    onChange={e => setMediaUrlInput(e.target.value)}
                    className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMediaInput(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMediaInput(!showMediaInput)}
                  className={`p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    showMediaInput ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : ''
                  }`}
                  title="Attach Image"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>

                <input
                  id="chat-message-input"
                  type="text"
                  placeholder={`Message ${activeConv.otherUser.fullName}...`}
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />

                <button
                  id="chat-send-btn"
                  type="submit"
                  disabled={!textInput.trim() && !mediaUrlInput.trim()}
                  className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Select a conversation to start chatting
            </h4>
            <p className="text-xs text-slate-500 max-w-sm">
              Direct messages are strictly restricted to confirmed friends to maintain a safe, distraction-free environment.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
