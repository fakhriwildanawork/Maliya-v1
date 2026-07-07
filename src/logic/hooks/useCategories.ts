import { useState, useEffect, useCallback } from 'react';
import { Category, CategoryInsert } from '../types/categories';
import { CategoryService } from '../services/categoryService';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CategoryService.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err);
      console.error('Failed to fetch categories', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (category: CategoryInsert) => {
    const newCategory = await CategoryService.create(category);
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = async (id: string, updates: Partial<CategoryInsert>) => {
    const updated = await CategoryService.update(id, updates);
    setCategories(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  };

  const deleteCategory = async (id: string) => {
    await CategoryService.delete(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory
  };
}
