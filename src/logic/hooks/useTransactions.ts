import { useState, useCallback, useRef } from 'react';
import { transactionService } from '../services/transactionService';
import { Transaction, TransactionInsert } from '../types/transactions';

export function useTransactions() {
  const [data, setData] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const pageRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTransactions = useCallback(async (
    page: number = 0,
    reset: boolean = false,
    filters?: {
      search?: string;
      type?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      if (reset || page === 0) {
        setLoading(true);
        pageRef.current = 0;
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      
      const response = await transactionService.getPaginated(page, undefined, filters);
      
      if (!abortControllerRef.current.signal.aborted) {
        if (reset || page === 0) {
          setData(response.data);
        } else {
          setData(prev => [...prev, ...response.data]);
        }
        setTotal(response.total);
        setHasMore(response.hasMore);
        pageRef.current = page + 1;
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && !abortControllerRef.current?.signal.aborted) {
        setError(err.message || 'Failed to fetch transactions');
        console.error(err);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  const addTransaction = async (transaction: TransactionInsert) => {
    try {
      setLoading(true);
      const newTransaction = await transactionService.create(transaction);
      // Optimistic update for the UI: mapping db snake case response back to camel case
      const mappedNewTransaction: Transaction = {
        id: newTransaction.id,
        orderId: newTransaction.order_id,
        title: newTransaction.title,
        category: newTransaction.category,
        price: newTransaction.price,
        status: newTransaction.status,
        date: newTransaction.date,
        datetime: newTransaction.datetime,
        description: newTransaction.description,
        attachments: newTransaction.attachments,
        type: newTransaction.type,
        sourceAccountId: newTransaction.source_account_id,
        destinationAccountId: newTransaction.destination_account_id,
        linkedDebtId: newTransaction.linked_debt_id,
      };
      
      setData(prev => [mappedNewTransaction, ...prev]);
      setTotal(prev => prev + 1);
      return mappedNewTransaction;
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editTransaction = async (id: string, transaction: Partial<TransactionInsert>) => {
    try {
      setLoading(true);
      const updatedTransaction = await transactionService.update(id, transaction);
      
      const mappedUpdatedTransaction: Transaction = {
        id: updatedTransaction.id,
        orderId: updatedTransaction.order_id,
        title: updatedTransaction.title,
        category: updatedTransaction.category,
        price: updatedTransaction.price,
        status: updatedTransaction.status,
        date: updatedTransaction.date,
        datetime: updatedTransaction.datetime,
        description: updatedTransaction.description,
        attachments: updatedTransaction.attachments,
        type: updatedTransaction.type,
        sourceAccountId: updatedTransaction.source_account_id,
        destinationAccountId: updatedTransaction.destination_account_id,
        linkedDebtId: updatedTransaction.linked_debt_id,
      };
      
      setData(prev => prev.map(t => t.id === id ? { ...t, ...mappedUpdatedTransaction } : t));
      return mappedUpdatedTransaction;
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeTransaction = async (id: string) => {
    try {
      setLoading(true);
      await transactionService.delete(id);
      setData(prev => prev.filter(t => t.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    total,
    loading,
    loadingMore,
    error,
    hasMore,
    fetchTransactions,
    addTransaction,
    editTransaction,
    removeTransaction
  };
}
