// Configuration de l'application (Devise, Fuseau horaire, Paramètres globaux)

export const APP_CONFIG = {
  appName: 'Personal GEST TRACKER',
  currency: 'FCFA',
  currencySymbol: 'FCFA',
  locale: 'fr-FR',
  timezone: 'Africa/Abidjan',
} as const;

/**
 * Formate un montant numérique ou Decimal en chaîne néobrutaliste "5 000 FCFA"
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `0 ${APP_CONFIG.currency}`;
  }

  const numericValue = typeof amount === 'number' ? amount : parseFloat(amount);
  
  // Formatage avec séparateur d'espace insécable pour les milliers
  const formattedNumber = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(numericValue);

  return `${formattedNumber} ${APP_CONFIG.currency}`;
}
