import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md ${className}`} />
);

export const PostSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-4 shadow-xs">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="w-11 h-11 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-20 h-3" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-5/6 h-4" />
      <Skeleton className="w-2/3 h-4" />
    </div>
    <Skeleton className="w-full h-48 rounded-xl mb-4" />
    <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
      <Skeleton className="w-16 h-6" />
      <Skeleton className="w-16 h-6" />
      <Skeleton className="w-16 h-6" />
    </div>
  </div>
);

export const NewsSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
    <Skeleton className="w-full h-44" />
    <div className="p-5 space-y-3">
      <Skeleton className="w-24 h-4 rounded-full" />
      <Skeleton className="w-full h-6" />
      <Skeleton className="w-4/5 h-4" />
      <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-16 h-3" />
      </div>
    </div>
  </div>
);
