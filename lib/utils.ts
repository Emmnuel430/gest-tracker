import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Transaction } from '@/types/transaction';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { formatCurrency, formatAmountInput, parseAmountInput } from '@/constants/config';

/**
 * Assainit et sérialise une transaction issue de Prisma (convertit Decimal et Date)
 * pour éviter toute erreur de sérialisation React Server Action / Client Component
 */
export interface RawTransactionInput {
  id: string;
  type: string;
  amount: number | { toNumber: () => number } | string;
  category: string;
  payment: string;
  note?: string | null;
  date: Date | string;
  userId?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export function serializeTransaction(tx: RawTransactionInput): Transaction {
  return {
    id: tx.id,
    type: tx.type as Transaction['type'],
    amount: typeof tx.amount === 'object' && tx.amount !== null && 'toNumber' in tx.amount 
      ? tx.amount.toNumber() 
      : Number(tx.amount),
    category: tx.category,
    payment: tx.payment,
    note: tx.note ?? null,
    date: tx.date instanceof Date ? tx.date.toISOString() : String(tx.date),
    userId: tx.userId ?? null,
    createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : String(tx.createdAt || ''),
    updatedAt: tx.updatedAt instanceof Date ? tx.updatedAt.toISOString() : String(tx.updatedAt || ''),
  };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Une erreur inattendue est survenue';
}

export function getContrastTextColor(hexColor: string): '#111827' | '#FFFFFF' {
  if (!hexColor) return '#111827';
  const cleanHex = hexColor.replace('#', '');
  if (cleanHex.length !== 6) return '#111827';
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 145 ? '#111827' : '#FFFFFF';
}

/**
 * Assainit une chaîne de caractères pour un rendu HTML sécurisé (protection injection XSS)
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

