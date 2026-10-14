// Configuration de l'application (Devise, Fuseau horaire, Paramètres globaux)

export const APP_CONFIG = {
  appName: 'Personal GEST TRACKER',
  currency: 'FCFA',
  currencySymbol: 'FCFA',
  locale: 'fr-FR',
  timezone: 'Africa/Abidjan',
} as const;
export const SAVINGS_WARNING_THRESHOLD = 15;

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

/**
 * Formate les chiffres saisis dans un champ de saisie avec le séparateur de milliers en point (.)
 * Exemple : "5000000" => "5.000.000", 5000 => "5.000"
 */
export function formatAmountInput(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const digitsOnly = value.toString().replace(/\D/g, '');
  if (!digitsOnly) return '';
  // Évite les zéros inutiles en début de saisie (ex: "0500" => "500"), sauf si c'est juste "0"
  const sanitized = digitsOnly.replace(/^0+(?=\d)/, '');
  return sanitized.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Extrait le montant numérique entier ou flottant d'une chaîne formatée avec points
 * Exemple : "5.000.000" => 5000000
 */
export function parseAmountInput(value: string | null | undefined): number {
  if (!value) return 0;
  const digitsOnly = value.toString().replace(/\D/g, '');
  return digitsOnly ? parseInt(digitsOnly, 10) : 0;
}
