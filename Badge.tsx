import React from 'react';
import { Copy, Check, ShieldCheck, Sparkles, GraduationCap } from 'lucide-react';

interface StudentIdBadgeProps {
  idCode: string;
  size?: 'sm' | 'md' | 'lg';
  showCopy?: boolean;
  className?: string;
}

export const StudentIdBadge: React.FC<StudentIdBadgeProps> = ({
  idCode,
  size = 'md',
  showCopy = true,
  className = ''
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(idCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  };

  return (
    <span
      id={`badge-student-id-${idCode}`}
      className={`inline-flex items-center font-mono font-bold tracking-wider rounded-md border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-xs ${sizeStyles[size]} ${className}`}
    >
      <GraduationCap className="w-3.5 h-3.5 opacity-80" />
      <span>{idCode}</span>
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          title="Copy Student ID"
          className="ml-0.5 hover:text-indigo-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60 hover:opacity-100" />}
        </button>
      )}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  if (role === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
        <ShieldCheck className="w-3 h-3" />
        Admin
      </span>
    );
  }
  if (role === 'MODERATOR') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        <Sparkles className="w-3 h-3" />
        Moderator
      </span>
    );
  }
  return null;
};

export const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const getCategoryStyles = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'scholarships':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'examinations':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'competitions':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'ict & technology':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'study tips':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'student opportunities':
        return 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'international education':
        return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'school updates':
      case 'education policies':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${getCategoryStyles(
        category
      )}`}
    >
      {category}
    </span>
  );
};
