import React, { useState, useEffect, useMemo } from 'react';
import { Transaction } from '../../../logic/types/transactions';
import InputPrice from '../../../ui/components/elements/InputPrice';
import FixDropdown from '../../../ui/components/elements/FixDropdown';
import { useFinance } from '../../../logic/context/FinanceContext';
import { useBudgets } from '../../../logic/hooks/useBudgets';
import { ArrowRightLeft, ArrowDownLeft, ArrowUpRight, Camera, Wand2, Loader2, X } from 'lucide-react';
import { AccountService } from '../../../logic/services/accountService';
import { Wallet, CreditCard } from '../../../logic/types/accounts';
import { format } from 'date-fns';
import { cn } from '../../../logic/utils/classNames';
import { 
  BG_PRIMARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_INVERSE,
} from '../../../ui/styles/tokens';

interface TransactionFormProps {
  initialData?: Transaction | null;
  fixedType?: 'expense' | 'income' | 'transfer';
  prefilledCategory?: string;
  onSubmit: (data: Partial<Transaction>) => void;
  onCancel: () => void;
}

const DEFAULT_EXPENSE_CATEGORIES = [
  { value: 'Food', label: 'Food & Dining' },
  { value: 'Travel', label: 'Travel & Transport' },
  { value: 'Software', label: 'Software & Subscriptions' },
  { value: 'Equipment', label: 'Equipment & Hardware' },
  { value: 'Debt Repayment', label: 'Debt Repayment (Bayar Hutang)' },
  { value: 'Other', label: 'Other' },
];

const INCOME_CATEGORIES = [
  { value: 'Income', label: 'Income & Salary' },
  { value: 'Bonus', label: 'Bonus' },
  { value: 'Investment', label: 'Investment' },
  { value: 'Loan Payment Received', label: 'Loan Payment Received (Terima Piutang)' },
  { value: 'Other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'Completed', label: 'Completed' },
  { value: 'Pending', label: 'Pending' },
  { value: 'In Progress', label: 'In Progress' },
];

export default function TransactionForm({ initialData, fixedType, prefilledCategory, onSubmit, onCancel }: TransactionFormProps) {
  const { activities, debts } = useFinance();
  const { budgets, revenuePlans } = useBudgets();
  
  const [realWallets, setRealWallets] = useState<Wallet[]>([]);
  const [realCards, setRealCards] = useState<CreditCard[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const [w, c] = await Promise.all([
          AccountService.getAllWallets(),
          AccountService.getAllCreditCards()
        ]);
        setRealWallets(w);
        setRealCards(c);
        
        if (!initialData) {
          setFormData(prev => ({
            ...prev,
            sourceAccountId: prev.sourceAccountId || w[0]?.id || '',
            destinationAccountId: prev.destinationAccountId || (w.length > 1 ? w[1].id : w[0]?.id) || ''
          }));
        }
      } catch (err) {
        console.error("Failed to load accounts", err);
      }
    };
    fetchAccounts();
  }, [initialData]);

  const [formData, setFormData] = useState<Partial<Transaction>>({
    title: '',
    category: prefilledCategory || '',
    price: 0,
    status: 'Completed',
    type: fixedType || 'expense',
    sourceAccountId: '',
    destinationAccountId: '',
    datetime: new Date().toISOString().slice(0, 16),
    description: '',
    attachments: [],
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [saveReceipt, setSaveReceipt] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeAI = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    setAnalyzeStatus('Menganalisa data (AI)...');
    try {
      const base64Image = selectedImage.split(',')[1];
      
      const context = {
        categories: dynamicCategories.map(c => c.value),
        accounts: accountOptions.map(a => a.label.split(' (')[0]),
        familyMembers: [],
      };

      const response = await fetch('/api/ai/analyze-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, context }),
      });

      if (!response.ok) throw new Error('AI analysis failed');
      
      const data = await response.json();
      
      // Map back to form
      const updates: any = {};
      if (data.amount) updates.price = Number(data.amount);
      if (data.title) updates.title = data.title;
      if (data.description) updates.description = data.description;
      if (data.date) {
        try {
          updates.datetime = new Date(data.date).toISOString().slice(0, 16);
        } catch (e) { /* ignore invalid date */ }
      }
      if (data.type) updates.type = data.type;
      
      if (data.category_name) {
        const cat = dynamicCategories.find(c => c.value.toLowerCase().includes(data.category_name.toLowerCase()));
        if (cat) updates.category = cat.value;
      }
      
      if (data.account_name) {
        const acc = accountOptions.find(a => a.label.toLowerCase().includes(data.account_name.toLowerCase()));
        if (acc) updates.sourceAccountId = acc.value;
      }

      setFormData(prev => ({ ...prev, ...updates }));
      setAnalyzeStatus('');

    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Gagal menganalisa struk.');
    } finally {
      setIsAnalyzing(false);
      setAnalyzeStatus('');
    }
  };

  const isInvalidTransfer = formData.type === 'transfer' && 
    formData.sourceAccountId === formData.destinationAccountId && 
    formData.sourceAccountId !== undefined;

  const currentPeriod = useMemo(() => {
    if (!formData.datetime) return null;
    const date = new Date(formData.datetime);
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };
  }, [formData.datetime]);

  const dynamicCategories = useMemo(() => {
    if (formData.type === 'transfer') {
      return [{ value: 'Transfer', label: 'Transfer' }];
    }

    const baseCategories = formData.type === 'income' ? INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
    
    // Get unique categories from history for this type
    const historyCategories = Array.from(new Set(
      activities
        .filter(a => a.type === formData.type)
        .map(a => a.category)
    ));

    // Get categories from budgets/revenue plans for current period
    const budgetCategories = currentPeriod 
      ? budgets
          .filter(b => b.month === currentPeriod.month && b.year === currentPeriod.year)
          .map(b => b.category)
      : [];
      
    const revenuePlanCategories = currentPeriod
      ? revenuePlans
          .filter(p => p.month === currentPeriod.month && p.year === currentPeriod.year)
          .map(p => p.category)
      : [];

    const planCategories = formData.type === 'income' ? revenuePlanCategories : budgetCategories;

    // Merge all unique values
    const allValues = new Set([
      ...baseCategories.map(c => c.value),
      ...historyCategories,
      ...planCategories
    ]);

    return Array.from(allValues).map(val => {
      const isPlanned = planCategories.includes(val);
      const baseOpt = baseCategories.find(c => c.value === val);
      
      let label = baseOpt ? baseOpt.label : val;
      
      if (isPlanned && formData.type === 'expense') {
        label = `🎯 ${label} (Budgeted)`;
      } else if (isPlanned && formData.type === 'income') {
        label = `📈 ${label} (Planned)`;
      }

      return { value: val, label };
    });
  }, [formData.type, currentPeriod, activities, budgets, revenuePlans]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Set default category when type or period changes if current category is not in dynamic list
  useEffect(() => {
    if (dynamicCategories.length > 0) {
      const exists = dynamicCategories.find(c => c.value === formData.category);
      if (!exists && !initialData) {
        setFormData(prev => ({ ...prev, category: dynamicCategories[0].value }));
      }
    }
  }, [dynamicCategories, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (name: string, value: number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name: string, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      
      // Auto fill price when selecting a debt
      if (name === 'linkedDebtId' && value) {
        const selectedDebt = debts.find(d => d.id === value);
        if (selectedDebt) {
          next.price = selectedDebt.amount - selectedDebt.paidAmount;
          next.title = `Payment: ${selectedDebt.title}`;
        }
      }

      if (name === 'category' && value !== 'Debt Repayment' && value !== 'Loan Payment Received') {
        next.linkedDebtId = undefined;
      }
      
      return next;
    });
  };

  const setType = (type: 'income' | 'expense' | 'transfer') => {
    setFormData(prev => ({
      ...prev,
      type,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (submitData.datetime) {
      submitData.date = format(new Date(submitData.datetime), 'dd MMM, yyyy hh:mm a');
    } else {
      submitData.date = format(new Date(), 'dd MMM, yyyy hh:mm a');
    }
    if (selectedImage && saveReceipt) {
      submitData.attachments = [...(submitData.attachments || []), 'Struk_Belanja_AI.jpg'];
    }
    onSubmit(submitData);
  };

  const accountOptions = useMemo(() => [
    ...realWallets.map(w => ({ value: w.id, label: `${w.name} (Wallet)` })),
    ...realCards.map(c => ({ value: c.id, label: `${c.number} (Card)` }))
  ], [realWallets, realCards]);

  const sourceAccountOptions = useMemo(() => {
    if (formData.type !== 'transfer') return accountOptions;
    return accountOptions.filter(opt => opt.value !== formData.destinationAccountId);
  }, [accountOptions, formData.type, formData.destinationAccountId]);

  const destinationAccountOptions = useMemo(() => {
    if (formData.type !== 'transfer') return accountOptions;
    return accountOptions.filter(opt => opt.value !== formData.sourceAccountId);
  }, [accountOptions, formData.type, formData.sourceAccountId]);

  const debtOptions = useMemo(() => {
    if (formData.category === 'Debt Repayment') {
      return debts
        .filter(d => d.type === 'payable' && d.status === 'active')
        .map(d => ({ value: d.id, label: `${d.title} (${d.name}) - Remaining: Rp ${(d.amount - d.paidAmount).toLocaleString('id-ID')}` }));
    } else if (formData.category === 'Loan Payment Received') {
      return debts
        .filter(d => d.type === 'receivable' && d.status === 'active')
        .map(d => ({ value: d.id, label: `${d.title} (${d.name}) - Remaining: Rp ${(d.amount - d.paidAmount).toLocaleString('id-ID')}` }));
    }
    return [];
  }, [debts, formData.category]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center">
        <h2 className={cn("text-xl font-bold", TEXT_PRIMARY)}>
          {initialData ? 'Edit Transaksi' : 'Transaksi Baru'}
        </h2>
        <button type="button" onClick={onCancel} className={cn("p-2 rounded-full hover:bg-gray-100", TEXT_SECONDARY)}>
          <X size={20} />
        </button>
      </div>

      {/* AI Receipt Upload Section */}
      {!initialData && (
        <div className={cn("p-4 border-2 border-dashed rounded-xl transition-all", selectedImage ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-400")}>
          <div className="flex flex-col items-center gap-3">
            {selectedImage ? (
              <div className="relative w-full aspect-[16/9] max-h-48 overflow-hidden rounded-lg shadow-sm border border-green-200">
                <img src={selectedImage} alt="Receipt Preview" className="w-full h-full object-contain" />
                <button 
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-2">
                <Camera size={32} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 text-center font-medium">Foto Struk untuk Isi Otomatis</p>
                <p className="text-[10px] text-gray-400 text-center">Analisa AI (Powered by Gemini)</p>
              </div>
            )}
            
            <div className="flex flex-col gap-2 w-full">
              <div className="flex gap-2 w-full">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn("flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-xs", 
                    selectedImage ? "bg-white border border-green-200 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {selectedImage ? 'Ganti Foto' : 'Pilih Foto'}
                </button>
                
                {selectedImage && (
                  <button
                    type="button"
                    onClick={handleAnalyzeAI}
                    disabled={isAnalyzing}
                    className={cn("flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-xs",
                      BG_PRIMARY, TEXT_INVERSE, "hover:opacity-90 disabled:opacity-50"
                    )}
                  >
                    {isAnalyzing ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Wand2 size={16} />
                    )}
                    {isAnalyzing ? analyzeStatus : 'Analisa AI'}
                  </button>
                )}
              </div>
              
              {selectedImage && (
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer pt-1">
                  <input 
                    type="checkbox" 
                    checked={saveReceipt}
                    onChange={(e) => setSaveReceipt(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4"
                  />
                  Simpan foto struk sebagai lampiran
                </label>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      {/* Transaction Type Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
        <button
          type="button"
          disabled={!!fixedType}
          onClick={() => setType('expense')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            formData.type === 'expense' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          } ${fixedType && formData.type !== 'expense' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ArrowUpRight className={`w-4 h-4 ${formData.type === 'expense' ? 'text-red-500' : ''}`} />
          Expense
        </button>
        <button
          type="button"
          disabled={!!fixedType}
          onClick={() => setType('income')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            formData.type === 'income' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          } ${fixedType && formData.type !== 'income' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ArrowDownLeft className={`w-4 h-4 ${formData.type === 'income' ? 'text-green-500' : ''}`} />
          Income
        </button>
        <button
          type="button"
          disabled={!!fixedType}
          onClick={() => setType('transfer')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            formData.type === 'transfer' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          } ${fixedType && formData.type !== 'transfer' ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ArrowRightLeft className={`w-4 h-4 ${formData.type === 'transfer' ? 'text-blue-500' : ''}`} />
          Transfer
        </button>
      </div>

      {isInvalidTransfer && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
          Source and destination accounts cannot be the same for transfers.
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Date & Time</label>
        <input
          type="datetime-local"
          name="datetime"
          value={formData.datetime || ''}
          onChange={handleChange}
          className="w-full px-4 py-2.5 min-h-[44px] rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Transaction Title</label>
        <input 
          type="text" 
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          className="w-full px-4 py-2.5 min-h-[44px] rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50"
          placeholder="e.g., Grocery Shopping"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Amount</label>
        <InputPrice 
          name="price"
          value={formData.price || 0}
          onChange={handlePriceChange}
          required
        />
      </div>

      {(formData.type === 'expense' || formData.type === 'transfer') && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">From Account</label>
          <FixDropdown
            options={sourceAccountOptions}
            value={formData.sourceAccountId || sourceAccountOptions[0]?.value}
            onChange={(value) => handleDropdownChange('sourceAccountId', value)}
          />
        </div>
      )}

      {(formData.type === 'income' || formData.type === 'transfer') && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">To Account</label>
          <FixDropdown
            options={destinationAccountOptions}
            value={formData.destinationAccountId || destinationAccountOptions[1]?.value || destinationAccountOptions[0]?.value}
            onChange={(value) => handleDropdownChange('destinationAccountId', value)}
          />
        </div>
      )}

      {formData.type !== 'transfer' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <FixDropdown
            options={dynamicCategories}
            value={formData.category || 'Other'}
            onChange={(value) => handleDropdownChange('category', value)}
          />
        </div>
      )}

      {(formData.category === 'Debt Repayment' || formData.category === 'Loan Payment Received') && (
        <div className="flex flex-col gap-1.5 p-4 bg-orange-50 border border-orange-100 rounded-xl">
          <label className="text-sm font-medium text-orange-800">Select Debt / Loan</label>
          {debtOptions.length > 0 ? (
            <FixDropdown
              options={debtOptions}
              value={formData.linkedDebtId || ''}
              onChange={(value) => handleDropdownChange('linkedDebtId', value)}
              placeholder="Select active debt..."
            />
          ) : (
            <p className="text-sm text-orange-600">No active debts found for this category.</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <FixDropdown
          options={STATUS_OPTIONS}
          value={formData.status || 'Completed'}
          onChange={(value) => handleDropdownChange('status', value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-4 py-2.5 min-h-[44px] rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50"
          placeholder="Add transaction description..."
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Attachments</label>
        <input
          type="file"
          multiple
          onChange={(e) => {
            const files = e.target.files;
            if (files) {
              setFormData(prev => ({
                ...prev,
                attachments: Array.from(files).map((f: any) => f.name)
              }));
            }
          }}
          className="w-full px-4 py-2.5 min-h-[44px] rounded-xl border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
        />
        {formData.attachments && formData.attachments.length > 0 && (
          <p className="text-xs text-gray-500">Selected: {formData.attachments.join(', ')}</p>
        )}
      </div>

      <div className="flex gap-3 mt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 px-5 py-2.5 min-h-[44px] rounded-full border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isInvalidTransfer}
          className={`flex-1 px-5 py-2.5 min-h-[44px] rounded-full font-medium transition-colors ${
            isInvalidTransfer 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {initialData ? 'Save' : 'Add'}
        </button>
      </div>
    </form>
  </div>
);
}
