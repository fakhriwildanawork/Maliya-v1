import { useFinance } from '../context/FinanceContext';

export function useDebts() {
  const { debts, loading, addDebt, updateDebt, deleteDebt, fetchDebts } = useFinance();

  return {
    debts,
    loading,
    addDebt,
    updateDebt,
    deleteDebt,
    fetchDebts
  };
}
