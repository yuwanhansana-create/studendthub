import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  School,
  BookOpen,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/common/Toast.js';

interface SignUpPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
];

const GRADE_OPTIONS = [
  'Middle School (Grade 6-8)',
  'High School - Freshman (Grade 9)',
  'High School - Sophomore (Grade 10)',
  'High School - Junior (Grade 11)',
  'High School - Senior (Grade 12)',
  'Undergraduate - 1st Year (Freshman)',
  'Undergraduate - 2nd Year (Sophomore)',
  'Undergraduate - 3rd Year (Junior)',
  'Undergraduate - 4th Year (Senior)',
  'Graduate / Master / PhD Student',
  'Lifelong Learner / Other'
];

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { success, error } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [createdStudentId, setCreatedStudentId] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: GRADE_OPTIONS[3],
    school: '',
    bio: '',
    avatarUrl: DEFAULT_AVATARS[0]
  });

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.username.trim() || !formData.email.trim() || !formData.password) {
      error('Please fill in all required fields');
      return;
    }
    if (formData.password.length < 6) {
      error('Password must be at least 6 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      error('Passwords do not match');
      return;
    }
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await register({
        fullName: formData.fullName.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        grade: formData.grade,
        school: formData.school.trim(),
        bio: formData.bio.trim(),
        avatarUrl: formData.avatarUrl
      });

      setCreatedStudentId(res.studentId);
      setStep(3);
      success('Account created successfully!');
      
      // Trigger celebration confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      error(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const copyStudentId = () => {
    navigator.clipboard.writeText(createdStudentId);
    setCopiedId(true);
    success('Student ID copied to clipboard!');
    setTimeout(() => setCopiedId(false), 2500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Step Indicator (Only for Step 1 & 2) */}
        {step < 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className={step === 1 ? 'text-indigo-600 dark:text-indigo-400' : ''}>
                Step 1: Account
              </span>
              <span className={step === 2 ? 'text-indigo-600 dark:text-indigo-400' : ''}>
                Step 2: Academics
              </span>
              <span>Step 3: Student ID</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: step === 1 ? '33%' : '66%' }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: Basic Account Info */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-2">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Create Student Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Join StudentHub to receive your unique verified Student ID
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  id="signup-fullname-input"
                  type="text"
                  required
                  placeholder="e.g. Alex Chen"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Username *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-mono">@</span>
                  <input
                    id="signup-username-input"
                    type="text"
                    required
                    placeholder="alex_chen"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  id="signup-email-input"
                  type="email"
                  required
                  placeholder="alex@student.edu"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    id="signup-confirm-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                id="signup-continue-btn"
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Academic Info</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('signin')}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        )}

        {/* STEP 2: Academic Info & Profile Setup */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Academic Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tell us about your educational institution and choose an avatar
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Educational Level / Grade *
                </label>
                <select
                  id="signup-grade-select"
                  value={formData.grade}
                  onChange={e => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {GRADE_OPTIONS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  School / University Name
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    id="signup-school-input"
                    type="text"
                    placeholder="e.g. Stanford University or Lincoln High"
                    value={formData.school}
                    onChange={e => setFormData({ ...formData, school: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Student Bio / Interests
                </label>
                <textarea
                  id="signup-bio-input"
                  rows={2}
                  placeholder="e.g. Computer Science student passionate about AI & algorithms"
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Choose Profile Avatar
                </label>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {DEFAULT_AVATARS.map((avatarUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatarUrl })}
                      className={`relative flex-shrink-0 rounded-full p-0.5 transition-transform cursor-pointer ${
                        formData.avatarUrl === avatarUrl
                          ? 'ring-3 ring-indigo-600 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={avatarUrl}
                        alt={`Avatar ${idx + 1}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {formData.avatarUrl === avatarUrl && (
                        <div className="absolute inset-0 bg-indigo-600/30 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                id="signup-complete-btn"
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Generating Student ID...</span>
                ) : (
                  <>
                    <span>Generate Student ID & Join</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Student ID Generated Success Screen */}
        {step === 3 && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-950/40">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Welcome to StudentHub!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your account is active and your official Student ID has been generated:
              </p>
            </div>

            {/* Prominent Student ID Display Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100/50 dark:from-indigo-950/70 dark:via-blue-950/50 dark:to-slate-900 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                Your Official Student ID
              </span>
              
              <div className="text-3xl sm:text-4xl font-mono font-black text-indigo-900 dark:text-indigo-100 tracking-wider">
                {createdStudentId}
              </div>

              <div className="flex justify-center pt-1">
                <button
                  id="signup-copy-id-btn"
                  type="button"
                  onClick={copyStudentId}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-xs hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors border border-indigo-100 dark:border-indigo-900 cursor-pointer"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Student ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Privacy and usage note */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>How to use your Student ID</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <li>Give this ID to classmates so they can find you in search.</li>
                <li>Your phone number and email remain private.</li>
                <li>You can log in anytime using either your Student ID, Email, or Username.</li>
              </ul>
            </div>

            <div>
              <button
                id="signup-proceed-btn"
                type="button"
                onClick={() => onNavigate('feed')}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter StudentHub Feed</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
