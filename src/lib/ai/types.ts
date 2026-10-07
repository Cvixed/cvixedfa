export type AiActionType =
  | 'create_transaction'
  | 'create_goal'
  | 'create_budget'
  | 'create_wallet'
  | 'create_vehicle'
  | 'create_vehicle_service'
  | 'create_debt';

export interface CreateTransactionData {
  transaction_type?: 'income' | 'expense' | 'transfer';
  type?: 'income' | 'expense' | 'transfer';
  amount: number;
  category_name?: string;
  note?: string;
  merchant?: string | null;
  wallet_name?: string | null;
  date?: string | null;
}

export interface CreateGoalData {
  name?: string;
  goal_name?: string;
  target_amount: number;
  current_amount?: number;
  target_date?: string | null;
  deadline?: string | null;
  icon?: string | null;
  color?: string | null;
  priority?: 'low' | 'medium' | 'high';
}

export interface CreateBudgetData {
  category_name: string;
  amount: number;
  month?: number;
  year?: number;
}

export interface CreateWalletData {
  name: string;
  wallet_type?: 'cash' | 'bank' | 'ewallet' | 'other';
  type?: 'cash' | 'bank' | 'ewallet' | 'other';
  initial_balance?: number;
  icon?: string;
  color?: string;
}

export interface CreateVehicleData {
  name: string;
  plate_number?: string | null;
  vehicle_type?: 'car' | 'motorcycle' | 'other';
  type?: 'car' | 'motorcycle' | 'other';
  year?: number | null;
  odometer?: number | null;
  current_odometer?: number | null;
  tax_due_date?: string | null;
}

export interface CreateVehicleServiceData {
  vehicle_name?: string | null;
  service_type: string;
  cost?: number;
  odometer?: number | null;
  note?: string | null;
  date?: string | null;
}

export interface CreateDebtData {
  name: string;
  amount: number;
  person_name?: string | null;
  creditor_name?: string | null;
  due_date?: string | null;
  note?: string | null;
  debt_type?: string | null;
}

export interface AiAction {
  type: AiActionType;
  data: any;
}

export interface ExecutedActionResult {
  success: boolean;
  type: AiActionType;
  category: 'transaction' | 'goal' | 'budget' | 'wallet' | 'vehicle' | 'vehicle_service' | 'debt';
  title: string;
  detail: string;
  amount?: number;
  badge?: string;
  href?: string;
  error?: string;
  record?: any;
}

export interface AiChatExecutionResponse {
  reply: string;
  actions: AiAction[];
  executed_actions?: ExecutedActionResult[];
}
