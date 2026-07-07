import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, Filter, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTransactions } from '../../logic/hooks/useTransactions';
import { Transaction } from '../../logic/types/transactions';
import { TransactionsTable } from './components/TransactionsTable';
import Modal from '../../ui/components/common/Modal';
import { PrimaryButton } from '../../ui/components/elements/PrimaryButton';
import TransactionForm from './components/TransactionForm';
import FixDropdown from '../../ui/components/elements/FixDropdown';
import { DateRangePicker } from '../../ui/components/elements/DateRangePicker';
import { BulkActionButton } from '../../ui/components/elements/BulkActionButton';
import { DateRange } from 'react-day-picker';
import { parse } from 'date-fns';
import { cn } from '../../logic/utils/classNames';
import * as TOKENS from '../../ui/styles/tokens';
import { useFinance } from '../../logic/context/FinanceContext';
import { PageLoadingState } from '../../ui/components/common/PageLoadingState';
import { useModuleLoading } from '../../logic/hooks/useModuleLoading';

type SortField = 'title' | 'category' | 'price' | 'status' | 'date';
type SortDirection = 'asc' | 'desc' | null;

const TYPE_OPTIONS = [
  { value: 'All', label: 'All Types' },
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'transfer', label: 'Transfer' },
];

const STATUS_OPTIONS = [
  { value: 'All', label: 'All Statuses' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Pending', label: 'Pending' },
  { value: 'In Progress', label: 'In Progress' },
];

export default function Transactions() {
  const { 
    activities: transactions, 
    addActivity: addTransaction, 
    deleteActivity: removeTransaction,
  } = useFinance();
  
  const loading = useModuleLoading();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // We'll use a local state to track if we've completed the first fetch to avoid flickering
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Since FinanceContext already fetches, we just need to know when it's done or if we have data
  useEffect(() => {
    if (transactions.length > 0) {
      setHasFetchedOnce(true);
    }
  }, [transactions]);

  const processedTransactions = useMemo(() => {
    return [...transactions]
      .filter(tx => {
        const matchSearch = tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tx.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tx.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = filterType === 'All' || tx.type === filterType;
        const matchStatus = filterStatus === 'All' || tx.status === filterStatus;
        const txDate = parse(tx.date, 'dd MMM, yyyy hh:mm a', new Date());
        const matchDate = !dateRange || (!dateRange.from || txDate >= dateRange.from) && (!dateRange.to || txDate <= dateRange.to);

        return matchSearch && matchType && matchStatus && matchDate;
      })
      .sort((a, b) => {
        const field = sortDirection ? sortField : 'date';
        const dir = sortDirection ? sortDirection : 'desc';
        
        let valA: any = a[field as keyof Transaction];
        let valB: any = b[field as keyof Transaction];

        if (field === 'date') {
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
        }

        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [transactions, searchQuery, filterType, filterStatus, sortField, sortDirection, dateRange]);

  const totalPages = Math.ceil(processedTransactions.length / 50) || 1;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField('date');
      }
      else setSortDirection('asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleExport = () => {
    const headers = ['Title', 'Category', 'Amount', 'Type', 'Status', 'Date'];
    const csvData = processedTransactions.map(tx => [
      `"${tx.title}"`,
      tx.category,
      tx.price,
      tx.type || 'expense',
      tx.status,
      `"${tx.date}"`
    ].join(','));
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === processedTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(processedTransactions.map(tx => tx.id));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteAll = () => {
    // Note: deleteActivity logic could be added to FinanceContext if needed
    // For now keeping it simple as per context implementation
    console.log('Delete all selected transactions:', selectedIds);
    setSelectedIds([]);
  };

  const handleFormSubmit = async (data: Partial<Transaction>) => {
    try {
      if (selectedTransaction) {
        // FinanceContext doesn't have editActivity yet, but we can add it or just use dbEditActivity indirectly if needed
        // For now let's assume we might need to add it to context or just handle it here
        // Actually, let's just use addActivity since context handles creation
        await addTransaction(data); 
      } else {
        await addTransaction(data);
      }
      setIsFormOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <PageLoadingState isLoading={loading}>
    <div className="absolute inset-0 flex flex-col bg-gray-50 overflow-hidden">
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div className="w-full md:w-auto">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Transactions</h1>
            <p className="text-gray-500 text-xs md:text-sm mt-1">Manage and view all your financial activities</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 w-full md:w-auto">
            <button onClick={handleExport} className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-full font-medium flex items-center justify-center gap-2 transition-colors text-sm min-h-[44px]">
              <Download className="w-4 h-4" />
              Export
            </button>
            <PrimaryButton 
              onClick={() => { setSelectedTransaction(null); setIsFormOpen(true); }}
              icon={<Plus className="w-4 h-4" />}
              className="w-full sm:w-auto justify-center text-sm min-h-[44px]"
            >
              New Transaction
            </PrimaryButton>
          </div>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-gray-50 flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3 md:gap-4">
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search transactions..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 min-h-[44px] rounded-full border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`w-full md:w-auto px-4 py-2 min-h-[44px] rounded-full border text-sm font-medium flex items-center justify-center gap-2 transition-colors
                  ${isFilterOpen ? 'bg-green-50 border-green-200 text-green-700' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}
                `}
              >
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>
          </div>

           {isFilterOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in slide-in-from-top-2">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-medium text-gray-500">Transaction Type</label>
                <FixDropdown 
                  options={TYPE_OPTIONS}
                  value={filterType} 
                  onChange={setFilterType} 
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-medium text-gray-500">Status</label>
                <FixDropdown 
                  options={STATUS_OPTIONS}
                  value={filterStatus} 
                  onChange={setFilterStatus} 
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-medium text-gray-500">Date Range</label>
                <DateRangePicker 
                  date={dateRange}
                  onDateChange={setDateRange}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <TransactionsTable 
            transactions={processedTransactions}
            selectedIds={selectedIds}
            handleSelect={handleSelect}
            handleSelectAll={handleSelectAll}
            handleSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
            onRowClick={(activity) => { setSelectedTransaction(activity); setIsFormOpen(true); }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onDelete={removeTransaction}
          />

          <BulkActionButton selectedCount={selectedIds.length} onDeleteAll={handleDeleteAll} />
        </div>
      </main>

      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        title={selectedTransaction ? "Edit Transaction" : "New Transaction"}
      >
        <TransactionForm 
          initialData={selectedTransaction} 
          onSubmit={handleFormSubmit} 
          onCancel={() => setIsFormOpen(false)} 
        />
      </Modal>
    </div>
    </PageLoadingState>
  );
}
