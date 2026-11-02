'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownGroup {
  label: string;
  options: DropdownOption[];
}

export type DropdownItem = DropdownOption | DropdownGroup;

export interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownItem[];
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'outline';
  align?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  name?: string;
  id?: string;
}

function isGroup(item: DropdownItem): item is DropdownGroup {
  return 'options' in item && Array.isArray((item as DropdownGroup).options);
}

export function Dropdown({
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi...',
  label,
  icon,
  size = 'md',
  variant = 'default',
  align = 'left',
  fullWidth = false,
  disabled = false,
  className,
  triggerClassName,
  menuClassName,
  name,
  id,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Flatten options to easily search by value
  const allOptions = React.useMemo(() => {
    const list: DropdownOption[] = [];
    options.forEach((item) => {
      if (isGroup(item)) {
        list.push(...item.options);
      } else {
        list.push(item);
      }
    });
    return list;
  }, [options]);

  const selectedOption = allOptions.find((opt) => opt.value === value);

  // Close dropdown on outside click or tap
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    },
    [],
  );

  const handleSelect = (val: string, isDisabled?: boolean) => {
    if (isDisabled) return;
    onChange(val);
    setIsOpen(false);
  };

  // Size styling for trigger
  const sizeStyles = {
    sm: 'h-8 text-xs px-2.5 py-1 gap-1.5 rounded',
    md: 'h-10 text-xs sm:text-sm px-3 py-2 gap-2 rounded',
    lg: 'h-11 text-xs sm:text-sm px-3.5 py-2.5 gap-2.5 rounded',
  };

  // Variant styling for trigger
  const variantStyles = {
    default:
      'bg-white border-[#dce2e2] text-[#173744] hover:bg-[#f8faf9] focus:border-[#126b70] shadow-xs',
    subtle:
      'bg-[#f8faf9] border-[#dce2e2] text-[#173744] hover:bg-[#eff3f2] focus:border-[#126b70]',
    outline:
      'bg-transparent border-[#dce2e2] text-[#173744] hover:bg-slate-50 focus:border-[#126b70]',
  };

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={twMerge(
        'relative inline-block text-left',
        fullWidth ? 'w-full' : '',
        className,
      )}
    >
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-[#173744] block mb-1"
        >
          {label}
        </label>
      )}

      {/* Hidden input for HTML form support */}
      {name && <input type="hidden" name={name} value={value} id={id} />}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={twMerge(
          'w-full border flex items-center justify-between font-semibold transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#126b70]/20',
          sizeStyles[size],
          variantStyles[variant],
          isOpen && 'border-[#126b70] ring-2 ring-[#126b70]/20',
          disabled && 'opacity-60 cursor-not-allowed pointer-events-none',
          triggerClassName,
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && <span className="shrink-0 text-[#126b70]">{icon}</span>}
          {selectedOption ? (
            <span className="truncate text-[#173744] font-semibold text-left">
              {selectedOption.label}
            </span>
          ) : (
            <span className="truncate text-[#66757c] font-normal text-left">
              {placeholder}
            </span>
          )}
        </div>

        <ChevronDown
          className={twMerge(
            'w-3.5 h-3.5 text-[#66757c] shrink-0 transition-transform duration-200 ml-2',
            isOpen ? 'rotate-180 text-[#126b70]' : '',
          )}
        />
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={twMerge(
            'absolute top-full mt-1.5 z-[100] max-h-64 sm:max-h-72 overflow-y-auto bg-white border border-[#dce2e2] rounded-md shadow-lg p-1 custom-scrollbar focus:outline-none animate-in fade-in zoom-in-95 duration-100',
            fullWidth
              ? 'w-full min-w-full left-0'
              : 'min-w-[190px] w-max max-w-[calc(100vw-32px)] sm:max-w-xs',
            align === 'right' ? 'left-0 sm:left-auto sm:right-0' : 'left-0',
            menuClassName,
          )}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-[#66757c] text-center">
              Tidak ada pilihan
            </div>
          ) : (
            options.map((item, idx) => {
              if (isGroup(item)) {
                return (
                  <div key={idx} className="py-1">
                    <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#66757c] bg-[#f8faf9] rounded-xs select-none sticky top-0 z-10">
                      {item.label}
                    </div>
                    <div className="mt-0.5 space-y-0.5">
                      {item.options.map((opt) => {
                        const isSelected = opt.value === value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            disabled={opt.disabled}
                            onClick={() => handleSelect(opt.value, opt.disabled)}
                            className={twMerge(
                              'w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs rounded transition-colors text-left select-none cursor-pointer',
                              isSelected
                                ? 'bg-[#eaf3f1] text-[#126b70] font-bold'
                                : 'text-[#173744] hover:bg-[#f8faf9]',
                              opt.disabled &&
                                'opacity-40 cursor-not-allowed pointer-events-none',
                            )}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {opt.icon && (
                                <span className="shrink-0">{opt.icon}</span>
                              )}
                              <div className="min-w-0 flex-1">
                                <span className="block truncate">
                                  {opt.label}
                                </span>
                                {opt.description && (
                                  <span className="block text-[10px] text-[#66757c] font-normal truncate">
                                    {opt.description}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#126b70] shrink-0" />
                            )}
                            {opt.badge && (
                              <span className="shrink-0">{opt.badge}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              const isSelected = item.value === value;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={item.disabled}
                  onClick={() => handleSelect(item.value, item.disabled)}
                  className={twMerge(
                    'w-full flex items-center justify-between gap-2 px-2.5 py-2 text-xs rounded transition-colors text-left select-none cursor-pointer',
                    isSelected
                      ? 'bg-[#eaf3f1] text-[#126b70] font-bold'
                      : 'text-[#173744] hover:bg-[#f8faf9]',
                    item.disabled &&
                      'opacity-40 cursor-not-allowed pointer-events-none',
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    <div className="min-w-0 flex-1">
                      <span className="block truncate">{item.label}</span>
                      {item.description && (
                        <span className="block text-[10px] text-[#66757c] font-normal truncate">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#126b70] shrink-0" />
                  )}
                  {item.badge && <span className="shrink-0">{item.badge}</span>}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

