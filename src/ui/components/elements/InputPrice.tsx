import React, { useState, useEffect } from 'react';
import { cn } from '../../../logic/utils/classNames';

interface InputPriceProps {
  name: string;
  value: number;
  onChange: (name: string, value: number) => void;
  placeholder?: string;
  required?: boolean;
}

export default function InputPrice({ name, value, onChange, placeholder = '0.00', required }: InputPriceProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value !== undefined && value !== null) {
      // Convert number string with dot decimal to comma decimal for formatNumber
      const stringValue = value.toString().replace('.', ',');
      setDisplayValue(formatNumber(stringValue));
    }
  }, [value]);

  const formatNumber = (val: string) => {
    if (!val) return '';
    // Allow digits and comma for decimal part
    const cleanVal = val.replace(/[^\d,]/g, '');
    const parts = cleanVal.split(',');
    
    // Use dot for thousands separator
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    if (parts.length > 1) {
      parts[1] = parts[1].substring(0, 2);
    }
    
    return parts.join(',');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    if (rawValue === '') {
      setDisplayValue('');
      onChange(name, 0);
      return;
    }

    const formatted = formatNumber(rawValue);
    setDisplayValue(formatted);
    
    // Parse it back to float (remove dots, replace comma with dot)
    const numericValue = parseFloat(formatted.replace(/\./g, '').replace(/,/g, '.'));
    onChange(name, isNaN(numericValue) ? 0 : numericValue);
  };

  const symbol = 'Rp';

  return (
    <div className="relative flex items-center">
      <span className="absolute left-4 text-gray-500 text-sm font-medium">{symbol}</span>
      <input
        type="text"
        name={name}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={cn(
          "w-full pl-11 pr-4 py-2.5 min-h-[44px] rounded-xl border border-gray-200 text-base lg:text-sm",
          "focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        )}
      />
    </div>
  );
}
