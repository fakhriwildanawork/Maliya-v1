import React, { useState } from 'react';
import { Button } from '../../../ui/components/elements/Button';
import { Investment } from '../../../logic/types/finance';
import InputPrice from '../../../ui/components/elements/InputPrice';
import FixDropdown from '../../../ui/components/elements/FixDropdown';

interface InvestmentFormProps {
  initialData?: Investment | null;
  onSubmit: (data: Partial<Investment>) => Promise<void> | void;
  onCancel: () => void;
}

export default function InvestmentForm({ initialData, onSubmit, onCancel }: InvestmentFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<Investment['type']>(initialData?.type || 'Stock');
  const [quantity, setQuantity] = useState(initialData?.quantity || 0);
  const [averageBuyPrice, setAverageBuyPrice] = useState(initialData?.averageBuyPrice || 0);
  const [currentPrice, setCurrentPrice] = useState(initialData?.currentPrice || initialData?.averageBuyPrice || 0);
  const [purchaseDate, setPurchaseDate] = useState(initialData?.purchaseDate || new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const investmentTypes: { value: Investment['type']; label: string }[] = [
    { value: 'Stock', label: 'Stock' },
    { value: 'Mutual Fund', label: 'Mutual Fund' },
    { value: 'Crypto', label: 'Crypto' },
    { value: 'Gold', label: 'Gold' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'P2P Lending', label: 'P2P Lending' },
    { value: 'Other', label: 'Other' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const qty = Number(quantity);
      const avgBuy = Number(averageBuyPrice);
      const currPrice = currentPrice > 0 ? Number(currentPrice) : avgBuy;
      
      const investedAmount = qty * avgBuy;
      const currentValue = qty * currPrice;

      await onSubmit({
        name,
        type,
        quantity: qty,
        averageBuyPrice: avgBuy,
        currentPrice: currPrice,
        investedAmount,
        currentValue,
        purchaseDate,
        status: 'Active'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[1rem]">
      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-sm font-medium text-gray-500">Asset Name</label>
        <input 
          type="text" 
          value={name}
          disabled={isSubmitting}
          onChange={(e) => setName(e.target.value)}
          className="px-[1rem] py-[0.5rem] min-h-[2.75rem] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-base sm:text-sm disabled:opacity-70 disabled:bg-gray-50"
          placeholder="e.g. BBRI, Bitcoin, Mutual Fund A"
          required
        />
      </div>

      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-sm font-medium text-gray-500">Category Type</label>
        <FixDropdown 
          options={investmentTypes}
          value={type}
          disabled={isSubmitting}
          onChange={(val) => setType(val as Investment['type'])}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1rem]">
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-sm font-medium text-gray-500">Quantity (Units)</label>
          <input 
            type="number" 
            step="any"
            disabled={isSubmitting}
            value={quantity === 0 ? '' : quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="px-[1rem] py-[0.5rem] min-h-[2.75rem] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-base sm:text-sm disabled:opacity-70 disabled:bg-gray-50"
            placeholder="0.00"
            required
          />
        </div>

        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-sm font-medium text-gray-500">Purchase Date</label>
          <input 
            type="date" 
            disabled={isSubmitting}
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="px-[1rem] py-[0.5rem] min-h-[2.75rem] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-base sm:text-sm disabled:opacity-70 disabled:bg-gray-50"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1rem]">
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-sm font-medium text-gray-500">Average Buy Price per Unit</label>
          <InputPrice 
            name="averageBuyPrice"
            value={averageBuyPrice}
            disabled={isSubmitting}
            onChange={(_, val) => {
              setAverageBuyPrice(val);
              if (currentPrice === 0 || currentPrice === averageBuyPrice) {
                setCurrentPrice(val);
              }
            }}
            placeholder="0"
            required
          />
        </div>

        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-sm font-medium text-gray-500">Current Market Price per Unit</label>
          <InputPrice 
            name="currentPrice"
            value={currentPrice}
            disabled={isSubmitting}
            onChange={(_, val) => setCurrentPrice(val)}
            placeholder="0"
            required
          />
        </div>
      </div>

      {quantity > 0 && averageBuyPrice > 0 && (
        <div className="p-[1rem] rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-[0.5rem]">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Total Invested Amount:</span>
            <span className="font-semibold text-gray-900">
              Rp {(quantity * averageBuyPrice).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Estimated Current Market Value:</span>
            <span className="font-semibold text-gray-900">
              Rp {(quantity * (currentPrice || averageBuyPrice)).toLocaleString('id-ID')}
            </span>
          </div>
          {currentPrice > 0 && (
            <div className="flex justify-between text-xs">
              <span>Potential ROI (Return on Investment):</span>
              <span className={`font-bold ${
                currentPrice >= averageBuyPrice ? 'text-green-600' : 'text-red-500'
              }`}>
                {currentPrice >= averageBuyPrice ? '+' : ''}
                {(((currentPrice - averageBuyPrice) / averageBuyPrice) * 100).toFixed(2)}% (
                Rp {((currentPrice - averageBuyPrice) * quantity).toLocaleString('id-ID')}
                )
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-[1rem] mt-[1rem]">
        <Button variant="outline" type="button" className="flex-1" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 border-none" isLoading={isSubmitting}>
          Save Investment
        </Button>
      </div>
    </form>
  );
}
