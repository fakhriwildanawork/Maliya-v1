import { supabase } from '../libs/supabase';
import { Asset, AssetInsert, AssetHistoryLog } from '../types/assets';

export const AssetService = {
  async getAll(): Promise<Asset[]> {
    const { data, error } = await supabase
      .from('assets')
      .select('*, asset_history_logs(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;

    return (data || []).map(item => {
      const logs = (item.asset_history_logs || []).map((l: any) => ({
        id: l.id,
        date: l.date,
        value: l.value || 0,
        note: l.note || '',
        createdAt: l.created_at,
        updatedAt: l.updated_at
      })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        purchasePrice: item.purchase_price || 0,
        currentValue: item.current_value || 0,
        purchaseDate: item.purchase_date || '',
        lastUpdated: item.last_updated || '',
        description: item.description || '',
        historyLogs: logs,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      };
    }) as Asset[];
  },

  async create(asset: AssetInsert): Promise<Asset> {
    const dbPayload = {
      name: asset.name,
      category: asset.category,
      purchase_price: asset.purchasePrice,
      current_value: asset.currentValue,
      purchase_date: asset.purchaseDate,
      last_updated: asset.lastUpdated,
      description: asset.description
    };

    const { data, error } = await supabase
      .from('assets')
      .insert([dbPayload])
      .select()
      .single();
    if (error) throw error;

    // Create initial history log
    const initialLog = {
      asset_id: data.id,
      date: asset.purchaseDate || new Date().toISOString().split('T')[0],
      value: asset.currentValue,
      note: 'Pencatatan Aset Pertama Kali'
    };

    await supabase.from('asset_history_logs').insert([initialLog]);

    return {
      id: data.id,
      name: data.name,
      category: data.category,
      purchasePrice: data.purchase_price,
      currentValue: data.current_value,
      purchaseDate: data.purchase_date,
      lastUpdated: data.last_updated,
      description: data.description,
      historyLogs: [
        {
          id: 'initial',
          date: initialLog.date,
          value: initialLog.value,
          note: initialLog.note
        }
      ],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Asset;
  },

  async update(id: string, asset: Partial<AssetInsert>): Promise<Asset> {
    const dbPayload: any = {};
    if (asset.name !== undefined) dbPayload.name = asset.name;
    if (asset.category !== undefined) dbPayload.category = asset.category;
    if (asset.purchasePrice !== undefined) dbPayload.purchase_price = asset.purchasePrice;
    if (asset.currentValue !== undefined) dbPayload.current_value = asset.currentValue;
    if (asset.purchaseDate !== undefined) dbPayload.purchase_date = asset.purchaseDate;
    if (asset.lastUpdated !== undefined) dbPayload.last_updated = asset.lastUpdated;
    if (asset.description !== undefined) dbPayload.description = asset.description;

    const { data, error } = await supabase
      .from('assets')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      category: data.category,
      purchasePrice: data.purchase_price,
      currentValue: data.current_value,
      purchaseDate: data.purchase_date,
      lastUpdated: data.last_updated,
      description: data.description,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Asset;
  },

  async delete(id: string): Promise<boolean> {
    // Delete related asset history logs first to prevent foreign key constraint issues
    await supabase
      .from('asset_history_logs')
      .delete()
      .eq('asset_id', id);

    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async addValueLog(assetId: string, newValue: number, note: string): Promise<AssetHistoryLog> {
    // 1. Insert history log
    const logPayload = {
      asset_id: assetId,
      date: new Date().toISOString().split('T')[0],
      value: newValue,
      note: note || 'Penyesuaian Nilai Aset'
    };

    const { data: logData, error: logError } = await supabase
      .from('asset_history_logs')
      .insert([logPayload])
      .select()
      .single();
    if (logError) throw logError;

    // 2. Update parent asset record
    const { error: assetError } = await supabase
      .from('assets')
      .update({
        current_value: newValue,
        last_updated: new Date().toISOString().split('T')[0]
      })
      .eq('id', assetId);
    if (assetError) throw assetError;

    return {
      id: logData.id,
      date: logData.date,
      value: logData.value,
      note: logData.note,
      createdAt: logData.created_at,
      updatedAt: logData.updated_at
    };
  }
};
