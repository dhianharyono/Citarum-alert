import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary:
      'bg-[#126b70] hover:bg-[#0e5458] text-white shadow-xs border border-[#126b70] active:scale-[0.98]',
    secondary:
      'bg-white hover:bg-slate-50 text-[#173744] border border-[#dce2e2] shadow-xs active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-slate-100 text-[#173744] border border-[#dce2e2]',
    danger:
      'bg-[#b33e35] hover:bg-[#97322a] text-white shadow-xs border border-[#b33e35] active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-slate-100 text-[#66757c] hover:text-[#173744]',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-md font-medium gap-1.5',
    md: 'text-xs sm:text-sm px-3.5 py-2 rounded-md font-medium gap-2',
    lg: 'text-sm sm:text-base px-4 py-2.5 rounded-md font-semibold gap-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={twMerge(
        'inline-flex items-center justify-center transition-all select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Memproses...
        </>
      ) : (
        children
      )}
    </button>
  );
}

