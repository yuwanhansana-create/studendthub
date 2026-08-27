import React, { useState } from 'react';
import { KeyRound, ArrowRight, ArrowLeft, CheckCircle2, GraduationCap } from 'lucide-react';
import { api } from '../lib/api.js';
import { useToast } from '../components/common/Toast.js';

interface ForgotPasswordPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await api.forgotPassword({ email: email.trim().toLowerCase() });
      setSubmitted(true);
      success('Password reset instructions generated');
    } catch (err: any) {
      error(err.message || 'Failed to process password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
        
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your registered email address to receive password recovery instructions
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Student Account Email
              </label>
              <input
                id="forgot-email-input"
                type="email"
                required
                placeholder="alex@student.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="pt-2">
              <button
                id="forgot-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <span>Sending Instructions...</span> : <span>Send Reset Instructions</span>}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4 py-2 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              If an account with <strong className="text-indigo-600 dark:text-indigo-400">{email}</strong> exists, reset instructions have been sent.
            </p>
          </div>
        )}

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onNavigate('signin')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </button>
        </div>

      </div>
    </div>
  );
};
