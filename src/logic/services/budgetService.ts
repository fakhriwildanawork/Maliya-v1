import { supabase } from '../libs/supabase';
import { Budget, BudgetInsert, RevenuePlan, RevenuePlanInsert, ExpensePlan, ExpensePlanInsert, IncomePlan, IncomePlanInsert } from '../types/budgets';

export const BudgetService = {
  // --- BUDGETS ---
  async getAllBudgets() {
    const { data: budgetsData, error: budgetsError } = await supabase
      .from('budgets')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    if (budgetsError) throw budgetsError;

    let plans: any[] = [];
    try {
      const { data: plansData, error: plansError } = await supabase
        .from('budget_expenses_plans')
        .select('*');
      if (!plansError && plansData) {
        plans = plansData;
      }
    } catch (e) {
      console.error("Error fetching budget_expenses_plans:", e);
    }
    
    return budgetsData.map(item => {
      const itemPlans = plans.filter((ep: any) => ep.budget_id === item.id);
      return {
        id: item.id,
        category: item.category,
        limit: item.limit,
        spent: item.spent,
        month: item.month,
        year: item.year,
        status: item.status,
        expensePlans: itemPlans.map((ep: any) => ({
          id: ep.id,
          budgetId: ep.budget_id,
          name: ep.name,
          estimatedAmount: ep.estimated_amount,
          isCompleted: ep.is_completed,
          createdAt: ep.created_at,
          updatedAt: ep.updated_at
        })),
        createdAt: item.created_at,
        updatedAt: item.updated_at
      };
    }) as Budget[];
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
    
    let plans: any[] = [];
    try {
      const { data: plansData, error: plansError } = await supabase
        .from('revenue_income_plans')
        .select('*');
      if (!plansError && plansData) {
        plans = plansData;
      }
    } catch (e) {
      console.error("Error fetching revenue_income_plans:", e);
    }

    return data.map(item => {
      const itemPlans = plans.filter((ip: any) => ip.revenue_plan_id === item.id);
      return {
        id: item.id,
        category: item.category,
        target: item.target,
        achieved: item.achieved,
        month: item.month,
        year: item.year,
        status: item.status,
        incomePlans: itemPlans.map((ip: any) => ({
          id: ip.id,
          revenuePlanId: ip.revenue_plan_id,
          name: ip.name,
          estimatedAmount: ip.estimated_amount,
          isCompleted: ip.is_completed,
          createdAt: ip.created_at,
          updatedAt: ip.updated_at
        })),
        createdAt: item.created_at,
        updatedAt: item.updated_at
      };
    }) as RevenuePlan[];
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
  },

  // --- EXPENSE PLANS ---
  async createExpensePlan(plan: ExpensePlanInsert) {
    const dbPayload = {
      budget_id: plan.budgetId,
      name: plan.name,
      estimated_amount: plan.estimatedAmount,
      is_completed: plan.isCompleted || false
    };
    
    const { data, error } = await supabase
      .from('budget_expenses_plans')
      .insert([dbPayload])
      .select()
      .single();
    if (error) throw error;
    
    return {
      id: data.id,
      budgetId: data.budget_id,
      name: data.name,
      estimatedAmount: data.estimated_amount,
      isCompleted: data.is_completed,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as ExpensePlan;
  },

  async updateExpensePlan(id: string, plan: Partial<ExpensePlanInsert>) {
    const dbPayload: any = {};
    if (plan.budgetId !== undefined) dbPayload.budget_id = plan.budgetId;
    if (plan.name !== undefined) dbPayload.name = plan.name;
    if (plan.estimatedAmount !== undefined) dbPayload.estimated_amount = plan.estimatedAmount;
    if (plan.isCompleted !== undefined) dbPayload.is_completed = plan.isCompleted;

    const { data, error } = await supabase
      .from('budget_expenses_plans')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    
    return {
      id: data.id,
      budgetId: data.budget_id,
      name: data.name,
      estimatedAmount: data.estimated_amount,
      isCompleted: data.is_completed,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as ExpensePlan;
  },

  async deleteExpensePlan(id: string) {
    const { error } = await supabase.from('budget_expenses_plans').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- INCOME PLANS ---
  async createIncomePlan(plan: IncomePlanInsert) {
    const dbPayload = {
      revenue_plan_id: plan.revenuePlanId,
      name: plan.name,
      estimated_amount: plan.estimatedAmount,
      is_completed: plan.isCompleted || false
    };
    
    const { data, error } = await supabase
      .from('revenue_income_plans')
      .insert([dbPayload])
      .select()
      .single();
    if (error) throw error;
    
    return {
      id: data.id,
      revenuePlanId: data.revenue_plan_id,
      name: data.name,
      estimatedAmount: data.estimated_amount,
      isCompleted: data.is_completed,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as IncomePlan;
  },

  async updateIncomePlan(id: string, plan: Partial<IncomePlanInsert>) {
    const dbPayload: any = {};
    if (plan.revenuePlanId !== undefined) dbPayload.revenue_plan_id = plan.revenuePlanId;
    if (plan.name !== undefined) dbPayload.name = plan.name;
    if (plan.estimatedAmount !== undefined) dbPayload.estimated_amount = plan.estimatedAmount;
    if (plan.isCompleted !== undefined) dbPayload.is_completed = plan.isCompleted;

    const { data, error } = await supabase
      .from('revenue_income_plans')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    
    return {
      id: data.id,
      revenuePlanId: data.revenue_plan_id,
      name: data.name,
      estimatedAmount: data.estimated_amount,
      isCompleted: data.is_completed,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as IncomePlan;
  },

  async deleteIncomePlan(id: string) {
    const { error } = await supabase.from('revenue_income_plans').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
