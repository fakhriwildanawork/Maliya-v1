import React from 'react';
import { Edit2, Trash2, Copy } from 'lucide-react';
import * as TOKENS from '../../../ui/styles/tokens';
import { cn } from '../../../logic/utils/classNames';
import { Budget } from '../../../logic/types/finance';
import { InTableAction } from '../../../ui/components/elements/InTableAction';

interface BudgetTableProps {
  onRowClick: (budget: Budget) => void;
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
  const filteredBudgets = budgets.filter(b => {
    const matchesPeriod = b.month === month && b.year === year;
    const matchesSearch = b.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPeriod && matchesSearch;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={cn("text-sm border-b", TOKENS.TEXT_MUTED, TOKENS.BORDER_DEFAULT)}>
            <th className="py-4 px-4 font-normal">Category</th>
            <th className="py-4 px-4 font-normal text-right">Limit</th>
            <th className="py-4 px-4 font-normal text-right">Spent</th>
            <th className="py-4 px-4 font-normal text-right">Remaining</th>
            <th className="py-4 px-4 font-normal text-center">Status</th>
            <th className="py-4 px-4 font-normal w-32 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBudgets.length > 0 ? (
            filteredBudgets.map((budget) => (
              <tr key={budget.id} className={cn("border-b hover:bg-gray-50/50 transition-colors cursor-pointer group", TOKENS.BORDER_LIGHT)}>
                <td onClick={() => onRowClick(budget)} className={cn("py-4 px-4 text-sm font-medium whitespace-nowrap", TOKENS.TEXT_PRIMARY)}>{budget.category}</td>
                <td onClick={() => onRowClick(budget)} className={cn("py-4 px-4 text-sm text-right whitespace-nowrap", TOKENS.TEXT_SECONDARY)}>Rp {budget.limit.toLocaleString('id-ID')}</td>
                <td onClick={() => onRowClick(budget)} className={cn("py-4 px-4 text-sm font-medium text-right whitespace-nowrap", TOKENS.TEXT_PRIMARY)}>Rp {budget.spent.toLocaleString('id-ID')}</td>
                <td onClick={() => onRowClick(budget)} className="py-4 px-4 text-sm text-right whitespace-nowrap">
                  <span className={budget.limit - budget.spent < 0 ? TOKENS.TEXT_EXPENSE : TOKENS.TEXT_PRIMARY}>
                      Rp {(budget.limit - budget.spent).toLocaleString('id-ID')}
                  </span>
                </td>
                <td onClick={() => onRowClick(budget)} className="py-4 px-4 text-center whitespace-nowrap">
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
            ))
          ) : (
            <tr>
              <td colSpan={6} className={cn("py-12 text-center italic", TOKENS.TEXT_MUTED)}>No budgets found for this period</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
