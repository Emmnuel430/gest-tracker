'use client';

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { APP_CONFIG, formatAmountInput } from '@/constants/config';

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string | number;
  onChange: (formattedValue: string, numericValue: number) => void;
  label?: string;
  error?: string;
  suffix?: string;
  sizeVariant?: 'normal' | 'giant';
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      value,
      onChange,
      label,
      error,
      suffix = APP_CONFIG.currency,
      sizeVariant = 'normal',
      className,
      id,
      placeholder = '5.000',
      autoFocus,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const formattedValue = formatAmountInput(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawVal = e.target.value;
      const inputEl = inputRef.current;
      const cursorPos = inputEl?.selectionEnd || rawVal.length;

      // Compte le nombre de chiffres présents avant le curseur dans la chaîne tapée
      const digitsBeforeCursor = rawVal.slice(0, cursorPos).replace(/\D/g, '').length;

      // Extraction uniquement des chiffres pour formatage
      const cleanDigits = rawVal.replace(/\D/g, '');
      const newFormatted = formatAmountInput(cleanDigits);
      const numericVal = cleanDigits ? parseInt(cleanDigits, 10) : 0;

      // Calcul de la nouvelle position du curseur dans la chaîne formatée
      let newCursorPos = 0;
      let countedDigits = 0;
      while (newCursorPos < newFormatted.length && countedDigits < digitsBeforeCursor) {
        if (/\d/.test(newFormatted[newCursorPos])) {
          countedDigits++;
        }
        newCursorPos++;
      }

      // Notification au parent
      onChange(newFormatted, numericVal);

      // Repositionnement précis du curseur
      requestAnimationFrame(() => {
        if (inputEl) {
          inputEl.setSelectionRange(newCursorPos, newCursorPos);
        }
      });
    };

    const isGiant = sizeVariant === 'giant';

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-black uppercase tracking-wider text-[#111827] dark:text-[#F8FAFC]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            id={inputId}
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={formattedValue}
            onChange={handleChange}
            placeholder={placeholder}
            autoFocus={autoFocus}
            required={required}
            disabled={disabled}
            className={cn(
              'w-full bg-white dark:bg-[#131C31] border-2 border-[#111827] dark:border-[#334155] text-[#111827] dark:text-white font-black shadow-[3px_3px_0px_0px_#111827] dark:shadow-[3px_3px_0px_0px_#000000] focus:outline-none focus:bg-[#EFF6FF] dark:focus:bg-[#1E293B] transition-all disabled:opacity-50 disabled:bg-neutral-100',
              isGiant
                ? 'text-2xl sm:text-3xl border-3 rounded-xl p-4 pr-20 shadow-[4px_4px_0px_0px_#111827] dark:shadow-[4px_4px_0px_0px_#000000] focus:shadow-[6px_6px_0px_0px_#111827]'
                : 'rounded-xl px-4 py-3 text-base font-bold pr-16 focus:shadow-[4px_4px_0px_0px_#111827]',
              error && 'border-[#DC2626] bg-[#FEF2F2] dark:bg-[#2C0B0E]',
              className
            )}
            {...props}
          />
          {suffix && (
            <span
              className={cn(
                'absolute right-3 font-black uppercase bg-[#111827] dark:bg-white text-white dark:text-[#111827] rounded select-none pointer-events-none',
                isGiant ? 'text-sm right-4 px-2.5 py-1 rounded-md' : 'text-xs px-2 py-1'
              )}
            >
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <span className="text-xs font-bold text-[#DC2626] mt-0.5 flex items-center gap-1">
            ⚠️ {error}
          </span>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
