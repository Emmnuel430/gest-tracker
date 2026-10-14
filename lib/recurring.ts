/**
 * Utilitaires pour la gestion et le calcul des échéances et rappels des règles récurrentes (V2.6.0)
 */

/**
 * Résout la date d'échéance effective pour un jour de mois donné (1 à 31).
 * Pour les mois plus courts (ex: 28/29 février, 30 avril), la date est ramenée
 * de façon déterministe au dernier jour du mois (clamp).
 * L'heure est fixée à 12:00:00 (midi local) pour prémunir contre les décalages de fuseau horaire.
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

export interface ReminderTarget {
  ruleId: string;
  userId: string;
  dueDate: Date;
  offsetDays: number; // 7, 3 ou 0
  label: string;
  amount: number;
  category: string;
  type: string;
  note?: string | null;
}

export interface ExistingReminderLog {
  ruleId: string;
  dueDate: Date | string;
  offsetDays: number;
  status: string;
}

export function isSameCalendarDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function formatDueDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calcule l'ensemble des rappels dus à une date donnée pour les règles récurrentes actives.
 * Paliers de rappel : J-7, J-3, J0 (Section 8.2 & T2).
 * Tient compte de resolveDueDate (clamp de fin de mois) et ignore les rappels déjà envoyés.
 */
export function getRemindersDueOn(
  currentDate: Date,
  rules: Array<{
    id: string;
    userId: string;
    type: string;
    amount: number | { toNumber(): number } | string;
    category: string;
    dayOfMonth: number;
    isActive?: boolean;
    remindersEnabled?: boolean;
    note?: string | null;
  }>,
  existingLogs: ExistingReminderLog[] = []
): ReminderTarget[] {
  const offsets = [7, 3, 0];
  const reminders: ReminderTarget[] = [];

  const sentSet = new Set<string>();
  for (const log of existingLogs) {
    if (log.status === 'SENT') {
      const logDate = typeof log.dueDate === 'string' ? new Date(log.dueDate) : log.dueDate;
      sentSet.add(`${log.ruleId}_${formatDueDateISO(logDate)}_${log.offsetDays}`);
    }
  }

  for (const rule of rules) {
    if (rule.isActive === false || rule.remindersEnabled === false) {
      continue;
    }

    for (const offset of offsets) {
      const candidateDue = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + offset,
        12,
        0,
        0,
        0
      );

      const effectiveDue = resolveDueDate(
        candidateDue.getFullYear(),
        candidateDue.getMonth(),
        rule.dayOfMonth
      );

      if (isSameCalendarDay(candidateDue, effectiveDue)) {
        const key = `${rule.id}_${formatDueDateISO(effectiveDue)}_${offset}`;
        if (!sentSet.has(key)) {
          let label = `J-${offset}`;
          if (offset === 0) label = "Aujourd'hui (J0)";
          else if (offset === 3) label = 'Dans 3 jours (J-3)';
          else if (offset === 7) label = 'Dans 7 jours (J-7)';

          const numAmount =
            typeof rule.amount === 'number'
              ? rule.amount
              : typeof rule.amount === 'object' && 'toNumber' in rule.amount
              ? rule.amount.toNumber()
              : Number(rule.amount) || 0;

          reminders.push({
            ruleId: rule.id,
            userId: rule.userId,
            dueDate: effectiveDue,
            offsetDays: offset,
            label,
            amount: numAmount,
            category: rule.category,
            type: rule.type,
            note: rule.note,
          });
        }
      }
    }
  }

  return reminders;
}
