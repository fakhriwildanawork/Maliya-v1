import React, { useState } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, Target, TrendingDown, Wallet, Copy } from 'lucide-react';
import BudgetTable from './components/BudgetTable';
import { PrimaryButton } from '../../ui/components/elements/PrimaryButton';
import Modal from '../../ui/components/common/Modal';
import BudgetForm from './components/BudgetForm';
import TransactionForm from '../transactions/components/TransactionForm';
import { Budget, Activity } from '../../logic/types/finance';
import * as TOKENS from '../../ui/styles/tokens';
import { cn } from '../../logic/utils/classNames';
import { useFinance } from '../../logic/context/FinanceContext';
import { useModuleLoading } from '../../logic/hooks/useModuleLoading';
import { useBudgets } from '../../logic/hooks/useBudgets';
import { PageLoadingState } from '../../ui/components/common/PageLoadingState';

export default function Budgets() {
  const loading = useModuleLoading();
  const { 
    budgets, 
    addBudget, 
    updateBudget, 
    deleteBudget, 
    addActivity,
  } = useFinance();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickRecordData, setQuickRecordData] = useState<Partial<Activity> | null>(null);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleAddBudget = () => {
    setSelectedBudget(null);
    setIsFormOpen(true);
  };

  const handleRowClick = (budget: Budget) => {
    // This is now used for Edit
    setSelectedBudget(budget);
    setIsFormOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsFormOpen(true);
  };

  const handleDeleteBudget = (budget: Budget) => {
    import('sweetalert2').then((Swal) => {
      Swal.default.fire({
        title: 'Are you sure?',
        text: `You want to delete the budget for ${budget.category}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#EF4444',
        confirmButtonText: 'Yes, delete it!',
      }).then((result) => {
        if (result.isConfirmed) {
          deleteBudget(budget.id);
          Swal.default.fire(
            'Deleted!',
            'The budget has been deleted.',
            'success'
          );
        }
      });
    });
  };

  const handleQuickRecord = (budget: Budget) => {
    // Set date to current month/year but keeping day as today if possible
    const date = new Date();
    date.setFullYear(budget.year);
    date.setMonth(budget.month - 1);
    
    setQuickRecordData({
      category: budget.category,
      type: 'expense',
      datetime: date.toISOString().slice(0, 16),
    });
    setIsTransactionFormOpen(true);
  };

  const handleFormSubmit = async (data: Partial<Budget>) => {
    if (selectedBudget) {
      await updateBudget(selectedBudget.id, data);
    } else {
      await addBudget({ 
        category: data.category || '', 
        limit: data.limit || 0,
        spent: data.spent || 0,
        month: data.month || currentMonth, 
        year: data.year || currentYear,
        status: data.status || 'On Track'
      });
    }
    setIsFormOpen(false);
  };

  const handleTransactionSubmit = (data: Partial<Activity>) => {
    addActivity(data);
    setIsTransactionFormOpen(false);
  };

  const changeMonth = (delta: number) => {
    let nextMonth = currentMonth + delta;
    let nextYear = currentYear;

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    } else if (nextMonth < 1) {
      nextMonth = 12;
      nextYear--;
    }

    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
  };

  const filteredBudgets = budgets.filter(
    (b) => b.month === currentMonth && b.year === currentYear
  );

  const handleDuplicate = (budgetToDuplicate: Budget) => {
    // Current period logic for duplicate
    const dateNow = new Date();
    const actualCurrentMonth = dateNow.getMonth() + 1;
    const actualCurrentYear = dateNow.getFullYear();

    let defaultMonth = actualCurrentMonth;
    let defaultYear = actualCurrentYear;

    if (defaultMonth === budgetToDuplicate.month && defaultYear === budgetToDuplicate.year) {
      defaultMonth++;
      if (defaultMonth > 12) {
        defaultMonth = 1;
        defaultYear++;
      }
    }

    import('sweetalert2').then((Swal) => {
      Swal.default.fire({
        title: 'Duplicate Budget',
        html: `
          <div class="text-left mt-4">
            <p class="text-sm text-gray-600 mb-4">Select target period for <strong>${budgetToDuplicate.category}</strong> budget:</p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select id="swal-dup-month" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                  ${months.map((m, i) => `<option value="${i + 1}" ${i + 1 === defaultMonth ? 'selected' : ''}>${m}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input id="swal-dup-year" type="number" value="${defaultYear}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              </div>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Duplicate',
        preConfirm: () => {
          const m = parseInt((document.getElementById('swal-dup-month') as HTMLSelectElement).value);
          const y = parseInt((document.getElementById('swal-dup-year') as HTMLInputElement).value);
          
          if (isNaN(y) || y < 2000 || y > 2100) {
            Swal.default.showValidationMessage('Please enter a valid year');
            return false;
          }
          
          return { targetMonth: m, targetYear: y };
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          const { targetMonth, targetYear } = result.value;
          
          const exists = budgets.find(b => b.category === budgetToDuplicate.category && b.month === targetMonth && b.year === targetYear);
          
          if (exists) {
            Swal.default.fire('Already Exists', `Budget for ${budgetToDuplicate.category} already exists in ${months[targetMonth - 1]} ${targetYear}.`, 'warning');
            return;
          }

          addBudget({
            category: budgetToDuplicate.category,
            limit: budgetToDuplicate.limit,
            spent: 0,
            month: targetMonth,
            year: targetYear,
            status: 'On Track'
          });
          
          Swal.default.fire('Duplicated!', `${budgetToDuplicate.category} budget copied to ${months[targetMonth - 1]} ${targetYear}.`, 'success');
        }
      });
    });
  };

  const totalBudget = filteredBudgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = filteredBudgets.reduce((sum, b) => sum + b.spent, 0);
  const remainingBudget = totalBudget - totalSpent;

  const initialLoading = false;

  return (
    <PageLoadingState isLoading={loading}>
    <div className={cn("flex-1 flex flex-col min-h-0 overflow-y-auto", TOKENS.BG_BACKGROUND, TOKENS.PADDING_PAGE)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className={cn("text-2xl md:text-3xl font-bold", TOKENS.TEXT_PRIMARY)}>Budgets</h1>
          <p className={TOKENS.TEXT_SECONDARY}>Manage your periodic spending limits</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <PrimaryButton className="w-full sm:w-auto justify-center min-h-[44px]" icon={<Plus className="w-4 h-4" />} onClick={handleAddBudget}>
            Add Budget
          </PrimaryButton>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6 overflow-x-auto hide-scrollbar pt-1 pb-3 flex-shrink-0">
        <button 
          onClick={() => changeMonth(-1)}
          className="p-2 min-h-[44px] min-w-[44px] hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className={cn("bg-white px-6 py-2 min-h-[44px] rounded-2xl border shadow-sm flex items-center gap-2", TOKENS.BORDER_DEFAULT)}>
          <span className={cn("font-semibold whitespace-nowrap", TOKENS.TEXT_PRIMARY)}>{months[currentMonth - 1]}</span>
          <span className={cn("font-medium whitespace-nowrap", TOKENS.TEXT_MUTED)}>{currentYear}</span>
        </div>
        <button 
          onClick={() => changeMonth(1)}
          className="p-2 min-h-[44px] min-w-[44px] hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all flex items-center justify-center flex-shrink-0"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-lg mb-lg">
        <div className="bg-bg-main p-lg rounded-lg border border-border-main shadow-sm">
          <div className="flex items-center gap-md mb-sm">
            <div className="p-sm bg-blue-50 text-blue-600 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-text-secondary">Total Budget</h3>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            Rp {totalBudget.toLocaleString('id-ID')}
          </p>
        </div>
        
        <div className="bg-bg-main p-lg rounded-lg border border-border-main shadow-sm">
          <div className="flex items-center gap-md mb-sm">
            <div className="p-sm bg-red-50 text-red-600 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-text-secondary">Total Spent</h3>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            Rp {totalSpent.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="bg-bg-main p-lg rounded-lg border border-border-main shadow-sm">
          <div className="flex items-center gap-md mb-sm">
            <div className="p-sm bg-purple-50 text-purple-600 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-text-secondary">Remaining Budget</h3>
          </div>
          <div className="flex items-center gap-sm">
            <p className="text-2xl font-bold text-text-primary">
              Rp {remainingBudget.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      <div className={cn("p-4 sm:p-6 shadow-sm border flex-1 flex flex-col", TOKENS.BG_SURFACE, TOKENS.RADIUS_CARD, TOKENS.BORDER_LIGHT)}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className={cn("font-semibold text-lg", TOKENS.TEXT_PRIMARY)}>Active Budgets</h3>
          <div className="relative w-full sm:w-auto min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search budgets" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full pl-9 pr-4 py-2 min-h-[44px] border text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500",
                TOKENS.RADIUS_PILL,
                TOKENS.BORDER_DEFAULT
              )}
            />
          </div>
        </div>
        <BudgetTable 
          onRowClick={handleQuickRecord} 
          onQuickRecord={handleQuickRecord}
          onEdit={handleEditBudget}
          onDelete={handleDeleteBudget}
          onDuplicate={handleDuplicate}
          searchTerm={searchTerm}
          month={currentMonth} 
          year={currentYear}
          budgets={budgets} 
        />
      </div>

      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        title={selectedBudget ? "Edit Budget" : "Add New Budget"}
      >
        <BudgetForm 
          initialData={selectedBudget} 
          onSubmit={handleFormSubmit} 
          onCancel={() => setIsFormOpen(false)} 
        />
      </Modal>

      <Modal
        isOpen={isTransactionFormOpen}
        onClose={() => setIsTransactionFormOpen(false)}
        title="Quick Record Expense"
      >
        <TransactionForm 
          initialData={quickRecordData as Activity}
          fixedType="expense"
          onSubmit={handleTransactionSubmit}
          onCancel={() => setIsTransactionFormOpen(false)}
        />
      </Modal>
    </div>
    </PageLoadingState>
  );
}
