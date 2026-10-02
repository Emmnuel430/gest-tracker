import React from 'react';
import { Loader2 } from 'lucide-react';
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
        'flex flex-col items-center justify-center p-8 gap-3 border-2 border-black bg-white rounded-xl shadow-[4px_4px_0px_0px_#000]',
        className
      )}
    >
      <div className="relative">
        <div className="w-10 h-10 border-4 border-black border-t-[#FFDE59] rounded-full animate-spin" />
      </div>
      <p className="font-black text-sm uppercase tracking-wider text-black">{text}</p>
    </div>
  );
}
