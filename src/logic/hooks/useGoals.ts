import { useFinance } from '../context/FinanceContext';

export function useGoals() {
  const { goals, loading, addGoal, updateGoal, deleteGoal, fetchGoals } = useFinance();

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    fetchGoals
  };
}
