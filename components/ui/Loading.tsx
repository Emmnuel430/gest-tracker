import React from 'react';
import { cn } from '@/lib/utils';

export function Loading({
  text = 'Chargement en cours...',
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 gap-3 border-2 border-[#111827] bg-white rounded-xl shadow-[4px_4px_0px_0px_#111827]',
        className
      )}
    >
      <div className="relative">
        <div className="w-10 h-10 border-4 border-[#111827] border-t-[#2563EB] rounded-full animate-spin" />
      </div>
      <p className="font-black text-sm uppercase tracking-wider text-[#111827]">{text}</p>
    </div>
  );
}
