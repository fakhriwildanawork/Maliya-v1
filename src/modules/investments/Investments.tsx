import React, { useState, useMemo } from 'react';
import { useFinance } from '../../logic/context/FinanceContext';
import { useModuleLoading } from '../../logic/hooks/useModuleLoading';
import { PrimaryButton } from '../../ui/components/elements/PrimaryButton';
import { Plus, ArrowUpRight, TrendingUp, DollarSign, Award, Percent, Filter, HelpCircle, Briefcase } from 'lucide-react';
import { Investment } from '../../logic/types/finance';
import InvestmentTable from './components/InvestmentTable';
import InvestmentForm from './components/InvestmentForm';
import PortfolioChart from './components/PortfolioChart';
import Modal from '../../ui/components/common/Modal';
import { PageLoadingState } from '../../ui/components/common/PageLoadingState';

export default function Investments() {
  const loading = useModuleLoading();
  const { investments, addInvestment, updateInvestment } = useFinance();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingInv, setEditingInv] = useState<Investment | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Compute overall KPI metrics
  const totalInvested = useMemo(() => investments.reduce((sum, inv) => sum + inv.investedAmount, 0), [investments]);
  const totalCurrent = useMemo(() => investments.reduce((sum, inv) => sum + inv.currentValue, 0), [investments]);
  const totalNetGain = totalCurrent - totalInvested;
  const averageROI = totalInvested > 0 ? (totalNetGain / totalInvested) * 100 : 0;
  const isNetPositive = totalNetGain >= 0;

  const handleAddClick = () => {
    setEditingInv(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (inv: Investment) => {
    setEditingInv(inv);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (data: Partial<Investment>) => {
    if (editingInv) {
      updateInvestment({
        ...editingInv,
        ...data,
        lastUpdated: new Date().toISOString().split('T')[0]
      } as Investment);
    } else {
      addInvestment(data);
    }
    setIsFormModalOpen(false);
    setEditingInv(null);
  };

  const filterTabs = [
    { id: 'All', label: 'All Assets' },
    { id: 'Stock', label: 'Stocks' },
    { id: 'Mutual Fund', label: 'Mutual Funds' },
    { id: 'Crypto', label: 'Crypto' },
    { id: 'Gold', label: 'Gold' },
    { id: 'Real Estate', label: 'Real Estate' },
    { id: 'P2P Lending', label: 'P2P' },
    { id: 'Other', label: 'Other' }
  ];

  return (
    <PageLoadingState isLoading={loading}>
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-gray-50 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Investment Portfolio</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">Monitor your capital allocation, analyze sector distribution, and track real-time portfolio performance across all asset classes.</p>
          </div>
          <div className="w-full sm:w-auto">
            <PrimaryButton className="w-full sm:w-auto" icon={<Plus className="w-4 h-4" />} onClick={handleAddClick}>
              Record New Asset
            </PrimaryButton>
          </div>
        </div>

        {/* KPI Stats Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Total Capital Invested */}
          <div className="bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col group hover:border-blue-100 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Capital</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-gray-900">
              Rp {totalInvested.toLocaleString('id-ID')}
            </h2>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase">
              <Briefcase className="w-3 h-3" />
              Initial Investment Value
            </div>
          </div>

          {/* Current Portfolio Value */}
          <div className="bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col group hover:border-emerald-100 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Market Value</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-gray-900">
              Rp {totalCurrent.toLocaleString('id-ID')}
            </h2>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase">
              <TrendingUp className="w-3 h-3" />
              Current Portfolio Valuation
            </div>
          </div>

          {/* Net Growth (Gain / Loss) */}
          <div className="bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col group hover:border-blue-100 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Return</span>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                isNetPositive ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'
              }`}>
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <h2 className={`text-2xl font-black ${isNetPositive ? 'text-blue-600' : 'text-red-500'}`}>
              {isNetPositive ? '+' : ''}Rp {totalNetGain.toLocaleString('id-ID')}
            </h2>
            <div className={`mt-3 flex items-center gap-2 text-[10px] font-bold uppercase ${isNetPositive ? 'text-blue-400' : 'text-red-400'}`}>
              <Award className="w-3 h-3" />
              Net Unrealized Gain/Loss
            </div>
          </div>

          {/* Average ROI % */}
          <div className="bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col group hover:border-blue-100 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Weighted ROI</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <h2 className={`text-2xl font-black ${isNetPositive ? 'text-blue-600' : 'text-red-500'}`}>
              {isNetPositive ? '+' : ''}{averageROI.toFixed(2)}%
            </h2>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase">
              <Percent className="w-3 h-3" />
              Portfolio Yield Performance
            </div>
          </div>
        </div>

        {/* Visual Analytics */}
        <PortfolioChart />

        {/* Main Management Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Asset Management</h3>
              <p className="text-sm text-gray-500 mt-1">Detailed view of individual holdings and performance tracking.</p>
            </div>
            
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 max-w-full hide-scrollbar">
              {filterTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold tracking-tight whitespace-nowrap transition-all min-h-[44px] ${
                    activeFilter === tab.id
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                      : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-100 shadow-sm'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <InvestmentTable onEdit={handleEditClick} filterType={activeFilter} />
        </div>

        {/* Portfolio Registry Summary Section at the Bottom */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Full Portfolio Registry</h3>
              <p className="text-sm text-gray-500 mt-1">Consolidated view of all assets for cross-sector analysis.</p>
            </div>
            <div className="px-5 py-2.5 bg-blue-50/50 rounded-2xl border border-blue-100/50 shadow-sm">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Portfolio Net Worth</span>
              <span className="text-lg font-black text-blue-600">Rp {totalCurrent.toLocaleString('id-ID')}</span>
            </div>
          </div>
          
          <InvestmentTable onEdit={handleEditClick} filterType="All" />
        </div>

        {/* Adding / Editing Modal */}
        <Modal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingInv(null);
          }}
          title={editingInv ? 'Edit Investment Asset Details' : 'Record New Investment Asset'}
        >
          <InvestmentForm 
            initialData={editingInv}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormModalOpen(false);
              setEditingInv(null);
            }}
          />
        </Modal>
      </div>
    </PageLoadingState>
  );
}

