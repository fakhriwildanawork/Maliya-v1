import { useFinance } from '../context/FinanceContext';
import { CategoryInsert } from '../types/categories';

export function useCategories() {
  const { categories, loading, addCategory, updateCategory, deleteCategory, fetchCategories } = useFinance();

  return {
    categories,
    loading,
    addCategory: (category: CategoryInsert) => addCategory(category as any),
    updateCategory,
    deleteCategory,
    fetchCategories
  };
}
