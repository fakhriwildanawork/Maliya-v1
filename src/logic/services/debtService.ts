import { supabase } from '../libs/supabase';
import { Debt, DebtInsert } from '../types/debts';

export const DebtService = {
  async getAllDebts() {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      title: item.title,
      description: item.description,
      type: item.type,
      amount: item.amount,
      paidAmount: item.paid_amount,
      dueDate: item.due_date,
      status: item.status,
      paymentLogs: item.payment_logs || [],
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) as Debt[];
  },

  async createDebt(debt: DebtInsert) {
    const dbPayload = {
      name: debt.name,
      title: debt.title,
      description: debt.description,
      type: debt.type,
      amount: debt.amount,
      paid_amount: debt.paidAmount || 0,
      due_date: debt.dueDate,
      status: debt.status || 'active',
      payment_logs: debt.paymentLogs || []
    };
    
    const { data, error } = await supabase
      .from('debts')
      .insert([dbPayload])
      .select()
      .single();
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      title: data.title,
      description: data.description,
      type: data.type,
      amount: data.amount,
      paidAmount: data.paid_amount,
      dueDate: data.due_date,
      status: data.status,
      paymentLogs: data.payment_logs,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Debt;
  },

  async updateDebt(id: string, debt: Partial<DebtInsert>) {
    const dbPayload: any = {};
    if (debt.name !== undefined) dbPayload.name = debt.name;
    if (debt.title !== undefined) dbPayload.title = debt.title;
    if (debt.description !== undefined) dbPayload.description = debt.description;
    if (debt.type !== undefined) dbPayload.type = debt.type;
    if (debt.amount !== undefined) dbPayload.amount = debt.amount;
    if (debt.paidAmount !== undefined) dbPayload.paid_amount = debt.paidAmount;
    if (debt.dueDate !== undefined) dbPayload.due_date = debt.dueDate;
    if (debt.status !== undefined) dbPayload.status = debt.status;
    if (debt.paymentLogs !== undefined) dbPayload.payment_logs = debt.paymentLogs;

    const { data, error } = await supabase
      .from('debts')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      title: data.title,
      description: data.description,
      type: data.type,
      amount: data.amount,
      paidAmount: data.paid_amount,
      dueDate: data.due_date,
      status: data.status,
      paymentLogs: data.payment_logs,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Debt;
  },

  async deleteDebt(id: string) {
    const { error } = await supabase.from('debts').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
