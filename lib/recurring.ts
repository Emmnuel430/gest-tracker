/**
 * Utilitaires pour la gestion et le calcul des échéances des règles récurrentes (V2.0.3)
 */

/**
 * Résout la date d'échéance effective pour un jour de mois donné (1 à 31).
 * Pour les mois plus courts (ex: 28/29 février, 30 avril), la date est ramenée
 * de façon déterministe au dernier jour du mois (clamp).
 * L'heure est fixée à 12:00:00 (midi local) pour prémunir contre les décalages de fuseau horaire (UTC vs local).
 */
export function resolveDueDate(year: number, monthIndex: number, dayOfMonth: number): Date {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const effectiveDay = Math.min(Math.max(1, dayOfMonth), daysInMonth);
  return new Date(year, monthIndex, effectiveDay, 12, 0, 0, 0);
}

/**
 * Formate le libellé d'affichage du jour de récurrence.
 * Pour les jours 29, 30 et 31 : affiche "Le {jour} (ou dernier jour du mois)"
 */
export function formatDayOfMonthLabel(dayOfMonth: number): string {
  if (dayOfMonth >= 29) {
    return `Le ${dayOfMonth} (ou dernier jour du mois)`;
  }
  return `Le ${dayOfMonth} du mois`;
}
