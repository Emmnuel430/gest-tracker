// Configuration de l'application (Devise, Fuseau horaire, Paramètres globaux)

export const APP_CONFIG = {
  appName: 'Personal GEST TRACKER',
  currency: 'FCFA',
  currencySymbol: 'FCFA',
  locale: 'fr-FR',
  timezone: 'Africa/Abidjan',
} as const;

/**
 * Formate un montant numérique ou Decimal en chaîne néobrutaliste avec des points comme séparateurs de milliers
 * Exemple : 5000000 => "5.000.000 FCFA", 5000 => "5.000 FCFA", -12500 => "-12.500 FCFA"
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `0 ${APP_CONFIG.currency}`;
  }

  const numericValue = typeof amount === 'number' ? amount : parseFloat(amount);
  const sign = numericValue < 0 ? '-' : '';
  const absValue = Math.abs(Math.round(numericValue));

  // Formatage avec séparateur de milliers en point (.) : ex. 5.000.000 FCFA
  const formattedNumber = absValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${sign}${formattedNumber} ${APP_CONFIG.currency}`;
}
