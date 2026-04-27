export interface LoyaltyAccount {
  id: string;
  customer_id: string;
  current_balance: number;
  lifetime_points: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    display_name: string;
    email: string;
  };
}

export interface LoyaltyTransaction {
  id: string;
  customer_id: string;
  account_id: string;
  type: 'ACCUMULATION' | 'REDEMPTION' | 'EXPIRATION' | 'REVERSAL';
  points_amount: number;
  points_balance_after: number;
  reference_id?: string;
  description: string;
  created_at: string;
  expires_at?: string;
}

export interface LoyaltyRules {
  id: string;
  program_id?: string;
  points_per_dollar: number;
  max_points_per_transaction: number;
  max_points_per_day: number;
  redemption_rate: number;
  points_validity_months: number;
  rounding_type: 'UP' | 'DOWN' | 'DECIMAL';
  created_at: string;
  updated_at: string;
  is_active: boolean;
}