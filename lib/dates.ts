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
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
