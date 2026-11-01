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
    normal: 'bg-[#eaf3f1] text-[#497665] border-[#c3e6cb]/80',
    waspada: 'bg-[#fef9e7] text-[#927626] border-[#fde8a0]/80',
    siaga: 'bg-[#fcf2e4] text-[#a9621d] border-[#ffeeba]/80',
    awas: 'bg-[#fbeeeb] text-[#b33e35] border-[#f5c6cb]/80',
    blue: 'bg-[#eaf3f1] text-[#126b70] border-[#dce2e2]',
    neutral: 'bg-[#edf0e9] text-[#66757c] border-[#dce2e2]',
    success: 'bg-[#eaf3f1] text-[#497665] border-[#c3e6cb]/80',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded border font-semibold tracking-wide',
    md: 'text-xs px-2.5 py-0.5 rounded border font-semibold tracking-wide',
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

