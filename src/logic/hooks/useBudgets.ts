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
    addRevenuePlan, 
    updateRevenuePlan, 
    deleteRevenuePlan 
  } = useFinance();

  return {
    budgets,
    revenuePlans,
    loading,
    fetchBudgets,
    addBudget,
    updateBudget: (id: string, updates: any) => updateBudget({ ...updates, id } as any),
    deleteBudget,
    addRevenuePlan,
    updateRevenuePlan: (id: string, updates: any) => updateRevenuePlan({ ...updates, id } as any),
    deleteRevenuePlan
  };
}
