import React, { useState } from 'react';
import { RevenuePlan } from '../../../logic/types/finance';
import { cn } from '../../../logic/utils/classNames';
import { Edit2, Trash2, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { InTableAction } from '../../../ui/components/elements/InTableAction';
import { useBudgets } from '../../../logic/hooks/useBudgets';
import { useFinance } from '../../../logic/context/FinanceContext';
import InputPrice from '../../../ui/components/elements/InputPrice';

interface RevenuePlanTableProps {
  revenuePlans: RevenuePlan[];
  deleteRevenuePlan: (id: string) => Promise<void>;
  onEdit: (plan: RevenuePlan) => void;
  onAddIncome: (plan: RevenuePlan) => void;
  month: number;
  year: number;
}

export function RevenuePlanTable({ revenuePlans, deleteRevenuePlan, onEdit, onAddIncome, month, year }: RevenuePlanTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanAmount, setNewPlanAmount] = useState<number>(0);

  const { addIncomePlan, deleteIncomePlan } = useBudgets();
  const { activities } = useFinance();

  const filteredPlans = revenuePlans.filter(p => p.month === month && p.year === year);

  const getStatusColor = (status: RevenuePlan['status']) => {
    switch (status) {
      case 'Exceeded': return 'text-green-600 bg-green-50';
      case 'On Track': return 'text-blue-600 bg-blue-50';
      case 'Behind': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleToggleExpand = (plan: RevenuePlan) => {
    if (expandedId === plan.id) {
      setExpandedId(null);
    } else {
      setExpandedId(plan.id);
      setNewPlanName('');
      setNewPlanAmount(0);
    }
  };

  const handleAddPlan = async (revenuePlanId: string) => {
    if (!newPlanName || !newPlanAmount) return;
    await addIncomePlan({
      revenuePlanId,
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
            <tr className="bg-bg-sidebar border-b border-border-main">
              <th className="py-4 px-4 font-semibold text-sm text-text-secondary w-10"></th>
              <th className="px-lg py-md text-sm font-semibold text-text-secondary whitespace-nowrap">Category</th>
              <th className="px-lg py-md text-sm font-semibold text-text-secondary whitespace-nowrap">Target</th>
              <th className="px-lg py-md text-sm font-semibold text-text-secondary whitespace-nowrap">Achieved</th>
              <th className="px-lg py-md text-sm font-semibold text-text-secondary whitespace-nowrap">Progress</th>
              <th className="px-lg py-md text-sm font-semibold text-text-secondary text-center whitespace-nowrap">Status</th>
              <th className="px-lg py-md text-sm font-semibold text-text-secondary text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {filteredPlans.length > 0 ? (
              filteredPlans.map((plan) => {
                const progress = Math.min((plan.achieved / plan.target) * 100, 100);
                return (
                  <React.Fragment key={plan.id}>
                    <tr 
                      className="hover:bg-bg-sidebar transition-colors cursor-pointer group"
                      onClick={() => handleToggleExpand(plan)}
                    >
                      <td className="py-4 px-4 text-gray-400">
                        {expandedId === plan.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </td>
                      <td className="px-lg py-md whitespace-nowrap">
                        <span className="font-medium text-text-primary">{plan.category}</span>
                      </td>
                      <td className="px-lg py-md text-text-primary text-sm whitespace-nowrap">
                        Rp {plan.target.toLocaleString('id-ID')}
                      </td>
                      <td className="px-lg py-md text-text-primary text-sm whitespace-nowrap">
                        Rp {plan.achieved.toLocaleString('id-ID')}
                      </td>
                      <td className="px-lg py-md min-w-[150px]">
                        <div className="flex items-center gap-sm">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full transition-all duration-500",
                                plan.status === 'Behind' ? 'bg-red-500' : 'bg-primary-light'
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-text-secondary w-8 whitespace-nowrap">{Math.round(progress)}%</span>
                        </div>
                      </td>
                      <td className="px-lg py-md text-center whitespace-nowrap">
                        <span className={cn("px-md py-xs rounded-full text-xs font-medium", getStatusColor(plan.status))}>
                          {plan.status}
                        </span>
                      </td>
                      <td className="px-lg py-md text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <InTableAction
                            variant="custom"
                            icon={Plus}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddIncome(plan);
                            }}
                            title="Quick Record Income"
                          />
                          <InTableAction
                            variant="edit"
                            icon={Edit2}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(plan);
                            }}
                            title="Edit Plan"
                          />
                          <InTableAction
                            variant="delete"
                            icon={Trash2}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRevenuePlan(plan.id);
                            }}
                            title="Delete Plan"
                          />
                        </div>
                      </td>
                    </tr>
                    {expandedId === plan.id && (
                      <tr className="bg-gray-50/30 border-b">
                        <td colSpan={7} className="p-4 sm:p-6">
                          <div className="ml-10">
                            <h4 className="text-sm font-medium text-gray-700 mb-4">Income Plan</h4>
                            
                            {plan.incomePlans && plan.incomePlans.length > 0 ? (
                              <div className="space-y-2 mb-4">
                                {plan.incomePlans.map(incomePlan => {
                                  const achievedAmt = activities
                                    .filter(a => a.incomePlanId === incomePlan.id && a.type === 'income')
                                    .reduce((sum, a) => sum + a.price, 0);
                                    
                                  return (
                                    <div key={incomePlan.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                                      <div className="flex flex-col flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-gray-800">{incomePlan.name}</span>
                                          {achievedAmt >= incomePlan.estimatedAmount && incomePlan.estimatedAmount > 0 && (
                                            <span className="px-1.5 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded">Achieved</span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-xs text-gray-500">Est: Rp {incomePlan.estimatedAmount.toLocaleString('id-ID')}</span>
                                          <span className="text-xs text-gray-300">•</span>
                                          <span className={cn("text-xs font-medium", achievedAmt >= incomePlan.estimatedAmount ? "text-green-600" : "text-gray-600")}>
                                            Achieved: Rp {achievedAmt.toLocaleString('id-ID')}
                                          </span>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteIncomePlan(incomePlan.id);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic mb-4">No income plans yet. Add one to trace your specific income targets.</p>
                            )}
                            
                            <div className="flex items-center gap-3 bg-white p-3 border border-gray-200 rounded-lg" onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="text"
                                placeholder="Plan name (e.g. Project Freelance A)"
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
                                onClick={() => handleAddPlan(plan.id)}
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
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center italic text-text-muted">No revenue plans found for this period</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
  );
}
