import React, { useMemo, useState, useEffect } from 'react';
import { Search, Download, Filter, BookOpen } from 'lucide-react';
import { useLedger } from '../../logic/hooks/useLedger';
import { cn } from '../../logic/utils/classNames';
import FixDropdown from '../../ui/components/elements/FixDropdown';
import { Pagination } from '../../ui/components/common/Pagination';
import { PageLoadingState } from '../../ui/components/common/PageLoadingState';
import * as TOKENS from '../../ui/styles/tokens';

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' }
];

export default function Ledger() {
  const { ledgerEntries: journalEntries, totalTransactions, loading, fetchLedger } = useLedger();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const queryDebounceRef = React.useRef<any>(null);

  useEffect(() => {
    if (queryDebounceRef.current) {
      clearTimeout(queryDebounceRef.current);
    }

    const performFetch = () => {
      fetchLedger(currentPage - 1, searchQuery);
    };

    if (searchQuery) {
      queryDebounceRef.current = setTimeout(performFetch, 300);
    } else {
      performFetch();
    }

    return () => {
      if (queryDebounceRef.current) {
        clearTimeout(queryDebounceRef.current);
      }
    };
  }, [currentPage, searchQuery, fetchLedger]);

  const paginatedEntries = useMemo(() => {
    return [...journalEntries].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (sortOrder === 'date_desc') return dateB - dateA;
      return dateA - dateB;
    });
  }, [journalEntries, sortOrder]);

  const totalPages = Math.ceil(totalTransactions / 25) || 1;

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '-';
    return new Intl.NumberFormat('en-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = () => {
    const headers = ['Date', 'Transaction', 'Account', 'Debit', 'Credit'];
    const csvData = paginatedEntries.map(entry => [
      `"${entry.date}"`,
      `"${entry.transactionTitle || ''}"`,
      `"${entry.accountName}"`,
      entry.debit,
      entry.credit
    ].join(','));
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'general_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageLoadingState isLoading={loading}>
      <div className="absolute inset-0 flex flex-col bg-gray-50 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <p className="text-gray-500 text-sm mt-1">Double-entry accounting journal</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button onClick={handleExport} className="w-full sm:w-auto justify-center bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-full font-medium flex items-center gap-2 transition-colors text-sm min-h-[44px]">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-50 flex-1 flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 gap-4">
              <div className="relative flex-1 min-w-[200px] w-full max-w-md flex items-center">
                <Search className="w-5 h-5 absolute left-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search account or reference..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 min-h-[44px] rounded-full border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
              </div>
              <div className="w-full md:w-48 shrink-0">
                <FixDropdown 
                  options={SORT_OPTIONS}
                  value={sortOrder}
                  onChange={setSortOrder}
                />
              </div>
            </div>

            <div className="overflow-x-auto flex-1 border border-gray-100 rounded-2xl mb-4">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Transaction</th>
                    <th className="px-6 py-4 font-medium">Account / Category</th>
                    <th className="px-6 py-4 font-medium text-right">Debit</th>
                    <th className="px-6 py-4 font-medium text-right">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedEntries.map((entry, idx) => {
                    const isPair = idx > 0 && paginatedEntries[idx - 1].transactionId === entry.transactionId;
                    
                    return (
                      <tr 
                        key={entry.id} 
                        className={cn(
                          "hover:bg-gray-50/50 transition-colors",
                          isPair ? "bg-gray-50/30" : "border-t-2 border-gray-100"
                        )}
                      >
                        <td className="px-6 py-4 text-gray-500">
                          {!isPair && entry.date}
                        </td>
                        <td className="px-6 py-4 text-gray-700 text-sm font-medium">
                          {!isPair && entry.transactionTitle}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          <div className={cn("flex items-center", entry.credit > 0 && "ml-8")}>
                            {entry.accountName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {entry.debit > 0 ? (
                            <span className="font-medium text-gray-900">{formatCurrency(entry.debit)}</span>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {entry.credit > 0 ? (
                            <span className="font-medium text-gray-900">{formatCurrency(entry.credit)}</span>
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedEntries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <BookOpen className="w-8 h-8 text-gray-300" />
                          <p>No journal entries found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </main>
      </div>
    </PageLoadingState>
  );
}
