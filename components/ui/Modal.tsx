'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/60 animate-in fade-in duration-150">
      <div
        className={`bg-white border-3 border-[#111827] rounded-2xl w-full ${maxWidth} p-6 shadow-[8px_8px_0px_0px_#111827] relative max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-[#111827]">
          <h2 className="text-xl font-black uppercase tracking-wider text-[#111827]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 border-2 border-[#111827] bg-[#FEF2F2] hover:bg-[#DC2626] hover:text-white rounded-lg flex items-center justify-center font-bold transition-all shadow-[2px_2px_0px_0px_#111827] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 stroke-3 text-[#111827] hover:text-white" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
