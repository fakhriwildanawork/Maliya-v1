import React, { useState, useEffect } from 'react';
import { useFinance } from '../../logic/context/FinanceContext';
import { useModuleLoading } from '../../logic/hooks/useModuleLoading';
import { PrimaryButton } from '../../ui/components/elements/PrimaryButton';
import { Plus, ArrowUpRight, TrendingUp, Landmark, Shield, HelpCircle, FileText, Ban } from 'lucide-react';
import { Asset } from '../../logic/types/finance';
import { PageLoadingState } from '../../ui/components/common/PageLoadingState';
import AssetTable from './components/AssetTable';
import AssetForm from './components/AssetForm';
import NetWorthChart from './components/NetWorthChart';
import Modal from '../../ui/components/common/Modal';

export default function Assets() {
  const loading = useModuleLoading();
  const { wallets, cards, investments, debts, assets, addAsset, updateAsset, fetchAssets } = useFinance();
  
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState<'Physical' | 'Financial' | 'Liabilities' | 'Receivables'>('Financial');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

  // 1. Calculations
  const walletBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const creditCardDebt = cards.reduce((sum, c) => sum + c.balance, 0); // Credit card balance is debt
  const investmentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  
  // Receivables (Piutang aktif: amount - paidAmount)
  const receivablesValue = debts
    .filter(d => d.type === 'receivable' && d.status === 'active')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const totalFinancialAssets = walletBalance + investmentValue + receivablesValue;

  // Physical Assets value
  const totalPhysicalAssets = assets.reduce((sum, as) => sum + as.currentValue, 0);

  const totalAssetsValue = totalFinancialAssets + totalPhysicalAssets;

  // Liabilities (Hutang aktif + Credit Cards)
  const debtsValue = debts
    .filter(d => d.type === 'payable' && d.status === 'active')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
    
  const totalLiabilitiesValue = debtsValue + creditCardDebt;

  const netWorth = totalAssetsValue - totalLiabilitiesValue;

  const handleAddClick = () => {
    setEditingAsset(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (as: Asset) => {
    setEditingAsset(as);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (data: Partial<Asset>) => {
    if (editingAsset) {
      updateAsset({
        ...editingAsset,
        ...data,
        lastUpdated: new Date().toISOString().split('T')[0]
      } as Asset);
    } else {
      addAsset(data);
    }
    setIsFormModalOpen(false);
    setEditingAsset(null);
  };

  const categoryTabs = [
    { id: 'All', label: 'All Categories' },
    { id: 'Property', label: 'Property' },
    { id: 'Vehicle', label: 'Vehicle' },
    { id: 'Electronics', label: 'Electronics' },
    { id: 'Jewelry', label: 'Jewelry' },
    { id: 'Business', label: 'Business' },
    { id: 'Other', label: 'Other' }
  ];

  return (
    <PageLoadingState isLoading={loading}>
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-gray-50 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500 mt-1">Track physical assets, integrate your financial portfolio, and monitor your real-time net worth.</p>
          </div>
          <div className="w-full sm:w-auto">
            <PrimaryButton className="w-full sm:w-auto justify-center min-h-[44px]" icon={<Plus className="w-4 h-4" />} onClick={handleAddClick}>
              Record New Physical Asset
            </PrimaryButton>
          </div>
        </div>

        {/* KPI Stats Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
          {/* Total Financial Assets */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Liquid & Financial Assets</span>
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <Landmark className="w-5 h-5" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Rp {totalFinancialAssets.toLocaleString('id-ID')}
            </h2>
            <div className="mt-2 text-xs text-gray-400">Total Cash, Investments, & Active Receivables</div>
          </div>

          {/* Total Physical/Fixed Assets */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Real / Physical Assets</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Rp {totalPhysicalAssets.toLocaleString('id-ID')}
            </h2>
            <div className="mt-2 text-xs text-gray-400">Total properties, vehicles, precious metals, etc.</div>
          </div>

          {/* Total Liabilities */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">Total Liabilities (Debt)</span>
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                <Ban className="w-5 h-5" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-red-500">
              Rp {totalLiabilitiesValue.toLocaleString('id-ID')}
            </h2>
            <div className="mt-2 text-xs text-gray-400">Active liabilities to be paid</div>
          </div>

          {/* Net Worth */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-green-700">NET WORTH</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <h2 className="text-xl font-black text-emerald-600">
              Rp {netWorth.toLocaleString('id-ID')}
            </h2>
            <div className="mt-2 text-xs text-gray-400 font-medium">Real-time net worth (Total Assets - Liabilities)</div>
          </div>
        </div>

        {/* Analytics & Charts */}
        <NetWorthChart />

        {/* Physical Asset Registry - Requested to be at the bottom after cards/charts */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Physical Asset Inventory</h3>
              <p className="text-sm text-gray-500 mt-1">Detailed registry of your tangible assets and their current valuation.</p>
            </div>
            <div className="px-5 py-2.5 bg-blue-50/50 rounded-2xl border border-blue-100/50 shadow-sm">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Total Inventory Value</span>
              <span className="text-lg font-black text-blue-600">Rp {totalPhysicalAssets.toLocaleString('id-ID')}</span>
            </div>
          </div>
          
          <AssetTable onEdit={handleEditClick} filterCategory="All" />
        </div>

      {/* Main Table Tabs and Sections */}
      <div className="flex flex-col">
        {/* Navigation Tabs for detailed sub-views */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('Financial')}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === 'Financial'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Cash & Investments ({wallets.length + investments.length})
          </button>
          <button
            onClick={() => setActiveTab('Physical')}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === 'Physical'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Physical Assets ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('Liabilities')}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === 'Liabilities'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Liabilities ({debts.filter(d => d.type === 'payable' && d.status === 'active').length + cards.length})
          </button>
          <button
            onClick={() => setActiveTab('Receivables')}
            className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] ${
              activeTab === 'Receivables'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Receivables & Loans ({debts.filter(d => d.type === 'receivable' && d.status === 'active').length})
          </button>
        </div>

        {/* Active view renderer */}
        {activeTab === 'Financial' && (
          <div className="space-y-6">
            {/* Wallets & Cash */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900">Cash & Wallet Balances</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Liquid assets available in your wallets and bank accounts.</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Total Cash</div>
                  <div className="font-bold text-green-600">Rp {walletBalance.toLocaleString('id-ID')}</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {wallets.length === 0 ? (
                      <tr><td className="py-8 text-center text-gray-400">No wallets found.</td></tr>
                    ) : (
                      wallets.map(w => (
                        <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6 font-medium text-gray-900">{w.name} <span className="text-xs text-gray-400 ml-2">({w.type})</span></td>
                          <td className="py-4 px-6 text-right font-bold text-gray-900 whitespace-nowrap">Rp {w.balance.toLocaleString('id-ID')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Investments */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900">Investment Portfolio</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Market value of your active investment accounts.</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Total Investments</div>
                  <div className="font-bold text-blue-600">Rp {investmentValue.toLocaleString('id-ID')}</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {investments.length === 0 ? (
                      <tr><td className="py-8 text-center text-gray-400">No active investments found.</td></tr>
                    ) : (
                      investments.map(inv => (
                        <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-900">{inv.name}</div>
                            <div className="text-xs text-gray-400">{inv.institution} • {inv.type}</div>
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="font-bold text-gray-900">Rp {inv.currentValue.toLocaleString('id-ID')}</div>
                            <div className={`text-xs ${inv.currentValue >= inv.initialAmount ? 'text-green-500' : 'text-red-500'}`}>
                              {inv.currentValue >= inv.initialAmount ? '+' : ''}
                              {(((inv.currentValue - inv.initialAmount) / inv.initialAmount) * 100).toFixed(2)}%
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Physical' && (
          <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Real Asset Ownership</h3>
              
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 max-w-full hide-scrollbar">
                {categoryTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategoryFilter(tab.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold tracking-tight whitespace-nowrap transition-all min-h-[44px] ${
                      activeCategoryFilter === tab.id
                        ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                        : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-100 shadow-sm'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <AssetTable onEdit={handleEditClick} filterCategory={activeCategoryFilter} />
            </div>
          </div>
        )}

        {activeTab === 'Liabilities' && (
          <div className="space-y-6">
            {/* Credit Cards Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900">Credit Card Usage (Short-term Debt)</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Outstanding balances on your credit cards.</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Total Card Debt</div>
                  <div className="font-bold text-red-500">Rp {creditCardDebt.toLocaleString('id-ID')}</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {cards.length === 0 ? (
                      <tr><td className="py-8 text-center text-gray-400">No credit cards found.</td></tr>
                    ) : (
                      cards.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-900">{c.name}</div>
                            <div className="text-xs text-gray-400">{c.bankName}</div>
                          </td>
                          <td className="py-4 px-6 text-right font-bold text-red-500 whitespace-nowrap">Rp {c.balance.toLocaleString('id-ID')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Debts Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900">Your Financial Liabilities Balance</h3>
                  <p className="text-xs text-gray-400 mt-0.5">List of active debts that reduce your net worth (Synced with Debts module)</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Total Long-term Debt</div>
                  <div className="font-bold text-red-600">Rp {debtsValue.toLocaleString('id-ID')}</div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                      <th className="py-4 px-6">Liability / Creditor Name</th>
                      <th className="py-4 px-6">Due Date</th>
                      <th className="py-4 px-6 text-right">Initial Loan</th>
                      <th className="py-4 px-6 text-right">Amount Paid</th>
                      <th className="py-4 px-6 text-right">Remaining Debt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {debts.filter(d => d.type === 'payable' && d.status === 'active').length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-400">
                          Great! You have no active debt liabilities at the moment.
                        </td>
                      </tr>
                    ) : (
                      debts.filter(d => d.type === 'payable' && d.status === 'active').map(d => {
                        const remaining = d.amount - d.paidAmount;
                        return (
                          <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                              {d.title}
                              <div className="text-xs text-gray-400 font-normal mt-0.5">Creditor: {d.name}</div>
                            </td>
                            <td className="py-4 px-6 text-gray-600 text-xs whitespace-nowrap">
                              {d.dueDate ? new Date(d.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </td>
                            <td className="py-4 px-6 text-right text-gray-900 whitespace-nowrap">
                              Rp {d.amount.toLocaleString('id-ID')}
                            </td>
                            <td className="py-4 px-6 text-right text-green-600 whitespace-nowrap">
                              Rp {d.paidAmount.toLocaleString('id-ID')}
                            </td>
                            <td className="py-4 px-6 text-right font-bold text-red-500 whitespace-nowrap">
                              Rp {remaining.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Receivables' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-900">Your Receivables</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Money lent to others that will return to increase your cash liquidity (Synced with Debts module)</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                      <th className="py-4 px-6">Debtor / Receivable Title</th>
                      <th className="py-4 px-6">Expected Due Date</th>
                      <th className="py-4 px-6 text-right">Funds Lent</th>
                      <th className="py-4 px-6 text-right">Amount Received</th>
                      <th className="py-4 px-6 text-right">Remaining Receivables</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {debts.filter(d => d.type === 'receivable' && d.status === 'active').length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-400">
                          No active receivables recorded at the moment.
                        </td>
                      </tr>
                    ) : (
                      debts.filter(d => d.type === 'receivable' && d.status === 'active').map(d => {
                        const remaining = d.amount - d.paidAmount;
                        return (
                          <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                              {d.title}
                              <div className="text-xs text-gray-400 font-normal mt-0.5">Debtor: {d.name}</div>
                            </td>
                            <td className="py-4 px-6 text-gray-600 text-xs whitespace-nowrap">
                              {d.dueDate ? new Date(d.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </td>
                            <td className="py-4 px-6 text-right text-gray-900 whitespace-nowrap">
                              Rp {d.amount.toLocaleString('id-ID')}
                            </td>
                            <td className="py-4 px-6 text-right text-green-600 whitespace-nowrap">
                              Rp {d.paidAmount.toLocaleString('id-ID')}
                            </td>
                            <td className="py-4 px-6 text-right font-bold text-purple-600 whitespace-nowrap">
                              Rp {remaining.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Adding / Editing Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingAsset(null);
        }}
        title={editingAsset ? 'Edit Physical Asset Information' : 'Record New Physical Asset'}
      >
        <AssetForm 
          initialData={editingAsset}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormModalOpen(false);
            setEditingAsset(null);
          }}
        />
      </Modal>
      </div>
    </PageLoadingState>
  );
}
