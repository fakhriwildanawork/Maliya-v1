export interface DebtPaymentLog {
  id: string;
  date: string;
  amount: number;
  newDueDate?: string;
  note?: string;
}

export interface Debt {
  id: string;
  name: string; // the name of the person or institution
  title: string; // the name of the debt
  description?: string;
  type: 'payable' | 'receivable'; // payable = I owe them (hutang), receivable = they owe me (piutang)
  amount: number;
  paidAmount: number;
  dueDate?: string;
  status: 'active' | 'paid';
  paymentLogs?: DebtPaymentLog[];
  
  // Audit trail
  createdAt?: string;
  updatedAt?: string;
}

export type DebtInsert = Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>;
