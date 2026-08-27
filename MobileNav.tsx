import React from 'react';
import { Home, Users, UserCheck, Newspaper, Bot, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface MobileNavProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onNavigate }) => {
  const { user, pendingRequests } = useAuth();

  const navItems = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'search', label: 'Search', icon: Users },
    { id: 'ai', label: 'StudentHub AI', icon: Bot },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'friends', label: 'Friends', icon: UserCheck, count: pendingRequests },
    { id: 'messages', label: 'Chat', icon: MessageSquare },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-1 ring-white dark:ring-slate-900">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
