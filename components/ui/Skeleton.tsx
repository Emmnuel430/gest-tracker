import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-700',
        className
      )}
      {...props}
    />
  );
}
