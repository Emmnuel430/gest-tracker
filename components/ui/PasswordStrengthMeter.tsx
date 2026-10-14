'use client';

import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { evaluatePasswordStrength } from '@/lib/validations';

interface PasswordStrengthMeterProps {
  password?: string;
  showChecklist?: boolean;
}

export function PasswordStrengthMeter({
  password = '',
  showChecklist = true,
}: PasswordStrengthMeterProps) {
  const criteria = useMemo(() => evaluatePasswordStrength(password), [password]);

  // Définition des couleurs selon le score
  const getSegmentColor = (segmentIndex: number) => {
    if (criteria.score <= segmentIndex) {
      return 'bg-gray-200 dark:bg-[#334155]';
    }
    switch (criteria.score) {
      case 1:
        return 'bg-[#EF4444]'; // Rouge - Faible
      case 2:
        return 'bg-[#F59E0B]'; // Ambre - Moyen
      case 3:
        return 'bg-[#3B82F6]'; // Bleu - Bon
      case 4:
        return 'bg-[#10B981]'; // Vert émeraude - Robuste
      default:
        return 'bg-gray-200 dark:bg-[#334155]';
    }
  };

  const getLabelColor = () => {
    switch (criteria.score) {
      case 1:
        return 'text-[#DC2626] dark:text-[#EF4444]';
      case 2:
        return 'text-[#D97706] dark:text-[#F59E0B]';
      case 3:
        return 'text-[#2563EB] dark:text-[#60A5FA]';
      case 4:
        return 'text-[#059669] dark:text-[#34D399]';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const checklistItems = [
    { label: 'Au moins 8 caractères', satisfied: criteria.hasMinLength },
    { label: 'Une lettre majuscule', satisfied: criteria.hasUppercase },
    { label: 'Une lettre minuscule', satisfied: criteria.hasLowercase },
    { label: 'Un chiffre (0-9)', satisfied: criteria.hasDigit },
    { label: 'Un caractère spécial (!@#$...)', satisfied: criteria.hasSymbol },
  ];

  return (
    <div className="mt-2 space-y-2">
      {/* Barre segmentée en 4 sections */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-sm border border-[#111827] dark:border-[#475569] transition-all duration-200 ${getSegmentColor(
              index
            )}`}
          />
        ))}
      </div>

      {/* Libellé textuel néobrutaliste (Information non portée par la seule couleur) */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Robustesse :
        </span>
        <span className={`font-black uppercase tracking-wide ${getLabelColor()}`}>
          {password ? criteria.label : 'Non défini'}
        </span>
      </div>

      {/* Checklist des exigences */}
      {showChecklist && (
        <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
          {checklistItems.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 transition-colors ${
                item.satisfied
                  ? 'text-[#059669] dark:text-[#34D399] font-bold'
                  : 'text-gray-500 dark:text-gray-400 font-medium'
              }`}
            >
              {item.satisfied ? (
                <Check className="w-3.5 h-3.5 text-[#059669] dark:text-[#34D399] stroke-[3]" />
              ) : (
                <X className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 stroke-[2]" />
              )}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
