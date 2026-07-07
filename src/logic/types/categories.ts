// Interface TypeScript untuk modul Categories sebagai kontrak data

interface BaseAuditLog {
  createdAt?: string;
  createdBy?: string;
  createdTimezone?: string;
  updatedAt?: string;
  updatedBy?: string;
  updatedTimezone?: string;
}

export interface Category extends BaseAuditLog {
  id: string;
  name: string;
  type: 'expense' | 'income' | 'transfer';
}

export type CategoryInsert = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
