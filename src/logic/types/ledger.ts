// Interface TypeScript untuk modul Ledger sebagai kontrak data

export interface BaseAuditLog {
  createdAt?: string;
  createdBy?: string;
  createdTimezone?: string;
  updatedAt?: string;
  updatedBy?: string;
  updatedTimezone?: string;
}

export interface JournalEntry extends BaseAuditLog {
  id: string;
  transactionId?: string;
  transactionTitle?: string;
  date: string;
  accountName: string;
  debit: number;
  credit: number;
}

export type JournalEntryInsert = Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>;
