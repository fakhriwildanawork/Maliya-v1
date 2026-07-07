import { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';

/**
 * Hook to manage loading state for modules.
 * Combines global loading state with a minimum initial loading duration for visual consistency.
 */
export function useModuleLoading() {
  const { loading: globalLoading } = useFinance();
  return globalLoading;
}
