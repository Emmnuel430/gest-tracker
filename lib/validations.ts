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
  date: z.coerce.date().optional().nullable(),
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

export const RegisterSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: 'Veuillez saisir une adresse email valide' }),
    password: z
      .string()
      .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
      .regex(/[0-9]/, { message: 'Le mot de passe doit contenir au moins un chiffre' })
      .regex(/[a-zA-Z]/, { message: 'Le mot de passe doit contenir au moins une lettre' }),
    confirmPassword: z.string().min(1, { message: 'Veuillez confirmer votre mot de passe' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Veuillez saisir une adresse email valide' }),
  password: z.string().min(1, { message: 'Veuillez renseigner votre mot de passe' }),
});

export type RegisterFormValues = z.infer<typeof RegisterSchema>;
export type LoginFormValues = z.infer<typeof LoginSchema>;

export const BudgetSchema = z.object({
  category: z.string().min(1, { message: 'Veuillez sélectionner une catégorie' }),
  amount: z.coerce
    .number({ message: 'Le montant doit être un nombre valide' })
    .positive({ message: 'Le montant doit être strictement supérieur à 0' }),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, { message: 'Le mois doit être au format YYYY-MM' }),
});

export type BudgetFormValues = z.infer<typeof BudgetSchema>;

export const RecurringRuleSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE'] as const, {
    message: 'Le type doit être INCOME ou EXPENSE',
  }),
  amount: z.coerce
    .number({ message: 'Le montant doit être un nombre valide' })
    .positive({ message: 'Le montant doit être strictement supérieur à 0' }),
  category: z.string().min(1, { message: 'Veuillez sélectionner une catégorie' }),
  payment: z.string().min(1, { message: 'Veuillez sélectionner un moyen de paiement' }),
  dayOfMonth: z.coerce
    .number({ message: 'Le jour doit être un nombre valide' })
    .int({ message: 'Le jour doit être un entier' })
    .min(1, { message: 'Le jour doit être compris entre 1 et 31' })
    .max(31, { message: 'Le jour doit être compris entre 1 et 31' }),
  frequency: z.enum(['MONTHLY', 'WEEKLY', 'YEARLY'] as const).default('MONTHLY'),
  note: z
    .string()
    .max(250, { message: 'La note ne peut pas dépasser 250 caractères' })
    .optional()
    .nullable(),
  isActive: z.boolean().optional().default(true),
});

export type RecurringRuleFormValues = z.infer<typeof RecurringRuleSchema>;

