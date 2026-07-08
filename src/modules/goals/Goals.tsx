import React, { useState, useEffect } from 'react';
import { Plus, Search, Target, TrendingUp, Calendar } from 'lucide-react';
import { useFinance } from '../../logic/context/FinanceContext';
import { useModuleLoading } from '../../logic/hooks/useModuleLoading';
import { Goal } from '../../logic/types/finance';
import GoalCard from './components/GoalCard';
import GoalForm from './components/GoalForm';
import Modal from '../../ui/components/common/Modal';
import { PrimaryButton } from '../../ui/components/elements/PrimaryButton';
import { cn } from '../../logic/utils/classNames';
import * as TOKENS from '../../ui/styles/tokens';
import { PageLoadingState } from '../../ui/components/common/PageLoadingState';

export default function Goals() {
  const loading = useModuleLoading();
  const { goals, addGoal, updateGoal, deleteGoal, fetchGoals } = useFinance();
  
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filteredGoals = goals.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || g.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const averageProgress = goals.length > 0 ? (totalSaved / (totalTarget || 1)) * 100 : 0;

  const handleAddClick = () => {
    setSelectedGoal(null);
    setIsFormOpen(true);
  };

  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsFormOpen(true);
  };

  const handleDelete = (goal: Goal) => {
    import('sweetalert2').then((Swal) => {
      Swal.default.fire({
        title: 'Are you sure?',
        text: `You want to delete the goal "${goal.name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#EF4444',
        confirmButtonText: 'Yes, delete it!',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteGoal(goal.id);
            Swal.default.fire('Deleted!', 'Goal has been deleted.', 'success');
          } catch (err) {
            console.error(err);
            Swal.default.fire('Error', 'Failed to delete goal', 'error');
          }
        }
      });
    });
  };

  const handleFormSubmit = async (data: Partial<Goal>) => {
    try {
      if (selectedGoal) {
        await updateGoal(selectedGoal.id, data as any);
        import('sweetalert2').then((Swal) => {
          Swal.default.fire('Saved!', 'Goal has been updated.', 'success');
        });
      } else {
        await addGoal(data as any);
        import('sweetalert2').then((Swal) => {
          Swal.default.fire('Created!', 'New goal has been created.', 'success');
        });
      }
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      import('sweetalert2').then((Swal) => {
        Swal.default.fire('Error', 'Failed to save goal', 'error');
      });
    }
  };

  return (
    <PageLoadingState isLoading={loading}>
      <div className={cn("flex-1 flex flex-col min-h-0 overflow-y-auto", "bg-bg-sidebar p-lg")}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-lg">
          <div>
            <p className="text-text-secondary">Track and achieve your financial targets</p>
          </div>
          <div className="w-full sm:w-auto">
            <PrimaryButton className="w-full sm:w-auto justify-center min-h-[44px]" icon={<Plus className="w-4 h-4" />} onClick={handleAddClick}>
              Create New Goal
            </PrimaryButton>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-lg mb-lg">
          <div className="bg-bg-main p-lg rounded-lg border border-border-main shadow-sm">
            <div className="flex items-center gap-sm mb-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-text-secondary">Total Targets</span>
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Rp {totalTarget.toLocaleString('id-ID')}</h2>
            <div className="mt-sm text-xs text-text-muted">Across {goals.length} active goals</div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-500">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total Saved</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Rp {totalSaved.toLocaleString('id-ID')}</h2>
            <div className="mt-2 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full" style={{ width: `${averageProgress}%` }}></div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-gray-500">Achieved Goals</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{goals.filter(g => g.status === 'Achieved').length}</h2>
            <div className="mt-2 text-xs text-gray-400">Keep up the good work!</div>
          </div>
        </div>

        {/* Filters & Grid */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search goals..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full pl-9 pr-4 py-2 min-h-[44px] border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500",
                TOKENS.RADIUS_PILL
              )}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-gray-400 mr-2 whitespace-nowrap">FILTER:</span>
            {['All', 'In Progress', 'Achieved', 'On Hold'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-4 py-2 min-h-[44px] rounded-full text-xs font-bold transition-all whitespace-nowrap",
                  filterStatus === status 
                    ? "bg-gray-900 text-white shadow-md" 
                    : "bg-white text-gray-600 border border-gray-100 hover:border-gray-300"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8">
            {filteredGoals.map(goal => (
              <div key={goal.id}>
                <GoalCard 
                  goal={goal} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-12">
            <Target className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">No goals found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Modal */}
        <Modal 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)}
          title={selectedGoal ? "Edit Goal" : "Create New Goal"}
        >
          <GoalForm 
            initialData={selectedGoal} 
            onSubmit={handleFormSubmit} 
            onCancel={() => setIsFormOpen(false)} 
          />
        </Modal>
      </div>
    </PageLoadingState>
  );
}
