import React, { useState, useEffect } from 'react';
import { Goal } from '../../../logic/types/finance';
import { cn } from '../../../logic/utils/classNames';
import * as TOKENS from '../../../ui/styles/tokens';

interface GoalFormProps {
  initialData?: Goal | null;
  onSubmit: (data: Partial<Goal>) => void;
  onCancel: () => void;
}

export default function GoalForm({ initialData, onSubmit, onCancel }: GoalFormProps) {
  const [formData, setFormData] = useState<Partial<Goal>>({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: new Date().toISOString().split('T')[0],
    category: 'Saving',
    icon: '💰',
    status: 'In Progress'
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="space-y-xs">
          <label className="text-sm font-semibold text-text-secondary">Goal Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-md py-sm min-h-[44px] text-base sm:text-sm border border-border-main rounded-lg focus:ring-2 focus:ring-primary-light outline-none transition-all"
            placeholder="e.g. Dream House"
          />
        </div>
        <div className="space-y-xs">
          <label className="text-sm font-semibold text-text-secondary">Category</label>
          <select
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-md py-sm min-h-[44px] text-base sm:text-sm border border-border-main rounded-lg focus:ring-2 focus:ring-primary-light outline-none transition-all bg-white"
          >
            <option value="Saving">Saving</option>
            <option value="Investment">Investment</option>
            <option value="Transportation">Transportation</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Security">Security</option>
            <option value="Education">Education</option>
            <option value="Travel">Travel</option>
            <option value="Others">Others</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="space-y-xs">
          <label className="text-sm font-semibold text-text-secondary">Target Amount (Rp)</label>
          <input
            type="number"
            required
            min="0"
            value={formData.targetAmount || ''}
            onChange={e => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
            className="w-full px-md py-sm min-h-[44px] text-base sm:text-sm border border-border-main rounded-lg focus:ring-2 focus:ring-primary-light outline-none transition-all"
            placeholder="0"
          />
        </div>
        <div className="space-y-xs">
          <label className="text-sm font-semibold text-text-secondary">Initial Amount (Rp)</label>
          <input
            type="number"
            min="0"
            value={formData.currentAmount || ''}
            onChange={e => setFormData({ ...formData, currentAmount: Number(e.target.value) })}
            className="w-full px-md py-sm min-h-[44px] text-base sm:text-sm border border-border-main rounded-lg focus:ring-2 focus:ring-primary-light outline-none transition-all"
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="space-y-xs">
          <label className="text-sm font-semibold text-text-secondary">Deadline</label>
          <input
            type="date"
            required
            value={formData.deadline}
            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
            className="w-full px-md py-sm min-h-[44px] text-base sm:text-sm border border-border-main rounded-lg focus:ring-2 focus:ring-primary-light outline-none transition-all"
          />
        </div>
        <div className="space-y-xs">
          <label className="text-sm font-semibold text-text-secondary">Icon (Emoji)</label>
          <input
            type="text"
            value={formData.icon}
            onChange={e => setFormData({ ...formData, icon: e.target.value })}
            className="w-full px-md py-sm min-h-[44px] text-base sm:text-sm border border-border-main rounded-lg focus:ring-2 focus:ring-primary-light outline-none transition-all"
            placeholder="💰"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-md pt-lg border-t border-border-light">
        <button
          type="button"
          onClick={onCancel}
          className="px-lg py-sm min-h-[44px] w-full sm:w-auto border border-border-main rounded-full hover:bg-bg-sidebar transition-colors font-semibold text-text-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-lg py-sm min-h-[44px] w-full sm:w-auto bg-primary-main text-white hover:bg-primary-dark transition-colors font-semibold rounded-full shadow-sm"
        >
          {initialData ? 'Update Goal' : 'Create Goal'}
        </button>
      </div>
    </form>
  );
}
