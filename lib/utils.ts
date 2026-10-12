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
export function serializeTransaction(tx: any): Transaction {
  return {
    id: tx.id,
    type: tx.type,
    amount: typeof tx.amount === 'object' && tx.amount !== null && 'toNumber' in tx.amount 
      ? tx.amount.toNumber() 
      : Number(tx.amount),
    category: tx.category,
    payment: tx.payment,
    note: tx.note ?? null,
    date: tx.date instanceof Date ? tx.date.toISOString() : String(tx.date),
    userId: tx.userId ?? null,
    createdAt: tx.createdAt instanceof Date ? tx.createdAt.toISOString() : String(tx.createdAt),
    updatedAt: tx.updatedAt instanceof Date ? tx.updatedAt.toISOString() : String(tx.updatedAt),
  };
}
