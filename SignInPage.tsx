import React, { useState } from 'react';
import {
  GraduationCap,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  ShieldAlert,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/common/Toast.js';

interface SignInPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { success, error } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      error('Please enter your Student ID / Email / Username and Password');
      return;
    }

    setLoading(true);
    try {
      await login({ identifier: identifier.trim(), password });
      success('Welcome back to StudentHub!');
      onNavigate('feed');
    } catch (err: any) {
      error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoId: string, demoPass: string, label: string) => {
    setLoading(true);
    try {
      await login({ identifier: demoId, password: demoPass });
      success(`Logged in as ${label}`);
      onNavigate('feed');
    } catch (err: any) {
      error(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-2">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign In to StudentHub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your Student ID, Username, or Email to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Student ID / Username / Email
            </label>
            <input
              id="signin-identifier-input"
              type="text"
              required
              placeholder="e.g. STU-7A42K9 or alex_chen"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono sm:font-sans"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="signin-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              id="signin-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Instant Demo Accounts</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('STU-7A42K9', 'student123', 'Alex Chen (Student)')}
              className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold text-center border border-indigo-100 dark:border-indigo-900/40 transition-colors"
            >
              Alex (Student)
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('STU-9B81X4', 'student123', 'Maya Patel (Student)')}
              className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-[11px] font-bold text-center border border-blue-100 dark:border-blue-900/40 transition-colors"
            >
              Maya (Student)
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin', 'admin123', 'Administrator')}
              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-[11px] font-bold text-center border border-rose-100 dark:border-rose-900/40 transition-colors"
            >
              Admin Portal
            </button>
          </div>
        </div>

        {/* Bottom prompt */}
        <div className="text-center pt-1">
          <p className="text-xs text-slate-500">
            Don't have a Student ID yet?{' '}
            <button
              type="button"
              onClick={() => onNavigate('signup')}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Create Account Free
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
