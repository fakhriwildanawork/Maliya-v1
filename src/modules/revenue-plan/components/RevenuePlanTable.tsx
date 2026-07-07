import React from 'react';
import { RevenuePlan } from '../../../logic/types/finance';
import { cn } from '../../../logic/utils/classNames';
import { Edit2, Trash2 } from 'lucide-react';
import { InTableAction } from '../../../ui/components/elements/InTableAction';

interface RevenuePlanTableProps {
  revenuePlans: RevenuePlan[];
  deleteRevenuePlan: (id: string) => Promise<void>;
  onEdit: (plan: RevenuePlan) => void;
  onAddIncome: (plan: RevenuePlan) => void;
  month: number;
  year: number;
}

export function RevenuePlanTable({ revenuePlans, deleteRevenuePlan, onEdit, onAddIncome, month, year }: RevenuePlanTableProps) {
  const filteredPlans = revenuePlans.filter(p => p.month === month && p.year === year);

  const getStatusColor = (status: RevenuePlan['status']) => {
    switch (status) {
      case 'Exceeded': return 'text-green-600 bg-green-50';
      case 'On Track': return 'text-blue-600 bg-blue-50';
      case 'Behind': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-bg-main rounded-lg border border-border-main shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-sidebar border-b border-border-main">
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
                  <tr 
                    key={plan.id} 
                    className="hover:bg-bg-sidebar transition-colors cursor-pointer group"
                    onClick={() => onAddIncome(plan)}
                  >
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
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="py-12 text-center italic text-text-muted">No revenue plans found for this period</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
