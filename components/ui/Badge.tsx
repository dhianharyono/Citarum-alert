import React from 'react';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'normal' | 'waspada' | 'siaga' | 'awas' | 'blue' | 'neutral' | 'success';
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  className,
  variant = 'neutral',
  size = 'sm',
  ...props
}: BadgeProps) {
  const variantStyles = {
    normal: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    waspada: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    siaga: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    awas: 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full border font-medium',
    md: 'text-xs px-2.5 py-1 rounded-lg border font-semibold',
  };

  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

