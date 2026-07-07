export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: number; // 1-12
  year: number;
  status: 'On Track' | 'Warning' | 'Exceeded';
  
  // Audit trail
  createdAt?: string;
  updatedAt?: string;
}

export type BudgetInsert = Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>;

export interface RevenuePlan {
  id: string;
  category: string;
  target: number;
  achieved: number;
  month: number; // 1-12
  year: number;
  status: 'On Track' | 'Behind' | 'Exceeded';
  
  // Audit trail
  createdAt?: string;
  updatedAt?: string;
}

export type RevenuePlanInsert = Omit<RevenuePlan, 'id' | 'createdAt' | 'updatedAt'>;

