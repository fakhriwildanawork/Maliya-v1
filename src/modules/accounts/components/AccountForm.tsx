import React, { useState, useEffect } from 'react';
import { Wallet } from '../../../logic/types/accounts';
import InputPrice from '../../../ui/components/elements/InputPrice';
import SmallToggle from '../../../ui/components/elements/SmallToggle';
import { Button } from '../../../ui/components/elements/Button';

interface AccountFormProps {
  initialData?: Wallet | null;
  onSubmit: (data: Partial<Wallet>) => Promise<void> | void;
  onCancel: () => void;
}

export default function AccountForm({ initialData, onSubmit, onCancel }: AccountFormProps) {
  const [formData, setFormData] = useState<Partial<Wallet>>({
    name: '',
    balance: 0,
    limit: 0,
    status: 'Active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[1.25rem]">
      <div className="flex flex-col gap-[0.375rem]">
        <label className="text-sm font-medium text-gray-700">Account Name</label>
        <input 
          type="text" 
          name="name" 
          value={formData.name} 
          onChange={handleChange}
          className="px-[1rem] py-[0.625rem] min-h-[2.75rem] rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Main Account"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-[0.375rem]">
        <label className="text-sm font-medium text-gray-700">Initial Balance</label>
        <InputPrice 
          name="balance"
          value={formData.balance || 0}
          onChange={handlePriceChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-[0.375rem]">
        <label className="text-sm font-medium text-gray-700">Monthly Limit</label>
        <InputPrice 
          name="limit"
          value={formData.limit || 0}
          onChange={handlePriceChange}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <SmallToggle 
          checked={formData.status === 'Active'}
          onChange={handleStatusChange}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex items-center gap-[0.75rem] mt-[1rem] pt-[1rem] border-t border-gray-100">
        <Button 
          type="button"
          onClick={onCancel}
          variant="outline"
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="flex-1 bg-green-500 hover:bg-green-600 border-none"
          isLoading={isSubmitting}
        >
          {initialData ? 'Save Changes' : 'Add Account'}
        </Button>
      </div>
    </form>
  );
}
