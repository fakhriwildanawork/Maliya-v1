import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, CreditCard, MoreHorizontal, Plus, Search, Wallet, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFinance } from '../../logic/context/FinanceContext';
import { useViewport } from '../../logic/context/ViewportContext';
import { useDashboardData } from '../../logic/hooks/useDashboardData';
import { getCardThemeClasses, getCardThemeGlow } from '../../logic/utils/theme';
import { cn } from '../../logic/utils/classNames';
import * as TOKENS from '../../ui/styles/tokens';
import { InTableAction } from '../../ui/components/elements/InTableAction';
import { PageLoadingState } from '../../ui/components/common/PageLoadingState';
import Swal from 'sweetalert2';

import { useModuleLoading } from '../../logic/hooks/useModuleLoading';

import { useAuth } from '../../logic/context/AuthContext';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { 
    deleteActivity, 
    fetchAccounts, 
    fetchBudgets, 
    fetchActivities 
  } = useFinance();
  const { isCompact } = useViewport();
  const loading = useModuleLoading();

  useEffect(() => {
    fetchAccounts();
    fetchBudgets();
    fetchActivities(0, true);
  }, [fetchAccounts, fetchBudgets, fetchActivities]);

  const { 
    totalBalance, 
    stats, 
    growth, 
    chartData, 
    budgetProgress, 
    recentActivities, 
    wallets, 
    cards
  } = useDashboardData();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredActivities = recentActivities.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.orderId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLoadingState isLoading={loading}>
      <div className="absolute inset-0 flex flex-col bg-gray-50 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Hello, {currentUser?.name || "Oripio"}</h1>
            <p className="text-gray-500">Stay on top of your tasks, monitor progress, and track status.</p>
          </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          
          {/* Left Column */}
          <div className="lg:col-span-4 flex flex-col gap-lg">
            
            {/* Total Balance Card */}
            <div className="bg-bg-main rounded-lg p-4 sm:p-6 shadow-sm border border-border-light">
              <div className="flex justify-between items-start mb-md">
                <span className="text-text-secondary font-medium">Total Balance</span>
                <div className="flex items-center gap-sm bg-bg-sidebar px-md py-xs rounded-full border border-border-main">
                  <span>🇮🇩</span>
                  <span className="text-sm font-medium uppercase">IDR</span>
                  <ArrowDownLeft className="w-3 h-3 text-text-muted" />
                </div>
              </div>
              <div className="mb-sm">
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary">Rp {totalBalance.toLocaleString('id-ID')}</h2>
              </div>
              <div className="flex items-center gap-sm mb-lg text-sm">
                <span className={cn(
                  "font-medium flex items-center px-sm py-[0.125rem] rounded-md",
                  growth.earnings >= 0 ? "text-primary-light bg-green-50" : "text-red-500 bg-red-50"
                )}>
                  {growth.earnings >= 0 ? <ArrowUpRight className="w-3 h-3 mr-xs" /> : <ArrowDownLeft className="w-3 h-3 mr-xs" />}
                  {Math.abs(growth.earnings).toFixed(0)}%
                </span>
                <span className="text-text-muted">than last month</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
                <button className="flex-1 bg-green-400 hover:bg-green-500 text-gray-900 font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition-colors min-h-[44px]">
                  <ArrowRightLeft className="w-4 h-4" />
                  Transfer
                </button>
                <button className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition-colors min-h-[44px]">
                  <ArrowDownLeft className="w-4 h-4" />
                  Request
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="font-medium text-gray-900">Wallets</span>
                  <span className="text-gray-400">Total {wallets.length} wallets</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {wallets.map((wallet) => (
                    <div key={wallet.id} className="bg-gray-50 rounded-2xl p-3 sm:p-4 border border-gray-100 flex flex-col relative">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{wallet.name}</span>
                        </div>
                        <button className="flex items-center justify-center min-h-[44px] min-w-[44px] -mr-3 -mt-3 rounded-full hover:bg-gray-200/50 transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-gray-900 mb-1">Rp {wallet.balance.toLocaleString('id-ID')}</span>
                      <span className="text-xs text-gray-400 mb-2 truncate">Limit is Rp {wallet.limit >= 1000 ? (wallet.limit / 1000) + 'k' : wallet.limit} a month</span>
                      <span className={`text-xs font-medium ${wallet.status === 'Active' ? 'text-green-500' : 'text-red-400'}`}>
                        {wallet.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Spending Limit */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">Monthly Spending Limit</h3>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    budgetProgress.percent > 90 ? "bg-red-500" : budgetProgress.percent > 70 ? "bg-yellow-500" : "bg-green-500"
                  )} 
                  style={{ width: `${Math.min(budgetProgress.percent, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-900">Rp {budgetProgress.spent.toLocaleString('id-ID')} <span className="text-gray-400 font-normal">spent out of</span></span>
                <span className="text-gray-900">Rp {budgetProgress.limit.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* My Cards */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-50 flex-1">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-900" />
                  <h3 className="font-semibold text-gray-900">My Cards</h3>
                </div>
                <button className="text-sm font-medium text-gray-900 flex items-center gap-1 hover:text-green-600 transition-colors min-h-[44px] min-w-[44px] px-2 -mr-2 justify-center">
                  <Plus className="w-4 h-4" /> Add new
                </button>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {cards.map((card) => (
                  <div 
                    key={card.id} 
                    className={`min-w-64 h-40 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden snap-center ${getCardThemeClasses(card.theme)}`}
                  >
                    {/* Background decorations */}
                    {card.theme !== 'dark' && (
                      <>
                        <div className={`absolute top-0 right-0 w-32 h-32 opacity-20 rounded-full blur-2xl -mr-10 -mt-10 ${getCardThemeGlow(card.theme).top}`}></div>
                        <div className={`absolute bottom-0 left-0 w-24 h-24 opacity-20 rounded-full blur-xl -ml-5 -mb-5 ${getCardThemeGlow(card.theme).bottom}`}></div>
                      </>
                    )}
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                           <div className="w-3 h-3 bg-white rounded-full"></div>
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">{card.status}</span>
                      </div>
                      <div className="flex">
                        <div className="w-6 h-6 rounded-full bg-red-500/80 -mr-2 mix-blend-multiply"></div>
                        <div className="w-6 h-6 rounded-full bg-yellow-500/80 mix-blend-multiply"></div>
                      </div>
                    </div>

                    <div className="relative z-10 mt-auto">
                      <div className="flex justify-between mb-4">
                        <span className="opacity-70 text-xs">Card Number</span>
                        <span className="opacity-70 text-xs">EXP</span>
                        <span className="opacity-70 text-xs">CVV</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="tracking-widest text-sm">{card.number}</span>
                        <span className="text-sm">{card.exp}</span>
                        <span className="text-sm">{card.cvv}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Top Row: Metrics & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Total Earnings */}
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-3xl p-5 text-white flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className="text-sm font-medium">Total Earnings</span>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl xl:text-3xl font-bold mb-2">Rp {stats.earnings.toLocaleString('id-ID')}</h3>
                    <div className="flex items-center text-xs">
                      <span className="bg-white/20 px-2 py-0.5 rounded-md flex items-center mr-2">
                        {growth.earnings >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownLeft className="w-3 h-3 mr-1" />}
                        {Math.abs(growth.earnings).toFixed(0)}%
                      </span>
                      <span className="opacity-80">This month</span>
                    </div>
                  </div>
                </div>

                {/* Total Spending */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-50 flex flex-col justify-between">
                   <div className="flex justify-between items-start mb-4">
                    <span className="text-sm text-gray-500 font-medium">Total Spending</span>
                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-2">Rp {stats.spending.toLocaleString('id-ID')}</h3>
                    <div className="flex items-center text-xs">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md flex items-center mr-2",
                        growth.spending >= 0 ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"
                      )}>
                        {growth.spending >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownLeft className="w-3 h-3 mr-1" />}
                        {Math.abs(growth.spending).toFixed(0)}%
                      </span>
                      <span className="text-gray-400">This month</span>
                    </div>
                  </div>
                </div>

                {/* Total Income */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-50 flex flex-col justify-between">
                   <div className="flex justify-between items-start mb-4">
                    <span className="text-sm text-gray-500 font-medium">Total Income</span>
                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-2">Rp {stats.income.toLocaleString('id-ID')}</h3>
                    <div className="flex items-center text-xs">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md flex items-center mr-2",
                        growth.income >= 0 ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
                      )}>
                        {growth.income >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownLeft className="w-3 h-3 mr-1" />}
                        {Math.abs(growth.income).toFixed(0)}%
                      </span>
                      <span className="text-gray-400">This month</span>
                    </div>
                  </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-gray-50 flex flex-col justify-between">
                   <div className="flex justify-between items-start mb-4">
                    <span className="text-sm text-gray-500 font-medium">Total Revenue</span>
                    <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-2">Rp {stats.revenue.toLocaleString('id-ID')}</h3>
                    <div className="flex items-center text-xs">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md flex items-center mr-2",
                        growth.revenue >= 0 ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
                      )}>
                        {growth.revenue >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownLeft className="w-3 h-3 mr-1" />}
                        {Math.abs(growth.revenue).toFixed(0)}%
                      </span>
                      <span className="text-gray-400">This month</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Chart */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-50 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">Total Income</h3>
                    <p className="text-sm text-gray-500">View your income in a certain period of time</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-medium text-gray-900">Profit and Loss</span>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-green-400"></div> Profit</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-gray-900"></div> Loss</span>
                  </div>
                </div>
                
                <div className="flex-1 min-h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: isCompact ? 10 : 12, fill: '#9ca3af' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: isCompact ? 10 : 12, fill: '#9ca3af' }} tickFormatter={(value) => isCompact ? `${(value/1000).toFixed(0)}k` : `Rp ${value.toLocaleString('id-ID')}`} width={isCompact ? 40 : 100} />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-50 text-sm">
                                <p className="font-medium text-gray-900 mb-1">{label}</p>
                                <p className="text-green-500">Profit: Rp {payload[1].value.toLocaleString('id-ID')}</p>
                                <p className="text-gray-900">Loss: Rp {payload[0].value.toLocaleString('id-ID')}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="loss" stackId="a" fill="#111827" radius={[0, 0, 4, 4]} barSize={20} />
                      <Bar dataKey="profit" stackId="a" fill="#4ade80" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Recent Activities Table */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-50 flex-1">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="font-semibold text-gray-900 text-lg">Recent Activities</h3>
                <div className="flex w-full sm:w-auto gap-2">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-auto pl-9 pr-4 py-2 min-h-[44px] rounded-full border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse hidden sm:table">
                  <thead>
                    <tr className="text-gray-400 text-sm border-b border-gray-100">
                      <th className="py-3 px-2 sm:py-4 sm:px-4 font-normal w-12"><input type="checkbox" className="rounded text-green-500 focus:ring-green-500" /></th>
                      <th className="py-3 px-2 sm:py-4 sm:px-4 font-normal hidden sm:table-cell">Order ID</th>
                      <th className="py-3 px-2 sm:py-4 sm:px-4 font-normal">Activity</th>
                      <th className="py-3 px-2 sm:py-4 sm:px-4 font-normal">Price</th>
                      <th className="py-3 px-2 sm:py-4 sm:px-4 font-normal hidden md:table-cell">Status</th>
                      <th className="py-3 px-2 sm:py-4 sm:px-4 font-normal hidden lg:table-cell">Date</th>
                      <th className="py-3 px-2 sm:py-4 sm:px-4 font-normal w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivities.map((activity) => (
                      <tr key={activity.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-2 sm:py-4 sm:px-4">
                          <input type="checkbox" className="rounded text-green-500 focus:ring-green-500" />
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-4 text-sm text-gray-500 hidden sm:table-cell">{activity.orderId}</td>
                        <td className="py-3 px-2 sm:py-4 sm:px-4">
                          <span className={cn(
                            "font-medium text-sm",
                            activity.type === 'expense' ? TOKENS.TEXT_EXPENSE : 
                            activity.type === 'income' ? TOKENS.TEXT_INCOME : 
                            TOKENS.TEXT_TRANSFER
                          )}>
                            {activity.title}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-4 font-medium text-gray-900 text-sm whitespace-nowrap">Rp {activity.price.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-2 sm:py-4 sm:px-4 hidden md:table-cell">
                          <span className={`flex items-center gap-1.5 text-sm font-medium
                            ${activity.status === 'Completed' ? 'text-green-500' : activity.status === 'Pending' ? 'text-red-500' : 'text-yellow-500'}
                          `}>
                            <div className={`w-1.5 h-1.5 rounded-full 
                              ${activity.status === 'Completed' ? 'bg-green-500' : activity.status === 'Pending' ? 'bg-red-500' : 'bg-yellow-500'}
                            `}></div>
                            {activity.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-4 text-sm text-gray-500 hidden lg:table-cell">{activity.date}</td>
                        <td className="py-3 px-2 sm:py-4 sm:px-4 text-right">
                          <InTableAction
                            variant="delete"
                            icon={Trash2}
                            onClick={() => {
                              Swal.fire({
                                title: 'Apakah Anda yakin?',
                                text: 'Transaksi yang dihapus tidak dapat dikembalikan!',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#22c55e',
                                cancelButtonColor: '#ef4444',
                                confirmButtonText: 'Ya, hapus!',
                                cancelButtonText: 'Batal'
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  deleteActivity(activity.id);
                                  Swal.fire({
                                    title: 'Terhapus!',
                                    text: 'Transaksi telah berhasil dihapus.',
                                    icon: 'success',
                                    confirmButtonColor: '#22c55e'
                                  });
                                }
                              });
                            }}
                            title="Delete Transaction"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Mobile List View */}
                <div className="flex flex-col gap-3 sm:hidden">
                  {filteredActivities.map((activity) => (
                    <div key={activity.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="rounded text-green-500 focus:ring-green-500" />
                          <div>
                            <span className={cn(
                              "font-medium text-base",
                              activity.type === 'expense' ? TOKENS.TEXT_EXPENSE : 
                              activity.type === 'income' ? TOKENS.TEXT_INCOME : 
                              TOKENS.TEXT_TRANSFER
                            )}>
                              {activity.title}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">{activity.orderId}</div>
                          </div>
                        </div>
                        <InTableAction
                          variant="delete"
                          icon={Trash2}
                          onClick={() => {
                            Swal.fire({
                              title: 'Apakah Anda yakin?',
                              text: 'Transaksi yang dihapus tidak dapat dikembalikan!',
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#22c55e',
                              cancelButtonColor: '#ef4444',
                              confirmButtonText: 'Ya, hapus!',
                              cancelButtonText: 'Batal'
                            }).then((result) => {
                              if (result.isConfirmed) {
                                deleteActivity(activity.id);
                                Swal.fire({
                                  title: 'Terhapus!',
                                  text: 'Transaksi telah berhasil dihapus.',
                                  icon: 'success',
                                  confirmButtonColor: '#22c55e'
                                });
                              }
                            });
                          }}
                          title="Delete Transaction"
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-gray-900">Rp {activity.price.toLocaleString('id-ID')}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded-md bg-white border border-gray-200
                            ${activity.status === 'Completed' ? 'text-green-600' : activity.status === 'Pending' ? 'text-red-600' : 'text-yellow-600'}
                          `}>
                            {activity.status}
                          </span>
                          <span className="text-xs text-gray-500">{activity.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
    </PageLoadingState>
  );
}
