import React, { useState, useEffect } from 'react';
import { CreditCard } from '../../../logic/types/accounts';
import { CARD_THEMES } from '../../../logic/utils/theme';
import FixDropdown from '../../../ui/components/elements/FixDropdown';
import SmallToggle from '../../../ui/components/elements/SmallToggle';
import { Button } from '../../../ui/components/elements/Button';

interface CardFormProps {
  initialData?: CreditCard | null;
  onSubmit: (data: Partial<CreditCard>) => Promise<void> | void;
  onCancel: () => void;
}

export default function CardForm({ initialData, onSubmit, onCancel }: CardFormProps) {
  const [formData, setFormData] = useState<Partial<CreditCard>>({
    number: '',
    exp: '',
    cvv: '',
    status: 'Active',
    theme: 'dark',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto-formatting for card number
    if (name === 'number') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = v.match(/\d{4,16}/g);
      const match = matches && matches[0] || '';
      const parts = [];
      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }
      if (parts.length) {
        setFormData(prev => ({ ...prev, [name]: parts.join(' ') }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }

    // Auto-formatting for exp date
    if (name === 'exp') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      if (v.length >= 2) {
        setFormData(prev => ({ ...prev, [name]: `${v.substring(0, 2)}/${v.substring(2, 4)}` }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }

    // Auto-formatting for cvv
    if (name === 'cvv') {
      const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').substring(0, 3);
      setFormData(prev => ({ ...prev, [name]: v }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThemeChange = (value: string) => {
    setFormData(prev => ({ ...prev, theme: value }));
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
        <label className="text-sm font-medium text-gray-700">Card Number</label>
        <input 
          type="text" 
          name="number" 
          value={formData.number} 
          onChange={handleChange}
          className="px-[1rem] py-[0.625rem] min-h-[2.75rem] rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="0000 0000 0000 0000"
          maxLength={19}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-[1rem]">
        <div className="flex flex-col gap-[0.375rem]">
          <label className="text-sm font-medium text-gray-700">Expiry Date</label>
          <input 
            type="text" 
            name="exp" 
            value={formData.exp} 
            onChange={handleChange}
            className="px-[1rem] py-[0.625rem] min-h-[2.75rem] rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="MM/YY"
            maxLength={5}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="flex flex-col gap-[0.375rem]">
          <label className="text-sm font-medium text-gray-700">CVV</label>
          <input 
            type="text" 
            name="cvv" 
            value={formData.cvv} 
            onChange={handleChange}
            className="px-[1rem] py-[0.625rem] min-h-[2.75rem] rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="123"
            maxLength={3}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex flex-col gap-[0.375rem]">
        <label className="text-sm font-medium text-gray-700">Theme</label>
        <FixDropdown
          options={CARD_THEMES}
          value={formData.theme || 'dark'}
          onChange={handleThemeChange}
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
          {initialData ? 'Save Changes' : 'Add Card'}
        </Button>
      </div>
    </form>
  );
}
