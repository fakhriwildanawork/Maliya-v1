import { useState, useEffect, useCallback } from 'react';
import { Budget, BudgetInsert, RevenuePlan, RevenuePlanInsert } from '../types/budgets';
import { BudgetService } from '../services/budgetService';

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [revenuePlans, setRevenuePlans] = useState<RevenuePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const [bData, rpData] = await Promise.all([
        BudgetService.getAllBudgets(),
        BudgetService.getAllRevenuePlans()
      ]);
      setBudgets(bData);
      setRevenuePlans(rpData);
    } catch (err: any) {
      setError(err);
      console.error('Failed to fetch budgets and revenue plans', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const addBudget = async (budget: BudgetInsert) => {
    const newBudget = await BudgetService.createBudget(budget);
    setBudgets(prev => [newBudget, ...prev]);
    return newBudget;
  };

  const updateBudget = async (id: string, updates: Partial<BudgetInsert>) => {
    const updated = await BudgetService.updateBudget(id, updates);
    setBudgets(prev => prev.map(b => b.id === id ? updated : b));
    return updated;
  };

  const deleteBudget = async (id: string) => {
    await BudgetService.deleteBudget(id);
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const addRevenuePlan = async (plan: RevenuePlanInsert) => {
    const newPlan = await BudgetService.createRevenuePlan(plan);
    setRevenuePlans(prev => [newPlan, ...prev]);
    return newPlan;
  };

  const updateRevenuePlan = async (id: string, updates: Partial<RevenuePlanInsert>) => {
    const updated = await BudgetService.updateRevenuePlan(id, updates);
    setRevenuePlans(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const deleteRevenuePlan = async (id: string) => {
    await BudgetService.deleteRevenuePlan(id);
    setRevenuePlans(prev => prev.filter(p => p.id !== id));
  };

  return {
    budgets,
    revenuePlans,
    loading,
    error,
    fetchBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
    addRevenuePlan,
    updateRevenuePlan,
    deleteRevenuePlan
  };
}
