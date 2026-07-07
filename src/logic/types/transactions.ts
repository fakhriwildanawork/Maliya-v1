export interface Transaction {
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

  // Audit trail
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export type TransactionInsert = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;
