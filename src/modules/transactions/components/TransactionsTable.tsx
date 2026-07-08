import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { Transaction } from '../../../logic/types/transactions';
import { cn } from '../../../logic/utils/classNames';
import * as TOKENS from '../../../ui/styles/tokens';
import { Pagination } from '../../../ui/components/common/Pagination';
import { useFinance } from '../../../logic/context/FinanceContext';
import { InTableAction } from '../../../ui/components/elements/InTableAction';
import Swal from 'sweetalert2';

interface TransactionsTableProps {
  transactions: Transaction[];
  selectedIds: string[];
  handleSelect: (id: string) => void;
  handleSelectAll: () => void;
  handleSort: (field: any) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc' | null;
  onRowClick: (activity: Transaction) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  selectedIds,
  handleSelect,
  handleSelectAll,
  handleSort,
  sortField,
  sortDirection,
  onRowClick,
  currentPage,
  totalPages,
  onPageChange,
  onDelete,
}) => {
  const { familyMembers } = useFinance();

  const getPicName = (id?: string) => {
    if (!id) return '-';
    if (id === '00000000-0000-4000-8000-000000000000') return 'Super Admin';
    
    const member = familyMembers.find(m => m.id === id);
    if (member) return member.name;
    
    return 'User';
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field || !sortDirection) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-300 ml-1 inline" />;
    if (sortDirection === 'asc') return <ArrowUp className="w-3.5 h-3.5 text-green-500 ml-1 inline" />;
    return <ArrowDown className="w-3.5 h-3.5 text-green-500 ml-1 inline" />;
  };

  // Since we are using server-side pagination to save Supabase egress,
  // the transactions array is already filtered and paginated for the current page.
  const paginatedTransactions = transactions;

  return (
    <div className="flex flex-col">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-100">
              <th className="py-4 px-4 font-medium w-12">
                <input
                  type="checkbox"
                  className="rounded text-green-500 focus:ring-green-500"
                  checked={selectedIds.length === transactions.length && transactions.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="py-4 px-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('title')}>
                Transaction Details <SortIcon field="title" />
              </th>
              <th className="py-4 px-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('category')}>
                Category <SortIcon field="category" />
              </th>
              <th className="py-4 px-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('price')}>
                Amount <SortIcon field="price" />
              </th>
              <th className="py-4 px-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('status')}>
                Status <SortIcon field="status" />
              </th>
              <th className="py-4 px-4 font-medium cursor-pointer hover:text-gray-700" onClick={() => handleSort('date')}>
                Date <SortIcon field="date" />
              </th>
              <th className="py-4 px-4 font-medium">PIC</th>
              <th className="py-4 px-4 font-medium w-12"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-500">
                  No transactions found matching your criteria.
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((activity) => (
                <tr key={activity.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => onRowClick(activity)}>
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      className="rounded text-green-500 focus:ring-green-500"
                      checked={selectedIds.includes(activity.id)}
                      onChange={() => handleSelect(activity.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn("font-semibold text-sm", activity.type === 'expense' ? TOKENS.TEXT_EXPENSE : activity.type === 'income' ? TOKENS.TEXT_INCOME : TOKENS.TEXT_TRANSFER)}>{activity.title}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                      {activity.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-sm">
                    <span className={
                      activity.type === 'income' ? 'text-green-600' :
                      activity.type === 'transfer' ? 'text-gray-900' :
                      'text-red-500'
                    }>
                      {activity.type === 'income' ? '+' : activity.type === 'transfer' ? '' : '-'}
                      Rp {activity.price.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit
                      ${activity.status === 'Completed' ? 'bg-green-50 text-green-600' :
                        activity.status === 'Pending' ? 'bg-rose-50 text-rose-600' :
                        'bg-amber-50 text-amber-600'}
                    `}>
                      <div className={`w-1.5 h-1.5 rounded-full
                        ${activity.status === 'Completed' ? 'bg-green-500' :
                          activity.status === 'Pending' ? 'bg-rose-500' :
                          'bg-amber-500'}
                      `}></div>
                      {activity.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 whitespace-nowrap">{activity.date}</td>
                  <td className="py-4 px-4 text-xs text-gray-400 font-medium whitespace-nowrap">
                    {getPicName(activity.updatedBy)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <InTableAction
                        variant="delete"
                        icon={Trash2}
                        onClick={(e) => {
                          e.stopPropagation();
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
                              onDelete(activity.id);
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View (Card List) */}
      <div className="md:hidden flex flex-col gap-4">
        {paginatedTransactions.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            No transactions found.
          </div>
        ) : (
          paginatedTransactions.map((activity) => (
            <div 
              key={activity.id} 
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm active:bg-gray-50 transition-colors"
              onClick={() => onRowClick(activity)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="-ml-2 -mt-2 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <input
                      type="checkbox"
                      className="rounded text-green-500 focus:ring-green-500 w-4 h-4"
                      checked={selectedIds.includes(activity.id)}
                      onChange={() => handleSelect(activity.id)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className={cn("font-bold text-sm leading-tight mb-1", 
                      activity.type === 'expense' ? TOKENS.TEXT_EXPENSE : 
                      activity.type === 'income' ? TOKENS.TEXT_INCOME : 
                      TOKENS.TEXT_TRANSFER
                    )}>
                      {activity.title}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 w-fit">
                      {activity.category}
                    </span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className={cn("font-bold text-sm",
                    activity.type === 'income' ? 'text-green-600' :
                    activity.type === 'transfer' ? 'text-gray-900' :
                    'text-red-500'
                  )}>
                    {activity.type === 'income' ? '+' : activity.type === 'transfer' ? '' : '-'}
                    Rp {activity.price.toLocaleString('id-ID')}
                  </span>
                  <div className="flex flex-col items-end gap-0.5 mt-1">
                    <span className="text-[10px] text-gray-400">{activity.date}</span>
                    {activity.updatedBy && (
                      <span className="text-[9px] text-gray-300 font-medium">PIC: {getPicName(activity.updatedBy)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full
                  ${activity.status === 'Completed' ? 'bg-green-50 text-green-600' :
                    activity.status === 'Pending' ? 'bg-rose-50 text-rose-600' :
                    'bg-amber-50 text-amber-600'}
                `}>
                  <div className={`w-1 h-1 rounded-full
                    ${activity.status === 'Completed' ? 'bg-green-500' :
                      activity.status === 'Pending' ? 'bg-rose-500' :
                      'bg-amber-500'}
                  `}></div>
                  {activity.status}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
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
                          onDelete(activity.id);
                          Swal.fire({
                            title: 'Terhapus!',
                            text: 'Transaksi telah berhasil dihapus.',
                            icon: 'success',
                            confirmButtonColor: '#22c55e'
                          });
                        }
                      });
                    }}
                    className="p-2 sm:p-1.5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
};
