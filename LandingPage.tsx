import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Users,
  Sparkles,
  Newspaper,
  Bot,
  MessageSquare,
  Lock,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Languages,
  Award,
  TrendingUp,
  Search,
  MapPin,
  Landmark,
  ExternalLink,
  FileCheck,
  Laptop,
  Phone,
  Mail,
  HeartHandshake
} from 'lucide-react';
import { StudentIdBadge } from '../components/common/Badge.js';
import { useLanguage } from '../context/LanguageContext.js';
import { FOUNDER_DATA } from '../data/founderData.js';
import { FounderCard } from '../components/common/FounderCard.js';

interface LandingPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide shadow-xs border border-indigo-200 dark:border-indigo-800">
                <span className="text-amber-500 font-extrabold">🇱🇰 StudentHub.lk</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Sri Lanka's Official Student Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Connect. Learn. Grow.{' '}
                <span className="block mt-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-amber-500 dark:from-indigo-400 dark:via-indigo-300 dark:to-amber-300 bg-clip-text text-transparent">
                  Powered by Verified Student IDs & AI
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                StudentHub.lk unites Sri Lankan students across all 25 districts and 9 provinces. Collaborate with G.C.E. O/L, A/L, and university peers, understand difficult concepts with <strong>StudentHub AI (Google Gemini 3.7)</strong>, and stay updated with official DoENets circulars.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  id="hero-signup-btn"
                  type="button"
                  onClick={() => onNavigate('signup')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Get Your Student ID Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-ai-btn"
                  type="button"
                  onClick={() => onNavigate('ai')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-sm border border-indigo-200 dark:border-indigo-800 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-amber-500" />
                  <span>Try StudentHub AI</span>
                </button>
              </div>

              {/* Trust & Privacy Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified STU-XXXXXX IDs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Zero Contact Leakage</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-amber-500" />
                  <span>Sinhala, Tamil & English</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
                
                {/* Mock Sri Lankan Student Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-slate-800/80 dark:to-slate-900 border border-indigo-100 dark:border-indigo-950 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Sri Lanka Student Identity
                    </span>
                    <StudentIdBadge idCode="STU-7A42K9" size="sm" />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                      KN
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Kavindu Nimnaka
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-500" />
                        Colombo District • Royal College
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">STREAM</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">A/L Physical Science</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">TARGET</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">Engineering Faculty</span>
                    </div>
                  </div>
                </div>

                {/* AI Interactive Chat Sample */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <span>StudentHub AI • Live Exam Tutor</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 leading-relaxed">
                    "💡 <strong>Newton's 2nd Law (A/L Physics):</strong> The rate of change of momentum is proportional to the applied force. For constant mass: <strong>F = ma</strong>."
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium">25 Districts Covered</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">Join 10,000+ Students</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Platform Features Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Why Sri Lankan Students Choose StudentHub.lk
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Everything You Need to Excel in Your Studies
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Built specifically for the Sri Lankan education ecosystem with safety, peer collaboration, and intelligent AI tutoring.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-indigo-500 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                StudentHub AI Tutor
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Powered by Google Gemini 3.7. Ask difficult O/L and A/L questions, generate 5-question multiple choice quizzes, create 30-day revision plans, and translate concepts in Sinhala, Tamil, or English.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-indigo-500 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Verified Student IDs & Safety
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Every student receives a cryptographic ID (e.g. <code>STU-7A42K9</code>). Connect and chat with complete peace of mind—your phone number and email address are never exposed publicly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-indigo-500 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Newspaper className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Sri Lanka Education News
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Curated, verified alerts from the Department of Examinations, Ministry of Education, and University Grants Commission (UGC) regarding exam dates, admission cutoffs, and syllabus updates.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Sri Lanka Education Streams Section */}
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Study Communities by Academic Stream
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Filter feeds, search classmates, and share revision past papers for your specific syllabus.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { title: 'Physical Science', desc: 'Combined Maths & Physics', icon: '📐' },
              { title: 'Bio Science', desc: 'Biology & Chemistry', icon: '🔬' },
              { title: 'Commerce', desc: 'Accounting & Economics', icon: '📊' },
              { title: 'Technology', desc: 'Eng Tech & Bio Tech', icon: '⚡' },
              { title: 'Arts & Languages', desc: 'Logic, Media & Sinhala', icon: '📚' },
              { title: 'G.C.E. O/L', desc: 'Grades 10 & 11 Core', icon: '🎯' }
            ].map((stream, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2 shadow-xs hover:border-indigo-500 transition-all cursor-pointer"
                onClick={() => onNavigate('signup')}
              >
                <div className="text-2xl">{stream.icon}</div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  {stream.title}
                </div>
                <div className="text-[11px] text-slate-500">
                  {stream.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sri Lanka Official Government Education Portals Section */}
      <section className="py-16 sm:py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                <Landmark className="w-3.5 h-3.5" />
                <span>Verified Sri Lanka Government Portals (.gov.lk)</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Direct Access to Official Government Education Websites
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                1-click links to live national exam results, free government school textbooks (PDF), national LMS, syllabus guides, and state university admission criteria.
              </p>
            </div>
            <button
              onClick={() => onNavigate('gov-portals')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer self-start md:self-auto"
            >
              <span>Explore All Gov Portals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="https://results.doenets.lk/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600">
                    Exam Results Portal
                  </h4>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Department of Examinations (DoENETS). Check G.C.E. O/L, A/L, and Grade 5 Scholarship results.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                results.doenets.lk ↗
              </span>
            </a>

            <a
              href="http://www.edupub.gov.lk/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600">
                    EduPub Textbooks (PDF)
                  </h4>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Free official school textbooks for Grades 1 to 13 in Sinhala, Tamil, and English mediums.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                edupub.gov.lk ↗
              </span>
            </a>

            <a
              href="https://www.e-thaksalawa.moe.gov.lk/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600">
                    e-Thaksalawa National LMS
                  </h4>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Ministry of Education digital learning portal with interactive lessons and model papers.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                e-thaksalawa.moe.gov.lk ↗
              </span>
            </a>

            <a
              href="https://www.ugc.ac.lk/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600">
                    UGC University Admissions
                  </h4>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  State university admission criteria, Z-score cut-offs, handbooks, and degree registration.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                ugc.ac.lk ↗
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Meet the Founder Section */}
      <section id="founder-section" className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Leadership & Vision</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Meet the Founder
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                The mind behind StudentHub.lk, dedicated to revolutionizing digital education for Sri Lankan learners.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onNavigate('about')}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-800 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Read Full Story</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contact Founder</span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <FounderCard variant="full" />
            </div>

            {/* Founder Vision Snapshot */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  <HeartHandshake className="w-4 h-4 text-indigo-500" />
                  <span>Founder's Message</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  Built with Passion for Sri Lankan Youth
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  "I created StudentHub.lk to give every Sri Lankan student—regardless of district or school—equal access to high-quality revision aids, safe peer discussions, and intelligent AI tools to succeed in national exams."
                </p>
                <div className="pt-2 text-xs font-bold text-slate-900 dark:text-white">
                  — G. Yuwan Senithu Hansana
                </div>
              </div>

              {/* Direct Actions Quick Access */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white space-y-3 shadow-md">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Public Contact Channels</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <a
                    href={FOUNDER_DATA.phoneTel}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call: {FOUNDER_DATA.phone}</span>
                  </a>
                  <a
                    href={FOUNDER_DATA.emailMailto}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 border border-white/20 transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Email Founder</span>
                  </a>
                  <a
                    href={FOUNDER_DATA.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 flex items-center gap-1.5 border border-white/20 transition-colors"
                  >
                    <span>Portfolio ↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 sm:py-20 bg-indigo-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Join StudentHub.lk Today Free
          </h3>
          <p className="text-sm sm:text-base text-indigo-200 max-w-xl mx-auto">
            Get your instant verified Student ID, connect with classmates in your district, and supercharge your exam preparation with AI tutoring.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('signup')}
              className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Create Free Student Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-4 rounded-2xl bg-indigo-800/80 hover:bg-indigo-700 text-white font-bold text-sm border border-indigo-700 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Contact Founder</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <span className="font-bold text-white text-sm">StudentHub.lk</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-slate-300">StudentHub.lk — Built for Sri Lankan Students.</span>
            </div>
            <div className="text-amber-400 font-medium">
              Founded by G. Yuwan Senithu Hansana
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">
                About Founder & Platform
              </button>
              <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors cursor-pointer">
                Contact & Support
              </button>
              <button onClick={() => onNavigate('gov-portals')} className="hover:text-white transition-colors cursor-pointer">
                Gov Education Portals
              </button>
              <a
                href={FOUNDER_DATA.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white text-amber-400/90 transition-colors"
              >
                Founder Portfolio ↗
              </a>
            </div>
            <div>
              © {new Date().getFullYear()} StudentHub.lk. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
