export interface Customer {
  id: string;
  display_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  customer_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  memberships?: Membership[];
  coupons?: Coupon[];
}

export interface Membership {
  id: string;
  external_id: string;
  passkit_id: string;
  program_passkit_id: string;
  tier_passkit_id: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id?: string;
  [key: string]: any;
}
