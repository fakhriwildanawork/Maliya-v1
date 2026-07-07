// Interface Typescript untuk modul Accounts sebagai kontrak data

export interface BaseAuditLog {
  created_at?: string;
  created_by?: string;
  created_timezone?: string;
  updated_at?: string;
  updated_by?: string;
  updated_timezone?: string;
}

export interface Wallet extends BaseAuditLog {
  id: string;
  name: string;
  balance: number;
  limit: number;
  status: 'Active' | 'Inactive';
}

export interface CreditCard extends BaseAuditLog {
  id: string;
  number: string;
  exp: string;
  cvv: string;
  status: 'Active' | 'Inactive';
  theme: string;
  balance: number;
}
