import { getTodayInTimeZone } from '@/lib/recurring';

export type DebtType = 'LENT' | 'BORROWED';
export type DebtStatus = 'PENDING' | 'PARTIAL' | 'SETTLED';

export interface DebtRepaymentValidationResult {
  valid: boolean;
  error?: string;
  newRemaining?: number;
  newStatus?: DebtStatus;
}

export interface DebtUpdateValidationResult {
  valid: boolean;
  error?: string;
  alreadyRepaid?: number;
  newRemaining?: number;
  newStatus?: DebtStatus;
}

/**
 * Détermine le type de transaction générée lors de la création d'une dette/créance avec impact portefeuille :
 * - LENT (Argent prêté) : sortie de trésorerie -> EXPENSE
 * - BORROWED (Argent emprunté) : entrée de trésorerie -> INCOME
 */
export function resolveDebtCreationTransactionType(debtType: DebtType): 'EXPENSE' | 'INCOME' {
  return debtType === 'LENT' ? 'EXPENSE' : 'INCOME';
}

/**
 * Détermine le type de transaction générée lors d'un remboursement avec impact portefeuille :
 * - LENT (Remboursement reçu sur un prêt) : entrée de trésorerie -> INCOME
 * - BORROWED (Remboursement payé sur une dette) : sortie de trésorerie -> EXPENSE
 */
export function resolveDebtRepaymentTransactionType(debtType: DebtType): 'INCOME' | 'EXPENSE' {
  return debtType === 'LENT' ? 'INCOME' : 'EXPENSE';
}

/**
 * Valide un remboursement et calcule le nouveau solde restant et le statut du dossier ([DEBT-02]).
 * Rejette tout remboursement sur un dossier déjà soldé ou supérieur au reste dû.
 */
export function validateAndComputeRepayment(params: {
  initialAmount: number;
  currentRemaining: number;
  status: DebtStatus;
  repaymentAmount: number;
}): DebtRepaymentValidationResult {
  const { initialAmount, currentRemaining, status, repaymentAmount } = params;

  if (!Number.isFinite(repaymentAmount) || repaymentAmount <= 0) {
    return {
      valid: false,
      error: 'Le montant remboursé doit être supérieur à 0',
    };
  }

  if (status === 'SETTLED' || currentRemaining <= 0) {
    return {
      valid: false,
      error: 'Ce dossier est déjà intégralement soldé',
    };
  }

  if (repaymentAmount > currentRemaining) {
    return {
      valid: false,
      error: `Le montant saisi dépasse le reste dû (${currentRemaining.toLocaleString('fr-FR')} FCFA)`,
    };
  }

  const newRemaining = Math.max(0, currentRemaining - repaymentAmount);

  let newStatus: DebtStatus = 'PARTIAL';
  if (newRemaining <= 0) {
    newStatus = 'SETTLED';
  } else if (newRemaining === initialAmount) {
    newStatus = 'PENDING';
  }

  return {
    valid: true,
    newRemaining,
    newStatus,
  };
}

/**
 * Valide la modification du montant initial d'un dossier et recalcule le reste dû et le statut ([DEBT-03]).
 * Interdit un nouveau montant initial inférieur au total déjà remboursé.
 */
export function validateAndComputeDebtUpdate(params: {
  oldInitialAmount: number;
  oldRemainingAmount: number;
  newInitialAmount: number;
}): DebtUpdateValidationResult {
  const { oldInitialAmount, oldRemainingAmount, newInitialAmount } = params;

  if (!Number.isFinite(newInitialAmount) || newInitialAmount <= 0) {
    return {
      valid: false,
      error: 'Le montant initial doit être supérieur à 0',
    };
  }

  const alreadyRepaid = Math.max(0, oldInitialAmount - oldRemainingAmount);

  if (newInitialAmount < alreadyRepaid) {
    return {
      valid: false,
      error: `Le montant initial ne peut pas être inférieur au montant déjà remboursé (${alreadyRepaid.toLocaleString('fr-FR')} FCFA)`,
    };
  }

  const newRemaining = Math.max(0, newInitialAmount - alreadyRepaid);

  let newStatus: DebtStatus = 'PENDING';
  if (newRemaining <= 0) {
    newStatus = 'SETTLED';
  } else if (alreadyRepaid > 0) {
    newStatus = 'PARTIAL';
  }

  return {
    valid: true,
    alreadyRepaid,
    newRemaining,
    newStatus,
  };
}

/**
 * Retourne la date du jour au format YYYY-MM-DD dans le fuseau horaire métier (Africa/Abidjan).
 */
export function getTodayDateISO(now: Date = new Date()): string {
  const today = getTodayInTimeZone(now);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Détecte si une dette ou créance non soldée a dépassé sa date d'échéance ([DEBT-05]).
 */
export function isDebtOverdue(
  debt: { status: DebtStatus; dueDate?: string | null },
  todayISO: string = getTodayDateISO()
): boolean {
  if (debt.status === 'SETTLED' || !debt.dueDate) {
    return false;
  }
  const normalizedDue = debt.dueDate.split('T')[0];
  return normalizedDue < todayISO;
}
