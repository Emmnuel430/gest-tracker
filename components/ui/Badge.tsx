import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'income' | 'expense' | 'neutral' | 'yellow' | 'blue' | 'custom';
  customBg?: string;
  customText?: string;
}

export function Badge({
  className,
  variant = 'neutral',
  customBg,
  customText,
  children,
  style,
  ...props
}: BadgeProps) {
  const variants = {
    income: 'bg-[#00DF81] text-black',
    expense: 'bg-[#FF5964] text-white',
    neutral: 'bg-white text-black',
    yellow: 'bg-[#FFDE59] text-black',
    blue: 'bg-[#3A86FF] text-white',
    custom: '',
  };

  const customStyles = customBg
    ? { backgroundColor: customBg, color: customText || '#000000', ...style }
    : style;

  return (
    <span
      style={customStyles}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000]',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
