import React, { useState } from 'react';
import { useBudgets } from '../../../logic/hooks/useBudgets';
import { RevenuePlan } from '../../../logic/types/budgets';
import { Button } from '../../../ui/components/elements/Button';
import InputPrice from '../../../ui/components/elements/InputPrice';
import FixDropdown from '../../../ui/components/elements/FixDropdown';

interface RevenuePlanFormProps {
  onClose: () => void;
  editPlan?: RevenuePlan | null;
}

export function RevenuePlanForm({ onClose, editPlan }: RevenuePlanFormProps) {
  const { addRevenuePlan, updateRevenuePlan } = useBudgets();
  const [category, setCategory] = useState(editPlan?.category || '');
  const [target, setTarget] = useState(editPlan?.target || 0);
  const [month, setMonth] = useState(editPlan?.month || new Date().getMonth() + 1);
  const [year, setYear] = useState(editPlan?.year || new Date().getFullYear());

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editPlan) {
      await updateRevenuePlan(editPlan.id, {
        category,
        target,
        month,
        year,
        status: editPlan.achieved >= target ? 'Exceeded' : (editPlan.achieved < target * 0.5 ? 'Behind' : 'On Track')
      });
    } else {
      await addRevenuePlan({
        category,
        target,
        achieved: 0,
        month,
        year,
        status: 'On Track'
      });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <label className="text-sm font-medium text-text-secondary">Income Category</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-md py-sm min-h-[44px] rounded-lg border border-border-main text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
          placeholder="e.g. Salary, Freelance, Dividend"
          required
        />
      </div>
      
      <div className="flex flex-col gap-xs">
        <label className="text-sm font-medium text-text-secondary">Target Amount</label>
        <InputPrice
          name="target"
          value={target}
          onChange={(_, val) => setTarget(val)}
          placeholder="0"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-md">
        <div className="flex flex-col gap-xs">
          <label className="text-sm font-medium text-text-secondary">Month</label>
          <FixDropdown 
            options={months.map(m => ({ value: m.value.toString(), label: m.label }))}
            value={month.toString()}
            onChange={(val) => setMonth(Number(val))}
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label className="text-sm font-medium text-text-secondary">Year</label>
          <input 
            type="number" 
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-md py-sm min-h-[44px] rounded-lg border border-border-main text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
            required
          />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-md mt-md">
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          className="flex-1"
        >
          {editPlan ? 'Update Plan' : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
}
