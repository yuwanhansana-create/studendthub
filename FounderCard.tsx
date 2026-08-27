import React, { useState } from 'react';
import {
  Phone,
  Mail,
  ExternalLink,
  Sparkles,
  Code2,
  Cpu,
  Video,
  Bot,
  Workflow,
  Laptop,
  Check,
  Copy,
  MapPin,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { FOUNDER_DATA } from '../../data/founderData.js';

interface FounderCardProps {
  variant?: 'full' | 'compact' | 'contact-only';
  className?: string;
  showBio?: boolean;
  showTechInterests?: boolean;
}

const TECH_ICONS: Record<string, React.ReactNode> = {
  'Artificial Intelligence': <Bot className="w-3.5 h-3.5 text-indigo-500" />,
  'Web Development': <Code2 className="w-3.5 h-3.5 text-blue-500" />,
  'ICT': <Laptop className="w-3.5 h-3.5 text-emerald-500" />,
  'AI Prompt Engineering': <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
  'Video Editing': <Video className="w-3.5 h-3.5 text-purple-500" />,
  'Technology & Automation': <Workflow className="w-3.5 h-3.5 text-cyan-500" />
};

export const FounderCard: React.FC<FounderCardProps> = ({
  variant = 'full',
  className = '',
  showBio = true,
  showTechInterests = true
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(FOUNDER_DATA.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(FOUNDER_DATA.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div
      className={`rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all ${className}`}
    >
      {/* Top Banner Accent */}
      <div className="h-28 bg-gradient-to-r from-indigo-600 via-indigo-700 to-amber-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute top-3 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
          <span>Official Founder Profile</span>
        </div>
      </div>

      <div className="px-6 pb-6 sm:px-8 sm:pb-8 -mt-12 space-y-6">
        {/* Founder Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white font-extrabold text-2xl flex items-center justify-center ring-4 ring-white dark:ring-slate-900 shadow-xl border border-indigo-500/30">
                <span className="bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent">
                  YH
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-900" title="Creator of StudentHub.lk">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Founder & Creator</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {FOUNDER_DATA.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{FOUNDER_DATA.role} • {FOUNDER_DATA.location}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bio */}
        {showBio && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              "{FOUNDER_DATA.bio}"
            </p>
          </div>
        )}

        {/* Technology Interests */}
        {showTechInterests && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Technology Interests & Expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {FOUNDER_DATA.technologyInterests.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-500/50 transition-colors"
                >
                  {TECH_ICONS[tech] || <Cpu className="w-3.5 h-3.5 text-indigo-500" />}
                  <span>{tech}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Public Contact Details Card */}
        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          {/* Phone */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-emerald-500/50 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Official Phone
                </span>
                <a
                  href={FOUNDER_DATA.phoneTel}
                  className="text-xs font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 truncate block transition-colors"
                >
                  {FOUNDER_DATA.phone}
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyPhone}
              title="Copy Phone Number"
              className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-600 shadow-2xs transition-colors cursor-pointer"
            >
              {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Email */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-500/50 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Official Email
                </span>
                <a
                  href={FOUNDER_DATA.emailMailto}
                  className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate block transition-colors"
                >
                  {FOUNDER_DATA.email}
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyEmail}
              title="Copy Email Address"
              className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-600 shadow-2xs transition-colors cursor-pointer"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-indigo-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Contact Actions: Call Me, Email Me, About Me / Portfolio */}
        <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Call Me */}
          <a
            id="founder-action-call"
            href={FOUNDER_DATA.phoneTel}
            className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer hover:shadow-md hover:shadow-emerald-600/20"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Me</span>
          </a>

          {/* Email Me */}
          <a
            id="founder-action-email"
            href={FOUNDER_DATA.emailMailto}
            className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer hover:shadow-md hover:shadow-indigo-600/20"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Me</span>
          </a>

          {/* About Me / Portfolio */}
          <a
            id="founder-action-portfolio"
            href={FOUNDER_DATA.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 shadow-xs transition-all cursor-pointer group"
          >
            <span>About Me / Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
};
