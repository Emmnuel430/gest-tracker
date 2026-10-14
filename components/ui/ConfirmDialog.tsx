'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  requiredConfirmationText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  loadingLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  requiredConfirmationText,
  onConfirm,
  onCancel,
  isLoading = false,
  loadingLabel,
  variant = 'danger',
}: ConfirmDialogProps) {
  const [typedConfirmation, setTypedConfirmation] = useState('');

  // Réinitialiser la saisie quand la modale s'ouvre ou se ferme
  useEffect(() => {
    if (!isOpen) {
      setTypedConfirmation('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfirmationMatched = requiredConfirmationText
    ? typedConfirmation.trim() === requiredConfirmationText.trim()
    : true;

  const isConfirmDisabled = isLoading || !isConfirmationMatched;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-xl p-6 shadow-[6px_6px_0px_0px_#111827] dark:shadow-[6px_6px_0px_0px_#000000] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-2.5 border-2 border-[#111827] dark:border-white rounded-lg shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] ${
              variant === 'warning'
                ? 'bg-[#FFE600] text-[#111827]'
                : variant === 'primary'
                ? 'bg-[#2563EB] text-white'
                : 'bg-[#DC2626] text-white'
            }`}
          >
            <AlertTriangle className="w-6 h-6 stroke-2.5" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-[#111827] dark:text-[#F8FAFC]">
            {title}
          </h3>
        </div>

        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
          {message}
        </p>

        {/* Champ de confirmation textuelle obligatoire si configuré */}
        {requiredConfirmationText && (
          <div className="mb-5 p-3 bg-[#FEF2F2] dark:bg-[#2C0B0E] border-2 border-[#111827] dark:border-[#334155] rounded-xl">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Entrez : <span className="font-black text-[#DC2626] select-all">"{requiredConfirmationText}"</span> pour valider
            </label>
            <input
              type="text"
              value={typedConfirmation}
              onChange={(e) => setTypedConfirmation(e.target.value)}
              placeholder={requiredConfirmationText}
              autoFocus
              className="w-full px-3 py-2 text-xs font-black border-2 border-[#111827] dark:border-white rounded-lg bg-white dark:bg-[#0F172A] text-[#111827] dark:text-[#F8FAFC] placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
            />
          </div>
        )}

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
            variant={variant}
            size="sm"
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className={`disabled:opacity-50 disabled:cursor-not-allowed border-2 ${
              variant === 'warning'
                ? 'bg-[#FFE600] hover:bg-[#FACC15] text-[#111827] border-[#111827] shadow-[2px_2px_0px_0px_#111827]'
                : variant === 'primary'
                ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]'
                : 'bg-[#DC2626] hover:bg-[#B91C1C] text-white border-[#111827] dark:border-white shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000]'
            }`}
          >
            {isLoading ? (loadingLabel || (variant === 'danger' ? 'Suppression...' : 'Traitement...')) : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
