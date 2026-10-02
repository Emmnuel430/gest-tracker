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
    white: 'bg-white',
    surface: 'bg-[#EFF6FF]',
    accent: 'bg-[#DBEAFE]',
    green: 'bg-[#F0FDF4]',
    red: 'bg-[#FEF2F2]',
    yellow: 'bg-[#FEF3C7]',
    blue: 'bg-[#EFF6FF]',
  };

  return (
    <div
      className={cn(
        'border-2 border-[#111827] rounded-xl p-5 shadow-[4px_4px_0px_0px_#111827] transition-all duration-150',
        colorStyles[color],
        hoverable && 'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#111827]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
