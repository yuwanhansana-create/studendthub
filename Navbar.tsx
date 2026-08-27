import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  Bell,
  MessageSquare,
  Sun,
  Moon,
  PlusCircle,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  CheckCheck,
  ChevronDown,
  Menu,
  X,
  Languages,
  Bot,
  Newspaper,
  BookOpen,
  Info,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { Avatar } from '../common/Avatar.js';
import { StudentIdBadge } from '../common/Badge.js';
import { api } from '../../lib/api.js';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
  onOpenCreatePost?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenCreatePost
}) => {
  const { user, logout, unreadNotifications, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('search', searchQuery.trim());
      setSearchQuery('');
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotificationsList(data.notifications.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleNotifs = () => {
    if (!showNotifications) {
      loadNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await refreshUser();
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          
          {/* Logo & Official Branding: StudentHub.lk */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="navbar-logo-btn"
              type="button"
              onClick={() => onNavigate(user ? 'feed' : 'landing')}
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center font-extrabold text-white text-base shadow-sm group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1">
                  <span className="text-slate-900 dark:text-white font-extrabold text-lg tracking-tight">
                    StudentHub<span className="text-amber-500 font-black">.lk</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/50 dark:border-indigo-800/50">
                    🇱🇰 Sri Lanka
                  </span>
                </div>
                <span className="hidden sm:block text-[10px] text-slate-500 font-medium -mt-0.5">
                  Connect. Learn. Grow.
                </span>
              </div>
            </button>
          </div>

          {/* Search by Student ID or Name - Pill search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-sm mx-2 relative items-center"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              id="navbar-search-input"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Student ID (e.g. STU-...), name..."
              className="w-full bg-slate-100 dark:bg-slate-800/80 border-none rounded-full pl-9 pr-12 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none font-sans"
            />
            {searchQuery && (
              <button
                type="submit"
                className="absolute right-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Go
              </button>
            )}
          </form>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                id="navbar-language-btn"
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Change Language (English / සිංහල / தமிழ்)"
              >
                <Languages className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">
                  {language === 'si' ? 'සිංහල' : language === 'ta' ? 'தமிழ்' : 'English'}
                </span>
                <span className="sm:hidden uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('en');
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      language === 'en'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <span className="text-xs">✓</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('si');
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      language === 'si'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>සිංහල (Sinhala)</span>
                    {language === 'si' && <span className="text-xs">✓</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('ta');
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                      language === 'ta'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>தமிழ் (Tamil)</span>
                    {language === 'ta' && <span className="text-xs">✓</span>}
                  </button>
                </div>
              )}
            </div>
            
            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <>
                {/* Create Post Button */}
                {onOpenCreatePost && (
                  <button
                    id="navbar-create-post-btn"
                    type="button"
                    onClick={onOpenCreatePost}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Post</span>
                  </button>
                )}

                {/* Messages Shortcut */}
                <button
                  id="navbar-messages-btn"
                  type="button"
                  onClick={() => onNavigate('messages')}
                  className={`p-2 rounded-xl relative transition-colors cursor-pointer ${
                    currentTab === 'messages'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Direct Messages"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                {/* Notifications Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    id="navbar-notifications-btn"
                    type="button"
                    onClick={toggleNotifs}
                    className={`p-2 rounded-xl relative transition-colors cursor-pointer ${
                      showNotifications || currentTab === 'notifications'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                          {unreadNotifications > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                              {unreadNotifications} new
                            </span>
                          )}
                        </div>
                        {unreadNotifications > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                        {notificationsList.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notificationsList.map(n => (
                            <div
                              key={n.id}
                              onClick={() => {
                                setShowNotifications(false);
                                onNavigate('notifications');
                              }}
                              className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                                !n.isRead ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                  {n.title}
                                </p>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                                {n.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="pt-2 px-4 border-t border-slate-100 dark:border-slate-800 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNotifications(false);
                            onNavigate('notifications');
                          }}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 py-1 inline-block w-full"
                        >
                          View all notifications →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu Avatar */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    id="navbar-user-menu-btn"
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Avatar src={user.avatarUrl} alt={user.fullName} size="sm" showOnline />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          @{user.username} {user.district && `• ${user.district}`}
                        </p>
                        <div className="mt-2">
                          <StudentIdBadge idCode={user.studentId} size="sm" />
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          id="menu-my-profile-btn"
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            onNavigate('profile', user.studentId);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>My Student Profile</span>
                        </button>

                        <button
                          id="menu-ai-assistant-btn"
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            onNavigate('ai');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-left transition-colors font-semibold"
                        >
                          <Bot className="w-4 h-4" />
                          <span>StudentHub AI Tutor 🇱🇰</span>
                        </button>

                        <button
                          id="menu-news-btn"
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            onNavigate('news');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                        >
                          <Newspaper className="w-4 h-4 text-slate-400" />
                          <span>Sri Lanka Education News</span>
                        </button>

                        <button
                          id="menu-about-btn"
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            onNavigate('about');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                        >
                          <Info className="w-4 h-4 text-slate-400" />
                          <span>About Founder & Platform</span>
                        </button>

                        <button
                          id="menu-contact-btn"
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            onNavigate('contact');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                        >
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>Contact Founder & Support</span>
                        </button>

                        <button
                          id="menu-settings-btn"
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            onNavigate('settings');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-slate-400" />
                          <span>Settings & Privacy</span>
                        </button>

                        {user.role === 'ADMIN' && (
                          <button
                            id="menu-admin-portal-btn"
                            type="button"
                            onClick={() => {
                              setShowUserMenu(false);
                              onNavigate('admin');
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Admin Moderation Portal</span>
                          </button>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          id="menu-logout-btn"
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                            onNavigate('landing');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  id="navbar-signin-btn"
                  type="button"
                  onClick={() => onNavigate('signin')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </button>
                <button
                  id="navbar-signup-btn"
                  type="button"
                  onClick={() => onNavigate('signup')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
                >
                  Join StudentHub
                </button>
              </div>
            )}

            {/* Mobile Drawer Trigger */}
            <button
              id="mobile-menu-trigger-btn"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Student ID (e.g. STU-7A42K9)..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </form>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('ai');
                }}
                className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                <span>StudentHub AI</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('news');
                }}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2"
              >
                <Newspaper className="w-4 h-4" />
                <span>Edu News</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('about');
                }}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2"
              >
                <Info className="w-4 h-4" />
                <span>About</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('contact');
                }}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Contact</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
