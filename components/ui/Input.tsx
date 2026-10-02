'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, suffix, id, type, onWheel, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
      if (type === 'number') {
        (e.target as HTMLElement).blur();
      }
      if (onWheel) {
        onWheel(e);
      }
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-black uppercase tracking-wider text-[#111827]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            id={inputId}
            ref={ref}
            type={type}
            onWheel={handleWheel}
            className={cn(
              'w-full bg-white border-2 border-[#111827] rounded-lg px-4 py-2.5 text-[#111827] font-bold placeholder:text-neutral-400 placeholder:font-normal shadow-[3px_3px_0px_0px_#111827] focus:outline-none focus:bg-[#EFF6FF] focus:shadow-[4px_4px_0px_0px_#111827] transition-all disabled:opacity-50 disabled:bg-neutral-100',
              error && 'border-[#DC2626] bg-[#FEF2F2]',
              suffix && 'pr-14',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 font-black text-xs uppercase px-2 py-1 bg-[#111827] text-white rounded">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <span className="text-xs font-bold text-[#DC2626] mt-0.5 flex items-center gap-1">
            ⚠️ {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
