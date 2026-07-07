import { supabase } from '../libs/supabase';
import { Wallet, CreditCard } from '../types/accounts';
import { getFetchLimit } from './fetchingCenter';

export const AccountService = {
  // --- WALLETS ---
  async getAllWallets() {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data as Wallet[];
  },

  async getWalletsPaginated(page: number = 0, signal?: AbortSignal) {
    const limit = getFetchLimit('Wallets');
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to)
      .abortSignal(signal as any);

    if (error) throw error;
    return data as Wallet[];
  },

  async addWallet(wallet: Omit<Wallet, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('wallets')
      .insert([wallet])
      .select()
      .single();

    if (error) throw error;
    return data as Wallet;
  },

  async updateWallet(id: string, updates: Partial<Wallet>) {
    const { data, error } = await supabase
      .from('wallets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Wallet;
  },

  async deleteWallet(id: string) {
    const { error } = await supabase
      .from('wallets')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // --- CREDIT CARDS ---
  async getAllCreditCards() {
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as CreditCard[];
  },

  async getCreditCardsPaginated(page: number = 0, signal?: AbortSignal) {
    const limit = getFetchLimit('CreditCards');
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to)
      .abortSignal(signal as any);

    if (error) throw error;
    return data as CreditCard[];
  },

  async addCreditCard(card: Omit<CreditCard, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('credit_cards')
      .insert([card])
      .select()
      .single();

    if (error) throw error;
    return data as CreditCard;
  },

  async updateCreditCard(id: string, updates: Partial<CreditCard>) {
    const { data, error } = await supabase
      .from('credit_cards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CreditCard;
  },

  async deleteCreditCard(id: string) {
    const { error } = await supabase
      .from('credit_cards')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async updateBalance(accountId: string, type: 'wallet' | 'card', amount: number) {
    const table = type === 'wallet' ? 'wallets' : 'credit_cards';
    
    // Get current balance
    const { data: account, error: fetchError } = await supabase
      .from(table)
      .select('balance')
      .eq('id', accountId)
      .single();

    if (fetchError) throw fetchError;

    const newBalance = (account.balance || 0) + amount;

    const { error: updateError } = await supabase
      .from(table)
      .update({ balance: newBalance })
      .eq('id', accountId);

    if (updateError) throw updateError;
    return true;
  }
};
