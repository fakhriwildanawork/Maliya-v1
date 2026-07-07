import { supabase } from '../libs/supabase';
import { Transaction, TransactionInsert } from '../types/transactions';
import { getFetchLimit } from './fetchingCenter';
import { AccountService } from './accountService';

const TABLE_NAME = 'transactions';

async function adjustAccountBalance(accountId: string | null, amount: number) {
  if (!accountId) return;
  
  // Attempt to update as wallet first
  try {
    await AccountService.updateBalance(accountId, 'wallet', amount);
  } catch (err) {
    // If not found in wallets, try as credit card
    try {
      await AccountService.updateBalance(accountId, 'card', amount);
    } catch (cardErr) {
      console.warn(`Account ${accountId} not found in wallets or credit_cards for balance adjustment`);
    }
  }
}

export const transactionService = {
  // Fetch paginated transactions for infinite scroll or paginated table
  getPaginated: async (
    page: number = 0, 
    customLimit?: number,
    filters?: {
      search?: string;
      type?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ) => {
    const limit = customLimit || getFetchLimit('TransactionsList');
    const from = page * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact' });

    if (filters) {
      if (filters.type && filters.type !== 'All') {
        query = query.eq('type', filters.type);
      }
      if (filters.status && filters.status !== 'All') {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,category.ilike.%${filters.search}%,order_id.ilike.%${filters.search}%`);
      }
      if (filters.dateFrom) {
        query = query.gte('datetime', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('datetime', filters.dateTo);
      }
    }

    const { data, error, count } = await query
      .order('datetime', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }

    // Map database snake_case to frontend camelCase
    const mappedData: Transaction[] = (data || []).map(item => ({
      id: item.id,
      orderId: item.order_id,
      title: item.title,
      category: item.category,
      price: item.price,
      status: item.status,
      date: item.date,
      datetime: item.datetime,
      description: item.description,
      attachments: item.attachments,
      type: item.type,
      sourceAccountId: item.source_account_id,
      destinationAccountId: item.destination_account_id,
      linkedDebtId: item.linked_debt_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      createdBy: item.created_by,
      updatedBy: item.updated_by
    }));

    return {
      data: mappedData,
      total: count || 0,
      hasMore: count ? from + limit < count : false
    };
  },

  // Get all (if needed for small widgets)
  getAll: async () => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      orderId: item.order_id,
      title: item.title,
      category: item.category,
      price: item.price,
      status: item.status,
      date: item.date,
      datetime: item.datetime,
      description: item.description,
      attachments: item.attachments,
      type: item.type,
      sourceAccountId: item.source_account_id,
      destinationAccountId: item.destination_account_id,
      linkedDebtId: item.linked_debt_id,
    })) as Transaction[];
  },

  // Create new transaction
  create: async (transaction: TransactionInsert) => {
    // Convert camelCase to snake_case for DB
    const dbPayload = {
      order_id: transaction.orderId,
      title: transaction.title,
      category: transaction.category,
      price: transaction.price,
      status: transaction.status,
      date: transaction.date,
      datetime: transaction.datetime,
      description: transaction.description,
      attachments: transaction.attachments,
      type: transaction.type,
      source_account_id: transaction.sourceAccountId,
      destination_account_id: transaction.destinationAccountId,
      linked_debt_id: transaction.linkedDebtId,
      created_by: transaction.createdBy,
      updated_by: transaction.updatedBy
    };

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([dbPayload])
      .select()
      .single();

    if (error) throw error;
    
    // Adjust balances
    if (transaction.type === 'expense') {
      await adjustAccountBalance(transaction.sourceAccountId, -transaction.price);
    } else if (transaction.type === 'income') {
      await adjustAccountBalance(transaction.destinationAccountId, transaction.price);
    } else if (transaction.type === 'transfer') {
      await adjustAccountBalance(transaction.sourceAccountId, -transaction.price);
      await adjustAccountBalance(transaction.destinationAccountId, transaction.price);
    }
    
    return data;
  },

  // Update existing transaction
  update: async (id: string, transaction: Partial<TransactionInsert>) => {
    // For update, it's safer to fetch the old one first to reverse the impact
    const { data: oldTx, error: fetchError } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;

    // Reverse old impact
    if (oldTx.type === 'expense') {
      await adjustAccountBalance(oldTx.source_account_id, oldTx.price);
    } else if (oldTx.type === 'income') {
      await adjustAccountBalance(oldTx.destination_account_id, -oldTx.price);
    } else if (oldTx.type === 'transfer') {
      await adjustAccountBalance(oldTx.source_account_id, oldTx.price);
      await adjustAccountBalance(oldTx.destination_account_id, -oldTx.price);
    }
    const dbPayload: any = {};
    if (transaction.orderId !== undefined) dbPayload.order_id = transaction.orderId;
    if (transaction.title !== undefined) dbPayload.title = transaction.title;
    if (transaction.category !== undefined) dbPayload.category = transaction.category;
    if (transaction.price !== undefined) dbPayload.price = transaction.price;
    if (transaction.status !== undefined) dbPayload.status = transaction.status;
    if (transaction.date !== undefined) dbPayload.date = transaction.date;
    if (transaction.datetime !== undefined) dbPayload.datetime = transaction.datetime;
    if (transaction.description !== undefined) dbPayload.description = transaction.description;
    if (transaction.attachments !== undefined) dbPayload.attachments = transaction.attachments;
    if (transaction.type !== undefined) dbPayload.type = transaction.type;
    if (transaction.sourceAccountId !== undefined) dbPayload.source_account_id = transaction.sourceAccountId;
    if (transaction.destinationAccountId !== undefined) dbPayload.destination_account_id = transaction.destinationAccountId;
    if (transaction.linkedDebtId !== undefined) dbPayload.linked_debt_id = transaction.linkedDebtId;
    if (transaction.updatedBy !== undefined) dbPayload.updated_by = transaction.updatedBy;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Apply new impact
    const updatedTx = data;
    if (updatedTx.type === 'expense') {
      await adjustAccountBalance(updatedTx.source_account_id, -updatedTx.price);
    } else if (updatedTx.type === 'income') {
      await adjustAccountBalance(updatedTx.destination_account_id, updatedTx.price);
    } else if (updatedTx.type === 'transfer') {
      await adjustAccountBalance(updatedTx.source_account_id, -updatedTx.price);
      await adjustAccountBalance(updatedTx.destination_account_id, updatedTx.price);
    }

    return data;
  },

  // Delete transaction
  delete: async (id: string) => {
    // Fetch first to reverse impact
    const { data: oldTx, error: fetchError } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;

    // Reverse old impact
    if (oldTx.type === 'expense') {
      await adjustAccountBalance(oldTx.source_account_id, oldTx.price);
    } else if (oldTx.type === 'income') {
      await adjustAccountBalance(oldTx.destination_account_id, -oldTx.price);
    } else if (oldTx.type === 'transfer') {
      await adjustAccountBalance(oldTx.source_account_id, oldTx.price);
      await adjustAccountBalance(oldTx.destination_account_id, -oldTx.price);
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Bulk delete transactions
  deleteMany: async (ids: string[]) => {
    // Fetch all first to reverse impact
    const { data: oldTxs, error: fetchError } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .in('id', ids);
    
    if (fetchError) throw fetchError;

    // Reverse all impacts
    for (const oldTx of (oldTxs || [])) {
      if (oldTx.type === 'expense') {
        await adjustAccountBalance(oldTx.source_account_id, oldTx.price);
      } else if (oldTx.type === 'income') {
        await adjustAccountBalance(oldTx.destination_account_id, -oldTx.price);
      } else if (oldTx.type === 'transfer') {
        await adjustAccountBalance(oldTx.source_account_id, oldTx.price);
        await adjustAccountBalance(oldTx.destination_account_id, -oldTx.price);
      }
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .in('id', ids);

    if (error) throw error;
    return true;
  }
};
