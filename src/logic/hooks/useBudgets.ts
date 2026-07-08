import { useFinance } from '../context/FinanceContext';

export function useBudgets() {
  const { 
    budgets, 
    revenuePlans, 
    loading, 
    fetchBudgets, 
    addBudget, 
    updateBudget, 
    deleteBudget, 
    addExpensePlan,
    updateExpensePlan,
    deleteExpensePlan,
    addRevenuePlan, 
    updateRevenuePlan, 
    deleteRevenuePlan,
    addIncomePlan,
    updateIncomePlan,
    deleteIncomePlan
  } = useFinance();

  return {
    budgets,
    revenuePlans,
    loading,
    fetchBudgets,
    addBudget,
    updateBudget: (id: string, updates: any) => updateBudget({ ...updates, id } as any),
    deleteBudget,
    addExpensePlan,
    updateExpensePlan: (id: string, updates: any) => updateExpensePlan({ ...updates, id } as any),
    deleteExpensePlan,
    addRevenuePlan,
    updateRevenuePlan: (id: string, updates: any) => updateRevenuePlan({ ...updates, id } as any),
    deleteRevenuePlan,
    addIncomePlan,
    updateIncomePlan: (id: string, updates: any) => updateIncomePlan({ ...updates, id } as any),
    deleteIncomePlan
  };
}
