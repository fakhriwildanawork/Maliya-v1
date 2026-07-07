import { useState, useEffect, useCallback } from 'react';
import { JournalEntry } from '../types/ledger';
import { ledgerService } from '../services/ledgerService';

export function useLedger() {
  const [ledgerEntries, setLedgerEntries] = useState<JournalEntry[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLedger = useCallback(async (page: number = 0, search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ledgerService.getJournalEntries(page, search);
      setLedgerEntries(response.data);
      setTotalTransactions(response.total);
    } catch (err: any) {
      setError(err);
      console.error('Failed to fetch ledger entries', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    ledgerEntries,
    totalTransactions,
    loading,
    error,
    fetchLedger
  };
}
