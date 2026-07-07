import React, { useMemo, useState } from 'react';
import { useFinance } from '../../logic/context/FinanceContext';
import { useModuleLoading } from '../../logic/hooks/useModuleLoading';
import { PageLoadingState } from '../../ui/components/common/PageLoadingState';
import { DateRangePicker } from '../../ui/components/elements/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Wallet, CreditCard, 
  ArrowUpRight, ArrowDownLeft, PieChart as PieChartIcon, 
  Calendar, Download, Filter
} from 'lucide-react';
import { cn } from '../../logic/utils/classNames';
import { useViewport } from '../../logic/context/ViewportContext';
import { useDashboardData } from '../../logic/hooks/useDashboardData';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Reports() {
  const loading = useModuleLoading();
  const { isCompact } = useViewport();
  const { activities, budgets, wallets, cards } = useFinance();
  const { chartData, totalBalance } = useDashboardData();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // 1. Expense by Category (Current Month)
  const categoryData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthlyExpenses = activities.filter(a => {
      const d = new Date(a.datetime || a.date);
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear && a.type === 'expense';
    });

    const categories: Record<string, number> = {};
    monthlyExpenses.forEach(a => {
      categories[a.category] = (categories[a.category] || 0) + a.price;
    });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [activities]);

  // 2. Budget vs Actual
  const budgetVsActual = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return budgets
      .filter(b => b.month === currentMonth && b.year === currentYear)
      .map(b => ({
        name: b.category,
        budget: b.limit,
        actual: b.spent
      }))
      .slice(0, 8);
  }, [budgets]);

  // 3. Liquidity vs Non-Liquidity (simplified for now)
  const liquidityData = [
    { name: 'Wallets', value: wallets.reduce((acc, w) => acc + w.balance, 0) },
    { name: 'Cards', value: cards.reduce((acc, c) => acc + c.balance, 0) },
  ];

  return (
    <PageLoadingState isLoading={loading}>
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-gray-50 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Financial Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Deep dive into your spending patterns, budget adherence, and portfolio growth.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
          <DateRangePicker 
            date={dateRange} 
            onDateChange={setDateRange}
            className="rounded-2xl shadow-sm border-gray-200 w-full sm:w-auto"
          />
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm w-full sm:w-auto min-h-[44px]">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Summary & Main Charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Cash Flow Over Time */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Cash Flow Performance</h3>
                <p className="text-xs text-gray-500">Comparison of income (profit) vs expenses (loss) over the last 8 months.</p>
              </div>
              <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Income</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Expense</div>
              </div>
            </div>
            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -20, right: 10 }}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: isCompact ? 10 : 12, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: isCompact ? 10 : 12, fill: '#9ca3af' }} tickFormatter={(value) => isCompact ? `${(value/1000).toFixed(0)}k` : `Rp ${value.toLocaleString('id-ID')}`} width={isCompact ? 40 : 100} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`]}
                  />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={3} />
                  <Area type="monotone" dataKey="loss" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLoss)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Budget vs Actual */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Budget vs Actual Spending</h3>
            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetVsActual} layout="vertical" margin={{ left: isCompact ? -20 : 0, right: isCompact ? 10 : 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => isCompact ? `${(v/1000).toFixed(0)}k` : `Rp ${v.toLocaleString('id-ID')}`} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} width={isCompact ? 60 : 100} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`]}
                  />
                  <Bar dataKey="budget" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="actual" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Distribution & Highlights */}
        <div className="space-y-8">
          
          {/* Spending Distribution */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Spending Distribution</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
              {categoryData.slice(0, 5).map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-sm font-medium text-gray-600">{entry.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">Rp {entry.value.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Insights */}
          <div className="bg-blue-600 rounded-3xl p-4 sm:p-6 text-white shadow-lg shadow-blue-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h3 className="text-lg font-bold mb-4 relative z-10">Monthly Insights</h3>
            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-xs opacity-80 uppercase font-bold tracking-wider mb-1">Top Expense Category</p>
                <p className="text-lg font-bold">{categoryData[0]?.name || 'N/A'}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <p className="text-xs opacity-80 uppercase font-bold tracking-wider mb-1">Total Net Worth</p>
                <p className="text-lg font-bold">Rp {totalBalance.toLocaleString('id-ID')}</p>
              </div>
              <div className="pt-2 text-xs opacity-70 italic">
                * Based on current month transactions and asset valuations.
              </div>
            </div>
          </div>

          {/* Liquidity Breakdown */}
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Liquidity Profile</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={liquidityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#3b82f6" />
                  </Pie>
                  <Tooltip formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around mt-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 font-medium">Wallets</p>
                <p className="text-sm font-bold text-emerald-600">Rp {liquidityData[0].value.toLocaleString('id-ID')}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-medium">Cards</p>
                <p className="text-sm font-bold text-blue-600">Rp {liquidityData[1].value.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
    </PageLoadingState>
  );
}
