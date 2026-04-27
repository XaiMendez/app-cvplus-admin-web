export interface OdooContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  dui: string;
  internal_customer_id?: string;
}

export interface Tier {
  id: string;
  name: string;
  status: string;
}
