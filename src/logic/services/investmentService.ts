import { supabase } from '../libs/supabase';
import { Investment, InvestmentInsert, InvestmentHistoryLog } from '../types/investments';

export const InvestmentService = {
  async getAll(): Promise<Investment[]> {
    const { data, error } = await supabase
      .from('investments')
      .select('*, investment_history_logs(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;

    return (data || []).map(item => {
      const logs = (item.investment_history_logs || []).map((l: any) => ({
        id: l.id,
        date: l.date,
        investedAmount: l.invested_amount || 0,
        currentValue: l.current_value || 0,
        note: l.note || '',
        createdAt: l.created_at,
        updatedAt: l.updated_at
      })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        id: item.id,
        name: item.name,
        type: item.type,
        investedAmount: item.invested_amount || 0,
        currentValue: item.current_value || 0,
        quantity: item.quantity || 0,
        averageBuyPrice: item.average_buy_price || 0,
        currentPrice: item.current_price || 0,
        purchaseDate: item.purchase_date || '',
        lastUpdated: item.last_updated || '',
        status: item.status || 'Active',
        historyLogs: logs,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      };
    }) as Investment[];
  },

  async create(investment: InvestmentInsert): Promise<Investment> {
    const dbPayload = {
      name: investment.name,
      type: investment.type,
      invested_amount: investment.investedAmount,
      current_value: investment.currentValue,
      quantity: investment.quantity,
      average_buy_price: investment.averageBuyPrice,
      current_price: investment.currentPrice,
      purchase_date: investment.purchaseDate,
      last_updated: investment.lastUpdated,
      status: investment.status || 'Active'
    };

    const { data, error } = await supabase
      .from('investments')
      .insert([dbPayload])
      .select()
      .single();
    if (error) throw error;

    // Create initial history log
    const initialLog = {
      investment_id: data.id,
      date: investment.purchaseDate || new Date().toISOString().split('T')[0],
      invested_amount: investment.investedAmount,
      current_value: investment.currentValue,
      note: 'Inisialisasi Portofolio'
    };
    
    await supabase.from('investment_history_logs').insert([initialLog]);

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      investedAmount: data.invested_amount,
      currentValue: data.current_value,
      quantity: data.quantity,
      averageBuyPrice: data.average_buy_price,
      currentPrice: data.current_price,
      purchaseDate: data.purchase_date,
      lastUpdated: data.last_updated,
      status: data.status,
      historyLogs: [
        {
          id: 'initial',
          date: initialLog.date,
          investedAmount: initialLog.invested_amount,
          currentValue: initialLog.current_value,
          note: initialLog.note
        }
      ],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Investment;
  },

  async update(id: string, investment: Partial<InvestmentInsert>): Promise<Investment> {
    const dbPayload: any = {};
    if (investment.name !== undefined) dbPayload.name = investment.name;
    if (investment.type !== undefined) dbPayload.type = investment.type;
    if (investment.investedAmount !== undefined) dbPayload.invested_amount = investment.investedAmount;
    if (investment.currentValue !== undefined) dbPayload.current_value = investment.currentValue;
    if (investment.quantity !== undefined) dbPayload.quantity = investment.quantity;
    if (investment.averageBuyPrice !== undefined) dbPayload.average_buy_price = investment.averageBuyPrice;
    if (investment.currentPrice !== undefined) dbPayload.current_price = investment.currentPrice;
    if (investment.purchaseDate !== undefined) dbPayload.purchase_date = investment.purchaseDate;
    if (investment.lastUpdated !== undefined) dbPayload.last_updated = investment.lastUpdated;
    if (investment.status !== undefined) dbPayload.status = investment.status;

    const { data, error } = await supabase
      .from('investments')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      investedAmount: data.invested_amount,
      currentValue: data.current_value,
      quantity: data.quantity,
      averageBuyPrice: data.average_buy_price,
      currentPrice: data.current_price,
      purchaseDate: data.purchase_date,
      lastUpdated: data.last_updated,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Investment;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async addValueLog(investmentId: string, currentPrice: number, investedAmount: number, currentValue: number, note: string): Promise<InvestmentHistoryLog> {
    // 1. Insert history log
    const logPayload = {
      investment_id: investmentId,
      date: new Date().toISOString().split('T')[0],
      invested_amount: investedAmount,
      current_value: currentValue,
      note: note || 'Penyesuaian Nilai Pasar'
    };

    const { data: logData, error: logError } = await supabase
      .from('investment_history_logs')
      .insert([logPayload])
      .select()
      .single();
    if (logError) throw logError;

    // 2. Update parent investment record
    const { error: invError } = await supabase
      .from('investments')
      .update({
        current_price: currentPrice,
        current_value: currentValue,
        last_updated: new Date().toISOString().split('T')[0]
      })
      .eq('id', investmentId);
    if (invError) throw invError;

    return {
      id: logData.id,
      date: logData.date,
      investedAmount: logData.invested_amount,
      currentValue: logData.current_value,
      note: logData.note,
      createdAt: logData.created_at,
      updatedAt: logData.updated_at
    };
  }
};
