export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
  color: string;
  count: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  total: number;
  percentage: number;
  count: number;
}

export interface PeriodComparisonResult {
  currentTotal: number;
  previousTotal: number;
  difference: number;
  percentageChange: number; // Ex: +15.5 ou -8.2
  isIncrease: boolean;
}
