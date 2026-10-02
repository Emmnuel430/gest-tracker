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
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white border-3 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_#000] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-[#FF5964] border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] text-white">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-black">{title}</h3>
        </div>

        <p className="text-sm font-semibold text-neutral-700 mb-6 leading-relaxed">
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
          >
            {isLoading ? 'Suppression...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
