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
      <div className={cn("absolute inset-0 flex flex-col overflow-hidden", TOKENS.BG_BACKGROUND)}>
        <main className={cn("flex-1 overflow-y-auto", TOKENS.PADDING_PAGE)}>
          {/* Header */}
          <div className="mb-6">
            <h1 className={cn("text-2xl md:text-3xl font-bold mb-1", TOKENS.TEXT_PRIMARY)}>Hello, {currentUser?.name || "Oripio"}</h1>
            <p className={TOKENS.TEXT_SECONDARY}>Stay on top of your tasks, monitor progress, and track status.</p>
          </div>

        {/* Main Grid Layout */}
        <div className={cn("grid grid-cols-1 lg:grid-cols-12", TOKENS.GAP_SECTION)}>
          
          {/* Left Column */}
          <div className={cn("lg:col-span-4 flex flex-col", TOKENS.GAP_SECTION)}>
            
            {/* Total Balance Card */}
            <div className={cn("shadow-sm border", TOKENS.BG_SURFACE, TOKENS.RADIUS_CARD, TOKENS.PADDING_CARD, TOKENS.BORDER_DEFAULT)}>
              <div className="flex justify-between items-start mb-6">
                <span className={cn("font-medium", TOKENS.TEXT_SECONDARY)}>Total Balance</span>
                <div className={cn("flex items-center gap-2 px-3 py-1 border", TOKENS.RADIUS_PILL, TOKENS.BG_BACKGROUND, TOKENS.BORDER_DEFAULT)}>
                  <span>🇮🇩</span>
                  <span className="text-sm font-medium uppercase">IDR</span>
                  <ArrowDownLeft className={cn("w-3 h-3", TOKENS.TEXT_MUTED)} />
                </div>
              </div>
              <div className="mb-2">
                <h2 className={cn("text-3xl md:text-4xl font-bold", TOKENS.TEXT_PRIMARY)}>Rp {totalBalance.toLocaleString('id-ID')}</h2>
              </div>
              <div className="flex items-center gap-2 mb-6 text-sm">
                <span className={cn(
                  "font-medium flex items-center px-2 py-0.5",
                  TOKENS.RADIUS_DEFAULT,
                  growth.earnings >= 0 ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"
                )}>
                  {growth.earnings >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownLeft className="w-3 h-3 mr-1" />}
                  {Math.abs(growth.earnings).toFixed(0)}%
                </span>
                <span className={TOKENS.TEXT_MUTED}>than last month</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button className={cn("flex-1 font-semibold py-3 flex items-center justify-center gap-2 transition-colors min-h-[2.75rem]", TOKENS.RADIUS_PILL, TOKENS.BG_PRIMARY, TOKENS.BG_PRIMARY_HOVER, TOKENS.TEXT_INVERSE)}>
                  <ArrowRightLeft className="w-4 h-4" />
                  Transfer
                </button>
                <button className={cn("flex-1 border font-semibold py-3 flex items-center justify-center gap-2 transition-colors min-h-[2.75rem]", TOKENS.RADIUS_PILL, TOKENS.BG_SURFACE, TOKENS.BORDER_DEFAULT, TOKENS.TEXT_PRIMARY, "hover:bg-gray-50")}>
                  <ArrowDownLeft className="w-4 h-4" />
                  Request
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className={cn("font-medium", TOKENS.TEXT_PRIMARY)}>Wallets</span>
                  <span className={TOKENS.TEXT_MUTED}>Total {wallets.length} wallets</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {wallets.map((wallet) => (
                    <div key={wallet.id} className={cn("p-3 sm:p-4 border flex flex-col relative", TOKENS.BG_BACKGROUND, TOKENS.RADIUS_DEFAULT, TOKENS.BORDER_DEFAULT)}>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-bold", TOKENS.TEXT_PRIMARY)}>{wallet.name}</span>
                        </div>
                        <button className={cn("flex items-center justify-center min-h-[2.75rem] min-w-[2.75rem] -mr-3 -mt-3", TOKENS.RADIUS_PILL, "hover:bg-gray-200/50 transition-colors")}>
                          <MoreHorizontal className={cn("w-4 h-4", TOKENS.TEXT_MUTED)} />
                        </button>
                      </div>
                      <span className={cn("text-sm font-bold mb-1", TOKENS.TEXT_PRIMARY)}>Rp {wallet.balance.toLocaleString('id-ID')}</span>
                      <span className={cn("text-xs mb-2 truncate", TOKENS.TEXT_MUTED)}>Limit is Rp {wallet.limit >= 1000 ? (wallet.limit / 1000) + 'k' : wallet.limit} a month</span>
                      <span className={cn("text-xs font-medium", wallet.status === 'Active' ? TOKENS.TEXT_INCOME : "text-red-400")}>
                        {wallet.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Spending Limit */}
            <div className={cn("shadow-sm border", TOKENS.BG_SURFACE, TOKENS.RADIUS_CARD, TOKENS.PADDING_CARD, TOKENS.BORDER_LIGHT)}>
              <h3 className={cn("font-semibold mb-4", TOKENS.TEXT_PRIMARY)}>Monthly Spending Limit</h3>
              <div className={cn("w-full h-2 mb-3 overflow-hidden", TOKENS.RADIUS_PILL, TOKENS.BG_BACKGROUND)}>
                <div 
                  className={cn(
                    "h-2 transition-all duration-500",
                    TOKENS.RADIUS_PILL,
                    budgetProgress.percent > 90 ? "bg-red-500" : budgetProgress.percent > 70 ? "bg-yellow-500" : TOKENS.BG_PRIMARY
                  )} 
                  style={{ width: `${Math.min(budgetProgress.percent, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className={TOKENS.TEXT_PRIMARY}>Rp {budgetProgress.spent.toLocaleString('id-ID')} <span className={cn("font-normal", TOKENS.TEXT_MUTED)}>spent out of</span></span>
                <span className={TOKENS.TEXT_PRIMARY}>Rp {budgetProgress.limit.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* My Cards */}
            <div className={cn("shadow-sm border flex-1", TOKENS.BG_SURFACE, TOKENS.RADIUS_CARD, TOKENS.PADDING_CARD, TOKENS.BORDER_LIGHT)}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <CreditCard className={cn("w-5 h-5", TOKENS.TEXT_PRIMARY)} />
                  <h3 className={cn("font-semibold", TOKENS.TEXT_PRIMARY)}>My Cards</h3>
                </div>
                <button className={cn("text-sm font-medium flex items-center gap-1 hover:text-green-600 transition-colors min-h-[2.75rem] min-w-[2.75rem] px-2 -mr-2 justify-center", TOKENS.TEXT_PRIMARY)}>
                  <Plus className="w-4 h-4" /> Add new
                </button>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {cards.map((card) => (
                  <div 
                    key={card.id} 
                    className={cn(
                      "min-w-[16rem] h-40 p-5 flex flex-col justify-between relative overflow-hidden snap-center",
                      TOKENS.RADIUS_DEFAULT,
                      getCardThemeClasses(card.theme)
                    )}
                  >
                    {/* Background decorations */}
                    {card.theme !== 'dark' && (
                      <>
                        <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-20 blur-2xl -mr-10 -mt-10", TOKENS.RADIUS_PILL, getCardThemeGlow(card.theme).top)}></div>
                        <div className={cn("absolute bottom-0 left-0 w-24 h-24 opacity-20 blur-xl -ml-5 -mb-5", TOKENS.RADIUS_PILL, getCardThemeGlow(card.theme).bottom)}></div>
                      </>
                    )}
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-2">
                        <span className={cn("w-6 h-6 flex items-center justify-center bg-white/20", TOKENS.RADIUS_PILL)}>
                           <div className={cn("w-3 h-3 bg-white", TOKENS.RADIUS_PILL)}></div>
                        </span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 backdrop-blur-sm bg-white/20", TOKENS.RADIUS_PILL)}>{card.status}</span>
                      </div>
                      <div className="flex">
                        <div className={cn("w-6 h-6 bg-red-500/80 -mr-2 mix-blend-multiply", TOKENS.RADIUS_PILL)}></div>
                        <div className={cn("w-6 h-6 bg-yellow-500/80 mix-blend-multiply", TOKENS.RADIUS_PILL)}></div>
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
          <div className={cn("lg:col-span-8 flex flex-col", TOKENS.GAP_SECTION)}>
            
            {/* Top Row: Metrics & Chart */}
            <div className={cn("grid grid-cols-1 lg:grid-cols-2", TOKENS.GAP_SECTION)}>
              
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Total Earnings */}
                <div className={cn("bg-gradient-to-br from-green-400 to-green-600 p-5 text-white flex flex-col justify-between shadow-sm relative overflow-hidden", TOKENS.RADIUS_CARD)}>
                  <div className={cn("absolute top-0 right-0 w-32 h-32 bg-white opacity-10 blur-2xl -mr-10 -mt-10", TOKENS.RADIUS_PILL)}></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className="text-sm font-medium">Total Earnings</span>
                    <div className={cn("w-8 h-8 flex items-center justify-center backdrop-blur-sm bg-white/20", TOKENS.RADIUS_PILL)}>
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl xl:text-3xl font-bold mb-2">Rp {stats.earnings.toLocaleString('id-ID')}</h3>
                    <div className="flex items-center text-xs">
                      <span className={cn("px-2 py-0.5 flex items-center mr-2 bg-white/20", TOKENS.RADIUS_DEFAULT)}>
                        {growth.earnings >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownLeft className="w-3 h-3 mr-1" />}
                        {Math.abs(growth.earnings).toFixed(0)}%
                      </span>
                      <span className="opacity-80">This month</span>
                    </div>
                  </div>
                </div>

                {/* Total Spending */}
                <div className={cn("shadow-sm border flex flex-col justify-between", TOKENS.BG_SURFACE, TOKENS.RADIUS_CARD, TOKENS.PADDING_CARD, TOKENS.BORDER_LIGHT)}>
                   <div className="flex justify-between items-start mb-4">
                    <span className={cn("text-sm font-medium", TOKENS.TEXT_SECONDARY)}>Total Spending</span>
                    <div className={cn("w-8 h-8 border flex items-center justify-center", TOKENS.RADIUS_PILL, TOKENS.BG_BACKGROUND, TOKENS.BORDER_DEFAULT)}>
                      <Wallet className={cn("w-4 h-4", TOKENS.TEXT_MUTED)} />
                    </div>
                  </div>
                  <div>
                    <h3 className={cn("text-2xl xl:text-3xl font-bold mb-2", TOKENS.TEXT_PRIMARY)}>Rp {stats.spending.toLocaleString('id-ID')}</h3>
                    <div className="flex items-center text-xs">
                      <span className={cn(
                        "px-2 py-0.5 flex items-center mr-2",
                        TOKENS.RADIUS_DEFAULT,
                        growth.spending >= 0 ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"
                      )}>
                        {growth.spending >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownLeft className="w-3 h-3 mr-1" />}
                        {Math.abs(growth.spending).toFixed(0)}%
                      </span>
                      <span className={TOKENS.TEXT_MUTED}>This month</span>
                    </div>
                  </div>
                </div>

                {/* Total Income */}
                <div className={cn("shadow-sm border flex flex-col justify-between", TOKENS.BG_SURFACE, TOKENS.RADIUS_CARD, TOKENS.PADDING_CARD, TOKENS.BORDER_LIGHT)}>
                   <div className="flex justify-between items-start mb-4">
                    <span className={cn("text-sm font-medium", TOKENS.TEXT_SECONDARY)}>Total Income</span>
                    <div className={cn("w-8 h-8 border flex items-center justify-center", TOKENS.RADIUS_PILL, TOKENS.BG_BACKGROUND, TOKENS.BORDER_DEFAULT)}>
                      <Wallet className={cn("w-4 h-4", TOKENS.TEXT_MUTED)} />
                    </div>
                  </div>
                  <div>
                    <h3 className={cn("text-2xl xl:text-3xl font-bold mb-2", TOKENS.TEXT_PRIMARY)}>Rp {stats.income.toLocaleString('id-ID')}</h3>
                    <div className="flex items-center text-xs">
                      <span className={cn(
                        "px-2 py-0.5 flex items-center mr-2",
                        TOKENS.RADIUS_DEFAULT,
                        growth.income >= 0 ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
                      )}>
                        {growth.income >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownLeft className="w-3 h-3 mr-1" />}
                        {Math.abs(growth.income).toFixed(0)}%
                      </span>
                      <span className={TOKENS.TEXT_MUTED}>This month</span>
                    </div>
                  </div>
                </div>

                {/* Total Revenue */}
                <div className={cn("shadow-sm border flex flex-col justify-between", TOKENS.BG_SURFACE, TOKENS.RADIUS_CARD, TOKENS.PADDING_CARD, TOKENS.BORDER_LIGHT)}>
                   <div className="flex justify-between items-start mb-4">
                    <span className={cn("text-sm font-medium", TOKENS.TEXT_SECONDARY)}>Total Revenue</span>
                    <div className={cn("w-8 h-8 border flex items-center justify-center", TOKENS.RADIUS_PILL, TOKENS.BG_BACKGROUND, TOKENS.BORDER_DEFAULT)}>
                      <Wallet className={cn("w-4 h-4", TOKENS.TEXT_MUTED)} />
                    </div>
                  </div>
                  <div>
                    <h3 className={cn("text-2xl xl:text-3xl font-bold mb-2", TOKENS.TEXT_PRIMARY)}>Rp {stats.revenue.toLocaleString('id-ID')}</h3>
                    <div className="flex items-center text-xs">
                      <span className={cn(
                        "px-2 py-0.5 flex items-center mr-2",
                        TOKENS.RADIUS_DEFAULT,
                        growth.revenue >= 0 ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500"
                      )}>
                        {growth.revenue >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownLeft className="w-3 h-3 mr-1" />}
                        {Math.abs(growth.revenue).toFixed(0)}%
                      </span>
                      <span className={TOKENS.TEXT_MUTED}>This month</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Chart */}
              <div className={cn("shadow-sm border flex flex-col", TOKENS.BG_SURFACE, TOKENS.RADIUS_CARD, TOKENS.PADDING_CARD, TOKENS.BORDER_LIGHT)}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className={cn("font-semibold", TOKENS.TEXT_PRIMARY)}>Total Income</h3>
                    <p className={cn("text-sm", TOKENS.TEXT_SECONDARY)}>View your income in a certain period of time</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className={cn("text-sm font-medium", TOKENS.TEXT_PRIMARY)}>Profit and Loss</span>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1"><div className={cn("w-2 h-2", TOKENS.RADIUS_DEFAULT, "bg-green-400")}></div> Profit</span>
                    <span className="flex items-center gap-1"><div className={cn("w-2 h-2", TOKENS.RADIUS_DEFAULT, "bg-gray-900")}></div> Loss</span>
                  </div>
                </div>
                
                <div className="flex-1 min-h-[13rem] w-full">
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
                              <div className={cn("p-3 shadow-md border text-sm", TOKENS.BG_SURFACE, TOKENS.RADIUS_DEFAULT, TOKENS.BORDER_LIGHT)}>
                                <p className={cn("font-medium mb-1", TOKENS.TEXT_PRIMARY)}>{label}</p>
                                <p className="text-green-500">Profit: Rp {payload[1].value.toLocaleString('id-ID')}</p>
                                <p className={TOKENS.TEXT_PRIMARY}>Loss: Rp {payload[0].value.toLocaleString('id-ID')}</p>
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
            <div className={cn("shadow-sm border flex-1", TOKENS.BG_SURFACE, TOKENS.RADIUS_CARD, TOKENS.PADDING_CARD, TOKENS.BORDER_LIGHT)}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className={cn("font-semibold text-lg", TOKENS.TEXT_PRIMARY)}>Recent Activities</h3>
                <div className="flex w-full sm:w-auto gap-2">
                  <div className="relative w-full">
                    <Search className={cn("w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2", TOKENS.TEXT_MUTED)} />
                    <input 
                      type="text" 
                      placeholder="Search" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={cn("w-full sm:w-auto pl-9 pr-4 py-2 min-h-[2.75rem] border text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500", TOKENS.RADIUS_PILL, TOKENS.BORDER_DEFAULT)}
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse hidden sm:table">
                  <thead>
                    <tr className={cn("text-sm border-b", TOKENS.TEXT_MUTED, TOKENS.BORDER_DEFAULT)}>
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
                      <tr key={activity.id} className={cn("border-b hover:bg-gray-50/50 transition-colors", TOKENS.BORDER_LIGHT)}>
                        <td className="py-3 px-2 sm:py-4 sm:px-4">
                          <input type="checkbox" className="rounded text-green-500 focus:ring-green-500" />
                        </td>
                        <td className={cn("py-3 px-2 sm:py-4 sm:px-4 text-sm hidden sm:table-cell", TOKENS.TEXT_SECONDARY)}>{activity.orderId}</td>
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
                        <td className={cn("py-3 px-2 sm:py-4 sm:px-4 font-medium text-sm whitespace-nowrap", TOKENS.TEXT_PRIMARY)}>Rp {activity.price.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-2 sm:py-4 sm:px-4 hidden md:table-cell">
                          <span className={cn(
                            "flex items-center gap-1.5 text-sm font-medium",
                            activity.status === 'Completed' ? TOKENS.TEXT_INCOME : activity.status === 'Pending' ? TOKENS.TEXT_EXPENSE : "text-yellow-500"
                          )}>
                            <div className={cn(
                              "w-1.5 h-1.5",
                              TOKENS.RADIUS_PILL,
                              activity.status === 'Completed' ? "bg-green-500" : activity.status === 'Pending' ? "bg-red-500" : "bg-yellow-500"
                            )}></div>
                            {activity.status}
                          </span>
                        </td>
                        <td className={cn("py-3 px-2 sm:py-4 sm:px-4 text-sm hidden lg:table-cell", TOKENS.TEXT_SECONDARY)}>{activity.date}</td>
                        <td className="py-3 px-2 sm:py-4 sm:px-4 text-right">
                          <InTableAction
                            variant="delete"
                            icon={Trash2}
                            onClick={() => {
                              Swal.fire({
                                title: 'Are you sure?',
                                text: 'Deleted transactions cannot be recovered!',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#22c55e',
                                cancelButtonColor: '#ef4444',
                                confirmButtonText: 'Yes, delete it!',
                                cancelButtonText: 'Cancel'
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  deleteActivity(activity.id);
                                  Swal.fire({
                                    title: 'Deleted!',
                                    text: 'Transaction has been successfully deleted.',
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
                    <div key={activity.id} className={cn("p-4 border flex flex-col gap-3", TOKENS.BG_BACKGROUND, TOKENS.RADIUS_DEFAULT, TOKENS.BORDER_DEFAULT)}>
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
                            <div className={cn("text-xs mt-1", TOKENS.TEXT_SECONDARY)}>{activity.orderId}</div>
                          </div>
                        </div>
                        <InTableAction
                          variant="delete"
                          icon={Trash2}
                          onClick={() => {
                            Swal.fire({
                              title: 'Are you sure?',
                              text: 'Deleted transactions cannot be recovered!',
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#22c55e',
                              cancelButtonColor: '#ef4444',
                              confirmButtonText: 'Yes, delete it!',
                              cancelButtonText: 'Cancel'
                            }).then((result) => {
                              if (result.isConfirmed) {
                                deleteActivity(activity.id);
                                Swal.fire({
                                  title: 'Deleted!',
                                  text: 'Transaction has been successfully deleted.',
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
                        <span className={cn("font-bold", TOKENS.TEXT_PRIMARY)}>Rp {activity.price.toLocaleString('id-ID')}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-xs font-medium px-2 py-1 border bg-white",
                            TOKENS.RADIUS_DEFAULT,
                            TOKENS.BORDER_DEFAULT,
                            activity.status === 'Completed' ? "text-green-600" : activity.status === 'Pending' ? "text-red-600" : "text-yellow-600"
                          )}>
                            {activity.status}
                          </span>
                          <span className={cn("text-xs", TOKENS.TEXT_SECONDARY)}>{activity.date}</span>
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
