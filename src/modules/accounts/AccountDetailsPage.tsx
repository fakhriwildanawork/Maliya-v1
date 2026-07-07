import React, { useMemo, useState } from 'react';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { useFinance } from '../../logic/context/FinanceContext';
import { useModuleLoading } from '../../logic/hooks/useModuleLoading';
import { PageLoadingState } from '../../ui/components/common/PageLoadingState';
import { TransactionsTable } from '../transactions/components/TransactionsTable';
import { BulkActionButton } from '../../ui/components/elements/BulkActionButton';
import Modal from '../../ui/components/common/Modal';
import TransactionForm from '../transactions/components/TransactionForm';
import { Activity } from '../../logic/types/finance';
import { cn } from '../../logic/utils/classNames';
import { useNavigation } from '../../logic/context/NavigationContext';
import FixDropdown from '../../ui/components/elements/FixDropdown';
import { DateRangePicker } from '../../ui/components/elements/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { parse } from 'date-fns';

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

export default function AccountDetailsPage() {
  const { routeParam, setActiveRoute } = useNavigation();
  const loading = useModuleLoading();
  const { wallets, activities: allActivities } = useFinance();
  const id = routeParam;
  const wallet = wallets.find(w => w.id === id);

  const walletTransactions = useMemo(() => 
    allActivities.filter(a => a.sourceAccountId === id || a.destinationAccountId === id),
  [allActivities, id]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Activity | null>(null);
  const [sortField, setSortField] = useState<any>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const processedTransactions = useMemo(() => {
    return [...walletTransactions]
      .filter(tx => {
        const matchSearch = tx.title.toLowerCase().includes(searchQuery.toLowerCase()) || tx.orderId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchType = filterType === 'All' || tx.type === filterType;
        const matchStatus = filterStatus === 'All' || tx.status === filterStatus;
        const txDate = parse(tx.date, 'dd MMM, yyyy hh:mm a', new Date());
        const matchDate = !dateRange || (!dateRange.from || txDate >= dateRange.from) && (!dateRange.to || txDate <= dateRange.to);

        return matchSearch && matchType && matchStatus && matchDate;
      })
      .sort((a, b) => {
        const field = sortDirection ? sortField : 'date';
        const dir = sortDirection ? sortDirection : 'desc';
        
        let valA: any = a[field as keyof Activity];
        let valB: any = b[field as keyof Activity];

        if (field === 'date') {
          valA = new Date(a.date).getTime();
          valB = new Date(b.date).getTime();
        }

        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [walletTransactions, sortField, sortDirection, searchQuery, filterType, filterStatus, dateRange]);

  const totalPages = Math.ceil(processedTransactions.length / 50) || 1;

  const handleDeleteAll = () => {
    // Logic for delete multiple in context could go here
    setSelectedIds([]);
  };

  const handleFormSubmit = (data: Partial<Activity>) => {
    // Using context update logic
    setIsFormOpen(false);
    setSelectedTransaction(null);
  };
  const handleSort = (field: any) => {
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

  if (!wallet) return <div>Account not found</div>;

  return (
    <PageLoadingState isLoading={loading}>
      <div className="absolute inset-0 flex flex-col bg-gray-50 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <button onClick={() => setActiveRoute('accounts')} className="flex items-center gap-2 text-gray-500 mb-4 md:mb-6 hover:text-gray-900 text-sm md:text-base">
        <ArrowLeft className="w-4 h-4" /> Back to Accounts
      </button>
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">{wallet.name}</h1>
          <p className="text-sm md:text-base text-gray-500">Account Details & Transactions</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-gray-500 text-xs md:text-sm mb-1">Available Balance</p>
          <h2 className={cn("text-3xl md:text-4xl font-bold", wallet.balance > 0 ? "text-green-600" : "text-red-600")}>
            Rp {wallet.balance.toLocaleString('id-ID')}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
          <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-medium text-gray-500">Transaction Type</label>
              <FixDropdown 
                options={TYPE_OPTIONS}
                value={filterType} 
                onChange={(val) => { setFilterType(val); setCurrentPage(1); }}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-medium text-gray-500">Status</label>
              <FixDropdown 
                options={STATUS_OPTIONS}
                value={filterStatus} 
                onChange={(val) => { setFilterStatus(val); setCurrentPage(1); }}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-medium text-gray-500">Date Range</label>
              <DateRangePicker 
                date={dateRange}
                onDateChange={(range) => { setDateRange(range); setCurrentPage(1); }}
                className="w-full"
              />
            </div>
          </div>
        )}
        <TransactionsTable 
          transactions={processedTransactions}
          selectedIds={selectedIds}
          handleSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
          handleSelectAll={() => setSelectedIds(selectedIds.length === processedTransactions.length ? [] : processedTransactions.map(t => t.id))}
          handleSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          onRowClick={(activity) => { setSelectedTransaction(activity); setIsFormOpen(true); }}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
        <BulkActionButton selectedCount={selectedIds.length} onDeleteAll={handleDeleteAll} />
      </div>
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        title="Edit Transaction"
      >
        <TransactionForm 
          initialData={selectedTransaction} 
          onSubmit={handleFormSubmit} 
          onCancel={() => setIsFormOpen(false)} 
        />
      </Modal>
        </main>
      </div>
    </PageLoadingState>
  );
}
