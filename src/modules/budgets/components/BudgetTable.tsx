import React, { useState } from 'react';
import { Edit2, Trash2, Copy, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import * as TOKENS from '../../../ui/styles/tokens';
import { cn } from '../../../logic/utils/classNames';
import { Budget } from '../../../logic/types/finance';
import { InTableAction } from '../../../ui/components/elements/InTableAction';
import { useBudgets } from '../../../logic/hooks/useBudgets';
import { useFinance } from '../../../logic/context/FinanceContext';
import InputPrice from '../../../ui/components/elements/InputPrice';

interface BudgetTableProps {
  onRowClick?: (budget: Budget) => void;
  onQuickRecord: (budget: Budget) => void;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
  onDuplicate: (budget: Budget) => void;
  searchTerm?: string;
  month: number;
  year: number;
  budgets: Budget[];
}

export default function BudgetTable({ onRowClick, onQuickRecord, onEdit, onDelete, onDuplicate, searchTerm = '', month, year, budgets }: BudgetTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanAmount, setNewPlanAmount] = useState<number>(0);
  
  const { addExpensePlan, updateExpensePlan, deleteExpensePlan } = useBudgets();
  const { activities } = useFinance();

  const filteredBudgets = budgets.filter(b => {
    const matchesPeriod = b.month === month && b.year === year;
    const matchesSearch = b.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPeriod && matchesSearch;
  });
  
  const handleToggleExpand = (budget: Budget) => {
    if (expandedId === budget.id) {
      setExpandedId(null);
    } else {
      setExpandedId(budget.id);
      setNewPlanName('');
      setNewPlanAmount(0);
    }
  };

  const handleAddPlan = async (budgetId: string) => {
    if (!newPlanName || !newPlanAmount) return;
    await addExpensePlan({
      budgetId,
      name: newPlanName,
      estimatedAmount: newPlanAmount,
      isCompleted: false
    });
    setNewPlanName('');
    setNewPlanAmount(0);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={cn("text-sm border-b", TOKENS.TEXT_MUTED, TOKENS.BORDER_DEFAULT)}>
            <th className="py-4 px-4 font-normal w-10"></th>
            <th className="py-4 px-4 font-normal">Category</th>
            <th className="py-4 px-4 font-normal text-right">Limit</th>
            <th className="py-4 px-4 font-normal text-right">Spent</th>
            <th className="py-4 px-4 font-normal text-right">Remaining</th>
            <th className="py-4 px-4 font-normal text-center">Status</th>
            <th className="py-4 px-4 font-normal w-40 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBudgets.length > 0 ? (
            filteredBudgets.map((budget) => (
              <React.Fragment key={budget.id}>
                <tr className={cn("border-b hover:bg-gray-50/50 transition-colors cursor-pointer group", TOKENS.BORDER_LIGHT)} onClick={() => handleToggleExpand(budget)}>
                  <td className="py-4 px-4 text-gray-400">
                    {expandedId === budget.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </td>
                  <td className={cn("py-4 px-4 text-sm font-medium whitespace-nowrap", TOKENS.TEXT_PRIMARY)}>{budget.category}</td>
                  <td className={cn("py-4 px-4 text-sm text-right whitespace-nowrap", TOKENS.TEXT_SECONDARY)}>Rp {budget.limit.toLocaleString('id-ID')}</td>
                  <td className={cn("py-4 px-4 text-sm font-medium text-right whitespace-nowrap", TOKENS.TEXT_PRIMARY)}>Rp {budget.spent.toLocaleString('id-ID')}</td>
                  <td className="py-4 px-4 text-sm text-right whitespace-nowrap">
                    <span className={budget.limit - budget.spent < 0 ? TOKENS.TEXT_EXPENSE : TOKENS.TEXT_PRIMARY}>
                        Rp {(budget.limit - budget.spent).toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium",
                        budget.status === 'On Track' ? 'bg-green-50 text-green-600' : 
                        budget.status === 'Warning' ? 'bg-yellow-50 text-yellow-600' : 
                        'bg-red-50 text-red-600'
                    )}>
                        {budget.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <InTableAction
                        variant="custom"
                        icon={Plus}
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickRecord(budget);
                        }}
                        title="Quick Record Expense"
                      />
                      <InTableAction
                        variant="refresh"
                        icon={Copy}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(budget);
                        }}
                        title="Duplicate to Next Month"
                      />
                      <InTableAction
                        variant="edit"
                        icon={Edit2}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(budget);
                        }}
                        title="Edit Budget"
                      />
                      <InTableAction
                        variant="delete"
                        icon={Trash2}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(budget);
                        }}
                        title="Delete Budget"
                      />
                    </div>
                  </td>
                </tr>
                {expandedId === budget.id && (
                  <tr className="bg-gray-50/30 border-b">
                    <td colSpan={7} className="p-4 sm:p-6">
                      <div className="ml-10">
                        <h4 className="text-sm font-medium text-gray-700 mb-4">Expenses Plan</h4>
                        
                        {budget.expensePlans && budget.expensePlans.length > 0 ? (
                          <div className="space-y-2 mb-4">
                            {budget.expensePlans.map(plan => {
                              const spent = activities
                                .filter(a => a.expensePlanId === plan.id && a.type === 'expense')
                                .reduce((sum, a) => sum + a.price, 0);
                                
                              return (
                                <div key={plan.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                                  <div className="flex flex-col flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-800">{plan.name}</span>
                                      {spent >= plan.estimatedAmount && plan.estimatedAmount > 0 && (
                                        <span className="px-1.5 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded">Completed</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-gray-500">Est: Rp {plan.estimatedAmount.toLocaleString('id-ID')}</span>
                                      <span className="text-xs text-gray-300">•</span>
                                      <span className={cn("text-xs font-medium", spent > plan.estimatedAmount ? "text-red-500" : "text-gray-600")}>
                                        Spent: Rp {spent.toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => deleteExpensePlan(plan.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic mb-4">No expense plans yet. Add one to trace your specific spending intents.</p>
                        )}
                        
                        <div className="flex items-center gap-3 bg-white p-3 border border-gray-200 rounded-lg">
                          <input 
                            type="text"
                            placeholder="Plan name (e.g. Electric Bill)"
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={newPlanName}
                            onChange={(e) => setNewPlanName(e.target.value)}
                          />
                          <div className="w-48">
                            <InputPrice 
                              name="newPlanAmount"
                              value={newPlanAmount}
                              onChange={(_, val) => setNewPlanAmount(val)}
                              placeholder="Amount"
                            />
                          </div>
                          <button 
                            onClick={() => handleAddPlan(budget.id)}
                            disabled={!newPlanName || !newPlanAmount}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          ) : (
            <tr>
              <td colSpan={7} className={cn("py-12 text-center italic", TOKENS.TEXT_MUTED)}>No budgets found for this period</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
