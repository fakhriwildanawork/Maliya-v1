// Interface TypeScript untuk modul Goals sebagai kontrak data

interface BaseAuditLog {
  createdAt?: string;
  createdBy?: string;
  createdTimezone?: string;
  updatedAt?: string;
  updatedBy?: string;
  updatedTimezone?: string;
}

export interface Goal extends BaseAuditLog {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  icon?: string;
  status: 'In Progress' | 'Achieved' | 'On Hold';
  startDate?: string;
  monthlyTarget?: number;
}

export type GoalInsert = Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>;
