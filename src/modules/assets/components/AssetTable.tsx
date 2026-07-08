import React, { useState } from 'react';
import { Asset } from '../../../logic/types/finance';
import { useFinance } from '../../../logic/context/FinanceContext';
import { TrendingUp, TrendingDown, Edit2, Trash2, RefreshCw } from 'lucide-react';
import Modal from '../../../ui/components/common/Modal';
import InputPrice from '../../../ui/components/elements/InputPrice';
import { Button } from '../../../ui/components/elements/Button';
import { InTableAction } from '../../../ui/components/elements/InTableAction';
import Swal from 'sweetalert2';

interface AssetTableProps {
  onEdit: (as: Asset) => void;
  filterCategory: string;
}

export default function AssetTable({ onEdit, filterCategory }: AssetTableProps) {
  const { assets, deleteAsset, addAssetValueLog } = useFinance();
  const [selectedAssetForPriceUpdate, setSelectedAssetForPriceUpdate] = useState<Asset | null>(null);
  const [newValue, setNewValue] = useState(0);
  const [updateNote, setUpdateNote] = useState('');

  const filteredAssets = assets.filter(as => {
    if (filterCategory === 'All') return true;
    return as.category === filterCategory;
  });

  const openValueUpdateModal = (as: Asset) => {
    setSelectedAssetForPriceUpdate(as);
    setNewValue(as.currentValue);
    setUpdateNote('Periodic market value adjustment');
  };

  const handleValueUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAssetForPriceUpdate) {
      addAssetValueLog(selectedAssetForPriceUpdate.id, newValue, updateNote);
      setSelectedAssetForPriceUpdate(null);
    }
  };

  const getCategoryLabel = (category: Asset['category']) => {
    switch (category) {
      case 'Property': return 'Property';
      case 'Vehicle': return 'Vehicle';
      case 'Electronics': return 'Electronics';
      case 'Jewelry': return 'Jewelry';
      case 'Business': return 'Business';
      default: return 'Other';
    }
  };

  const getCategoryBadgeClass = (category: Asset['category']) => {
    switch (category) {
      case 'Property': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Vehicle': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Electronics': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'Jewelry': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'Business': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">
              <th className="py-4 px-6">Physical Asset Name</th>
              <th className="py-4 px-6">Category</th>
              <th className="py-4 px-6 text-right">Acquisition Value</th>
              <th className="py-4 px-6 text-right">Current Value</th>
              <th className="py-4 px-6 text-right">Value Change (Appreciation/Depresiation)</th>
              <th className="py-4 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  No physical assets recorded for this category.
                </td>
              </tr>
            ) : (
              filteredAssets.map((as) => {
                const changeAmount = as.currentValue - as.purchasePrice;
                const changePercent = as.purchasePrice > 0 ? (changeAmount / as.purchasePrice) * 100 : 0;
                const isPositive = changeAmount >= 0;

                return (
                  <tr key={as.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {as.name}
                      <div className="text-xs text-gray-400 font-normal mt-0.5 max-w-sm truncate">
                        {as.description || 'No additional notes'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryBadgeClass(as.category)}`}>
                        {getCategoryLabel(as.category)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-xs">
                      <div className="text-gray-900 font-semibold">
                        Rp {as.purchasePrice.toLocaleString('id-ID')}
                      </div>
                      <div className="text-gray-400 mt-0.5">
                        Buy: {new Date(as.purchaseDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-gray-900">
                      Rp {as.currentValue.toLocaleString('id-ID')}
                      <div className="text-xs text-gray-400 font-normal mt-0.5">
                        As of: {new Date(as.lastUpdated).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        isPositive ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                      </span>
                      <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-500'} font-medium mt-0.5`}>
                        {isPositive ? '+' : ''}Rp {changeAmount.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <InTableAction
                          variant="refresh"
                          icon={RefreshCw}
                          onClick={() => openValueUpdateModal(as)}
                          title="New Valuation / Appraisal"
                        />
                        <InTableAction
                          variant="edit"
                          icon={Edit2}
                          onClick={() => onEdit(as)}
                          title="Edit Asset"
                        />
                        <InTableAction
                          variant="delete"
                          icon={Trash2}
                          onClick={() => {
                            Swal.fire({
                              title: 'Delete Physical Asset?',
                              text: `Are you sure you want to delete the asset ${as.name}? This action cannot be undone.`,
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#10B981',
                              cancelButtonColor: '#EF4444',
                              confirmButtonText: 'Yes, delete!',
                              cancelButtonText: 'Cancel'
                            }).then((result) => {
                              if (result.isConfirmed) {
                                deleteAsset(as.id).then(() => {
                                  Swal.fire({
                                    title: 'Success!',
                                    text: 'Asset has been deleted.',
                                    icon: 'success'
                                  });
                                }).catch((err) => {
                                  Swal.fire({
                                    title: 'Failed!',
                                    text: err.message || 'Failed to delete asset.',
                                    icon: 'error'
                                  });
                                });
                              }
                            });
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
        isOpen={selectedAssetForPriceUpdate !== null}
        onClose={() => setSelectedAssetForPriceUpdate(null)}
        title={`Update Asset Valuation: ${selectedAssetForPriceUpdate?.name}`}
      >
        {selectedAssetForPriceUpdate && (
          <form onSubmit={handleValueUpdateSubmit} className="flex flex-col gap-4">
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600 flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span>Initial Acquisition Cost:</span>
                <span className="font-semibold text-gray-900">
                  Rp {selectedAssetForPriceUpdate.purchasePrice.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Previous Market Value:</span>
                <span className="font-semibold text-gray-900">
                  Rp {selectedAssetForPriceUpdate.currentValue.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-500">New Appraised Value</label>
              <InputPrice 
                name="newValue"
                value={newValue}
                onChange={(_, val) => setNewValue(val)}
                placeholder="0"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-500">Valuation Notes (Optional)</label>
              <input
                type="text"
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                className="px-4 py-2 min-h-[44px] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-base sm:text-sm"
                placeholder="e.g. Market appraisal adjustment, annual depreciation"
              />
            </div>

            {newValue > 0 && (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs flex flex-col gap-1">
                <div className="flex justify-between text-gray-500">
                  <span>Change from Acquisition Cost:</span>
                  <span className={`font-bold ${
                    newValue >= selectedAssetForPriceUpdate.purchasePrice ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {newValue >= selectedAssetForPriceUpdate.purchasePrice ? '+' : ''}
                    {(((newValue - selectedAssetForPriceUpdate.purchasePrice) / selectedAssetForPriceUpdate.purchasePrice) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" type="button" className="flex-1" onClick={() => setSelectedAssetForPriceUpdate(null)}>Cancel</Button>
              <Button type="submit" className="flex-1 bg-green-500 text-white hover:bg-green-600 rounded-full font-medium transition-colors">
                Apply New Value
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
