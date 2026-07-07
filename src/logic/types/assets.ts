// Interface TypeScript untuk modul Assets sebagai kontrak data

export interface AssetHistoryLog {
  id: string;
  date: string;
  value: number;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Asset {
  id: string;
  name: string;
  category: 'Property' | 'Vehicle' | 'Electronics' | 'Jewelry' | 'Business' | 'Other';
  purchasePrice: number;
  currentValue: number;
  purchaseDate: string;
  lastUpdated: string;
  description?: string;
  historyLogs?: AssetHistoryLog[];
  createdAt?: string;
  updatedAt?: string;
}

export type AssetInsert = Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'historyLogs'>;
export type AssetHistoryLogInsert = Omit<AssetHistoryLog, 'id' | 'createdAt' | 'updatedAt'>;
