'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-xl p-6 shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-[#DC2626] border-2 border-[#111827] dark:border-white rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] text-white">
            <AlertTriangle className="w-6 h-6 stroke-2.5" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
            {title}
          </h3>
        </div>

        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3 justify-end">
          <Button
            variant="neutral"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-[#DC2626] hover:bg-[#B91C1C] text-white border-2 border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]"
          >
            {isLoading ? 'Suppression...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
