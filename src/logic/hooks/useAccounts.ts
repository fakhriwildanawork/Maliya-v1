import { useFinance } from '../context/FinanceContext';
import { Wallet, CreditCard } from '../types/finance';

export function useAccounts() {
  const { 
    wallets, 
    cards, 
    loading, 
    addWallet, 
    updateWallet, 
    deleteWallet, 
    addCard, 
    updateCard, 
    deleteCard, 
    fetchAccounts 
  } = useFinance();

  return {
    wallets,
    cards,
    loading,
    addWallet,
    updateWallet,
    deleteWallet,
    addCreditCard: addCard,
    updateCreditCard: updateCard,
    deleteCreditCard: deleteCard,
    fetchAccounts
  };
}
