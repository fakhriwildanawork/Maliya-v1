import React, { useState } from 'react';
import { Button } from '../../../ui/components/elements/Button';
import { Budget } from '../../../logic/types/finance';
import InputPrice from '../../../ui/components/elements/InputPrice';
import FixDropdown from '../../../ui/components/elements/FixDropdown';

interface BudgetFormProps {
  initialData?: Budget | null;
  onSubmit: (data: Partial<Budget>) => Promise<void> | void;
  onCancel: () => void;
}

export default function BudgetForm({ initialData, onSubmit, onCancel }: BudgetFormProps) {
  const [category, setCategory] = useState(initialData?.category || '');
  const [limit, setLimit] = useState(initialData?.limit || 0);
  const [month, setMonth] = useState(initialData?.month || new Date().getMonth() + 1);
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ category, limit, month, year });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
      <div className="flex flex-col gap-xs">
        <label className="text-sm font-medium text-text-secondary">Category</label>
        <input 
          type="text" 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-md py-sm min-h-[2.75rem] text-base sm:text-sm rounded-lg border border-border-main focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
          placeholder="e.g. Food & Dining"
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="flex flex-col gap-xs">
        <label className="text-sm font-medium text-text-secondary">Limit</label>
        <InputPrice 
          name="limit"
          value={limit}
          onChange={(_, val) => setLimit(val)}
          placeholder="0"
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="grid grid-cols-2 gap-md">
        <div className="flex flex-col gap-xs">
          <label className="text-sm font-medium text-text-secondary">Month</label>
          <FixDropdown 
            options={months.map(m => ({ value: m.value.toString(), label: m.label }))}
            value={month.toString()}
            onChange={(val) => setMonth(Number(val))}
            disabled={isSubmitting}
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label className="text-sm font-medium text-text-secondary">Year</label>
          <input 
            type="number" 
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-md py-sm min-h-[2.75rem] text-base sm:text-sm rounded-lg border border-border-main focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
            required
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-md mt-md">
        <Button variant="outline" type="button" className="flex-1" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" className="flex-1" isLoading={isSubmitting}>Save Budget</Button>
      </div>
    </form>
  );
}
