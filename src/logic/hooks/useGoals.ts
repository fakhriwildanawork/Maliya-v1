import { useState, useEffect, useCallback } from 'react';
import { Goal, GoalInsert } from '../types/goals';
import { GoalService } from '../services/goalService';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await GoalService.getAll();
      setGoals(data);
    } catch (err: any) {
      setError(err);
      console.error('Failed to fetch goals', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (goal: GoalInsert) => {
    const newGoal = await GoalService.create(goal);
    setGoals(prev => [newGoal, ...prev]);
    return newGoal;
  };

  const updateGoal = async (id: string, updates: Partial<GoalInsert>) => {
    const updated = await GoalService.update(id, updates);
    setGoals(prev => prev.map(g => g.id === id ? updated : g));
    return updated;
  };

  const deleteGoal = async (id: string) => {
    await GoalService.delete(id);
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return {
    goals,
    loading,
    error,
    fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal
  };
}
