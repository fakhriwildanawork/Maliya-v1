// Interface TypeScript untuk modul Investments sebagai kontrak data

export interface InvestmentHistoryLog {
  id: string;
  date: string;
  investedAmount: number;
  currentValue: number;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Investment {
  id: string;
  name: string;
  type: 'Stock' | 'Mutual Fund' | 'Crypto' | 'Real Estate' | 'Gold' | 'P2P Lending' | 'Other';
  investedAmount: number; // Cash actually invested
  currentValue: number;   // Current market value
  quantity: number;        // Units held
  averageBuyPrice: number; // Average buy price per unit
  currentPrice: number;    // Current market price per unit
  purchaseDate: string;
  lastUpdated: string;
  status: 'Active' | 'Liquidated';
  historyLogs?: InvestmentHistoryLog[];
  createdAt?: string;
  updatedAt?: string;
}

export type InvestmentInsert = Omit<Investment, 'id' | 'createdAt' | 'updatedAt' | 'historyLogs'>;
export type InvestmentHistoryLogInsert = Omit<InvestmentHistoryLog, 'id' | 'createdAt' | 'updatedAt'>;
