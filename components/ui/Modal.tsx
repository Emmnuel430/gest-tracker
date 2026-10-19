'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !mounted) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/70 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className={`bg-white dark:bg-[#1E293B] border-3 border-[#111827] dark:border-[#334155] rounded-2xl w-full ${maxWidth} p-6 shadow-[8px_8px_0px_0px_#111827] dark:shadow-[8px_8px_0px_0px_#000000] relative max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-[#111827] dark:border-[#334155]">
          <h2 id="modal-title" className="text-xl font-black uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 border-2 border-[#111827] dark:border-white bg-[#FEF2F2] dark:bg-[#2C0B0E] hover:bg-[#DC2626] hover:text-white rounded-lg flex items-center justify-center font-bold transition-all shadow-[2px_2px_0px_0px_#111827] dark:shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 stroke-3 text-[#111827] dark:text-white hover:text-white" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
