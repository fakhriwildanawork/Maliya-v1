import { useState, useEffect, useCallback } from 'react';
import { Wallet, CreditCard } from '../types/accounts';
import { AccountService } from '../services/accountService';

export function useAccounts() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const [wData, cData] = await Promise.all([
        AccountService.getAllWallets(),
        AccountService.getAllCreditCards()
      ]);
      setWallets(wData);
      setCards(cData);
    } catch (err: any) {
      setError(err);
      console.error('Failed to fetch accounts', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const addWallet = async (wallet: any) => {
    const newWallet = await AccountService.addWallet(wallet);
    setWallets(prev => [newWallet, ...prev]);
    return newWallet;
  };

  const updateWallet = async (id: string, updates: any) => {
    const updated = await AccountService.updateWallet(id, updates);
    setWallets(prev => prev.map(w => w.id === id ? updated : w));
    return updated;
  };

  const deleteWallet = async (id: string) => {
    await AccountService.deleteWallet(id);
    setWallets(prev => prev.filter(w => w.id !== id));
  };

  const addCreditCard = async (card: any) => {
    const newCard = await AccountService.addCreditCard(card);
    setCards(prev => [newCard, ...prev]);
    return newCard;
  };

  const updateCreditCard = async (id: string, updates: any) => {
    const updated = await AccountService.updateCreditCard(id, updates);
    setCards(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  };

  const deleteCreditCard = async (id: string) => {
    await AccountService.deleteCreditCard(id);
    setCards(prev => prev.filter(c => c.id !== id));
  };

  return {
    wallets,
    cards,
    loading,
    error,
    fetchAccounts,
    addWallet,
    updateWallet,
    deleteWallet,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard
  };
}
