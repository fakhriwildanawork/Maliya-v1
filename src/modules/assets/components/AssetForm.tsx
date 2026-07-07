import React, { useState } from 'react';
import { Button } from '../../../ui/components/elements/Button';
import { Asset } from '../../../logic/types/finance';
import InputPrice from '../../../ui/components/elements/InputPrice';
import FixDropdown from '../../../ui/components/elements/FixDropdown';

interface AssetFormProps {
  initialData?: Asset | null;
  onSubmit: (data: Partial<Asset>) => void;
  onCancel: () => void;
}

export default function AssetForm({ initialData, onSubmit, onCancel }: AssetFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<Asset['category']>(initialData?.category || 'Property');
  const [purchasePrice, setPurchasePrice] = useState(initialData?.purchasePrice || 0);
  const [currentValue, setCurrentValue] = useState(initialData?.currentValue || initialData?.purchasePrice || 0);
  const [purchaseDate, setPurchaseDate] = useState(initialData?.purchaseDate || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(initialData?.description || '');

  const assetCategories: { value: Asset['category']; label: string }[] = [
    { value: 'Property', label: 'Property (Real Estate, Land, Building)' },
    { value: 'Vehicle', label: 'Vehicle (Car, Motorcycle)' },
    { value: 'Electronics', label: 'Electronics (Gadgets, Workstation)' },
    { value: 'Jewelry', label: 'Jewelry & Precious Metals (Gold, Diamonds)' },
    { value: 'Business', label: 'Business Ownership (SMB, Franchise)' },
    { value: 'Other', label: 'Other Assets (Collectibles, Art)' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pPrice = Number(purchasePrice);
    const cVal = currentValue > 0 ? Number(currentValue) : pPrice;

    onSubmit({
      name,
      category,
      purchasePrice: pPrice,
      currentValue: cVal,
      purchaseDate,
      description,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-500">Asset Name</label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-2 min-h-[44px] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-base sm:text-sm"
          placeholder="e.g. HR-V Car, Work Laptop, Apartment"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-500">Asset Category</label>
        <FixDropdown 
          options={assetCategories}
          value={category}
          onChange={(val) => setCategory(val as Asset['category'])}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-500">Acquisition Date</label>
          <input 
            type="date" 
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="px-4 py-2 min-h-[44px] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-base sm:text-sm"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-500">Acquisition Cost / Purchase Price</label>
          <InputPrice 
            name="purchasePrice"
            value={purchasePrice}
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

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-500">Current Market Appraisal</label>
        <InputPrice 
          name="currentValue"
          value={currentValue}
          onChange={(_, val) => setCurrentValue(val)}
          placeholder="0"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-500">Description / Additional Notes (Optional)</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="px-4 py-2 min-h-[44px] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-base sm:text-sm resize-none"
          placeholder="Specifications, location, serial number, or other supporting details..."
        />
      </div>

      {purchasePrice > 0 && currentValue > 0 && (
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-2">
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

      <div className="flex justify-end gap-4 mt-4">
        <Button variant="outline" type="button" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1 bg-green-500 text-white hover:bg-green-600 rounded-full font-medium transition-colors">
          Save Asset
        </Button>
      </div>
    </form>
  );
}
