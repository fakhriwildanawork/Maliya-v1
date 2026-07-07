import { AccountService } from './accountService';
import { transactionService } from './transactionService';
import { JournalEntry } from '../types/ledger';

export const ledgerService = {
  // Generate double-entry accounting journal entries from real transactions and accounts
  async getJournalEntries(): Promise<JournalEntry[]> {
    try {
      const [transactions, wallets, cards] = await Promise.all([
        transactionService.getAll(),
        AccountService.getAllWallets(),
        AccountService.getAllCreditCards()
      ]);

      const entries: JournalEntry[] = [];

      const getAccountName = (id?: string) => {
        if (!id) return 'Main Account';
        const wallet = wallets.find(w => w.id === id);
        if (wallet) return wallet.name;
        const card = cards.find(c => c.id === id);
        if (card) return card.number;
        return 'Unknown Account';
      };

      transactions.forEach(tx => {
        let debitAccount = '';
        let creditAccount = '';

        if (tx.type === 'expense') {
          debitAccount = tx.category; // Expense increases (Debit)
          creditAccount = getAccountName(tx.sourceAccountId); // Asset decreases (Credit)
        } else if (tx.type === 'income') {
          debitAccount = getAccountName(tx.sourceAccountId); // Asset increases (Debit)
          creditAccount = tx.category; // Income increases (Credit)
        } else if (tx.type === 'transfer') {
          debitAccount = getAccountName(tx.destinationAccountId); // Destination Asset increases (Debit)
          creditAccount = getAccountName(tx.sourceAccountId); // Source Asset decreases (Credit)
        } else {
          // Fallback if type is not specified
          debitAccount = tx.category || 'Other';
          creditAccount = 'Main Account';
        }

        // Add Debit Entry
        entries.push({
          id: `${tx.id}-dr`,
          transactionId: tx.orderId || tx.id,
          date: tx.date,
          accountName: debitAccount,
          debit: tx.price,
          credit: 0
        });

        // Add Credit Entry
        entries.push({
          id: `${tx.id}-cr`,
          transactionId: tx.orderId || tx.id,
          date: tx.date,
          accountName: creditAccount,
          debit: 0,
          credit: tx.price
        });
      });

      return entries;
    } catch (error) {
      console.error('Failed to retrieve ledger entries:', error);
      throw error;
    }
  }
};
