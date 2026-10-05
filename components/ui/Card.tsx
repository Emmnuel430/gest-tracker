import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  color?: 'white' | 'surface' | 'accent' | 'green' | 'red' | 'yellow' | 'blue';
}

export function Card({
  className,
  children,
  hoverable = false,
  color = 'white',
  ...props
}: CardProps) {
  const colorStyles = {
    white: 'bg-white dark:bg-[#1E293B] text-[#111827] dark:text-[#F8FAFC]',
    surface: 'bg-[#EFF6FF] dark:bg-[#131C31] text-[#111827] dark:text-[#F8FAFC]',
    accent: 'bg-[#DBEAFE] dark:bg-[#1E3A8A] text-[#111827] dark:text-white',
    green: 'bg-[#F0FDF4] dark:bg-[#062413] text-[#111827] dark:text-[#F8FAFC]',
    red: 'bg-[#FEF2F2] dark:bg-[#2C0B0E] text-[#111827] dark:text-[#F8FAFC]',
    yellow: 'bg-[#FEF3C7] dark:bg-[#2E1A05] text-[#111827] dark:text-[#F8FAFC]',
    blue: 'bg-[#EFF6FF] dark:bg-[#131C31] text-[#111827] dark:text-[#F8FAFC]',
  };

  return (
    <div
      className={cn(
        'border-2 border-[#111827] dark:border-[#334155] rounded-xl p-5 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] transition-all duration-150',
        colorStyles[color],
        hoverable && 'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#111827] dark:hover:shadow-[6px_6px_0px_0px_#000000]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
