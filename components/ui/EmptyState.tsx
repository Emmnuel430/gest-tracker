import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import Link from 'next/link';

export function EmptyState({
  title = 'Aucune transaction trouvée',
  description = 'Commencez par ajouter votre premier revenu ou votre première dépense.',
  actionLabel,
  actionHref,
  className,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-[#111827] dark:border-[#334155] bg-white dark:bg-[#1E293B] rounded-xl shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000]',
        className
      )}
    >
      <div className="w-16 h-16 bg-[#DBEAFE] dark:bg-[#1E3A8A] border-2 border-[#111827] dark:border-[#334155] rounded-xl shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-[#2563EB] dark:text-[#60A5FA]" />
      </div>
      <h3 className="font-black text-lg uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC] mb-1">{title}</h3>
      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 max-w-xs mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button variant="primary" size="md">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
