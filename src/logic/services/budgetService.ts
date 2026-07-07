import { supabase } from '../libs/supabase';
import { Budget, BudgetInsert, RevenuePlan, RevenuePlanInsert } from '../types/budgets';

export const BudgetService = {
  // --- BUDGETS ---
  async getAllBudgets() {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      category: item.category,
      limit: item.limit,
      spent: item.spent,
      month: item.month,
      year: item.year,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) as Budget[];
  },

  async createBudget(budget: BudgetInsert) {
    const dbPayload = {
      category: budget.category,
      limit: budget.limit,
      spent: budget.spent || 0,
      month: budget.month,
      year: budget.year,
      status: budget.status || 'On Track'
    };
    
    const { data, error } = await supabase
      .from('budgets')
      .insert([dbPayload])
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      category: data.category,
      limit: data.limit,
      spent: data.spent,
      month: data.month,
      year: data.year,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Budget;
  },

  async updateBudget(id: string, budget: Partial<BudgetInsert>) {
    const dbPayload: any = {};
    if (budget.category !== undefined) dbPayload.category = budget.category;
    if (budget.limit !== undefined) dbPayload.limit = budget.limit;
    if (budget.spent !== undefined) dbPayload.spent = budget.spent;
    if (budget.month !== undefined) dbPayload.month = budget.month;
    if (budget.year !== undefined) dbPayload.year = budget.year;
    if (budget.status !== undefined) dbPayload.status = budget.status;

    const { data, error } = await supabase
      .from('budgets')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      category: data.category,
      limit: data.limit,
      spent: data.spent,
      month: data.month,
      year: data.year,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Budget;
  },

  async deleteBudget(id: string) {
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- REVENUE PLANS ---
  async getAllRevenuePlans() {
    const { data, error } = await supabase
      .from('revenue_plans')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      category: item.category,
      target: item.target,
      achieved: item.achieved,
      month: item.month,
      year: item.year,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) as RevenuePlan[];
  },

  async createRevenuePlan(plan: RevenuePlanInsert) {
    const dbPayload = {
      category: plan.category,
      target: plan.target,
      achieved: plan.achieved || 0,
      month: plan.month,
      year: plan.year,
      status: plan.status || 'On Track'
    };
    
    const { data, error } = await supabase
      .from('revenue_plans')
      .insert([dbPayload])
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      category: data.category,
      target: data.target,
      achieved: data.achieved,
      month: data.month,
      year: data.year,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as RevenuePlan;
  },

  async updateRevenuePlan(id: string, plan: Partial<RevenuePlanInsert>) {
    const dbPayload: any = {};
    if (plan.category !== undefined) dbPayload.category = plan.category;
    if (plan.target !== undefined) dbPayload.target = plan.target;
    if (plan.achieved !== undefined) dbPayload.achieved = plan.achieved;
    if (plan.month !== undefined) dbPayload.month = plan.month;
    if (plan.year !== undefined) dbPayload.year = plan.year;
    if (plan.status !== undefined) dbPayload.status = plan.status;

    const { data, error } = await supabase
      .from('revenue_plans')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return {
      id: data.id,
      category: data.category,
      target: data.target,
      achieved: data.achieved,
      month: data.month,
      year: data.year,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as RevenuePlan;
  },

  async deleteRevenuePlan(id: string) {
    const { error } = await supabase.from('revenue_plans').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
