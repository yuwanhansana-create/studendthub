import React, { useState } from 'react';
import {
  ExternalLink,
  Search,
  CheckCircle2,
  Building2,
  BookOpen,
  GraduationCap,
  FileCheck,
  Laptop,
  Briefcase,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Globe
} from 'lucide-react';
import { GOV_EDUCATION_PORTALS, GovPortal } from '../../data/govPortals.js';

interface GovPortalsViewProps {
  onSelectPortal?: (portal: GovPortal) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Exams & Results': <FileCheck className="w-4 h-4 text-amber-500" />,
  'Textbooks & Materials': <BookOpen className="w-4 h-4 text-emerald-500" />,
  'E-Learning': <Laptop className="w-4 h-4 text-blue-500" />,
  'Ministry & Policy': <Building2 className="w-4 h-4 text-indigo-500" />,
  'Higher Education': <GraduationCap className="w-4 h-4 text-purple-500" />,
  'Vocational & Training': <Briefcase className="w-4 h-4 text-rose-500" />
};

export const GovPortalsView: React.FC<GovPortalsViewProps> = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const categories = [
    'All',
    'Exams & Results',
    'Textbooks & Materials',
    'E-Learning',
    'Ministry & Policy',
    'Higher Education',
    'Vocational & Training'
  ];

  const handleCopyLink = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filteredPortals = GOV_EDUCATION_PORTALS.filter(portal => {
    const matchesCategory = selectedCategory === 'All' || portal.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      portal.name.toLowerCase().includes(q) ||
      portal.sinhalaName.toLowerCase().includes(q) ||
      portal.tamilName.toLowerCase().includes(q) ||
      portal.description.toLowerCase().includes(q) ||
      portal.services.some(s => s.toLowerCase().includes(q)) ||
      portal.url.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-lg">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Official Sri Lanka Government Portals (.gov.lk / .lk)</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
            Sri Lanka Government Official Education Portals
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Direct, verified links to official Department of Examinations results, Ministry of Education circulars, free school textbook downloads from EduPub, e-Thaksalawa e-learning, and UGC university admissions.
          </p>

          {/* Quick Access Badges */}
          <div className="pt-2 flex flex-wrap gap-2">
            <a
              href="https://results.doenets.lk/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15"
            >
              <FileCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Exam Results Portal</span>
              <ArrowUpRight className="w-3 h-3 text-white/70" />
            </a>
            <a
              href="http://www.edupub.gov.lk/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Free Textbooks (PDF)</span>
              <ArrowUpRight className="w-3 h-3 text-white/70" />
            </a>
            <a
              href="https://www.e-thaksalawa.moe.gov.lk/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15"
            >
              <Laptop className="w-3.5 h-3.5 text-blue-400" />
              <span>e-Thaksalawa LMS</span>
              <ArrowUpRight className="w-3 h-3 text-white/70" />
            </a>
            <a
              href="https://www.ugc.ac.lk/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15"
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              <span>UGC University Admissions</span>
              <ArrowUpRight className="w-3 h-3 text-white/70" />
            </a>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search exam results, textbooks, circulars, UGC, DoENETS..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Portals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPortals.map(portal => (
          <div
            key={portal.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  {CATEGORY_ICONS[portal.category] || <Globe className="w-3.5 h-3.5 text-indigo-500" />}
                  <span>{portal.category}</span>
                </div>
                {portal.isVerifiedGov && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-900/50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Official Gov</span>
                  </span>
                )}
              </div>

              {/* Title & Trilingual names */}
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                  {portal.name}
                </h3>
                <div className="text-[11px] text-indigo-600/90 dark:text-indigo-400/90 font-medium mt-0.5">
                  {portal.sinhalaName} • {portal.tamilName}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {portal.description}
              </p>

              {/* Services List */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Available Services:
                </div>
                <ul className="space-y-1">
                  {portal.services.slice(0, 3).map((serv, idx) => (
                    <li key={idx} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 flex-shrink-0" />
                      <span className="line-clamp-1">{serv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Outbound Actions */}
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={e => handleCopyLink(portal.url, e)}
                title="Copy website link"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {copiedUrl === portal.url ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy Link</span>
                  </>
                )}
              </button>

              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer group-hover:shadow-md"
              >
                <span>Visit Official Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredPortals.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <Search className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">No government portals found</h3>
          <p className="text-xs text-slate-400">Try searching for keywords like "results", "textbooks", "NIE", or "UGC".</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            Show All Portals
          </button>
        </div>
      )}
    </div>
  );
};
