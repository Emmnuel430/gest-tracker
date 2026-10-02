import { z } from 'zod';

export const TransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE'] as const, {
    message: 'Le type de transaction doit être INCOME ou EXPENSE',
  }),
  amount: z.coerce
    .number({
      message: 'Le montant doit être un nombre valide',
    })
    .positive({ message: 'Le montant doit être strictement supérieur à 0' }),
  category: z.string().min(1, { message: 'Veuillez sélectionner une catégorie' }),
  payment: z.string().min(1, { message: 'Veuillez sélectionner un moyen de paiement' }),
  date: z.coerce.date().default(() => new Date()),
  note: z
    .string()
    .max(250, { message: 'La note ne peut pas dépasser 250 caractères' })
    .optional()
    .nullable(),
});

export const UpdateTransactionSchema = TransactionSchema.partial().extend({
  id: z.string().uuid({ message: 'ID de transaction invalide' }),
});

export const FilterSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year', 'custom'] as const).default('month'),
  type: z.enum(['INCOME', 'EXPENSE'] as const).optional(),
  category: z.string().optional(),
  payment: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof TransactionSchema>;
export type UpdateTransactionFormValues = z.infer<typeof UpdateTransactionSchema>;
export type FilterFormValues = z.infer<typeof FilterSchema>;
