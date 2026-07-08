import React, { useState, useEffect } from 'react';
import { useFinance } from '../../logic/context/FinanceContext';
import { useBudgets } from '../../logic/hooks/useBudgets';
import { PrimaryButton } from '../../ui/components/elements/PrimaryButton';
import { Plus, Target, TrendingUp, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { RevenuePlan as RevenuePlanType, Activity } from '../../logic/types/finance';
import { RevenuePlanTable } from './components/RevenuePlanTable';
import { RevenuePlanForm } from './components/RevenuePlanForm';
import TransactionForm from '../transactions/components/TransactionForm';
import Modal from '../../ui/components/common/Modal';
import { PageLoadingState } from '../../ui/components/common/PageLoadingState';

export default function RevenuePlan() {
  const { 
    addActivity, 
    revenuePlans, 
    addRevenuePlan, 
    updateRevenuePlan, 
    deleteRevenuePlan, 
    loading,
    fetchBudgets
  } = useFinance();
  
  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);
  
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isLogIncomeModalOpen, setIsLogIncomeModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<RevenuePlanType | null>(null);
  const [targetPlanForIncome, setTargetPlanForIncome] = useState<RevenuePlanType | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const filteredPlans = revenuePlans.filter(p => p.month === currentMonth && p.year === currentYear);

  const totalTarget = filteredPlans.reduce((sum, p) => sum + p.target, 0);
  const totalAchieved = filteredPlans.reduce((sum, p) => sum + p.achieved, 0);
  const achievementRate = totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0;

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

  const handleAddClick = () => {
    setEditingPlan(null);
    setIsPlanModalOpen(true);
  };

  const handleEditClick = (plan: RevenuePlanType) => {
    setEditingPlan(plan);
    setIsPlanModalOpen(true);
  };
  
  const handleAddIncomeClick = (plan: RevenuePlanType) => {
    setTargetPlanForIncome(plan);
    setIsLogIncomeModalOpen(true);
  };

  const handleIncomeSubmit = async (data: Partial<Activity>) => {
    if (data.type === 'income') {
      try {
        await addActivity({
          orderId: `#${Math.floor(Math.random() * 100000)}`,
          title: data.title || 'Log Income',
          category: data.category || 'Revenue',
          price: data.price || 0,
          status: 'Completed',
          date: data.date || new Date().toISOString().split('T')[0],
          datetime: data.datetime || new Date().toISOString(),
          type: 'income',
          sourceAccountId: data.sourceAccountId,
          description: data.description,
        });

        // Update the achieved progress on the revenue plan in the database
        if (targetPlanForIncome) {
          const newAchieved = targetPlanForIncome.achieved + (data.price || 0);
          let status: 'On Track' | 'Behind' | 'Exceeded' = 'On Track';
          if (newAchieved >= targetPlanForIncome.target) {
            status = 'Exceeded';
          } else if (newAchieved < targetPlanForIncome.target * 0.5) {
            status = 'Behind';
          }
          await updateRevenuePlan(targetPlanForIncome.id, {
            achieved: newAchieved,
            status
          });
        }
      } catch (err) {
        console.error('Failed to log income transaction and update revenue plan:', err);
      }
    }
    setIsLogIncomeModalOpen(false);
    setTargetPlanForIncome(null);
  };

  return (
    <PageLoadingState isLoading={loading}>
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-bg-sidebar p-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-lg">
        <div>
          <p className="text-text-secondary">Set and monitor your income targets</p>
        </div>
        <div className="w-full sm:w-auto">
          <PrimaryButton className="w-full sm:w-auto justify-center min-h-[44px]" icon={<Plus className="w-4 h-4" />} onClick={handleAddClick}>
            New Revenue Plan
          </PrimaryButton>
        </div>
      </div>

      <div className="flex items-center gap-md mb-lg overflow-x-auto hide-scrollbar pt-1 pb-3 flex-shrink-0">
        <button 
          onClick={() => changeMonth(-1)}
          className="p-sm hover:bg-bg-main rounded-lg border border-transparent hover:border-border-main transition-all min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-text-muted" />
        </button>
        <div className="bg-bg-main px-lg py-sm min-h-[44px] rounded-lg border border-border-main shadow-sm flex items-center gap-sm">
          <span className="font-semibold text-text-primary whitespace-nowrap">{months[currentMonth - 1]}</span>
          <span className="font-medium text-text-muted whitespace-nowrap">{currentYear}</span>
        </div>
        <button 
          onClick={() => changeMonth(1)}
          className="p-sm hover:bg-bg-main rounded-lg border border-transparent hover:border-border-main transition-all min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
        >
          <ChevronRight className="w-5 h-5 text-text-muted" />
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-lg mb-lg">
        <div className="bg-bg-main p-lg rounded-lg border border-border-main shadow-sm">
          <div className="flex items-center gap-sm mb-sm">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-primary-main">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Monthly Target</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Rp {totalTarget.toLocaleString('id-ID')}</h2>
          <div className="mt-sm text-xs text-text-muted">Total across all income sources</div>
        </div>
        
        <div className="bg-bg-main p-lg rounded-lg border border-border-main shadow-sm">
          <div className="flex items-center gap-sm mb-sm">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Total Achieved</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Rp {totalAchieved.toLocaleString('id-ID')}</h2>
          <div className="mt-sm text-xs text-text-muted">Achievement rate: {Math.round(achievementRate)}%</div>
        </div>

        <div className="bg-bg-main p-lg rounded-lg border border-border-main shadow-sm">
          <div className="flex items-center gap-sm mb-sm">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-text-secondary">Remaining</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary">
            Rp {Math.max(0, totalTarget - totalAchieved).toLocaleString('id-ID')}
          </h2>
          <div className="mt-sm text-xs text-text-muted">To reach your monthly goals</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-md">
          <h3 className="text-lg font-semibold text-text-primary">Target Progress</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          <RevenuePlanTable 
            revenuePlans={revenuePlans}
            deleteRevenuePlan={deleteRevenuePlan}
            onEdit={handleEditClick} 
            onAddIncome={handleAddIncomeClick} 
            month={currentMonth}
            year={currentYear}
          />
        </div>
      </div>

      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title={editingPlan ? 'Edit Revenue Plan' : 'Add New Revenue Plan'}
      >
        <RevenuePlanForm 
          editPlan={editingPlan} 
          onClose={() => setIsPlanModalOpen(false)} 
        />
      </Modal>

      <Modal
        isOpen={isLogIncomeModalOpen}
        onClose={() => setIsLogIncomeModalOpen(false)}
        title="Log Income"
      >
        {targetPlanForIncome && (
          <TransactionForm
            fixedType="income"
            prefilledCategory={targetPlanForIncome.category}
            onSubmit={handleIncomeSubmit}
            onCancel={() => setIsLogIncomeModalOpen(false)}
          />
        )}
      </Modal>
    </div>
    </PageLoadingState>
  );
}
