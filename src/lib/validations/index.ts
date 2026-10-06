import { z } from 'zod';

// ==================== Transaction ====================

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z
    .number()
    .int('Nominal harus bilangan bulat')
    .positive('Nominal harus lebih dari 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  category_id: z.string().uuid('Kategori tidak valid').nullable().optional(),
  wallet_id: z.string().uuid('Dompet tidak valid'),
  dest_wallet_id: z.string().uuid('Dompet tujuan tidak valid').nullable().optional(),
  note: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
  tags: z.array(z.string()).optional(),
  merchant: z.string().max(200).optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

// ==================== Wallet ====================

export const walletSchema = z.object({
  name: z.string().min(1, 'Nama dompet wajib diisi').max(100),
  type: z.enum(['cash', 'bank', 'ewallet', 'other']),
  icon: z.string().optional(),
  color: z.string().optional(),
  initial_balance: z.number().int().default(0),
});

export type WalletInput = z.infer<typeof walletSchema>;

// ==================== Category ====================

export const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi').max(100),
  type: z.enum(['income', 'expense']),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// ==================== Budget ====================

export const budgetSchema = z.object({
  category_id: z.string().uuid('Kategori tidak valid'),
  amount: z
    .number()
    .int('Nominal harus bilangan bulat')
    .positive('Nominal harus lebih dari 0'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
});

export type BudgetInput = z.infer<typeof budgetSchema>;

// ==================== Goal ====================

export const goalSchema = z.object({
  name: z.string().min(1, 'Nama goal wajib diisi').max(200),
  target_amount: z
    .number()
    .int('Nominal harus bilangan bulat')
    .positive('Target harus lebih dari 0'),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  icon: z.string().optional(),
  color: z.string().optional(),
  is_recurring: z.boolean().default(false),
  recurrence_interval: z
    .enum(['monthly', 'quarterly', 'semi_annual', 'annual'])
    .nullable()
    .optional(),
  template_key: z.string().optional(),
});

export type GoalInput = z.infer<typeof goalSchema>;

// ==================== Goal Contribution ====================

export const goalContributionSchema = z.object({
  goal_id: z.string().uuid('Goal tidak valid'),
  amount: z
    .number()
    .int('Nominal harus bilangan bulat')
    .positive('Nominal harus lebih dari 0'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  note: z.string().max(500).optional(),
});

export type GoalContributionInput = z.infer<typeof goalContributionSchema>;

// ==================== Profile ====================

export const profileSchema = z.object({
  full_name: z.string().max(200).optional(),
  monthly_income: z.number().int().min(0).optional(),
  dependents: z.number().int().min(0).optional(),
  marital_status: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  risk_tolerance: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  investment_horizon: z.string().max(100).optional(),
  investment_instruments: z.array(z.string()).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  hide_balance: z.boolean().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// ==================== Recurring Rule ====================

export const recurringRuleSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(200),
  type: z.enum(['income', 'expense']),
  amount: z
    .number()
    .int('Nominal harus bilangan bulat')
    .positive('Nominal harus lebih dari 0'),
  category_id: z.string().uuid().nullable().optional(),
  wallet_id: z.string().uuid().nullable().optional(),
  note: z.string().max(500).optional(),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annual', 'annual']),
  day_of_month: z.number().int().min(1).max(31).nullable().optional(),
  next_due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export type RecurringRuleInput = z.infer<typeof recurringRuleSchema>;

// ==================== Debt ====================

export const debtSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').max(200),
  type: z.enum(['debt', 'receivable']),
  total_amount: z.number().int().positive(),
  remaining_amount: z.number().int().min(0),
  interest_rate: z.number().min(0).max(100).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  person_name: z.string().max(200).optional(),
  direction: z.enum(['owed_by_me', 'owed_to_me']),
  note: z.string().max(500).optional(),
});

export type DebtInput = z.infer<typeof debtSchema>;

// ==================== Vehicle ====================

export const vehicleSchema = z.object({
  name: z.string().min(1, 'Nama kendaraan wajib diisi').max(200),
  plate_number: z.string().max(20).optional(),
  type: z.enum(['car', 'motorcycle', 'other']).default('car'),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  current_odometer: z.number().int().min(0).default(0),
  tax_due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  insurance_due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  service_interval_km: z.number().int().min(0).default(10000),
  service_interval_months: z.number().int().min(0).default(6),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
