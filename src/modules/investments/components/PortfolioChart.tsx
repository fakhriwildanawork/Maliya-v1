import React from 'react';
import { useFinance } from '../../../logic/context/FinanceContext';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { Investment } from '../../../logic/types/finance';

export default function PortfolioChart() {
  const { investments } = useFinance();

  // 1. Calculate Portfolio Composition (By Category)
  const categoryTotals: Record<string, number> = {
    'Stock': 0,
    'Mutual Fund': 0,
    'Crypto': 0,
    'Gold': 0,
    'Real Estate': 0,
    'P2P Lending': 0,
    'Other': 0
  };

  let totalPortfolioValue = 0;
  let totalInvestedCapital = 0;

  investments.forEach(inv => {
    categoryTotals[inv.type] += inv.currentValue;
    totalPortfolioValue += inv.currentValue;
    totalInvestedCapital += inv.investedAmount;
  });

  const categoryLabels: Record<string, string> = {
    'Stock': 'Stock',
    'Mutual Fund': 'Mutual Fund',
    'Crypto': 'Crypto',
    'Gold': 'Gold',
    'Real Estate': 'Real Estate',
    'P2P Lending': 'P2P Lending',
    'Other': 'Other'
  };

  const COLORS: Record<string, string> = {
    'Stock': '#3b82f6',       // Blue-500
    'Mutual Fund': '#a855f7',  // Purple-500
    'Crypto': '#f97316',       // Orange-500
    'Gold': '#eab308',         // Yellow-500
    'Real Estate': '#14b8a6',  // Teal-500
    'P2P Lending': '#6366f1',  // Indigo-500
    'Other': '#6b7280'         // Gray-500
  };

  const compositionData = Object.entries(categoryTotals)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: categoryLabels[key] || key,
      value,
      percentage: totalPortfolioValue > 0 ? (value / totalPortfolioValue) * 100 : 0,
      color: COLORS[key] || '#94a3b8'
    }));

  // 2. Generate Historical Portfolio Trend Data from Logs
  // Aggregate history logs by date to compute net invested amount vs. net value over time
  const allLogs: { date: string; invested: number; value: number }[] = [];
  
  // Collect logs and map them by date
  const dateMap: Record<string, { date: string; invested: number; value: number; assetsCount: Record<string, boolean> }> = {};

  // For a clean presentation, let's pre-populate standard dates if logs exist, or construct from active history logs
  investments.forEach(inv => {
    if (inv.historyLogs) {
      inv.historyLogs.forEach(log => {
        const dateStr = log.date;
        if (!dateMap[dateStr]) {
          dateMap[dateStr] = {
            date: dateStr,
            invested: 0,
            value: 0,
            assetsCount: {}
          };
        }
        dateMap[dateStr].invested += log.investedAmount;
        dateMap[dateStr].value += log.currentValue;
        dateMap[dateStr].assetsCount[inv.id] = true;
      });
    }
  });

  // Sort logs by date
  const sortedDates = Object.keys(dateMap).sort();
  
  // Accumulate or carry forward values for assets that didn't have logs on specific dates
  // To keep it simple and accurate, we can map sorted logs
  const trendData = sortedDates.map(date => {
    const data = dateMap[date];
    // Formatter for English short dates (e.g. Jan 10)
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    return {
      date: formattedDate,
      'Invested Capital': data.invested,
      'Portfolio Value': data.value
    };
  });

  const formatRupiahK = (value: number) => {
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(0)}M`;
    } else if (value >= 1000) {
      return `Rp ${(value / 1000).toFixed(0)}K`;
    }
    return `Rp ${value}`;
  };

  const customTooltipFormatter = (value: any) => [
    `Rp ${Number(value).toLocaleString('id-ID')}`,
    ''
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
      {/* Composition Card */}
      <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Asset Allocation</h3>
        <p className="text-xs text-gray-400 mb-4">Investment weight by asset category</p>
        
        {totalPortfolioValue === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-12">
            No portfolio allocation data available.
          </div>
        ) : (
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="w-44 h-44 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={compositionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {compositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={customTooltipFormatter} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xs text-gray-400 font-medium">Total Value</span>
                <span className="text-sm font-bold text-gray-900 mt-0.5">
                  Rp {totalPortfolioValue >= 1000000 ? `${(totalPortfolioValue / 1000000).toFixed(1)}M` : totalPortfolioValue.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-2.5 w-full">
              {compositionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{item.percentage.toFixed(1)}%</span>
                    <span className="text-gray-400">
                      (Rp {item.value >= 1000000 ? `${(item.value / 1000000).toFixed(1)}M` : item.value.toLocaleString('id-ID')})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Growth Trend Card */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Portfolio Growth</h3>
        <p className="text-xs text-gray-400 mb-4">Trend of invested capital vs. market value</p>

        {trendData.length < 2 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm py-12 gap-2 text-center">
            <span>The growth trend curve requires at least 2 historical data points.</span>
            <span className="text-xs max-w-sm">Use the <b className="text-green-600">Update Market Value</b> (refresh icon) in the asset table to add periodic valuation records!</span>
          </div>
        ) : (
          <div className="flex-1 min-h-[12rem] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 10 }} 
                />
                <YAxis 
                  tickFormatter={formatRupiahK}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 10 }} 
                />
                <Tooltip 
                  formatter={(value: any) => `Rp ${Number(value).toLocaleString('id-ID')}`}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="Invested Capital" 
                  stroke="#9ca3af" 
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Portfolio Value" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
