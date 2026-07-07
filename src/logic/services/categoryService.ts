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
      type: category.type
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
      updatedAt: data.updated_at
    } as Category;
  },

  async update(id: string, category: Partial<CategoryInsert>): Promise<Category> {
    const dbPayload: any = {};
    if (category.name !== undefined) dbPayload.name = category.name;
    if (category.type !== undefined) dbPayload.type = category.type;
    
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
      updatedAt: data.updated_at
    } as Category;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
