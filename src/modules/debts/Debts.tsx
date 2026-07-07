import React, { useState } from 'react';
import { Plus, Search, HandCoins, ArrowUpRight, ArrowDownRight, Edit2, Trash2, CheckCircle2, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';
import { Debt } from '../../logic/types/debts';
import { useFinance } from '../../logic/context/FinanceContext';
import { useModuleLoading } from '../../logic/hooks/useModuleLoading';
import { PrimaryButton } from '../../ui/components/elements/PrimaryButton';
import FixDropdown from '../../ui/components/elements/FixDropdown';
import Modal from '../../ui/components/common/Modal';
import { cn } from '../../logic/utils/classNames';
import * as TOKENS from '../../ui/styles/tokens';
import { InTableAction } from '../../ui/components/elements/InTableAction';
import { PageLoadingState } from '../../ui/components/common/PageLoadingState';

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Debts/Loans' },
  { value: 'payable', label: 'Payable (Hutang)' },
  { value: 'receivable', label: 'Receivable (Piutang)' },
];

export default function Debts() {
  const loading = useModuleLoading();
  const { debts, addDebt, updateDebt, deleteDebt } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const filteredDebts = debts.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (filterType === 'all' || d.type === filterType)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAdd = () => {
    Swal.fire({
      title: 'Add Debt/Loan',
      html: `
        <div class="flex flex-col gap-4 text-left h-[400px] overflow-y-auto pr-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Debt/Loan Title</label>
            <input id="swal-input-title" class="w-full px-3 py-2 min-h-[44px] text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Car Loan">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name / Institution</label>
            <input id="swal-input-name" class="w-full px-3 py-2 min-h-[44px] text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. John Doe / BCA">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div class="flex p-1 bg-gray-100 rounded-xl">
              <label class="flex-1 cursor-pointer">
                <input type="radio" name="debt_type" value="payable" class="peer sr-only" checked>
                <div class="text-center py-1.5 px-3 text-sm font-medium rounded-lg text-gray-500 peer-checked:bg-white peer-checked:text-gray-900 peer-checked:shadow-sm transition-all">Payable (Hutang)</div>
              </label>
              <label class="flex-1 cursor-pointer">
                <input type="radio" name="debt_type" value="receivable" class="peer sr-only">
                <div class="text-center py-1.5 px-3 text-sm font-medium rounded-lg text-gray-500 peer-checked:bg-white peer-checked:text-gray-900 peer-checked:shadow-sm transition-all">Receivable (Piutang)</div>
              </label>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input id="swal-input-amount" type="number" class="w-full px-3 py-2 min-h-[44px] text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input id="swal-input-duedate" type="date" class="w-full px-3 py-2 min-h-[44px] text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea id="swal-input-desc" rows="2" class="w-full px-3 py-2 min-h-[44px] text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Add some details..."></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const title = (document.getElementById('swal-input-title') as HTMLInputElement).value.trim();
        const name = (document.getElementById('swal-input-name') as HTMLInputElement).value.trim();
        const type = (document.querySelector('input[name="debt_type"]:checked') as HTMLInputElement).value as 'payable' | 'receivable';
        const amount = parseFloat((document.getElementById('swal-input-amount') as HTMLInputElement).value);
        const dueDate = (document.getElementById('swal-input-duedate') as HTMLInputElement).value;
        const description = (document.getElementById('swal-input-desc') as HTMLTextAreaElement).value.trim();
        
        if (!title || !name || isNaN(amount) || amount <= 0 || !dueDate) {
          Swal.showValidationMessage('Please fill all required fields correctly including due date!');
          return false;
        }
        return { title, name, description: description || undefined, type, amount, dueDate, paymentLogs: [] };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        addDebt(result.value);
        Swal.fire('Added!', 'Debt/Loan record has been added.', 'success');
      }
    });
  };

  const handlePay = (debt: Debt) => {
    Swal.fire({
      title: 'Record Payment',
      html: `
        <div class="flex flex-col gap-4 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input id="swal-pay-amount" type="number" max="${debt.amount - debt.paidAmount}" class="w-full px-3 py-2 min-h-[44px] text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
            <input id="swal-pay-date" type="date" value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 min-h-[44px] text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">New Due Date (Optional)</label>
            <input id="swal-pay-duedate" type="date" class="w-full px-3 py-2 min-h-[44px] text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
            <p class="text-xs text-gray-500 mt-1">Leave blank to keep the current due date</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
            <input id="swal-pay-note" type="text" class="w-full px-3 py-2 min-h-[44px] text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. First installment">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Record',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const amt = parseFloat((document.getElementById('swal-pay-amount') as HTMLInputElement).value);
        const date = (document.getElementById('swal-pay-date') as HTMLInputElement).value;
        const newDueDate = (document.getElementById('swal-pay-duedate') as HTMLInputElement).value;
        const note = (document.getElementById('swal-pay-note') as HTMLInputElement).value;
        
        if (isNaN(amt) || amt <= 0 || amt > (debt.amount - debt.paidAmount) || !date) {
          Swal.showValidationMessage('Invalid amount or date');
          return false;
        }
        return { amt, date, newDueDate, note };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { amt, date, newDueDate, note } = result.value;
        const newPaid = debt.paidAmount + amt;
        
        const newLog = {
          id: `log-${Date.now()}`,
          date,
          amount: amt,
          newDueDate: newDueDate || undefined,
          note: note || undefined
        };
        
        const updatedDebt = {
          ...debt,
          paidAmount: newPaid,
          status: newPaid >= debt.amount ? 'paid' : 'active',
          dueDate: newDueDate ? newDueDate : debt.dueDate,
          paymentLogs: [...(debt.paymentLogs || []), newLog]
        };
        
        updateDebt(updatedDebt.id, updatedDebt as Partial<Debt>);
        if (selectedDebt?.id === debt.id) {
          setSelectedDebt(updatedDebt as Debt);
        }
        Swal.fire('Recorded!', 'Payment has been updated.', 'success');
      }
    });
  };

  const handleDelete = (debtId: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteDebt(debtId);
        Swal.fire('Deleted!', 'Record has been deleted.', 'success');
      }
    });
  };

  return (
    <PageLoadingState isLoading={loading}>
      <div className={cn("flex-1 flex flex-col min-h-0 overflow-y-auto", TOKENS.BG_BACKGROUND, TOKENS.PADDING_PAGE)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className={cn("text-2xl md:text-3xl font-bold", TOKENS.TEXT_PRIMARY)}>Debts & Loans</h1>
          <p className={TOKENS.TEXT_SECONDARY}>Manage your payable and receivable accounts</p>
        </div>
        <div className="w-full sm:w-auto">
          <PrimaryButton className="w-full sm:w-auto justify-center min-h-[44px]" icon={<Plus className="w-4 h-4" />} onClick={handleAdd}>
            Add Record
          </PrimaryButton>
        </div>
      </div>

      <div className={cn("p-4 sm:p-6 shadow-sm border flex-1 rounded-3xl", TOKENS.BG_SURFACE, TOKENS.BORDER_LIGHT)}>
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 gap-4">
          <div className="relative flex-1 min-w-[200px] w-full max-w-md flex items-center">
            <Search className="w-5 h-5 absolute left-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 min-h-[44px] rounded-full border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
          </div>
          <div className="w-full md:w-56 shrink-0">
            <FixDropdown 
              options={TYPE_OPTIONS}
              value={filterType}
              onChange={setFilterType}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDebts.map((debt) => (
            <div 
              key={debt.id} 
              onClick={() => {
                setSelectedDebt(debt);
                setIsViewModalOpen(true);
              }}
              className="border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-sm transition-all group flex flex-col gap-4 bg-white cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", 
                    debt.type === 'payable' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
                  )}>
                    {debt.type === 'payable' ? <ArrowDownRight className="w-5 h-5 text-red-600" /> : <ArrowUpRight className="w-5 h-5 text-green-600" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{debt.title}</h3>
                    <p className="text-sm text-gray-500 mb-1">{debt.name}</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-md border font-medium uppercase tracking-wider", 
                      debt.type === 'payable' ? 'text-red-600 bg-red-50 border-red-100' : 'text-green-600 bg-green-50 border-green-100'
                    )}>
                      {debt.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {debt.status === 'active' && (
                    <InTableAction
                      variant="refresh"
                      icon={CheckCircle2}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePay(debt);
                      }}
                      title="Record Payment"
                    />
                  )}
                  <InTableAction
                    variant="delete"
                    icon={Trash2}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(debt.id);
                    }}
                    title="Delete Debt Record"
                  />
                </div>
              </div>
              
              <div className="space-y-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Amount</span>
                  <span className="font-medium">{formatCurrency(debt.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Paid Amount</span>
                  <span className="font-medium text-green-600">{formatCurrency(debt.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-50">
                  <span className="text-gray-600 font-medium">Remaining</span>
                  <span className="font-bold text-gray-900">{formatCurrency(debt.amount - debt.paidAmount)}</span>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div 
                    className={cn("h-1.5 rounded-full", debt.status === 'paid' ? 'bg-green-500' : 'bg-blue-500')} 
                    style={{ width: `${Math.min(100, (debt.paidAmount / debt.amount) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDebts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <HandCoins className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-medium mb-1">No debts or loans found</h3>
            <p className="text-gray-500 text-sm">You're all clear! Add a record if needed.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Debt/Loan Details"
      >
        {selectedDebt && (
          <div className="p-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", 
                  selectedDebt.type === 'payable' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
                )}>
                  {selectedDebt.type === 'payable' ? <ArrowDownRight className="w-6 h-6 text-red-600" /> : <ArrowUpRight className="w-6 h-6 text-green-600" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedDebt.title}</h3>
                  <p className="text-sm font-medium text-gray-700">{selectedDebt.name}</p>
                  <p className="text-sm text-gray-500">{selectedDebt.type === 'payable' ? 'You owe them' : 'They owe you'}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={cn("px-3 py-1 rounded-full text-sm font-medium", 
                  selectedDebt.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                )}>
                  {selectedDebt.status === 'paid' ? 'Settled' : 'Active'}
                </span>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1 justify-end">
                  <Calendar className="w-3.5 h-3.5" /> Due: {selectedDebt.dueDate || 'No due date'}
                </p>
              </div>
            </div>

            {selectedDebt.description && (
              <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedDebt.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedDebt.amount)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Remaining</p>
                <p className={cn("text-lg font-bold", (selectedDebt.amount - selectedDebt.paidAmount) === 0 ? "text-green-600" : "text-gray-900")}>
                  {formatCurrency(selectedDebt.amount - selectedDebt.paidAmount)}
                </p>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">Payment History</h4>
              {selectedDebt.status === 'active' && (
                <PrimaryButton 
                  onClick={() => handlePay(selectedDebt)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                  className="py-1.5 px-3 text-sm"
                >
                  Record Payment
                </PrimaryButton>
              )}
            </div>

            {(!selectedDebt.paymentLogs || selectedDebt.paymentLogs.length === 0) ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                <p className="text-gray-500 text-sm">No payments recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDebt.paymentLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{formatCurrency(log.amount)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{log.date}</p>
                    </div>
                    <div className="text-right">
                      {log.note && <p className="text-sm text-gray-600 mb-0.5">{log.note}</p>}
                      {log.newDueDate && (
                        <p className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                          Due updated: {log.newDueDate}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
    </PageLoadingState>
  );
}
