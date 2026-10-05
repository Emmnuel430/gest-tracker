'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'accent' | 'blue' | 'neutral' | 'dark' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled,
      isLoading = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-black uppercase tracking-wider transition-all duration-150 border-2 border-[#111827] dark:border-[#334155] rounded-lg cursor-pointer select-none active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

    const variants = {
      primary:
        'bg-[#2563EB] text-white shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] hover:bg-[#1D4ED8] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#111827] dark:hover:shadow-[5px_5px_0px_0px_#000000]',
      success:
        'bg-[#16A34A] text-white shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] hover:bg-[#15803D] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#111827] dark:hover:shadow-[5px_5px_0px_0px_#000000]',
      danger:
        'bg-[#DC2626] text-white shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] hover:bg-[#B91C1C] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#111827] dark:hover:shadow-[5px_5px_0px_0px_#000000]',
      warning:
        'bg-[#F59E0B] text-[#111827] shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] hover:bg-[#D97706] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#111827] dark:hover:shadow-[5px_5px_0px_0px_#000000]',
      accent:
        'bg-[#DBEAFE] dark:bg-[#1E3A8A] text-[#111827] dark:text-white shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] hover:bg-[#BFDBFE] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#111827] dark:hover:shadow-[5px_5px_0px_0px_#000000]',
      blue:
        'bg-[#2563EB] text-white shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] hover:bg-[#1D4ED8] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#111827] dark:hover:shadow-[5px_5px_0px_0px_#000000]',
      neutral:
        'bg-white dark:bg-[#1E293B] text-[#111827] dark:text-white shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] hover:bg-[#EFF6FF] dark:hover:bg-[#131C31] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#111827] dark:hover:shadow-[5px_5px_0px_0px_#000000]',
      dark:
        'bg-[#111827] dark:bg-[#0B0F19] text-white shadow-[3px_3px_0px_0px_#2563EB] hover:bg-neutral-800 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#2563EB]',
      outline:
        'bg-transparent text-[#111827] dark:text-white border-2 border-[#111827] dark:border-[#334155] shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] hover:bg-[#EFF6FF] dark:hover:bg-[#1E293B]',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]',
      md: 'text-sm px-4 py-2.5 gap-2 shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000]',
      lg: 'text-base px-6 py-3.5 gap-2.5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin stroke-3" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
