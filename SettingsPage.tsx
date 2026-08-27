import React, { useState } from 'react';
import {
  Settings,
  User,
  Lock,
  Shield,
  Eye,
  Trash2,
  Check,
  Sparkles,
  School,
  BookOpen,
  MapPin,
  Languages,
  GraduationCap
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Avatar } from '../components/common/Avatar.js';
import { StudentIdBadge } from '../components/common/Badge.js';
import { Modal } from '../components/common/Modal.js';
import { useToast } from '../components/common/Toast.js';
import { 
  DISTRICT_NAMES, 
  DISTRICT_TO_PROVINCE, 
  SRI_LANKA_GRADE_LEVELS, 
  SRI_LANKA_SUBJECTS_LIST 
} from '../data/sriLankaData.js';
import { FOUNDER_DATA } from '../data/founderData.js';
import { FounderCard } from '../components/common/FounderCard.js';

interface SettingsPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
];

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user, refreshUser, logout } = useAuth();
  const { success, error: toastError } = useToast();
  const { language, setLanguage } = useLanguage();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'privacy' | 'founder'>('profile');

  // Profile Form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [school, setSchool] = useState(user?.school || '');
  const [grade, setGrade] = useState(user?.grade || SRI_LANKA_GRADE_LEVELS[3]);
  const [district, setDistrict] = useState(user?.district || 'Colombo');
  const [province, setProvince] = useState(user?.province || 'Western');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(user?.subjects || ['Combined Mathematics', 'Physics']);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Privacy Form
  const [showSchool, setShowSchool] = useState(user?.privacySettings?.showSchoolOnProfile ?? true);
  const [allowSearch, setAllowSearch] = useState(user?.privacySettings?.allowSearchBySchool ?? true);
  const [districtVisibility, setDistrictVisibility] = useState<'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE'>(
    user?.privacySettings?.districtVisibility || 'PUBLIC'
  );
  const [preferredLang, setPreferredLang] = useState<'en' | 'si' | 'ta'>(
    user?.preferredLanguage || language
  );
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  // Delete Account Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleDistrictChange = (d: string) => {
    setDistrict(d);
    setProvince(DISTRICT_TO_PROVINCE[d] || 'Western');
  };

  const handleToggleSubject = (sub: string) => {
    setSelectedSubjects(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.updateProfile({
        fullName: fullName.trim(),
        bio: bio.trim(),
        school: school.trim(),
        grade: grade.trim(),
        district: district.trim(),
        province: province.trim(),
        avatarUrl: avatarUrl.trim(),
        subjects: selectedSubjects,
        preferredLanguage: preferredLang
      });
      await refreshUser();
      success('Profile updated successfully!');
    } catch (err: any) {
      toastError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toastError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      success('Password changed successfully');
    } catch (err: any) {
      toastError(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUpdatePrivacy = async () => {
    setSavingPrivacy(true);
    try {
      await api.updatePrivacy({
        showSchoolOnProfile: showSchool,
        allowSearchBySchool: allowSearch,
        districtVisibility: districtVisibility
      });
      setLanguage(preferredLang);
      await refreshUser();
      success('Privacy & Language preferences saved');
    } catch (err: any) {
      toastError('Failed to update privacy settings');
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') {
      toastError('Please type DELETE to confirm');
      return;
    }
    logout();
    success('Your account has been closed.');
    onNavigate('landing');
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Account & Profile Settings</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your Sri Lankan student credentials, privacy shield, and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Student Profile & Stream</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Password & Security</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'privacy'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Privacy & Language</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('founder')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'founder'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>About Founder</span>
        </button>
      </div>

      {/* TAB 1: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Identity Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 block uppercase">
                Official Sri Lankan Student Identifier
              </span>
              <p className="text-xs text-indigo-950 dark:text-indigo-200 mt-0.5">
                Share this unique ID with classmates to connect safely on StudentHub.lk.
              </p>
            </div>
            <StudentIdBadge idCode={user.studentId} size="lg" />
          </div>

          {/* Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            
            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Profile Avatar
              </label>
              <div className="flex items-center gap-4">
                <Avatar src={avatarUrl} alt={fullName} size="xl" />
                <div className="flex-1 space-y-2">
                  <input
                    type="url"
                    placeholder="Custom image URL (https://...)"
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Presets:</span>
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatarUrl(preset)}
                        className="w-7 h-7 rounded-full overflow-hidden border-2 border-transparent hover:border-indigo-600 transition-all"
                      >
                        <img src={preset} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  School / Higher Education Institute
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={e => setSchool(e.target.value)}
                  placeholder="e.g. Royal College, Ananda, Visakha, University of Moratuwa"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  District (Sri Lanka)
                </label>
                <select
                  value={district}
                  onChange={e => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  {DISTRICT_NAMES.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Province
                </label>
                <input
                  type="text"
                  readOnly
                  value={province}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Level / Stream
                </label>
                <select
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  {SRI_LANKA_GRADE_LEVELS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Current Study Subjects
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
                {SRI_LANKA_SUBJECTS_LIST.map(sub => {
                  const isChecked = selectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleToggleSubject(sub)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        isChecked
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {sub} {isChecked && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Student Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Share your study goals, exam targets, or subject interests..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all"
              >
                {savingProfile ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Security */}
      {activeTab === 'security' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Change Account Password</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Privacy & Language */}
      {activeTab === 'privacy' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Privacy Shield & Visibility
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={showSchool}
                  onChange={e => setShowSchool(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Show School / Institute on public profile
                  </span>
                  <span className="text-slate-500">
                    Allows other verified students to see which school you attend.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={allowSearch}
                  onChange={e => setAllowSearch(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Allow classmates to find me by school name
                  </span>
                  <span className="text-slate-500">
                    Include your profile in school-wide student searches.
                  </span>
                </div>
              </label>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  District Location Visibility
                </span>
                <select
                  value={districtVisibility}
                  onChange={e => setDistrictVisibility(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="PUBLIC">Public (Visible to all students)</option>
                  <option value="FRIENDS_ONLY">Friends Only (Visible only to accepted study partners)</option>
                  <option value="PRIVATE">Private (Hidden from everyone)</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Preferred Platform Language
                </span>
                <select
                  value={preferredLang}
                  onChange={e => setPreferredLang(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="si">සිංහල (Sinhala)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={savingPrivacy}
                onClick={handleUpdatePrivacy}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all"
              >
                {savingPrivacy ? 'Saving...' : 'Save Privacy Preferences'}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: Founder & Leadership Details */}
      {activeTab === 'founder' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Meet the Founder & Platform Leadership
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Official contact details for Founder & Creator G. Yuwan Senithu Hansana
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Full About Page
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Contact Page
                </button>
              </div>
            </div>

            <FounderCard variant="full" />
          </div>
        </div>
      )}

    </div>
  );
};
