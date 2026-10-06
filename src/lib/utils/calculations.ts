import { differenceInMonths, differenceInWeeks, differenceInDays } from 'date-fns';

/**
 * Hitung setoran per bulan untuk mencapai goal
 */
export function calculateMonthlyContribution(
  targetAmount: number,
  currentAmount: number,
  targetDate: Date | string
): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return 0;

  const months = differenceInMonths(target, new Date());
  if (months <= 0) return remaining; // Past due, need full amount
  return Math.ceil(remaining / months);
}

/**
 * Hitung setoran per minggu untuk mencapai goal
 */
export function calculateWeeklyContribution(
  targetAmount: number,
  currentAmount: number,
  targetDate: Date | string
): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return 0;

  const weeks = differenceInWeeks(target, new Date());
  if (weeks <= 0) return remaining;
  return Math.ceil(remaining / weeks);
}

/**
 * Hitung status goal
 */
export function calculateGoalStatus(
  targetAmount: number,
  currentAmount: number,
  targetDate: Date | string
): 'completed' | 'on_track' | 'behind' | 'active' {
  if (currentAmount >= targetAmount) return 'completed';

  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const now = new Date();
  const totalDays = differenceInDays(target, now);

  if (totalDays <= 0) return 'behind'; // Past due and not completed

  // Calculate expected progress based on time elapsed
  // We need the creation-relative progress, but since we don't have start date,
  // use a simpler heuristic: compare current contribution rate vs required rate
  const monthlyNeeded = calculateMonthlyContribution(targetAmount, currentAmount, target);
  const progress = currentAmount / targetAmount;
  const timeRemaining = totalDays / 30; // rough months

  // If they need more than 120% of what's "fair" per month, they're behind
  const fairMonthly = targetAmount / (totalDays / 30 + (targetAmount - currentAmount > 0 ? 0 : 1));

  if (progress >= 0.95) return 'on_track';
  if (monthlyNeeded > fairMonthly * 1.2) return 'behind';
  return 'on_track';
}

/**
 * Hitung dana darurat ideal
 * @param monthlyExpenses - Pengeluaran bulanan rata-rata
 * @param hasDependents - Apakah punya tanggungan
 * @param isFreelance - Apakah penghasilan tidak tetap
 * @returns { min, max, recommended } dalam Rupiah
 */
export function calculateEmergencyFund(
  monthlyExpenses: number,
  hasDependents: boolean = false,
  isFreelance: boolean = false
): { min: number; max: number; recommended: number } {
  let minMonths = 3;
  let maxMonths = 6;

  if (hasDependents || isFreelance) {
    minMonths = 6;
    maxMonths = 12;
  }

  return {
    min: monthlyExpenses * minMonths,
    max: monthlyExpenses * maxMonths,
    recommended: monthlyExpenses * Math.ceil((minMonths + maxMonths) / 2),
  };
}

/**
 * Hitung alokasi bulanan (framework 50/30/20 yang disesuaikan)
 */
export function calculateMonthlyAllocation(
  monthlyIncome: number,
  options?: {
    hasDebt?: boolean;
    emergencyFundComplete?: boolean;
  }
): {
  needs: number;       // Kebutuhan pokok
  wants: number;       // Keinginan
  savings: number;     // Tabungan & investasi
  debtPayment: number; // Pembayaran utang (jika ada)
} {
  const { hasDebt = false, emergencyFundComplete = false } = options ?? {};

  if (hasDebt) {
    // Prioritaskan pelunasan utang
    return {
      needs: Math.round(monthlyIncome * 0.50),
      wants: Math.round(monthlyIncome * 0.20),
      savings: Math.round(monthlyIncome * 0.10),
      debtPayment: Math.round(monthlyIncome * 0.20),
    };
  }

  if (!emergencyFundComplete) {
    // Prioritaskan dana darurat
    return {
      needs: Math.round(monthlyIncome * 0.50),
      wants: Math.round(monthlyIncome * 0.20),
      savings: Math.round(monthlyIncome * 0.30),
      debtPayment: 0,
    };
  }

  // Standard 50/30/20
  return {
    needs: Math.round(monthlyIncome * 0.50),
    wants: Math.round(monthlyIncome * 0.30),
    savings: Math.round(monthlyIncome * 0.20),
    debtPayment: 0,
  };
}

/**
 * Simulasi compound interest sederhana
 * @param principal - Modal awal
 * @param monthlyContribution - Setoran bulanan
 * @param annualReturnRate - Return tahunan (desimal, mis. 0.07 = 7%)
 * @param years - Durasi tahun
 * @returns { finalAmount, totalContributions, totalReturns }
 */
export function simulateCompoundGrowth(
  principal: number,
  monthlyContribution: number,
  annualReturnRate: number,
  years: number
): { finalAmount: number; totalContributions: number; totalReturns: number } {
  const monthlyRate = annualReturnRate / 12;
  const months = years * 12;

  let balance = principal;
  const totalContributions = principal + monthlyContribution * months;

  for (let i = 0; i < months; i++) {
    balance = (balance + monthlyContribution) * (1 + monthlyRate);
  }

  return {
    finalAmount: Math.round(balance),
    totalContributions,
    totalReturns: Math.round(balance - totalContributions),
  };
}

/**
 * Hitung savings rate
 */
export function calculateSavingsRate(income: number, expense: number): number {
  if (income <= 0) return 0;
  return Math.round(((income - expense) / income) * 100);
}
