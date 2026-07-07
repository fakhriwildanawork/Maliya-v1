import { supabase } from '../libs/supabase';
import { Category, CategoryInsert } from '../types/categories';

export const CategoryService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      createdAt: item.created_at,
      createdBy: item.created_by,
      createdTimezone: item.created_timezone,
      updatedAt: item.updated_at,
      updatedBy: item.updated_by,
      updatedTimezone: item.updated_timezone
    })) as Category[];
  },

  async create(category: CategoryInsert): Promise<Category> {
    const dbPayload = {
      name: category.name,
      type: category.type,
      created_by: category.createdBy,
      updated_by: category.updatedBy
    };
    
    const { data, error } = await supabase
      .from('categories')
      .insert([dbPayload])
      .select()
      .single();
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      createdAt: data.created_at,
      createdBy: data.created_by,
      updatedAt: data.updated_at,
      updatedBy: data.updated_by
    } as Category;
  },

  async update(id: string, category: Partial<CategoryInsert>): Promise<Category> {
    const dbPayload: any = {};
    if (category.name !== undefined) dbPayload.name = category.name;
    if (category.type !== undefined) dbPayload.type = category.type;
    if (category.updatedBy !== undefined) dbPayload.updated_by = category.updatedBy;
    
    const { data, error } = await supabase
      .from('categories')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      createdAt: data.created_at,
      createdBy: data.created_by,
      updatedAt: data.updated_at,
      updatedBy: data.updated_by
    } as Category;
  },

  async delete(id: string): Promise<boolean> {
    // Check if category name is used in transactions
    const { data: category } = await supabase
      .from('categories')
      .select('name')
      .eq('id', id)
      .single();

    if (category) {
      const { count, error: countError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('category', category.name);
      
      if (countError) throw countError;
      if (count && count > 0) {
        throw new Error('Cannot delete category that is currently used in transactions');
      }
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
