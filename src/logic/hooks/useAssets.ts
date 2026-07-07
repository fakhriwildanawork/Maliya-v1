import { useFinance } from '../context/FinanceContext';

export function useAssets() {
  const { 
    assets, 
    loading, 
    addAsset, 
    updateAsset, 
    deleteAsset, 
    addAssetValueLog, 
    fetchAssets 
  } = useFinance();

  return {
    assets,
    loading,
    addAsset,
    updateAsset,
    deleteAsset,
    addAssetValueLog,
    fetchAssets
  };
}
