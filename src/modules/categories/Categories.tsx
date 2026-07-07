import React, { useMemo, useState } from 'react';
import { Plus, Search, FolderOpen, Edit2, Trash2, ArrowUpRight, ArrowDownRight, ArrowRightLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { useFinance } from '../../logic/context/FinanceContext';
import { useAuth } from '../../logic/context/AuthContext';
import { useCategories } from '../../logic/hooks/useCategories';
import { PrimaryButton } from '../../ui/components/elements/PrimaryButton';
import FixDropdown from '../../ui/components/elements/FixDropdown';
import { cn } from '../../logic/utils/classNames';
import { InTableAction } from '../../ui/components/elements/InTableAction';
import { PageLoadingState } from '../../ui/components/common/PageLoadingState';

const TYPE_OPTIONS = [
  { value: 'All', label: 'All Types' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'transfer', label: 'Transfer' },
];

export default function Categories() {
  const { activities } = useFinance();
  const { categories: dbCategories, addCategory, updateCategory, deleteCategory, loading } = useCategories();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Derive categories strictly from database categories
  const categories = useMemo(() => {
    return dbCategories
      .map(cat => {
        const matchingActivities = activities.filter(act => act.category.toLowerCase() === cat.name.toLowerCase());
        const count = matchingActivities.length;
        const total = matchingActivities.reduce((sum, act) => sum + act.price, 0);
        return {
          id: cat.id,
          name: cat.name,
          type: cat.type,
          count,
          total
        };
      })
      .filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filterType === 'All' || cat.type === filterType)
      )
      .sort((a, b) => b.total - a.total);
  }, [activities, searchQuery, filterType, dbCategories]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'income': return 'text-green-600 bg-green-50 border-green-100';
      case 'expense': return 'text-red-600 bg-red-50 border-red-100';
      case 'transfer': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getCardStyle = (type: string) => {
    switch(type) {
      case 'income': return 'bg-green-50/50 border-green-100 hover:border-green-300';
      case 'expense': return 'bg-red-50/50 border-red-100 hover:border-red-300';
      case 'transfer': return 'bg-blue-50/50 border-blue-100 hover:border-blue-300';
      default: return 'bg-white border-gray-100 hover:border-gray-200';
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'income': return <ArrowUpRight className="w-5 h-5 text-green-600" />;
      case 'expense': return <ArrowDownRight className="w-5 h-5 text-red-600" />;
      case 'transfer': return <ArrowRightLeft className="w-5 h-5 text-blue-600" />;
      default: return <FolderOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  const getIconBg = (type: string) => {
    switch(type) {
      case 'income': return 'bg-green-100 border-green-200';
      case 'expense': return 'bg-red-100 border-red-200';
      case 'transfer': return 'bg-blue-100 border-blue-200';
      default: return 'bg-gray-50 border-gray-100';
    }
  };

  const handleEdit = (catId: string | undefined, catName: string) => {
    if (!catId) {
      Swal.fire({
        icon: 'error',
        title: 'Predefined Category',
        text: 'This category is derived from transaction history and cannot be edited. You can only edit custom categories.',
        confirmButtonColor: '#10b981'
      });
      return;
    }

    Swal.fire({
      title: 'Edit Category',
      input: 'text',
      inputValue: catName,
      showCancelButton: true,
      confirmButtonText: 'Save',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      inputValidator: (value) => {
        if (!value) {
          return 'Category name cannot be empty!';
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          await updateCategory(catId, { 
            name: result.value.trim(),
            updatedBy: currentUser?.id || undefined
          });
          Swal.fire('Saved!', 'Category has been updated.', 'success');
        } catch (err) {
          console.error(err);
          Swal.fire('Error', 'Failed to update category', 'error');
        }
      }
    });
  };

  const handleDelete = (catId: string | undefined, catName: string, count: number) => {
    if (!catId) {
      Swal.fire({
        icon: 'error',
        title: 'Predefined Category',
        text: 'This category is derived from transaction history and cannot be deleted.',
        confirmButtonColor: '#10b981'
      });
      return;
    }

    if (count > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Cannot Delete Category',
        text: `Kategori tidak bisa dihapus karena memiliki ${count} transaksi terkait. Hapus atau pindahkan transaksinya terlebih dahulu.`,
        confirmButtonColor: '#10b981'
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete category "${catName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteCategory(catId);
          Swal.fire('Deleted!', 'Category has been deleted.', 'success');
        } catch (err) {
          console.error(err);
          Swal.fire('Error', 'Failed to delete category', 'error');
        }
      }
    });
  };

  const handleAdd = () => {
    Swal.fire({
      title: 'Add New Category',
      html: `
        <div class="flex flex-col gap-4 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input id="swal-input-name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Subscriptions">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div class="flex p-1 bg-gray-100 rounded-xl">
              <label class="flex-1 cursor-pointer">
                <input type="radio" name="cat_type" value="expense" class="peer sr-only" checked>
                <div class="text-center py-1.5 px-3 text-sm font-medium rounded-lg text-gray-500 peer-checked:bg-white peer-checked:text-gray-900 peer-checked:shadow-sm transition-all">Expense</div>
              </label>
              <label class="flex-1 cursor-pointer">
                <input type="radio" name="cat_type" value="income" class="peer sr-only">
                <div class="text-center py-1.5 px-3 text-sm font-medium rounded-lg text-gray-500 peer-checked:bg-white peer-checked:text-gray-900 peer-checked:shadow-sm transition-all">Income</div>
              </label>
              <label class="flex-1 cursor-pointer">
                <input type="radio" name="cat_type" value="transfer" class="peer sr-only">
                <div class="text-center py-1.5 px-3 text-sm font-medium rounded-lg text-gray-500 peer-checked:bg-white peer-checked:text-gray-900 peer-checked:shadow-sm transition-all">Transfer</div>
              </label>
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Add Category',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const name = (document.getElementById('swal-input-name') as HTMLInputElement).value.trim();
        const type = (document.querySelector('input[name="cat_type"]:checked') as HTMLInputElement).value;
        if (!name) {
          Swal.showValidationMessage('Category name is required!');
          return false;
        }
        return { name, type };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const { name, type } = result.value as { name: string; type: 'expense' | 'income' | 'transfer' };
        const exists = categories.some(c => c.name.toLowerCase() === name.toLowerCase());
        if (exists) {
           Swal.fire('Error', 'Category already exists!', 'error');
           return;
        }
        try {
          await addCategory({ 
            name, 
            type,
            createdBy: currentUser?.id || undefined,
            updatedBy: currentUser?.id || undefined
          });
          Swal.fire('Added!', 'New category has been added.', 'success');
        } catch (err) {
          console.error(err);
          Swal.fire('Error', 'Failed to add category', 'error');
        }
      }
    });
  };

  return (
    <PageLoadingState isLoading={loading}>
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <main className="p-4 md:p-8 flex-1 w-full max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-500 text-sm mt-1">Manage your transaction categories</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <PrimaryButton className="w-full sm:w-auto" onClick={handleAdd} icon={<Plus className="w-4 h-4" />}>
                Add Category
              </PrimaryButton>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-50 flex-1">
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 gap-4">
              <div className="relative flex-1 min-w-[200px] w-full max-w-md flex items-center">
                <Search className="w-5 h-5 absolute left-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search categories..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 min-h-[44px] rounded-full border border-gray-200 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
              </div>
              <div className="w-full md:w-48 shrink-0">
                <FixDropdown 
                  options={TYPE_OPTIONS}
                  value={filterType}
                  onChange={setFilterType}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat, idx) => (
                <div key={idx} className={cn("border rounded-2xl p-5 transition-all group flex flex-col gap-4 shadow-sm", getCardStyle(cat.type))}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", getIconBg(cat.type))}>
                        {getIcon(cat.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn("text-xs px-2 py-0.5 rounded-md border font-medium uppercase tracking-wider", getTypeColor(cat.type))}>
                            {cat.type}
                          </span>
                          <span className="text-xs text-gray-500">{cat.count} items</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity bg-white/50 rounded-lg p-0.5">
                      <InTableAction
                        variant="edit"
                        icon={Edit2}
                        onClick={() => handleEdit(cat.id, cat.name)}
                        title="Edit Category"
                      />
                      <InTableAction
                        variant="delete"
                        icon={Trash2}
                        onClick={() => handleDelete(cat.id, cat.name, cat.count)}
                        title="Delete Category"
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-black/5 flex justify-between items-end mt-2">
                    <span className="text-sm text-gray-600 font-medium">Total Value</span>
                    <span className="font-bold text-gray-900 text-lg">{formatCurrency(cat.total)}</span>
                  </div>
                </div>
              ))}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <FolderOpen className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-medium mb-1">No categories found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>
      </main>
    </div>
    </PageLoadingState>
  );
}
