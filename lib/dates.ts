import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  format,
  parseISO,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { PeriodType, DateRange } from '@/types/period';

export function getDateRangeForPeriod(
  period: PeriodType,
  customStart?: string | Date,
  customEnd?: string | Date,
  referenceDate: Date = new Date()
): DateRange {
  switch (period) {
    case 'today':
      return {
        from: startOfDay(referenceDate),
        to: endOfDay(referenceDate),
      };
    case 'week':
      return {
        from: startOfWeek(referenceDate, { weekStartsOn: 1 }), // Lundi
        to: endOfWeek(referenceDate, { weekStartsOn: 1 }),     // Dimanche
      };
    case 'month':
      return {
        from: startOfMonth(referenceDate),
        to: endOfMonth(referenceDate),
      };
    case 'year':
      return {
        from: startOfYear(referenceDate),
        to: endOfYear(referenceDate),
      };
    case 'custom':
      if (customStart && customEnd) {
        const from = typeof customStart === 'string' ? parseISO(customStart) : customStart;
        const to = typeof customEnd === 'string' ? parseISO(customEnd) : customEnd;
        return {
          from: startOfDay(from),
          to: endOfDay(to),
        };
      }
      return {
        from: startOfMonth(referenceDate),
        to: endOfMonth(referenceDate),
      };
    default:
      return {
        from: startOfMonth(referenceDate),
        to: endOfMonth(referenceDate),
      };
  }
}

export function getPreviousDateRange(
  period: PeriodType,
  currentRange: DateRange
): DateRange {
  switch (period) {
    case 'today':
      return {
        from: startOfDay(subDays(currentRange.from, 1)),
        to: endOfDay(subDays(currentRange.to, 1)),
      };
    case 'week':
      return {
        from: startOfWeek(subWeeks(currentRange.from, 1), { weekStartsOn: 1 }),
        to: endOfWeek(subWeeks(currentRange.to, 1), { weekStartsOn: 1 }),
      };
    case 'month':
      return {
        from: startOfMonth(subMonths(currentRange.from, 1)),
        to: endOfMonth(subMonths(currentRange.to, 1)),
      };
    case 'year':
      return {
        from: startOfYear(subYears(currentRange.from, 1)),
        to: endOfYear(subYears(currentRange.to, 1)),
      };
    case 'custom': {
      const diffTime = Math.abs(currentRange.to.getTime() - currentRange.from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      return {
        from: startOfDay(subDays(currentRange.from, diffDays)),
        to: endOfDay(subDays(currentRange.to, diffDays)),
      };
    }
    default:
      return {
        from: startOfMonth(subMonths(currentRange.from, 1)),
        to: endOfMonth(subMonths(currentRange.to, 1)),
      };
  }
}

export function formatDisplayDate(date: string | Date, pattern = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: fr });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm');
}

/**
 * Formate une date au format requis par <input type="date"> (YYYY-MM-DD)
 */
export function formatDateForInput(date: string | Date = new Date()): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

/**
 * Formate une heure au format requis par <input type="time"> (HH:mm)
 */
export function formatTimeForInput(date: string | Date = new Date()): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm');
}

/**
 * Combine une chaîne de date (YYYY-MM-DD) et une chaîne d'heure (HH:mm) en un objet Date
 */
export function combineDateAndTime(dateStr: string, timeStr?: string): Date {
  const time = timeStr && timeStr.trim() ? timeStr : formatTimeForInput();
  return new Date(`${dateStr}T${time}:00`);
}

/**
 * Formatage strict de l'affichage de la période selon la Section 2.1 de roadmapv1.2.md :
 * - Aujourd'hui : "03 octobre 2026" (et non "Du 03/10 au 03/10")
 * - Semaine : "29 septembre → 05 octobre"
 * - Mois : "01 octobre → 31 octobre"
 * - Année : "01 janvier → 31 décembre"
 * - Personnalisé : "Date début → Date fin"
 */
export function formatPeriodLabel(period: PeriodType, range: DateRange): string {
  switch (period) {
    case 'today':
      return format(range.from, 'dd MMMM yyyy', { locale: fr });
    case 'week':
      return `${format(range.from, 'dd MMMM', { locale: fr })} → ${format(range.to, 'dd MMMM', { locale: fr })}`;
    case 'month':
      return `${format(range.from, 'dd MMMM', { locale: fr })} → ${format(range.to, 'dd MMMM', { locale: fr })}`;
    case 'year':
      return `${format(range.from, 'dd MMMM', { locale: fr })} → ${format(range.to, 'dd MMMM', { locale: fr })}`;
    case 'custom':
      return `${format(range.from, 'dd MMMM yyyy', { locale: fr })} → ${format(range.to, 'dd MMMM yyyy', { locale: fr })}`;
    default:
      return `${format(range.from, 'dd MMMM yyyy', { locale: fr })} → ${format(range.to, 'dd MMMM yyyy', { locale: fr })}`;
  }
}
