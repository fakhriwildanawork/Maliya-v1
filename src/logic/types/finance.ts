export interface Wallet {
  id: string;
  name: string;
  balance: number;
  limit: number;
  status: 'Active' | 'Inactive';
}

export interface Activity {
  id: string;
  orderId: string;
  title: string;
  category: string;
  price: number;
  status: 'Completed' | 'Pending' | 'In Progress';
  date: string;
  datetime?: string;
  description?: string;
  attachments?: string[];
  type?: 'expense' | 'income' | 'transfer';
  sourceAccountId?: string;
  destinationAccountId?: string;
  linkedDebtId?: string;
  expensePlanId?: string;
  incomePlanId?: string;
}

export interface ChartDataPoint {
  month: string;
  profit: number;
  loss: number;
}

export interface CreditCard {
  id: string;
  number: string;
  exp: string;
  cvv: string;
  status: 'Active' | 'Inactive';
  theme: string;
  balance: number;
}

export * from './debts';
export * from './budgets';
export * from './goals';
export * from './categories';
export * from './investments';
export * from './assets';

export * from './ledger';

export * from './familyMembers';


