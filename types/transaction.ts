import { IncomeCategory, ExpenseCategory } from '@/constants/categories';
import { PaymentMethod } from '@/constants/payment-methods';

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  payment: string;
  note?: string | null;
  date: string;
  userId?: string | null;
  walletId?: string | null;
  targetWalletId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ActionResult<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export type ActionResponse<T = any> = ActionResult<T>;

export interface CreateTransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  payment: string;
  note?: string | null;
  date?: string | Date;
  walletId?: string | null;
  targetWalletId?: string | null;
}

export interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
  id: string;
}
