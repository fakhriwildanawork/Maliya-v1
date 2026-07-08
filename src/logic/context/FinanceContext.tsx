import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo, useRef } from 'react';
import { Wallet, CreditCard, Budget, Activity, Goal, RevenuePlan, Debt, Investment, Asset, FamilyMember, Category } from '../types/finance';
import { AccountService } from '../services/accountService';
import { transactionService } from '../services/transactionService';
import { BudgetService } from '../services/budgetService';
import { GoalService } from '../services/goalService';
import { DebtService } from '../services/debtService';
import { InvestmentService } from '../services/investmentService';
import { AssetService } from '../services/assetService';
import { FamilyMemberService } from '../services/familyMemberService';
import { CategoryService } from '../services/categoryService';

interface FinanceContextType {
  // State
  wallets: Wallet[];
  cards: CreditCard[];
  budgets: Budget[];
  revenuePlans: RevenuePlan[];
  goals: Goal[];
  activities: Activity[];
  debts: Debt[];
  investments: Investment[];
  assets: Asset[];
  familyMembers: FamilyMember[];
  categories: Category[];
  
  // Loading states
  loading: boolean;
  totalActivities: number;
  loadingActivities: boolean;
  
  // Fetch operations
  fetchAccounts: () => Promise<void>;
  fetchActivities: (page?: number, reset?: boolean, filters?: any) => Promise<void>;
  fetchBudgets: () => Promise<void>;
  fetchGoals: () => Promise<void>;
  fetchDebts: () => Promise<void>;
  fetchInvestments: () => Promise<void>;
  fetchAssets: () => Promise<void>;
  fetchFamilyMembers: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // CRUD Operations
  addActivity: (activity: Partial<Activity>) => Promise<void>;
  updateActivity: (id: string, activity: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  deleteActivities: (ids: string[]) => Promise<void>;
  
  addWallet: (wallet: Partial<Wallet>) => Promise<void>;
  updateWallet: (wallet: Wallet) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  
  addCard: (card: Partial<CreditCard>) => Promise<void>;
  updateCard: (card: CreditCard) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  
  addBudget: (budget: Partial<Budget>) => Promise<Budget>;
  updateBudget: (budget: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  addExpensePlan: (plan: Partial<any>) => Promise<any>;
  updateExpensePlan: (plan: any) => Promise<void>;
  deleteExpensePlan: (id: string) => Promise<void>;
  
  addRevenuePlan: (plan: Partial<RevenuePlan>) => Promise<any>;
  updateRevenuePlan: (plan: RevenuePlan) => Promise<void>;
  deleteRevenuePlan: (id: string) => Promise<void>;
  
  addIncomePlan: (plan: Partial<any>) => Promise<any>;
  updateIncomePlan: (plan: any) => Promise<void>;
  deleteIncomePlan: (id: string) => Promise<void>;
  
  addGoal: (goal: Partial<Goal>) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  addDebt: (debt: Partial<Debt>) => Promise<void>;
  updateDebt: (debt: Debt) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  
  addInvestment: (investment: Partial<Investment>) => Promise<void>;
  updateInvestment: (investment: Investment) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  addInvestmentValueLog: (investmentId: string, currentPrice: number, note?: string) => Promise<void>;
  
  addAsset: (asset: Partial<Asset>) => Promise<void>;
  updateAsset: (asset: Asset) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  addAssetValueLog: (assetId: string, newValue: number, note?: string) => Promise<void>;
  
  addFamilyMember: (member: Partial<FamilyMember>) => Promise<void>;
  updateFamilyMember: (member: FamilyMember) => Promise<void>;
  deleteFamilyMember: (id: string) => Promise<void>;
  
  addCategory: (category: Partial<Category>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [revenuePlans, setRevenuePlans] = useState<RevenuePlan[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [totalActivities, setTotalActivities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const initialFetchRef = useRef(false);

  // --- Fetch Operations ---
  const fetchAccounts = useCallback(async () => {
    try {
      const [wData, cData] = await Promise.all([AccountService.getAllWallets(), AccountService.getAllCreditCards()]);
      setWallets(wData);
      setCards(cData);
    } catch (err) { console.error(err); }
  }, []);

  const fetchActivities = useCallback(async (page: number = 0, reset: boolean = false, filters?: any) => {
    try {
      setLoadingActivities(true);
      const response = await transactionService.getPaginated(page, undefined, filters);
      if (reset || page === 0) {
        setActivities(response.data);
      } else {
        setActivities(prev => [...prev, ...response.data]);
      }
      setTotalActivities(response.total);
    } catch (err) { console.error(err); }
    finally { setLoadingActivities(false); }
  }, []);

  const fetchBudgets = useCallback(async () => {
    try {
      const [bData, rpData] = await Promise.all([BudgetService.getAllBudgets(), BudgetService.getAllRevenuePlans()]);
      setBudgets(bData);
      setRevenuePlans(rpData);
    } catch (err) { console.error(err); }
  }, []);

  const fetchGoals = useCallback(async () => {
    try {
      const data = await GoalService.getAll();
      setGoals(data);
    } catch (err) { console.error(err); }
  }, []);

  const fetchDebts = useCallback(async () => {
    try {
      const data = await DebtService.getAllDebts();
      setDebts(data);
    } catch (err) { console.error(err); }
  }, []);

  const fetchInvestments = useCallback(async () => {
    try {
      const data = await InvestmentService.getAll();
      setInvestments(data);
    } catch (err) { console.error(err); }
  }, []);

  const fetchAssets = useCallback(async () => {
    try {
      const data = await AssetService.getAll();
      setAssets(data);
    } catch (err) { console.error(err); }
  }, []);

  const fetchFamilyMembers = useCallback(async () => {
    try {
      const data = await FamilyMemberService.getAll();
      setFamilyMembers(data);
    } catch (err) { console.error(err); }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await CategoryService.getAll();
      setCategories(data);
    } catch (err) { console.error(err); }
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        fetchAccounts(),
        fetchActivities(0, true),
        fetchBudgets(),
        fetchGoals(),
        fetchDebts(),
        fetchInvestments(),
        fetchAssets(),
        fetchFamilyMembers(),
        fetchCategories()
      ]);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  }, [fetchAccounts, fetchActivities, fetchBudgets, fetchGoals, fetchDebts, fetchInvestments, fetchAssets, fetchFamilyMembers, fetchCategories]);

  useEffect(() => {
    if (!initialFetchRef.current) {
      setLoading(true);
      refreshAll().finally(() => setLoading(false));
      initialFetchRef.current = true;
    }
  }, [refreshAll]);

  // --- CRUD Operations ---
  
  const addActivity = async (data: Partial<Activity>) => {
    await transactionService.create(data as any);
    await refreshAll();
  };

  const updateActivity = async (id: string, data: Partial<Activity>) => {
    await transactionService.update(id, data as any);
    await refreshAll();
  };

  const deleteActivity = async (id: string) => {
    await transactionService.delete(id);
    await refreshAll();
  };

  const deleteActivities = async (ids: string[]) => {
    await transactionService.deleteMany(ids);
    await refreshAll();
  };

  const addWallet = async (data: Partial<Wallet>) => {
    await AccountService.addWallet(data as any);
    fetchAccounts();
  };

  const updateWallet = async (wallet: Wallet) => {
    await AccountService.updateWallet(wallet.id, wallet);
    fetchAccounts();
  };

  const deleteWallet = async (id: string) => {
    await AccountService.deleteWallet(id);
    fetchAccounts();
  };

  const addCard = async (data: Partial<CreditCard>) => {
    await AccountService.addCreditCard(data as any);
    fetchAccounts();
  };

  const updateCard = async (card: CreditCard) => {
    await AccountService.updateCreditCard(card.id, card);
    fetchAccounts();
  };

  const deleteCard = async (id: string) => {
    await AccountService.deleteCreditCard(id);
    fetchAccounts();
  };

  const addBudget = async (data: Partial<Budget>) => {
    const res = await BudgetService.createBudget(data as any);
    fetchBudgets();
    return res;
  };

  const updateBudget = async (budget: Budget) => {
    await BudgetService.updateBudget(budget.id, budget);
    fetchBudgets();
  };

  const deleteBudget = async (id: string) => {
    await BudgetService.deleteBudget(id);
    fetchBudgets();
  };

  const addExpensePlan = async (data: Partial<any>) => {
    const res = await BudgetService.createExpensePlan(data as any);
    fetchBudgets();
    return res;
  };

  const updateExpensePlan = async (plan: any) => {
    await BudgetService.updateExpensePlan(plan.id, plan);
    fetchBudgets();
  };

  const deleteExpensePlan = async (id: string) => {
    await BudgetService.deleteExpensePlan(id);
    fetchBudgets();
  };

  const addRevenuePlan = async (data: Partial<RevenuePlan>) => {
    const res = await BudgetService.createRevenuePlan(data as any);
    fetchBudgets();
    return res;
  };

  const updateRevenuePlan = async (plan: RevenuePlan) => {
    await BudgetService.updateRevenuePlan(plan.id, plan);
    fetchBudgets();
  };

  const deleteRevenuePlan = async (id: string) => {
    await BudgetService.deleteRevenuePlan(id);
    fetchBudgets();
  };

  const addIncomePlan = async (data: Partial<any>) => {
    const res = await BudgetService.createIncomePlan(data as any);
    fetchBudgets();
    return res;
  };

  const updateIncomePlan = async (plan: any) => {
    await BudgetService.updateIncomePlan(plan.id, plan);
    fetchBudgets();
  };

  const deleteIncomePlan = async (id: string) => {
    await BudgetService.deleteIncomePlan(id);
    fetchBudgets();
  };

  const addGoal = async (data: Partial<Goal>) => {
    await GoalService.create(data as any);
    fetchGoals();
  };

  const updateGoal = async (goal: Goal) => {
    await GoalService.update(goal.id, goal);
    fetchGoals();
  };

  const deleteGoal = async (id: string) => {
    await GoalService.delete(id);
    fetchGoals();
  };

  const addDebt = async (data: Partial<Debt>) => {
    await DebtService.createDebt(data as any);
    fetchDebts();
  };

  const updateDebt = async (debt: Debt) => {
    await DebtService.updateDebt(debt.id, debt);
    fetchDebts();
  };

  const deleteDebt = async (id: string) => {
    await DebtService.deleteDebt(id);
    fetchDebts();
  };

  const addInvestment = async (data: Partial<Investment>) => {
    await InvestmentService.create(data as any);
    fetchInvestments();
  };

  const updateInvestment = async (inv: Investment) => {
    await InvestmentService.update(inv.id, inv);
    fetchInvestments();
  };

  const deleteInvestment = async (id: string) => {
    await InvestmentService.delete(id);
    fetchInvestments();
  };

  const addInvestmentValueLog = async (invId: string, currentPrice: number, note?: string) => {
    const target = investments.find(i => i.id === invId);
    if (target) {
      await InvestmentService.addValueLog(invId, currentPrice, target.investedAmount, target.quantity * currentPrice, note || 'Adjustment');
      fetchInvestments();
    }
  };

  const addAsset = async (data: Partial<Asset>) => {
    await AssetService.create(data as any);
    fetchAssets();
  };

  const updateAsset = async (asset: Asset) => {
    await AssetService.update(asset.id, asset);
    fetchAssets();
  };

  const deleteAsset = async (id: string) => {
    await AssetService.delete(id);
    fetchAssets();
  };

  const addAssetValueLog = async (asId: string, newValue: number, note?: string) => {
    await AssetService.addValueLog(asId, newValue, note || 'Adjustment');
    fetchAssets();
  };

  const addFamilyMember = async (data: Partial<FamilyMember>) => {
    await FamilyMemberService.create(data as any);
    fetchFamilyMembers();
  };

  const updateFamilyMember = async (member: FamilyMember) => {
    await FamilyMemberService.update(member.id, member);
    fetchFamilyMembers();
  };

  const deleteFamilyMember = async (id: string) => {
    await FamilyMemberService.delete(id);
    fetchFamilyMembers();
  };

  const addCategory = async (data: Partial<Category>) => {
    await CategoryService.create(data as any);
    fetchCategories();
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    await CategoryService.update(id, data as any);
    fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    await CategoryService.delete(id);
    fetchCategories();
  };

  return (
    <FinanceContext.Provider value={{
      wallets,
      cards,
      budgets,
      revenuePlans,
      goals,
      activities,
      debts,
      investments,
      assets,
      familyMembers,
      categories,
      loading,
      totalActivities,
      loadingActivities,
      fetchAccounts,
      fetchActivities,
      fetchBudgets,
      fetchGoals,
      fetchDebts,
      fetchInvestments,
      fetchAssets,
      fetchFamilyMembers,
      fetchCategories,
      refreshAll,
      addActivity,
      updateActivity,
      deleteActivity,
      deleteActivities,
      addWallet,
      updateWallet,
      deleteWallet,
      addCard,
      updateCard,
      deleteCard,
      addBudget,
      updateBudget,
      deleteBudget,
      addExpensePlan,
      updateExpensePlan,
      deleteExpensePlan,
      addRevenuePlan,
      updateRevenuePlan,
      deleteRevenuePlan,
      addIncomePlan,
      updateIncomePlan,
      deleteIncomePlan,
      addGoal,
      updateGoal,
      deleteGoal,
      addDebt,
      updateDebt,
      deleteDebt,
      addInvestment,
      updateInvestment,
      deleteInvestment,
      addInvestmentValueLog,
      addAsset,
      updateAsset,
      deleteAsset,
      addAssetValueLog,
      addFamilyMember,
      updateFamilyMember,
      deleteFamilyMember,
      addCategory,
      updateCategory,
      deleteCategory
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
