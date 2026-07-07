import { useState, useEffect, useCallback } from 'react';
import { Investment, InvestmentInsert } from '../types/investments';
import { InvestmentService } from '../services/investmentService';

export function useInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInvestments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await InvestmentService.getAll();
      setInvestments(data);
    } catch (err: any) {
      setError(err);
      console.error('Failed to fetch investments', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const addInvestment = async (investment: InvestmentInsert) => {
    const newInv = await InvestmentService.create(investment);
    setInvestments(prev => [newInv, ...prev]);
    return newInv;
  };

  const updateInvestment = async (id: string, updates: Partial<InvestmentInsert>) => {
    const updated = await InvestmentService.update(id, updates);
    // Reload full list to get updated audit or logs properly
    const data = await InvestmentService.getAll();
    setInvestments(data);
    return updated;
  };

  const deleteInvestment = async (id: string) => {
    await InvestmentService.delete(id);
    setInvestments(prev => prev.filter(i => i.id !== id));
  };

  const addInvestmentValueLog = async (investmentId: string, currentPrice: number, investedAmount: number, currentValue: number, note: string) => {
    await InvestmentService.addValueLog(investmentId, currentPrice, investedAmount, currentValue, note);
    const data = await InvestmentService.getAll();
    setInvestments(data);
  };

  return {
    investments,
    loading,
    error,
    fetchInvestments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addInvestmentValueLog
  };
}
