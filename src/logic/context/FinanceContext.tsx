import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Wallet, CreditCard, Budget, Activity, Goal, RevenuePlan, Debt, Investment, InvestmentHistoryLog, Asset, AssetHistoryLog, FamilyMember } from '../types/finance';
import { useInvestments } from '../hooks/useInvestments';
import { useAssets } from '../hooks/useAssets';
import { useFamilyMembers } from '../hooks/useFamilyMembers';
import { useAccounts } from '../hooks/useAccounts';
import { useBudgets } from '../hooks/useBudgets';
import { useDebts } from '../hooks/useDebts';
import { useGoals } from '../hooks/useGoals';
import { useTransactions } from '../hooks/useTransactions';

interface FinanceContextType {
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
  loading: boolean;
  assetsLoading?: boolean;
  addActivity: (activity: Partial<Activity>) => void;
  updateActivity: (id: string, activity: Partial<Activity>) => void;
  deleteActivity: (activityId: string) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (budgetId: string) => void;
  updateWallet: (wallet: Wallet) => void;
  deleteWallet: (walletId: string) => void;
  updateCard: (card: CreditCard) => void;
  deleteCard: (cardId: string) => void;
  addWallet: (wallet: Partial<Wallet>) => void;
  addCard: (card: Partial<CreditCard>) => void;
  addBudget: (budget: Partial<Budget>) => void;
  addRevenuePlan: (plan: Partial<RevenuePlan>) => void;
  updateRevenuePlan: (plan: RevenuePlan) => void;
  deleteRevenuePlan: (planId: string) => void;
  addGoal: (goal: Partial<Goal>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (goalId: string) => void;
  addDebt: (debt: Partial<Debt>) => void;
  updateDebt: (debt: Debt) => void;
  deleteDebt: (debtId: string) => void;
  addInvestment: (investment: Partial<Investment>) => void;
  updateInvestment: (investment: Investment) => void;
  deleteInvestment: (investmentId: string) => void;
  addInvestmentValueLog: (investmentId: string, currentPrice: number, note?: string) => void;
  addAsset: (asset: Partial<Asset>) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (assetId: string) => void;
  addAssetValueLog: (assetId: string, newValue: number, note?: string) => void;
  addFamilyMember: (member: Partial<FamilyMember>) => void;
  updateFamilyMember: (member: FamilyMember) => void;
  deleteFamilyMember: (memberId: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  // Real database hooks for modular domains
  const {
    wallets,
    cards,
    loading: accountsLoading,
    addWallet: dbAddWallet,
    updateWallet: dbUpdateWallet,
    deleteWallet: dbDeleteWallet,
    addCreditCard: dbAddCard,
    updateCreditCard: dbUpdateCard,
    deleteCreditCard: dbDeleteCard,
  } = useAccounts();

  const {
    budgets,
    revenuePlans,
    loading: budgetsLoading,
    addBudget: dbAddBudget,
    updateBudget: dbUpdateBudget,
    deleteBudget: dbDeleteBudget,
    addRevenuePlan: dbAddRevenuePlan,
    updateRevenuePlan: dbUpdateRevenuePlan,
    deleteRevenuePlan: dbDeleteRevenuePlan
  } = useBudgets();

  const {
    goals,
    loading: goalsLoading,
    addGoal: dbAddGoal,
    updateGoal: dbUpdateGoal,
    deleteGoal: dbDeleteGoal
  } = useGoals();

  const {
    data: activities,
    loading: transactionsLoading,
    addTransaction: dbAddActivity,
    editTransaction: dbEditActivity,
    removeTransaction: dbDeleteActivity,
    fetchTransactions
  } = useTransactions();

  const {
    debts,
    loading: debtsLoading,
    addDebt: dbAddDebt,
    updateDebt: dbUpdateDebt,
    deleteDebt: dbDeleteDebt
  } = useDebts();
  
  // Initial data fetch
  const initialFetchRef = React.useRef(false);
  useEffect(() => {
    if (!initialFetchRef.current) {
      fetchTransactions(0, true);
      initialFetchRef.current = true;
    }
  }, [fetchTransactions]);

  // Database-backed state hooks for modular investments and assets
  const {
    investments,
    loading: investmentsLoading,
    addInvestment: dbAddInvestment,
    updateInvestment: dbUpdateInvestment,
    deleteInvestment: dbDeleteInvestment,
    addInvestmentValueLog: dbAddInvestmentValueLog
  } = useInvestments();

  const {
    assets,
    loading: assetsLoading,
    addAsset: dbAddAsset,
    updateAsset: dbUpdateAsset,
    deleteAsset: dbDeleteAsset,
    addAssetValueLog: dbAddAssetValueLog
  } = useAssets();

  const {
    familyMembers,
    loading: familyMembersLoading,
    addFamilyMember: dbAddFamilyMember,
    updateFamilyMember: dbUpdateFamilyMember,
    deleteFamilyMember: dbDeleteFamilyMember
  } = useFamilyMembers();

  const isLoading = accountsLoading || budgetsLoading || goalsLoading || transactionsLoading || debtsLoading || investmentsLoading || assetsLoading || familyMembersLoading;

  // The "Brain" - Domino Effect Logic (Now using DB functions)
  const addActivity = async (activityData: Partial<Activity>) => {
    try {
      await dbAddActivity({
        orderId: activityData.orderId || `#${Math.floor(Math.random() * 100000)}`,
        title: activityData.title || 'Untitled Transaction',
        category: activityData.category || 'Other',
        price: activityData.price || 0,
        status: activityData.status || 'Completed',
        date: activityData.date || new Date().toISOString().split('T')[0],
        datetime: activityData.datetime || new Date().toISOString(),
        type: activityData.type || 'expense',
        sourceAccountId: activityData.sourceAccountId,
        destinationAccountId: activityData.destinationAccountId,
        description: activityData.description,
        linkedDebtId: activityData.linkedDebtId
      });
    } catch (err) {
      console.error('Failed to add transaction to database:', err);
    }
  };

  const updateActivity = async (id: string, activity: Partial<Activity>) => {
    try {
      await dbEditActivity(id, activity);
    } catch (err) {
      console.error('Failed to update transaction in database:', err);
    }
  };

  const deleteActivity = async (activityId: string) => {
    try {
      await dbDeleteActivity(activityId);
    } catch (err) {
      console.error('Failed to delete transaction from database:', err);
    }
  };

  const updateBudget = async (budget: Budget) => {
    try {
      await dbUpdateBudget(budget.id, {
        category: budget.category,
        limit: budget.limit,
        spent: budget.spent,
        month: budget.month,
        year: budget.year
      });
    } catch (err) {
      console.error('Failed to update budget in database:', err);
    }
  };

  const deleteBudget = async (budgetId: string) => {
    try {
      await dbDeleteBudget(budgetId);
    } catch (err) {
      console.error('Failed to delete budget from database:', err);
    }
  };

  const addBudget = async (budgetData: Partial<Budget>) => {
    try {
      await dbAddBudget({
        category: budgetData.category || 'Other',
        limit: budgetData.limit || 0,
        spent: budgetData.spent || 0,
        month: budgetData.month || new Date().getMonth() + 1,
        year: budgetData.year || new Date().getFullYear(),
        status: 'On Track'
      });
    } catch (err) {
      console.error('Failed to add budget to database:', err);
    }
  };

  const updateRevenuePlan = async (plan: RevenuePlan) => {
    try {
      await dbUpdateRevenuePlan(plan.id, {
        category: plan.category,
        target: plan.target,
        achieved: plan.achieved,
        month: plan.month,
        year: plan.year
      });
    } catch (err) {
      console.error('Failed to update revenue plan in database:', err);
    }
  };

  const deleteRevenuePlan = async (planId: string) => {
    try {
      await dbDeleteRevenuePlan(planId);
    } catch (err) {
      console.error('Failed to delete revenue plan from database:', err);
    }
  };

  const addRevenuePlan = async (planData: Partial<RevenuePlan>) => {
    try {
      await dbAddRevenuePlan({
        category: planData.category || 'Other Income',
        target: planData.target || 0,
        achieved: planData.achieved || 0,
        month: planData.month || new Date().getMonth() + 1,
        year: planData.year || new Date().getFullYear(),
        status: 'On Track'
      });
    } catch (err) {
      console.error('Failed to add revenue plan to database:', err);
    }
  };

  const updateWallet = async (wallet: Wallet) => {
    try {
      await dbUpdateWallet(wallet.id, {
        name: wallet.name,
        balance: wallet.balance,
        limit: wallet.limit,
        status: wallet.status
      });
    } catch (err) {
      console.error('Failed to update wallet in database:', err);
    }
  };

  const deleteWallet = async (walletId: string) => {
    try {
      await dbDeleteWallet(walletId);
    } catch (err) {
      console.error('Failed to delete wallet from database:', err);
    }
  };

  const addWallet = async (walletData: Partial<Wallet>) => {
    try {
      await dbAddWallet({
        name: walletData.name || 'New Account',
        balance: walletData.balance || 0,
        limit: walletData.limit || 0,
        status: 'Active'
      });
    } catch (err) {
      console.error('Failed to add wallet to database:', err);
    }
  };

  const updateCard = async (card: CreditCard) => {
    try {
      await dbUpdateCard(card.id, {
        number: card.number,
        exp: card.exp,
        cvv: card.cvv,
        status: card.status,
        theme: card.theme,
        balance: card.balance
      });
    } catch (err) {
      console.error('Failed to update card in database:', err);
    }
  };

  const deleteCard = async (cardId: string) => {
    try {
      await dbDeleteCard(cardId);
    } catch (err) {
      console.error('Failed to delete card from database:', err);
    }
  };

  const addCard = async (cardData: Partial<CreditCard>) => {
    try {
      await dbAddCard({
        number: cardData.number || '**** **** **** ****',
        exp: cardData.exp || '12/29',
        cvv: cardData.cvv || '***',
        status: 'Active',
        theme: cardData.theme || 'dark',
        balance: cardData.balance || 0
      });
    } catch (err) {
      console.error('Failed to add card to database:', err);
    }
  };

  const addGoal = async (goalData: Partial<Goal>) => {
    try {
      await dbAddGoal({
        name: goalData.name || 'New Goal',
        targetAmount: goalData.targetAmount || 0,
        currentAmount: goalData.currentAmount || 0,
        deadline: goalData.deadline || new Date().toISOString().split('T')[0],
        category: goalData.category || 'Saving',
        icon: goalData.icon || '💰',
        status: 'In Progress'
      });
    } catch (err) {
      console.error('Failed to add goal to database:', err);
    }
  };

  const updateGoal = async (goal: Goal) => {
    try {
      await dbUpdateGoal(goal.id, {
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        deadline: goal.deadline,
        category: goal.category,
        icon: goal.icon,
        status: goal.status
      });
    } catch (err) {
      console.error('Failed to update goal in database:', err);
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      await dbDeleteGoal(goalId);
    } catch (err) {
      console.error('Failed to delete goal from database:', err);
    }
  };

  const addDebt = async (debtData: Partial<Debt>) => {
    try {
      await dbAddDebt({
        title: debtData.title || 'Untitled Debt',
        name: debtData.name || 'Unknown',
        description: debtData.description,
        type: debtData.type || 'payable',
        amount: debtData.amount || 0,
        paidAmount: debtData.paidAmount || 0,
        dueDate: debtData.dueDate || new Date().toISOString().split('T')[0],
        status: debtData.status || 'active',
        paymentLogs: debtData.paymentLogs || []
      });
    } catch (err) {
      console.error('Failed to add debt to database:', err);
    }
  };

  const updateDebt = async (debt: Debt) => {
    try {
      await dbUpdateDebt(debt.id, {
        title: debt.title,
        name: debt.name,
        description: debt.description,
        type: debt.type,
        amount: debt.amount,
        paidAmount: debt.paidAmount,
        dueDate: debt.dueDate,
        status: debt.status,
        paymentLogs: debt.paymentLogs
      });
    } catch (err) {
      console.error('Failed to update debt in database:', err);
    }
  };

  const deleteDebt = async (debtId: string) => {
    try {
      await dbDeleteDebt(debtId);
    } catch (err) {
      console.error('Failed to delete debt from database:', err);
    }
  };

  const addInvestment = async (invData: Partial<Investment>) => {
    try {
      const qty = invData.quantity || 0;
      const avgBuy = invData.averageBuyPrice || 0;
      const invested = invData.investedAmount || (qty * avgBuy);
      const currPrice = invData.currentPrice || avgBuy;
      const currValue = invData.currentValue || (qty * currPrice);

      await dbAddInvestment({
        name: invData.name || 'Untitled Investment',
        type: invData.type || 'Other',
        investedAmount: invested,
        currentValue: currValue,
        quantity: qty,
        averageBuyPrice: avgBuy,
        currentPrice: currPrice,
        purchaseDate: invData.purchaseDate || new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        status: invData.status || 'Active'
      });
    } catch (err) {
      console.error('Failed to add investment to database:', err);
    }
  };

  const updateInvestment = async (inv: Investment) => {
    try {
      await dbUpdateInvestment(inv.id, {
        name: inv.name,
        type: inv.type,
        investedAmount: inv.investedAmount,
        currentValue: inv.currentValue,
        quantity: inv.quantity,
        averageBuyPrice: inv.averageBuyPrice,
        currentPrice: inv.currentPrice,
        purchaseDate: inv.purchaseDate,
        lastUpdated: new Date().toISOString().split('T')[0],
        status: inv.status
      });
    } catch (err) {
      console.error('Failed to update investment in database:', err);
    }
  };

  const deleteInvestment = async (invId: string) => {
    try {
      await dbDeleteInvestment(invId);
    } catch (err) {
      console.error('Failed to delete investment from database:', err);
    }
  };

  const addInvestmentValueLog = async (invId: string, currentPrice: number, note?: string) => {
    try {
      const target = investments.find(i => i.id === invId);
      if (target) {
        const qty = target.quantity;
        const newValue = qty * currentPrice;
        await dbAddInvestmentValueLog(
          invId,
          currentPrice,
          target.investedAmount,
          newValue,
          note || 'Penyesuaian Nilai Pasar'
        );
      }
    } catch (err) {
      console.error('Failed to add investment value log to database:', err);
    }
  };

  const addAsset = async (assetData: Partial<Asset>) => {
    try {
      const pPrice = assetData.purchasePrice || 0;
      const cVal = assetData.currentValue || pPrice;
      await dbAddAsset({
        name: assetData.name || 'Untitled Physical Asset',
        category: assetData.category || 'Other',
        purchasePrice: pPrice,
        currentValue: cVal,
        purchaseDate: assetData.purchaseDate || new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        description: assetData.description
      });
    } catch (err) {
      console.error('Failed to add asset to database:', err);
    }
  };

  const updateAsset = async (as: Asset) => {
    try {
      await dbUpdateAsset(as.id, {
        name: as.name,
        category: as.category,
        purchasePrice: as.purchasePrice,
        currentValue: as.currentValue,
        purchaseDate: as.purchaseDate,
        lastUpdated: new Date().toISOString().split('T')[0],
        description: as.description
      });
    } catch (err) {
      console.error('Failed to update asset in database:', err);
    }
  };

  const deleteAsset = async (asId: string) => {
    try {
      await dbDeleteAsset(asId);
    } catch (err) {
      console.error('Failed to delete asset from database:', err);
    }
  };

  const addAssetValueLog = async (asId: string, newValue: number, note?: string) => {
    try {
      await dbAddAssetValueLog(asId, newValue, note || 'Penyesuaian Nilai Aset');
    } catch (err) {
      console.error('Failed to add asset value log to database:', err);
    }
  };

  const addFamilyMember = async (memberData: Partial<FamilyMember>) => {
    try {
      await dbAddFamilyMember({
        name: memberData.name || 'Anggota Baru',
        relationship: memberData.relationship || 'Other',
        role: memberData.role || 'Member',
        email: memberData.email || '',
        phone: memberData.phone || '',
        avatarUrl: memberData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(memberData.name || 'NewMember')}`,
        joinedDate: memberData.joinedDate || new Date().toISOString().split('T')[0],
        status: memberData.status || 'Active',
        accessCode: memberData.accessCode || '',
        password: memberData.password || ''
      });
    } catch (err) {
      console.error('Failed to add family member to database:', err);
    }
  };

  const updateFamilyMember = async (member: FamilyMember) => {
    try {
      await dbUpdateFamilyMember(member.id, {
        name: member.name,
        relationship: member.relationship,
        role: member.role,
        email: member.email,
        phone: member.phone,
        avatarUrl: member.avatarUrl,
        joinedDate: member.joinedDate,
        status: member.status,
        accessCode: member.accessCode,
        password: member.password
      });
    } catch (err) {
      console.error('Failed to update family member in database:', err);
    }
  };

  const deleteFamilyMember = async (memberId: string) => {
    try {
      await dbDeleteFamilyMember(memberId);
    } catch (err) {
      console.error('Failed to delete family member from database:', err);
    }
  };

  return (
    <FinanceContext.Provider value={{
      wallets, cards, budgets, revenuePlans, goals, activities, debts, investments, assets, familyMembers,
      loading: isLoading,
      assetsLoading,
      addActivity, deleteActivity, updateBudget, deleteBudget, addBudget,
      addRevenuePlan, updateRevenuePlan, deleteRevenuePlan,
      updateWallet, deleteWallet, addWallet,
      updateCard, deleteCard, addCard,
      addGoal, updateGoal, deleteGoal,
      addDebt, updateDebt, deleteDebt,
      addInvestment, updateInvestment, deleteInvestment, addInvestmentValueLog,
      addAsset, updateAsset, deleteAsset, addAssetValueLog,
      addFamilyMember, updateFamilyMember, deleteFamilyMember
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
