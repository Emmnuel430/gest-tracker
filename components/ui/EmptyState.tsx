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
        'flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-black bg-white rounded-xl shadow-[4px_4px_0px_0px_#000]',
        className
      )}
    >
      <div className="w-16 h-16 bg-[#FFE600] border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-black" />
      </div>
      <h3 className="font-black text-lg uppercase tracking-tight text-black mb-1">{title}</h3>
      <p className="text-sm font-medium text-neutral-600 max-w-xs mb-6">{description}</p>
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
