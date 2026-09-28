import React, { useState } from 'react';

const AVATAR_GRADIENTS = {
  'avatar-1': 'from-indigo-600 to-violet-500',
  'avatar-2': 'from-emerald-500 to-teal-400',
  'avatar-3': 'from-amber-500 to-orange-500',
  'avatar-4': 'from-rose-500 to-pink-500',
  'avatar-5': 'from-sky-500 to-blue-600',
  'avatar-6': 'from-purple-600 to-indigo-600'
};

const UserAvatar = ({ avatar, name = 'Student', size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);

  const isImage =
    !imageError &&
    avatar &&
    (avatar.startsWith('data:image/') ||
      avatar.startsWith('http://') ||
      avatar.startsWith('https://') ||
      avatar.startsWith('blob:'));

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-3xl',
    '2xl': 'w-24 h-24 text-4xl'
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  if (isImage) {
    return (
      <div
        className={`${currentSize} rounded-full overflow-hidden shrink-0 shadow-sm border border-slate-200/80 dark:border-white/10 ${className}`}
      >
        <img
          src={avatar}
          alt={name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const gradient = AVATAR_GRADIENTS[avatar] || 'from-indigo-600 to-violet-500';
  const initial = name ? name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <div
      className={`${currentSize} rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center text-white font-extrabold shrink-0 shadow-sm select-none ${className}`}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;
