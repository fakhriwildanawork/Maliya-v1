import { useState, useEffect, useCallback } from 'react';
import { Debt, DebtInsert } from '../types/debts';
import { DebtService } from '../services/debtService';

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await DebtService.getAllDebts();
      setDebts(data);
    } catch (err: any) {
      setError(err);
      console.error('Failed to fetch debts', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const addDebt = async (debt: DebtInsert) => {
    const newDebt = await DebtService.createDebt(debt);
    setDebts(prev => [newDebt, ...prev]);
    return newDebt;
  };

  const updateDebt = async (id: string, updates: Partial<DebtInsert>) => {
    const updated = await DebtService.updateDebt(id, updates);
    setDebts(prev => prev.map(d => d.id === id ? updated : d));
    return updated;
  };

  const deleteDebt = async (id: string) => {
    await DebtService.deleteDebt(id);
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  return {
    debts,
    loading,
    error,
    fetchDebts,
    addDebt,
    updateDebt,
    deleteDebt
  };
}
