import React, { useState, useEffect } from 'react';
import { CreditCard } from '../../../logic/types/accounts';
import { CARD_THEMES } from '../../../logic/utils/theme';
import FixDropdown from '../../../ui/components/elements/FixDropdown';
import SmallToggle from '../../../ui/components/elements/SmallToggle';

interface CardFormProps {
  initialData?: CreditCard | null;
  onSubmit: (data: Partial<CreditCard>) => void;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Card Number</label>
        <input 
          type="text" 
          name="number" 
          value={formData.number} 
          onChange={handleChange}
          className="px-4 py-2.5 min-h-[44px] rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="0000 0000 0000 0000"
          maxLength={19}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Expiry Date</label>
          <input 
            type="text" 
            name="exp" 
            value={formData.exp} 
            onChange={handleChange}
            className="px-4 py-2.5 min-h-[44px] rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="MM/YY"
            maxLength={5}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">CVV</label>
          <input 
            type="text" 
            name="cvv" 
            value={formData.cvv} 
            onChange={handleChange}
            className="px-4 py-2.5 min-h-[44px] rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="123"
            maxLength={3}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Theme</label>
        <FixDropdown
          options={CARD_THEMES}
          value={formData.theme || 'dark'}
          onChange={handleThemeChange}
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
          {initialData ? 'Save Changes' : 'Add Card'}
        </button>
      </div>
    </form>
  );
}
