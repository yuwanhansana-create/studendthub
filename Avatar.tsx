import React, { useState, useEffect } from 'react';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  showOnline?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-3xl',
  '3xl': 'w-32 h-32 text-4xl'
};

const colors = [
  'bg-blue-600 text-white',
  'bg-indigo-600 text-white',
  'bg-emerald-600 text-white',
  'bg-violet-600 text-white',
  'bg-rose-600 text-white',
  'bg-amber-600 text-white',
  'bg-cyan-600 text-white',
  'bg-teal-600 text-white'
];

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  className = '',
  showOnline = false
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const getInitials = (name: string) => {
    if (!name) return 'S';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const hasValidImage = Boolean(src && typeof src === 'string' && src.trim().length > 0 && !imgError);

  return (
    <div className={`relative inline-flex flex-shrink-0 select-none ${className}`}>
      {hasValidImage ? (
        <img
          src={src!}
          alt={alt || 'Profile Avatar'}
          onError={() => setImgError(true)}
          loading="lazy"
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-xs transition-opacity duration-300`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} ${getColor(
            alt || 'User'
          )} rounded-full flex items-center justify-center font-bold ring-2 ring-slate-100 dark:ring-slate-800 shadow-xs`}
        >
          {getInitials(alt)}
        </div>
      )}
      {showOnline && (
        <span
          className="absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"
          title="Online"
        />
      )}
    </div>
  );
};

