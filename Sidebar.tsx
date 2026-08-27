import React from 'react';
import {
  Home,
  Users,
  UserCheck,
  Newspaper,
  Bot,
  MessageSquare,
  User as UserIcon,
  Shield,
  Settings,
  Sparkles,
  QrCode,
  Check,
  Copy,
  Landmark,
  Info,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { Avatar } from '../common/Avatar.js';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
  onOpenCreatePost?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate }) => {
  const { user, pendingRequests, unreadNotifications } = useAuth();
  const [copiedId, setCopiedId] = React.useState(false);

  const handleCopyId = () => {
    if (user?.studentId) {
      navigator.clipboard.writeText(user.studentId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const navItems = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'search', label: 'Find Students', icon: Users, badge: 'ID Search' },
    { id: 'friends', label: 'Study Circle', icon: UserCheck, count: pendingRequests },
    { id: 'news', label: 'Education News', icon: Newspaper, badge: 'SL' },
    { id: 'gov-portals', label: 'Gov Education Links', icon: Landmark, badge: 'gov.lk' },
    { id: 'ai', label: 'StudentHub AI', icon: Bot, highlight: true, badge: 'Gemini' },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Sparkles, count: unreadNotifications },
  ];

  if (!user) {
    return (
      <aside className="w-64 flex-shrink-0 hidden lg:block sticky top-20 h-[calc(100vh-5rem)] space-y-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto font-bold">
              S
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              StudentHub Network
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Verify your student identity, connect with classmates, and collaborate securely.
            </p>
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => onNavigate('signup')}
                className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Create Student ID
              </button>
              <button
                type="button"
                onClick={() => onNavigate('signin')}
                className="w-full py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col sticky top-20 h-[calc(100vh-5rem)] space-y-4 overflow-y-auto pr-1 pb-4">
      {/* Navigation Card */}
      <nav className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-xs space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {item.count}
                </span>
              )}
              {item.badge && !item.count && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-2 my-1 border-t border-slate-100 dark:border-slate-800">
          <button
            id="sidebar-nav-about"
            type="button"
            onClick={() => onNavigate('about')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'about'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Info className="w-4 h-4 text-slate-400" />
            <span>About StudentHub</span>
          </button>

          <button
            id="sidebar-nav-contact"
            type="button"
            onClick={() => onNavigate('contact')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'contact'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Phone className="w-4 h-4 text-slate-400" />
            <span>Contact & Support</span>
          </button>

          <button
            id="sidebar-nav-profile"
            type="button"
            onClick={() => onNavigate('profile', user.studentId)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'profile'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <UserIcon className="w-4 h-4 text-slate-400" />
            <span>My Profile</span>
          </button>

          <button
            id="sidebar-nav-settings"
            type="button"
            onClick={() => onNavigate('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-transparent'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>

          {user.role === 'ADMIN' && (
            <button
              id="sidebar-nav-admin"
              type="button"
              onClick={() => onNavigate('admin')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Console</span>
            </button>
          )}
        </div>
      </nav>

      {/* User Mini Profile Card (Geometric Balance Bottom Style) */}
      <div className="mt-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div
            className="flex items-center gap-3 cursor-pointer min-w-0"
            onClick={() => onNavigate('profile', user.studentId)}
          >
            <Avatar src={user.avatarUrl} alt={user.fullName} size="md" />
            <div className="min-w-0">
              <div className="text-slate-900 dark:text-white text-xs font-bold truncate">
                {user.fullName}
              </div>
              <div className="text-slate-400 text-[10px] truncate">
                {user.grade ? `${user.grade} • ` : ''}{user.school || `@${user.username}`}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyId}
            title={`Copy ${user.studentId}`}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer flex-shrink-0"
          >
            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
