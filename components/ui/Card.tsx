import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  color?: 'white' | 'yellow' | 'green' | 'red' | 'blue';
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
    yellow: 'bg-[#FFF9D2]',
    green: 'bg-[#E1FCEF]',
    red: 'bg-[#FFEAEB]',
    blue: 'bg-[#E7EFFF]',
  };

  return (
    <div
      className={cn(
        'border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_#000] transition-all duration-150',
        colorStyles[color],
        hoverable && 'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
