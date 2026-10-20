import { z } from 'zod';

export const TransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER'] as const, {
    message: 'Le type de transaction doit être INCOME, EXPENSE ou TRANSFER',
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
  categoryId: z.string().optional().nullable(),
  walletId: z.string().optional().nullable(),
  targetWalletId: z.string().optional().nullable(),
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

export const HistoryFiltersSchema = z.object({
  period: z.enum(['today', 'day', 'week', 'month', 'year', 'all', 'custom'] as const).default('month'),
  type: z.enum(['all', 'INCOME', 'EXPENSE'] as const).default('all'),
  category: z.string().default('all'),
  payment: z.string().default('all'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  tab: z.enum(['list', 'analytics', 'comparison'] as const).default('list'),
});

export type TransactionFormValues = z.infer<typeof TransactionSchema>;
export type UpdateTransactionFormValues = z.infer<typeof UpdateTransactionSchema>;
export type FilterFormValues = z.infer<typeof FilterSchema>;
export type HistoryFiltersInput = z.infer<typeof HistoryFiltersSchema>;

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const PasswordSchema = z
  .string()
  .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  .regex(/[a-z]/, { message: 'Le mot de passe doit contenir au moins une lettre minuscule' })
  .regex(/[A-Z]/, { message: 'Le mot de passe doit contenir au moins une lettre majuscule' })
  .regex(/[0-9]/, { message: 'Le mot de passe doit contenir au moins un chiffre' })
  .regex(/[^A-Za-z0-9]/, { message: 'Le mot de passe doit contenir au moins un caractère spécial' });

export interface PasswordCriteria {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
  score: number; // 0 à 4
  label: 'Faible' | 'Moyen' | 'Bon' | 'Robuste';
  isValid: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordCriteria {
  if (!password) {
    return {
      hasMinLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasDigit: false,
      hasSymbol: false,
      score: 0,
      label: 'Faible',
      isValid: false,
    };
  }

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUppercase && hasLowercase) score++;
  if (hasDigit) score++;
  if (hasSymbol) score++;

  let label: 'Faible' | 'Moyen' | 'Bon' | 'Robuste' = 'Faible';
  if (score >= 4) {
    label = 'Robuste';
  } else if (score === 3) {
    label = 'Bon';
  } else if (score === 2) {
    label = 'Moyen';
  } else {
    label = 'Faible';
  }

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasDigit && hasSymbol;

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasDigit,
    hasSymbol,
    score,
    label,
    isValid,
  };
}

export const RegisterSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: 'Veuillez saisir une adresse email valide' }),
    password: PasswordSchema,
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

export const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, { message: 'Veuillez saisir votre mot de passe actuel' }),
    newPassword: PasswordSchema,
    confirmPassword: z.string().min(1, { message: 'Veuillez confirmer le nouveau mot de passe' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les nouveaux mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'Le nouveau mot de passe doit être différent de l’ancien mot de passe',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>;

export const RequestPasswordResetSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Veuillez saisir une adresse email valide' }),
});

export type RequestPasswordResetFormValues = z.infer<typeof RequestPasswordResetSchema>;

export const VerifyPasswordResetOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'Veuillez saisir une adresse email valide' }),
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { message: 'Le code doit comporter exactement 6 chiffres' }),
});

export type VerifyPasswordResetOtpFormValues = z.infer<typeof VerifyPasswordResetOtpSchema>;

export const ResetPasswordSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: z.string().min(1, { message: 'Veuillez confirmer le nouveau mot de passe' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>;

export const CategorySchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, { message: 'Le nom de la catégorie est obligatoire' })
    .max(50, { message: 'Le nom ne peut pas dépasser 50 caractères' }),
  kind: z.enum(['INCOME', 'EXPENSE', 'BOTH'] as const, {
    message: 'Le type doit être INCOME, EXPENSE ou BOTH',
  }),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: 'La couleur doit être au format hexadécimal (#RRGGBB)' })
    .transform((val) => val.toUpperCase()),
  isArchived: z.boolean().default(false),
});

export type CategoryFormValues = z.input<typeof CategorySchema>;

export const BudgetSchema = z.object({
  category: z.string().min(1, { message: 'Veuillez sélectionner une catégorie' }),
  categoryId: z.string().optional().nullable(),
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
  categoryId: z.string().optional().nullable(),
  payment: z.string().min(1, { message: 'Veuillez sélectionner un moyen de paiement' }),
  walletId: z.string().optional().nullable(),
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
  remindersEnabled: z.boolean().optional().default(true),
});

export type RecurringRuleFormValues = z.infer<typeof RecurringRuleSchema>;

export const WalletSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, { message: 'Veuillez saisir un nom pour le portefeuille' }),
  type: z.enum(['CASH', 'MOBILE_MONEY', 'BANK', 'SAVINGS'] as const, {
    message: 'Type de portefeuille invalide',
  }),
  initialBalance: z.coerce.number().default(0),
  declaredBalance: z.coerce.number().optional().nullable(),
  declaredAt: z.union([z.string(), z.date()]).optional().nullable(),
  adjustCurrentBalance: z.boolean().optional().default(false),
  color: z.string().default('#2563EB'),
  isDefault: z.boolean().default(false),
  isArchived: z.boolean().default(false),
});

export type WalletFormValues = z.infer<typeof WalletSchema>;

export const TransferSchema = z
  .object({
    sourceWalletId: z.string().min(1, { message: 'Veuillez sélectionner le portefeuille source' }),
    targetWalletId: z.string().min(1, { message: 'Veuillez sélectionner le portefeuille de destination' }),
    amount: z.coerce
      .number({ message: 'Le montant doit être un nombre valide' })
      .positive({ message: 'Le montant du transfert doit être supérieur à 0' }),
    note: z
      .string()
      .max(250, { message: 'La note ne peut pas dépasser 250 caractères' })
      .optional()
      .nullable(),
    date: z.coerce.date().optional().nullable(),
  })
  .refine((data) => data.sourceWalletId !== data.targetWalletId, {
    message: 'Le portefeuille source et le portefeuille de destination doivent être différents',
    path: ['targetWalletId'],
  });

export type TransferFormValues = z.infer<typeof TransferSchema>;

export const DebtSchema = z.object({
  id: z.string().optional(),
  personName: z.string().min(1, { message: 'Veuillez indiquer le nom de la personne concernée' }),
  type: z.enum(['LENT', 'BORROWED'] as const, {
    message: 'Le type doit être LENT (prêté) ou BORROWED (emprunté)',
  }),
  initialAmount: z.coerce
    .number({ message: 'Le montant doit être un nombre valide' })
    .positive({ message: 'Le montant doit être supérieur à 0' }),
  remainingAmount: z.coerce.number().min(0).optional(),
  dueDate: z.coerce.date().optional().nullable(),
  status: z.enum(['PENDING', 'PARTIAL', 'SETTLED'] as const).default('PENDING'),
  note: z.string().max(250).optional().nullable(),
});

export type DebtFormValues = z.infer<typeof DebtSchema>;

