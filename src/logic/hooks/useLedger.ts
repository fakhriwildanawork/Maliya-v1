import { useState, useEffect, useCallback } from 'react';
import { JournalEntry } from '../types/ledger';
import { ledgerService } from '../services/ledgerService';

export function useLedger() {
  const [ledgerEntries, setLedgerEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLedger = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ledgerService.getJournalEntries();
      setLedgerEntries(data);
    } catch (err: any) {
      setError(err);
      console.error('Failed to fetch ledger entries', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  return {
    ledgerEntries,
    loading,
    error,
    fetchLedger
  };
}
