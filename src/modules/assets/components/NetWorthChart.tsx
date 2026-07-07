import React from 'react';
import { useFinance } from '../../../logic/context/FinanceContext';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip
} from 'recharts';
import { TrendingUp, Percent, Landmark, ShieldCheck, AlertCircle } from 'lucide-react';

export default function NetWorthChart() {
  const { wallets, cards, investments, debts, assets } = useFinance();

  // 1. Calculations
  const walletBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const creditCardDebt = cards.reduce((sum, c) => sum + c.balance, 0);
  const investmentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  
  // Active Receivables (Piutang aktif: amount - paidAmount)
  const receivablesValue = debts
    .filter(d => d.type === 'receivable' && d.status === 'active')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  // Physical Assets (Aset fisik)
  const physicalValue = assets.reduce((sum, as) => sum + as.currentValue, 0);

  const totalAssets = walletBalance + investmentValue + receivablesValue + physicalValue;

  // Total Liabilities (Active Payables + Credit Card Debt)
  const debtsValue = debts
    .filter(d => d.type === 'payable' && d.status === 'active')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const totalLiabilities = debtsValue + creditCardDebt;

  const netWorth = totalAssets - totalLiabilities;

  // Debt to Asset ratio
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  const liquidRatio = totalAssets > 0 ? (walletBalance / totalAssets) * 100 : 0;

  // Composition data for Pie Chart
  const assetComposition = [
    { name: 'Cash & Wallets', value: walletBalance, color: '#22c55e' }, // Green-500
    { name: 'Investments', value: investmentValue, color: '#3b82f6' },  // Blue-500
    { name: 'Receivables', value: receivablesValue, color: '#a855f7' }, // Purple-500
    { name: 'Physical Assets', value: physicalValue, color: '#eab308' } // Yellow-500
  ].filter(item => item.value > 0);

  const formatRupiah = (value: number) => {
    return `Rp ${value.toLocaleString('id-ID')}`;
  };

  const customTooltipFormatter = (value: any) => [
    formatRupiah(Number(value)),
    ''
  ];

  // Get financial health state
  const getHealthStatus = () => {
    if (debtToAssetRatio > 50) {
      return {
        label: 'High Risk (High Debt)',
        color: 'text-red-500 bg-red-50 border-red-100',
        desc: 'Your debt liabilities exceed 50% of your total assets. It is recommended to prioritize paying off high-interest debt first.',
        icon: <AlertCircle className="w-5 h-5 text-red-500" />
      };
    } else if (debtToAssetRatio > 35) {
      return {
        label: 'Warning (Moderate Debt)',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-100',
        desc: 'Your debt is in the moderate zone (35% - 50%). Avoid taking on new consumer debt.',
        icon: <AlertCircle className="w-5 h-5 text-yellow-600" />
      };
    } else {
      return {
        label: 'Very Healthy (Low Debt)',
        color: 'text-green-600 bg-green-50 border-green-100',
        desc: 'Your debt-to-asset ratio is very safe (<35%). Your financial structure is solid for accumulating more productive assets.',
        icon: <ShieldCheck className="w-5 h-5 text-green-600" />
      };
    }
  };

  const health = getHealthStatus();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
      {/* Asset Composition Donut */}
      <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Asset Allocation Structure</h3>
        <p className="text-xs text-gray-400 mb-4">Distribution of all your asset holdings</p>

        {totalAssets === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-12">
            No asset value data available for visualization.
          </div>
        ) : (
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="w-40 h-40 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={assetComposition}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {assetComposition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={customTooltipFormatter} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-gray-400 font-medium">Total Assets</span>
                <span className="text-xs font-bold text-gray-900 mt-0.5">
                  Rp {totalAssets >= 1000000000 ? `${(totalAssets / 1000000000).toFixed(2)}B` : `${(totalAssets / 1000000).toFixed(0)}M`}
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-2 w-full">
              {assetComposition.map((item, index) => {
                const pct = totalAssets > 0 ? (item.value / totalAssets) * 100 : 0;
                return (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-gray-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{pct.toFixed(1)}%</span>
                      <span className="text-gray-400">
                        ({item.value >= 1000000000 ? `${(item.value / 1000000000).toFixed(1)}B` : `${(item.value / 1000000).toFixed(0)}M`})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Net Worth Health & Ratios */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Net Worth Health Ratio</h3>
          <p className="text-xs text-gray-400 mb-4">Analysis of leverage, liquidity, and personal balance sheet structure</p>

          {/* Ratios visual progress bar */}
          <div className="flex flex-col gap-3 mt-2">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Debt to Asset Ratio (Leverage Ratio)</span>
                <span className="font-semibold text-gray-900">{debtToAssetRatio.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    debtToAssetRatio > 50 ? 'bg-red-500' : debtToAssetRatio > 35 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(debtToAssetRatio, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-1">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                <div className="text-[11px] text-gray-400 font-medium">Cash Liquidity</div>
                <div className="text-sm font-bold text-gray-900 mt-0.5">{liquidRatio.toFixed(1)}%</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Ready-to-use cash ratio</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                <div className="text-[11px] text-gray-400 font-medium">Net Worth</div>
                <div className="text-sm font-bold text-gray-900 mt-0.5">{(100 - debtToAssetRatio).toFixed(1)}%</div>
                <div className="text-[10px] text-gray-400 mt-0.5">Portion of personally-owned assets</div>
              </div>
            </div>
          </div>
        </div>

        {/* Advisor Comment Card */}
        <div className={`p-4 rounded-2xl border flex items-start gap-3 mt-4 ${health.color}`}>
          <div className="mt-0.5 flex-shrink-0">
            {health.icon}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold">{health.label}</span>
            <p className="text-[11px] leading-relaxed text-gray-600">
              {health.desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
