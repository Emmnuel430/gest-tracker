'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'blue' | 'neutral' | 'dark' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-black uppercase tracking-wider transition-all duration-150 border-2 border-black rounded-lg cursor-pointer select-none active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

    const variants = {
      primary: 'bg-[#FFDE59] text-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#FFE600] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000]',
      success: 'bg-[#00DF81] text-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#00F58D] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000]',
      danger: 'bg-[#FF5964] text-white shadow-[3px_3px_0px_0px_#000] hover:bg-[#FF3847] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000]',
      blue: 'bg-[#3A86FF] text-white shadow-[3px_3px_0px_0px_#000] hover:bg-[#2575FC] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000]',
      neutral: 'bg-white text-black shadow-[3px_3px_0px_0px_#000] hover:bg-neutral-50 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000]',
      dark: 'bg-black text-white shadow-[3px_3px_0px_0px_#555] hover:bg-neutral-800 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#555]',
      outline: 'bg-transparent text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-black/5',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 shadow-[2px_2px_0px_0px_#000]',
      md: 'text-sm px-4 py-2.5 gap-2 shadow-[3px_3px_0px_0px_#000]',
      lg: 'text-base px-6 py-3.5 gap-2.5 shadow-[4px_4px_0px_0px_#000]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
