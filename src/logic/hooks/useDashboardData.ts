import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Activity, ChartDataPoint } from '../types/finance';

export function useDashboardData() {
  const { wallets, cards, activities, budgets, revenuePlans, loading } = useFinance();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // 1. Total Balance
  const totalBalance = useMemo(() => {
    const walletSum = wallets.reduce((acc, w) => acc + w.balance, 0);
    const cardSum = cards.reduce((acc, c) => acc + c.balance, 0);
    return walletSum + cardSum;
  }, [wallets, cards]);

  // 2. Current Month Stats
  const stats = useMemo(() => {
    const monthlyActivities = activities.filter(a => {
      const d = new Date(a.datetime || a.date);
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
    });

    const earnings = monthlyActivities
      .filter(a => a.type === 'income')
      .reduce((acc, a) => acc + a.price, 0);

    const spending = monthlyActivities
      .filter(a => a.type === 'expense')
      .reduce((acc, a) => acc + a.price, 0);

    const revenueAchieved = revenuePlans
      .filter(p => p.month === currentMonth && p.year === currentYear)
      .reduce((acc, p) => acc + p.achieved, 0);

    return {
      earnings,
      spending,
      revenue: revenueAchieved,
      income: earnings + revenueAchieved
    };
  }, [activities, revenuePlans, currentMonth, currentYear]);

  // 3. Comparison with last month
  const lastMonthStats = useMemo(() => {
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const lastMonthActivities = activities.filter(a => {
      const d = new Date(a.datetime || a.date);
      return d.getMonth() + 1 === lastMonth && d.getFullYear() === lastYear;
    });

    const earnings = lastMonthActivities
      .filter(a => a.type === 'income')
      .reduce((acc, a) => acc + a.price, 0);

    const spending = lastMonthActivities
      .filter(a => a.type === 'expense')
      .reduce((acc, a) => acc + a.price, 0);

    const revenueAchieved = revenuePlans
      .filter(p => p.month === lastMonth && p.year === lastYear)
      .reduce((acc, p) => acc + p.achieved, 0);

    return { 
      earnings, 
      spending, 
      revenue: revenueAchieved,
      income: earnings + revenueAchieved
    };
  }, [activities, revenuePlans, currentMonth, currentYear]);

  const growth = useMemo(() => {
    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    return {
      earnings: calcGrowth(stats.earnings, lastMonthStats.earnings),
      spending: calcGrowth(stats.spending, lastMonthStats.spending),
      income: calcGrowth(stats.income, lastMonthStats.income),
      revenue: calcGrowth(stats.revenue, lastMonthStats.revenue)
    };
  }, [stats, lastMonthStats]);

  // 4. Chart Data (Last 8 months)
  const chartData = useMemo(() => {
    const data: ChartDataPoint[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });

      const monthActivities = activities.filter(a => {
        const ad = new Date(a.datetime || a.date);
        return ad.getMonth() + 1 === m && ad.getFullYear() === y;
      });

      const profit = monthActivities
        .filter(a => a.type === 'income')
        .reduce((acc, a) => acc + a.price, 0);

      const loss = monthActivities
        .filter(a => a.type === 'expense')
        .reduce((acc, a) => acc + a.price, 0);

      data.push({
        month: monthLabel,
        profit,
        loss
      });
    }
    return data;
  }, [activities, now]);

  // 5. Budget Progress
  const budgetProgress = useMemo(() => {
    const currentBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);
    const limit = currentBudgets.reduce((acc, b) => acc + b.limit, 0);
    const spent = currentBudgets.reduce((acc, b) => acc + b.spent, 0);
    const percent = limit > 0 ? (spent / limit) * 100 : 0;

    return { limit, spent, percent };
  }, [budgets, currentMonth, currentYear]);

  return {
    totalBalance,
    stats,
    growth,
    chartData,
    budgetProgress,
    recentActivities: activities.slice(0, 10),
    wallets,
    cards,
    loading
  };
}
