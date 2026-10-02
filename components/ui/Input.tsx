'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, suffix, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-black uppercase tracking-wider text-black">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full bg-white border-2 border-black rounded-lg px-4 py-2.5 text-black font-bold placeholder:text-neutral-400 placeholder:font-normal shadow-[3px_3px_0px_0px_#000] focus:outline-none focus:bg-[#FFFDEB] focus:shadow-[4px_4px_0px_0px_#000] transition-all disabled:opacity-50 disabled:bg-neutral-100',
              error && 'border-[#FF5964] bg-[#FFF2F2]',
              suffix && 'pr-14',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 font-black text-xs uppercase px-2 py-1 bg-black text-white rounded">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <span className="text-xs font-bold text-[#FF5964] mt-0.5 flex items-center gap-1">
            ⚠️ {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
