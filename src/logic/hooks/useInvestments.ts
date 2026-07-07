import { useFinance } from '../context/FinanceContext';

export function useInvestments() {
  const { 
    investments, 
    loading, 
    addInvestment, 
    updateInvestment, 
    deleteInvestment, 
    addInvestmentValueLog, 
    fetchInvestments 
  } = useFinance();

  return {
    investments,
    loading,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addInvestmentValueLog,
    fetchInvestments
  };
}
