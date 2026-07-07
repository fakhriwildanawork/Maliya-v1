import { useState, useEffect, useCallback } from 'react';
import { Asset, AssetInsert } from '../types/assets';
import { AssetService } from '../services/assetService';

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AssetService.getAll();
      setAssets(data);
    } catch (err: any) {
      setError(err);
      console.error('Failed to fetch assets', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const addAsset = async (asset: AssetInsert) => {
    const newAsset = await AssetService.create(asset);
    setAssets(prev => [newAsset, ...prev]);
    return newAsset;
  };

  const updateAsset = async (id: string, updates: Partial<AssetInsert>) => {
    const updated = await AssetService.update(id, updates);
    const data = await AssetService.getAll();
    setAssets(data);
    return updated;
  };

  const deleteAsset = async (id: string) => {
    await AssetService.delete(id);
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const addAssetValueLog = async (assetId: string, newValue: number, note: string) => {
    await AssetService.addValueLog(assetId, newValue, note);
    const data = await AssetService.getAll();
    setAssets(data);
  };

  return {
    assets,
    loading,
    error,
    fetchAssets,
    addAsset,
    updateAsset,
    deleteAsset,
    addAssetValueLog
  };
}
