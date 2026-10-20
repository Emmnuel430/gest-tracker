/**
 * Logique pure de calcul des frais de virement (Sprint 2.10.0 - ADR-04)
 */

export type TransferFeeMode = 'AMOUNT' | 'PERCENT';

export interface ComputeTransferFeeParams {
  amount: number;
  mode: TransferFeeMode;
  value: number;
}

/**
 * Calcule les frais de virement selon le mode choisi :
 * - Montant fixe : arrondi au FCFA entier, plafonné entre 0 et amount
 * - Pourcentage : arrondi au FCFA le plus proche (demi vers le haut : Math.round), plafonné entre 0 et amount
 */
export function computeTransferFee(params: ComputeTransferFeeParams): number {
  const { amount, mode, value } = params;

  if (isNaN(amount) || amount <= 0 || isNaN(value) || value <= 0) {
    return 0;
  }

  let calculated = 0;
  if (mode === 'AMOUNT') {
    calculated = Math.round(value);
  } else if (mode === 'PERCENT') {
    calculated = Math.round((amount * value) / 100);
  }

  // Les frais ne peuvent être négatifs ni dépasser le montant transféré
  return Math.min(Math.max(0, calculated), amount);
}

/**
 * Génère le libellé pédagogique de synthèse en direct
 */
export function formatTransferFeePreview(options: {
  amount: number;
  fee: number;
  sourceName: string;
  targetName: string;
  mode?: TransferFeeMode;
  percentValue?: number;
}): string {
  const { amount, fee, sourceName, targetName, mode, percentValue } = options;
  const totalDebited = amount + fee;

  const feeDetails =
    mode === 'PERCENT' && percentValue !== undefined
      ? `${fee.toLocaleString('fr-FR')} FCFA (${percentValue} %)`
      : `${fee.toLocaleString('fr-FR')} FCFA`;

  return `Débité de ${sourceName} : ${totalDebited.toLocaleString('fr-FR')} FCFA · Crédité sur ${targetName} : ${amount.toLocaleString('fr-FR')} FCFA · Frais : ${feeDetails}`;
}
