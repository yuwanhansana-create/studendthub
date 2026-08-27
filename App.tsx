import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LanguageProvider } from './context/LanguageContext.js';
import { ToastProvider, useToast } from './components/common/Toast.js';
import { Navbar } from './components/layout/Navbar.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { RightSidebar } from './components/layout/RightSidebar.js';
import { MobileNav } from './components/layout/MobileNav.js';
import { Modal } from './components/common/Modal.js';
import { StudentHubAIWidget } from './components/ai/StudentHubAIWidget.js';

// Pages
import { LandingPage } from './pages/LandingPage.js';
import { SignInPage } from './pages/SignInPage.js';
import { SignUpPage } from './pages/SignUpPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { FeedPage } from './pages/FeedPage.js';
import { FindStudentsPage } from './pages/FindStudentsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { FriendsPage } from './pages/FriendsPage.js';
import { NotificationsPage } from './pages/NotificationsPage.js';
import { MessagesPage } from './pages/MessagesPage.js';
import { NewsPage } from './pages/NewsPage.js';
import { NewsDetailPage } from './pages/NewsDetailPage.js';
import { AIAssistantPage } from './pages/AIAssistantPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { AdminPage } from './pages/AdminPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { api } from './lib/api.js';

const CATEGORIES = [
  'General Academics',
  'Combined Mathematics & Physics',
  'Biology & Chemistry',
  'Commerce & Accounting',
  'ICT & Computer Science',
  'Arts & Humanities',
  'Technology Stream',
  'Study Tips & Past Papers'
];

const MainApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { success, error } = useToast();

  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [activeParam, setActiveParam] = useState<string | undefined>(undefined);

  // Global Quick Post Modal
  const [isQuickPostOpen, setIsQuickPostOpen] = useState(false);
  const [quickPostContent, setQuickPostContent] = useState('');
  const [quickPostCategory, setQuickPostCategory] = useState('Computer Science');
  const [quickPostImageUrl, setQuickPostImageUrl] = useState('');
  const [isPublishingQuickPost, setIsPublishingQuickPost] = useState(false);

  // Redirect to feed if user is logged in and on landing/auth page initially
  useEffect(() => {
    if (!authLoading && user && (currentTab === 'landing' || currentTab === 'signin' || currentTab === 'signup')) {
      setCurrentTab('feed');
    }
  }, [user, authLoading]);

  const handleNavigate = (tab: string, param?: string) => {
    setCurrentTab(tab);
    setActiveParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGlobalCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPostContent.trim()) {
      error('Please write something for your post');
      return;
    }

    setIsPublishingQuickPost(true);
    try {
      await api.createPost({
        content: quickPostContent.trim(),
        category: quickPostCategory,
        imageUrl: quickPostImageUrl.trim() || undefined
      });
      success('Post published to StudentHub feed!');
      setIsQuickPostOpen(false);
      setQuickPostContent('');
      setQuickPostImageUrl('');
      if (currentTab !== 'feed') {
        handleNavigate('feed');
      }
    } catch (err: any) {
      error(err.message || 'Failed to publish post');
    } finally {
      setIsPublishingQuickPost(false);
    }
  };

  const isAuthOrLandingPage =
    currentTab === 'landing' ||
    currentTab === 'signin' ||
    currentTab === 'signup' ||
    currentTab === 'forgot-password' ||
    currentTab === 'about' ||
    currentTab === 'contact';

  const showRightSidebar =
    user &&
    !isAuthOrLandingPage &&
    currentTab !== 'messages' &&
    currentTab !== 'admin' &&
    currentTab !== 'settings';

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-pulse mx-auto" />
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">
            Loading StudentHub...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-150">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenCreatePost={() => setIsQuickPostOpen(true)}
      />

      {/* Main Container Layout */}
      {isAuthOrLandingPage ? (
        <main className="flex-1">
          {currentTab === 'landing' && <LandingPage onNavigate={handleNavigate} />}
          {currentTab === 'about' && <AboutPage onNavigate={handleNavigate} />}
          {currentTab === 'contact' && <ContactPage onNavigate={handleNavigate} />}
          {currentTab === 'signin' && <SignInPage onNavigate={handleNavigate} />}
          {currentTab === 'signup' && <SignUpPage onNavigate={handleNavigate} />}
          {currentTab === 'forgot-password' && <ForgotPasswordPage onNavigate={handleNavigate} />}
        </main>
      ) : (
        <div className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex gap-6">
          
          {/* Left Navigation Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onNavigate={handleNavigate}
            onOpenCreatePost={() => setIsQuickPostOpen(true)}
          />

          {/* Center Main Content Area */}
          <main className="flex-1 min-w-0">
            {currentTab === 'feed' && (
              <FeedPage onNavigate={handleNavigate} />
            )}
            {currentTab === 'search' && (
              <FindStudentsPage onNavigate={handleNavigate} initialQuery={activeParam} />
            )}
            {currentTab === 'profile' && (
              <ProfilePage
                identifier={activeParam || user?.studentId || ''}
                onNavigate={handleNavigate}
              />
            )}
            {currentTab === 'friends' && (
              <FriendsPage onNavigate={handleNavigate} />
            )}
            {currentTab === 'notifications' && (
              <NotificationsPage onNavigate={handleNavigate} />
            )}
            {currentTab === 'messages' && (
              <MessagesPage
                initialConversationId={activeParam}
                onNavigate={handleNavigate}
              />
            )}
            {currentTab === 'news' && (
              <NewsPage onNavigate={handleNavigate} initialSubTab="news" />
            )}
            {currentTab === 'gov-portals' && (
              <NewsPage onNavigate={handleNavigate} initialSubTab="gov-portals" />
            )}
            {currentTab === 'news-detail' && (
              <NewsDetailPage slug={activeParam || ''} onNavigate={handleNavigate} />
            )}
            {(currentTab === 'ai' || currentTab === 'ai-assistant') && (
              <AIAssistantPage onNavigate={handleNavigate} />
            )}
            {currentTab === 'settings' && (
              <SettingsPage onNavigate={handleNavigate} />
            )}
            {currentTab === 'admin' && (
              <AdminPage onNavigate={handleNavigate} />
            )}
          </main>

          {/* Right Insights Sidebar */}
          {showRightSidebar && (
            <RightSidebar onNavigate={handleNavigate} />
          )}

        </div>
      )}

      {/* Floating StudentHub AI Widget (Accessible Everywhere) */}
      <StudentHubAIWidget onNavigateToFullAI={() => handleNavigate('ai')} />

      {/* Mobile Bottom Navigation Bar */}
      {!isAuthOrLandingPage && (
        <MobileNav
          currentTab={currentTab}
          onNavigate={handleNavigate}
          onOpenCreatePost={() => setIsQuickPostOpen(true)}
        />
      )}

      {/* Global Quick Post Modal */}
      <Modal
        isOpen={isQuickPostOpen}
        onClose={() => setIsQuickPostOpen(false)}
        title="Create StudentHub Post"
        description="Share a study question, academic update, or topic discussion."
      >
        <form onSubmit={handleGlobalCreatePost} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={quickPostCategory}
              onChange={e => setQuickPostCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Post Content
            </label>
            <textarea
              rows={4}
              required
              placeholder="What are you studying today? Share insights, questions, or resources..."
              value={quickPostContent}
              onChange={e => setQuickPostContent(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Attachment Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={quickPostImageUrl}
              onChange={e => setQuickPostImageUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsQuickPostOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPublishingQuickPost || !quickPostContent.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs disabled:opacity-50"
            >
              {isPublishingQuickPost ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <MainApp />
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
