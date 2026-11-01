'use client';

import React, { useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  X,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export type AlertVariant = 'success' | 'info' | 'warning' | 'siaga' | 'error' | 'awas';
export type AlertPosition = 'top-center' | 'top-right' | 'top-left' | 'bottom-center' | 'bottom-right';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode | boolean;
  onClose?: () => void;
  floating?: boolean;
  position?: AlertPosition;
  autoClose?: number; // Time in milliseconds before auto-dismiss
  className?: string;
}

export function Alert({
  variant = 'info',
  title,
  children,
  icon = true,
  onClose,
  floating = false,
  position = 'top-center',
  autoClose,
  className,
  ...props
}: AlertProps) {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  // Variant color definitions
  const variantStyles: Record<AlertVariant, { container: string; icon: string; title: string }> = {
    success: {
      container: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50',
      icon: 'text-emerald-400',
      title: 'text-emerald-300 font-bold',
    },
    info: {
      container: 'bg-blue-950/90 border-blue-500/40 text-blue-200 shadow-blue-950/50',
      icon: 'text-blue-400',
      title: 'text-blue-300 font-bold',
    },
    warning: {
      container: 'bg-amber-950/90 border-amber-500/40 text-amber-200 shadow-amber-950/50',
      icon: 'text-amber-400',
      title: 'text-amber-300 font-bold',
    },
    siaga: {
      container: 'bg-amber-950/90 border-amber-500/50 text-amber-200 shadow-amber-950/50',
      icon: 'text-amber-400',
      title: 'text-amber-300 font-bold',
    },
    error: {
      container: 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-rose-950/50',
      icon: 'text-rose-400',
      title: 'text-rose-300 font-bold',
    },
    awas: {
      container: 'bg-rose-950/90 border-rose-500/60 text-rose-200 shadow-rose-950/50',
      icon: 'text-rose-400 animate-pulse',
      title: 'text-rose-300 font-bold',
    },
  };

  const positionStyles: Record<AlertPosition, string> = {
    'top-center': 'fixed top-3.5 sm:top-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-1.5rem)] sm:w-auto max-w-md animate-in fade-in slide-in-from-top-2 duration-200',
    'top-right': 'fixed top-3.5 sm:top-4 right-3.5 sm:right-4 z-[9999] w-[calc(100%-1.5rem)] sm:w-auto max-w-md animate-in fade-in slide-in-from-top-2 duration-200',
    'top-left': 'fixed top-3.5 sm:top-4 left-3.5 sm:left-4 z-[9999] w-[calc(100%-1.5rem)] sm:w-auto max-w-md animate-in fade-in slide-in-from-top-2 duration-200',
    'bottom-center': 'fixed bottom-3.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-1.5rem)] sm:w-auto max-w-md animate-in fade-in slide-in-from-bottom-2 duration-200',
    'bottom-right': 'fixed bottom-3.5 sm:bottom-4 right-3.5 sm:right-4 z-[9999] w-[calc(100%-1.5rem)] sm:w-auto max-w-md animate-in fade-in slide-in-from-bottom-2 duration-200',
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />;
      case 'warning':
      case 'siaga':
        return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />;
      case 'error':
      case 'awas':
        return <AlertOctagon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />;
    }
  };

  const renderedIcon =
    icon === false ? null : React.isValidElement(icon) ? (
      icon
    ) : (
      getDefaultIcon()
    );

  const currentVariant = variantStyles[variant] || variantStyles.info;

  return (
    <div
      role="alert"
      className={twMerge(
        'flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border backdrop-blur-md shadow-xl transition-all duration-300 text-xs sm:text-sm',
        currentVariant.container,
        floating ? positionStyles[position] : 'relative w-full',
        className
      )}
      {...props}
    >
      {renderedIcon && (
        <span className={twMerge('shrink-0', currentVariant.icon)}>
          {renderedIcon}
        </span>
      )}

      <div className="flex-1 min-w-0 pr-0.5">
        {title && (
          <div className={twMerge('text-xs font-bold leading-tight', currentVariant.title)}>
            {title}
          </div>
        )}
        {children && (
          <div
            className={twMerge(
              'text-[11px] sm:text-xs opacity-95 leading-snug',
              title && 'mt-0.5'
            )}
          >
            {children}
          </div>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Tutup notifikasi"
          className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

