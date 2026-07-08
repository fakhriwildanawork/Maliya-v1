import React, { useState } from 'react';
import { Button } from '../../../ui/components/elements/Button';
import { Asset } from '../../../logic/types/finance';
import InputPrice from '../../../ui/components/elements/InputPrice';
import FixDropdown from '../../../ui/components/elements/FixDropdown';

interface AssetFormProps {
  initialData?: Asset | null;
  onSubmit: (data: Partial<Asset>) => Promise<void> | void;
  onCancel: () => void;
}

export default function AssetForm({ initialData, onSubmit, onCancel }: AssetFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<Asset['category']>(initialData?.category || 'Property');
  const [purchasePrice, setPurchasePrice] = useState(initialData?.purchasePrice || 0);
  const [currentValue, setCurrentValue] = useState(initialData?.currentValue || initialData?.purchasePrice || 0);
  const [purchaseDate, setPurchaseDate] = useState(initialData?.purchaseDate || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(initialData?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assetCategories: { value: Asset['category']; label: string }[] = [
    { value: 'Property', label: 'Property (Real Estate, Land, Building)' },
    { value: 'Vehicle', label: 'Vehicle (Car, Motorcycle)' },
    { value: 'Electronics', label: 'Electronics (Gadgets, Workstation)' },
    { value: 'Jewelry', label: 'Jewelry & Precious Metals (Gold, Diamonds)' },
    { value: 'Business', label: 'Business Ownership (SMB, Franchise)' },
    { value: 'Other', label: 'Other Assets (Collectibles, Art)' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const pPrice = Number(purchasePrice);
      const cVal = currentValue > 0 ? Number(currentValue) : pPrice;

      await onSubmit({
        name,
        category,
        purchasePrice: pPrice,
        currentValue: cVal,
        purchaseDate,
        description,
        lastUpdated: new Date().toISOString().split('T')[0]
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
          placeholder="e.g. HR-V Car, Work Laptop, Apartment"
          required
        />
      </div>

      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-sm font-medium text-gray-500">Asset Category</label>
        <FixDropdown 
          options={assetCategories}
          value={category}
          disabled={isSubmitting}
          onChange={(val) => setCategory(val as Asset['category'])}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1rem]">
        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-sm font-medium text-gray-500">Acquisition Date</label>
          <input 
            type="date" 
            value={purchaseDate}
            disabled={isSubmitting}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="px-[1rem] py-[0.5rem] min-h-[2.75rem] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-base sm:text-sm disabled:opacity-70 disabled:bg-gray-50"
            required
          />
        </div>

        <div className="flex flex-col gap-[0.25rem]">
          <label className="text-sm font-medium text-gray-500">Acquisition Cost / Purchase Price</label>
          <InputPrice 
            name="purchasePrice"
            value={purchasePrice}
            disabled={isSubmitting}
            onChange={(_, val) => {
              setPurchasePrice(val);
              if (currentValue === 0 || currentValue === purchasePrice) {
                setCurrentValue(val);
              }
            }}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-sm font-medium text-gray-500">Current Market Appraisal</label>
        <InputPrice 
          name="currentValue"
          value={currentValue}
          disabled={isSubmitting}
          onChange={(_, val) => setCurrentValue(val)}
          placeholder="0"
          required
        />
      </div>

      <div className="flex flex-col gap-[0.25rem]">
        <label className="text-sm font-medium text-gray-500">Description / Additional Notes (Optional)</label>
        <textarea 
          value={description}
          disabled={isSubmitting}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="px-[1rem] py-[0.5rem] min-h-[2.75rem] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-base sm:text-sm resize-none disabled:opacity-70 disabled:bg-gray-50"
          placeholder="Specifications, location, serial number, or other supporting details..."
        />
      </div>

      {purchasePrice > 0 && currentValue > 0 && (
        <div className="p-[1rem] rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-[0.5rem]">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Asset Appreciation / Depreciation:</span>
            <span className={`font-bold ${
              currentValue >= purchasePrice ? 'text-green-600' : 'text-red-500'
            }`}>
              {currentValue >= purchasePrice ? 'Appreciation: +' : 'Depreciation: '}
              {(((currentValue - purchasePrice) / purchasePrice) * 100).toFixed(2)}% (
              Rp {Math.abs(currentValue - purchasePrice).toLocaleString('id-ID')}
              )
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-[1rem] mt-[1rem]">
        <Button variant="outline" type="button" className="flex-1" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 border-none" isLoading={isSubmitting}>
          Save Asset
        </Button>
      </div>
    </form>
  );
}
