import { supabase } from '../libs/supabase';
import { Goal, GoalInsert } from '../types/goals';

export const GoalService = {
  async getAll(): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      targetAmount: item.target_amount || 0,
      currentAmount: item.current_amount || 0,
      deadline: item.deadline || '',
      category: item.category || '',
      icon: item.icon || '',
      status: item.status || 'In Progress',
      startDate: item.start_date || '',
      monthlyTarget: item.monthly_target || 0,
      createdAt: item.created_at,
      createdBy: item.created_by,
      createdTimezone: item.created_timezone,
      updatedAt: item.updated_at,
      updatedBy: item.updated_by,
      updatedTimezone: item.updated_timezone
    })) as Goal[];
  },

  async create(goal: GoalInsert): Promise<Goal> {
    const dbPayload = {
      name: goal.name,
      target_amount: goal.targetAmount,
      current_amount: goal.currentAmount || 0,
      deadline: goal.deadline,
      category: goal.category,
      icon: goal.icon,
      status: goal.status || 'In Progress',
      start_date: goal.startDate,
      monthly_target: goal.monthlyTarget
    };
    
    const { data, error } = await supabase
      .from('goals')
      .insert([dbPayload])
      .select()
      .single();
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      targetAmount: data.target_amount,
      currentAmount: data.current_amount,
      deadline: data.deadline,
      category: data.category,
      icon: data.icon,
      status: data.status,
      startDate: data.start_date,
      monthlyTarget: data.monthly_target,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Goal;
  },

  async update(id: string, goal: Partial<GoalInsert>): Promise<Goal> {
    const dbPayload: any = {};
    if (goal.name !== undefined) dbPayload.name = goal.name;
    if (goal.targetAmount !== undefined) dbPayload.target_amount = goal.targetAmount;
    if (goal.currentAmount !== undefined) dbPayload.current_amount = goal.currentAmount;
    if (goal.deadline !== undefined) dbPayload.deadline = goal.deadline;
    if (goal.category !== undefined) dbPayload.category = goal.category;
    if (goal.icon !== undefined) dbPayload.icon = goal.icon;
    if (goal.status !== undefined) dbPayload.status = goal.status;
    if (goal.startDate !== undefined) dbPayload.start_date = goal.startDate;
    if (goal.monthlyTarget !== undefined) dbPayload.monthly_target = goal.monthlyTarget;
    
    const { data, error } = await supabase
      .from('goals')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      targetAmount: data.target_amount,
      currentAmount: data.current_amount,
      deadline: data.deadline,
      category: data.category,
      icon: data.icon,
      status: data.status,
      startDate: data.start_date,
      monthlyTarget: data.monthly_target,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Goal;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
};
