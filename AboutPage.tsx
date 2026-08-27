import React from 'react';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Target,
  Compass,
  BookOpen,
  ArrowRight,
  Phone,
  Mail,
  ExternalLink,
  Bot,
  Laptop,
  Users,
  Code2,
  HeartHandshake,
  Landmark
} from 'lucide-react';
import { FOUNDER_DATA } from '../data/founderData.js';
import { FounderCard } from '../components/common/FounderCard.js';

interface AboutPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Breadcrumb / Navigation Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <button
              onClick={() => onNavigate('landing')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">About StudentHub.lk</span>
          </div>

          <button
            onClick={() => onNavigate('contact')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Contact Founder</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>About StudentHub.lk</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Empowering Sri Lankan Students Through Technology & AI
            </h1>
            
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              StudentHub.lk is Sri Lanka's dedicated student-centric digital ecosystem, connecting learners across all 25 districts with privacy-first verified Student IDs, real-time educational updates, and intelligent AI study assistance.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Section 1: Meet the Founder & Founder Card */}
        <section id="meet-the-founder" className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Leadership & Vision</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Meet the Founder
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Learn more about the creator behind StudentHub.lk, his technology passions, and dedication to Sri Lankan education.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <FounderCard variant="full" />
            </div>

            {/* Founder Story & Journey */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  The StudentHub.lk Story
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {FOUNDER_DATA.story}
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Created in Sri Lanka 🇱🇰</span>
                  <a
                    href={FOUNDER_DATA.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Portfolio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Quick Contact Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Direct Communication</span>
                </div>
                <h4 className="text-base font-bold">
                  Have a suggestion or partnership inquiry?
                </h4>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  Founder G. Yuwan Senithu Hansana welcomes feedback from students, teachers, and academic institutions.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={FOUNDER_DATA.phoneTel}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call: {FOUNDER_DATA.phone}</span>
                  </a>
                  <a
                    href={FOUNDER_DATA.emailMailto}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Me</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Vision & Mission */}
        <section className="grid md:grid-cols-2 gap-6">
          {/* Vision Card */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-indigo-500/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Our Future Outlook
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Vision for StudentHub.lk
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {FOUNDER_DATA.vision}
            </p>
          </div>

          {/* Mission Card */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-amber-500/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Our Driving Purpose
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Mission of StudentHub.lk
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {FOUNDER_DATA.mission}
            </p>
          </div>
        </section>

        {/* Section 3: Core Platform Pillars */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              The Three Pillars of StudentHub.lk
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Crafted specifically to support the academic realities of Sri Lankan students.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                1. Privacy-First Identity
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Unique, tamper-evident cryptographic Student IDs (e.g. STU-XXXXXX) protect phone numbers and personal emails from public exposure.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                2. AI Academic Guidance
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Integrated Google Gemini 3.7 AI assistant explains difficult concepts in Sinhala, Tamil, and English with step-by-step math, science, and revision tools.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Landmark className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                3. Verified National Updates
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Automated daily educational alerts from DoENETS, MOE circulars, EduPub textbook guides, and UGC state university cutoffs.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Contact CTA */}
        <section className="p-8 sm:p-12 rounded-3xl bg-indigo-900 text-white text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black">
              Connect With Founder G. Yuwan Senithu Hansana
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              Have questions regarding StudentHub.lk or interested in collaborating on Sri Lankan educational technology?
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <a
                href={FOUNDER_DATA.phoneTel}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call Me: {FOUNDER_DATA.phone}</span>
              </a>

              <a
                href={FOUNDER_DATA.emailMailto}
                className="px-5 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>Email Me: {FOUNDER_DATA.email}</span>
              </a>

              <a
                href={FOUNDER_DATA.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-indigo-800 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 border border-indigo-600 transition-all cursor-pointer"
              >
                <span>Portfolio / About Me</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </a>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
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
          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate('landing')} className="hover:text-white transition-colors">Home</button>
              <button onClick={() => onNavigate('about')} className="hover:text-white text-white font-bold transition-colors">About</button>
              <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">Contact</button>
              <a href={FOUNDER_DATA.portfolioUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Founder Portfolio ↗</a>
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
