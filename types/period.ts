export type PeriodType = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface PeriodFilter {
  type: PeriodType;
  startDate?: string;
  endDate?: string;
}
