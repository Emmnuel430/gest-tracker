import { IncomeCategory, ExpenseCategory } from '@/constants/categories';
import { PaymentMethod } from '@/constants/payment-methods';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  payment: string;
  note?: string | null;
  date: string;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ActionResult<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  payment: string;
  note?: string | null;
  date?: string | Date;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
  id: string;
}
