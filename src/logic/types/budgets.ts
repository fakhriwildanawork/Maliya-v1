export interface ExpensePlan {
  id: string;
  budgetId: string;
  name: string;
  estimatedAmount: number;
  isCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ExpensePlanInsert = Omit<ExpensePlan, 'id' | 'createdAt' | 'updatedAt'>;

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: number; // 1-12
  year: number;
  status: 'On Track' | 'Warning' | 'Exceeded';
  expensePlans?: ExpensePlan[];
  
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
  incomePlans?: IncomePlan[];
  
  // Audit trail
  createdAt?: string;
  updatedAt?: string;
}

export type RevenuePlanInsert = Omit<RevenuePlan, 'id' | 'createdAt' | 'updatedAt'>;

export interface IncomePlan {
  id: string;
  revenuePlanId: string;
  name: string;
  estimatedAmount: number;
  isCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type IncomePlanInsert = Omit<IncomePlan, 'id' | 'createdAt' | 'updatedAt'>;

