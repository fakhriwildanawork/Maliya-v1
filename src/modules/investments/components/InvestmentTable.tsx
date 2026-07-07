import React, { useState } from 'react';
import { Investment } from '../../../logic/types/finance';
import { useFinance } from '../../../logic/context/FinanceContext';
import { TrendingUp, TrendingDown, Edit2, Trash2, ArrowUpRight, PlusCircle, RefreshCw } from 'lucide-react';
import Modal from '../../../ui/components/common/Modal';
import InputPrice from '../../../ui/components/elements/InputPrice';
import { Button } from '../../../ui/components/elements/Button';
import { InTableAction } from '../../../ui/components/elements/InTableAction';

interface InvestmentTableProps {
  onEdit: (inv: Investment) => void;
  filterType: string;
}

export default function InvestmentTable({ onEdit, filterType }: InvestmentTableProps) {
  const { investments, deleteInvestment, addInvestmentValueLog } = useFinance();
  const [selectedInvForPriceUpdate, setSelectedInvForPriceUpdate] = useState<Investment | null>(null);
  const [newMarketPrice, setNewMarketPrice] = useState(0);
  const [updateNote, setUpdateNote] = useState('');

  const filteredInvestments = investments.filter(inv => {
    if (filterType === 'All') return true;
    return inv.type === filterType;
  });

  const openPriceUpdateModal = (inv: Investment) => {
    setSelectedInvForPriceUpdate(inv);
    setNewMarketPrice(inv.currentPrice);
    setUpdateNote('Daily market price adjustment');
  };

  const handlePriceUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInvForPriceUpdate) {
      addInvestmentValueLog(selectedInvForPriceUpdate.id, newMarketPrice, updateNote);
      setSelectedInvForPriceUpdate(null);
    }
  };

  const getTypeLabel = (type: Investment['type']) => {
    switch (type) {
      case 'Stock': return 'Stock';
      case 'Mutual Fund': return 'Mutual Fund';
      case 'Crypto': return 'Crypto';
      case 'Gold': return 'Gold';
      case 'Real Estate': return 'Real Estate';
      case 'P2P Lending': return 'P2P Lending';
      default: return 'Other';
    }
  };

  const getTypeBadgeClass = (type: Investment['type']) => {
    switch (type) {
      case 'Stock': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Mutual Fund': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Crypto': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Gold': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'Real Estate': return 'bg-teal-50 text-teal-700 border-teal-100';
      case 'P2P Lending': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
              <th className="py-4 px-6">Asset Name</th>
              <th className="py-4 px-6">Type</th>
              <th className="py-4 px-6 text-right">Ownership (Units)</th>
              <th className="py-4 px-6 text-right">Average / Market Price</th>
              <th className="py-4 px-6 text-right">Invested Capital</th>
              <th className="py-4 px-6 text-right">Current Value</th>
              <th className="py-4 px-6 text-right">Estimated ROI</th>
              <th className="py-4 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredInvestments.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  No investment assets recorded for this category.
                </td>
              </tr>
            ) : (
              filteredInvestments.map((inv) => {
                const gainAmount = inv.currentValue - inv.investedAmount;
                const gainPercent = inv.investedAmount > 0 ? (gainAmount / inv.investedAmount) * 100 : 0;
                const isPositive = gainAmount >= 0;

                return (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {inv.name}
                      <div className="text-xs text-gray-400 font-normal mt-0.5">
                        Buy: {new Date(inv.purchaseDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadgeClass(inv.type)}`}>
                        {getTypeLabel(inv.type)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-gray-700">
                      {inv.quantity.toLocaleString('id-ID', { maximumFractionDigits: 6 })}
                    </td>
                    <td className="py-4 px-6 text-right text-xs">
                      <div className="text-gray-500">
                        Buy: Rp {inv.averageBuyPrice.toLocaleString('id-ID')}
                      </div>
                      <div className="text-gray-900 font-semibold mt-0.5">
                        Market: Rp {inv.currentPrice.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-900">
                      Rp {inv.investedAmount.toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-gray-900">
                      Rp {inv.currentValue.toLocaleString('id-ID')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        isPositive ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPositive ? '+' : ''}{gainPercent.toFixed(2)}%
                      </span>
                      <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-500'} font-medium mt-0.5`}>
                        {isPositive ? '+' : ''}Rp {gainAmount.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <InTableAction
                          variant="refresh"
                          icon={RefreshCw}
                          onClick={() => openPriceUpdateModal(inv)}
                          title="Update Market Value"
                        />
                        <InTableAction
                          variant="edit"
                          icon={Edit2}
                          onClick={() => onEdit(inv)}
                          title="Edit Asset"
                        />
                        <InTableAction
                          variant="delete"
                          icon={Trash2}
                          onClick={() => {
                            if (confirm(`Delete investment record for ${inv.name}?`)) {
                              deleteInvestment(inv.id);
                            }
                          }}
                          title="Delete"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={selectedInvForPriceUpdate !== null}
        onClose={() => setSelectedInvForPriceUpdate(null)}
        title={`Update Market Price: ${selectedInvForPriceUpdate?.name}`}
      >
        {selectedInvForPriceUpdate && (
          <form onSubmit={handlePriceUpdateSubmit} className="flex flex-col gap-4">
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600 flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span>Ownership Quantity:</span>
                <span className="font-semibold text-gray-900">
                  {selectedInvForPriceUpdate.quantity} units
                </span>
              </div>
              <div className="flex justify-between">
                <span>Average Buy Price:</span>
                <span className="font-semibold text-gray-900">
                  Rp {selectedInvForPriceUpdate.averageBuyPrice.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Market Price:</span>
                <span className="font-semibold text-gray-900">
                  Rp {selectedInvForPriceUpdate.currentPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-500">New Market Price per Unit</label>
              <InputPrice 
                name="newMarketPrice"
                value={newMarketPrice}
                onChange={(_, val) => setNewMarketPrice(val)}
                placeholder="0"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-500">Change Note (Optional)</label>
              <input
                type="text"
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                className="px-4 py-2 min-h-[44px] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-base sm:text-sm"
                placeholder="e.g. Daily exchange correction, dividend distribution, etc."
              />
            </div>

            {newMarketPrice > 0 && (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs flex flex-col gap-1">
                <div className="flex justify-between text-gray-500">
                  <span>New Portfolio Value:</span>
                  <span className="font-bold text-gray-900">
                    Rp {(selectedInvForPriceUpdate.quantity * newMarketPrice).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>New Estimated ROI:</span>
                  <span className={`font-bold ${
                    newMarketPrice >= selectedInvForPriceUpdate.averageBuyPrice ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {newMarketPrice >= selectedInvForPriceUpdate.averageBuyPrice ? '+' : ''}
                    {(((newMarketPrice - selectedInvForPriceUpdate.averageBuyPrice) / selectedInvForPriceUpdate.averageBuyPrice) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" type="button" className="flex-1" onClick={() => setSelectedInvForPriceUpdate(null)}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-green-500 text-white hover:bg-green-600 rounded-full font-medium transition-colors">
                Apply New Price
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
