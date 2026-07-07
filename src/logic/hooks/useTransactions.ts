import { useFinance } from '../context/FinanceContext';

export function useTransactions() {
  const { 
    activities: data, 
    totalActivities: total, 
    loadingActivities: loading, 
    fetchActivities: fetchTransactions,
    addActivity: addTransaction,
    updateActivity: editTransaction,
    deleteActivity: removeTransaction
  } = useFinance();

  return {
    data,
    total,
    loading,
    loadingMore: false, // Handled in provider if needed
    error: null,
    hasMore: data.length < total,
    fetchTransactions,
    addTransaction,
    editTransaction,
    removeTransaction
  };
}
