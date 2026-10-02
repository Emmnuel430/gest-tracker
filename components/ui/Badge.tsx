import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'income' | 'expense' | 'neutral' | 'accent' | 'blue' | 'custom';
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
    income: 'bg-[#16A34A] text-white',
    expense: 'bg-[#DC2626] text-white',
    neutral: 'bg-white text-[#111827]',
    accent: 'bg-[#DBEAFE] text-[#111827]',
    blue: 'bg-[#2563EB] text-white',
    custom: '',
  };

  const customStyles = customBg
    ? { backgroundColor: customBg, color: customText || '#111827', ...style }
    : style;

  return (
    <span
      style={customStyles}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider border-2 border-[#111827] shadow-[2px_2px_0px_0px_#111827]',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
