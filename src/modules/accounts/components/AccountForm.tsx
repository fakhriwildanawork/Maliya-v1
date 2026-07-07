import React, { useState, useEffect } from 'react';
import { Wallet } from '../../../logic/types/accounts';
import InputPrice from '../../../ui/components/elements/InputPrice';
import SmallToggle from '../../../ui/components/elements/SmallToggle';

interface AccountFormProps {
  initialData?: Wallet | null;
  onSubmit: (data: Partial<Wallet>) => void;
  onCancel: () => void;
}

export default function AccountForm({ initialData, onSubmit, onCancel }: AccountFormProps) {
  const [formData, setFormData] = useState<Partial<Wallet>>({
    name: '',
    balance: 0,
    limit: 0,
    status: 'Active',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceChange = (name: string, value: number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, status: checked ? 'Active' : 'Inactive' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Account Name</label>
        <input 
          type="text" 
          name="name" 
          value={formData.name} 
          onChange={handleChange}
          className="px-4 py-2.5 min-h-[44px] rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Main Account"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Initial Balance</label>
        <InputPrice 
          name="balance"
          value={formData.balance || 0}
          onChange={handlePriceChange}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Monthly Limit</label>
        <InputPrice 
          name="limit"
          value={formData.limit || 0}
          onChange={handlePriceChange}
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <SmallToggle 
          checked={formData.status === 'Active'}
          onChange={handleStatusChange}
        />
      </div>

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 px-5 py-2.5 min-h-[44px] rounded-full border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          className="flex-1 px-5 py-2.5 min-h-[44px] rounded-full bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
        >
          {initialData ? 'Save Changes' : 'Add Account'}
        </button>
      </div>
    </form>
  );
}
