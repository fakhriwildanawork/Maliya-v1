import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from './Button';
import Swal from 'sweetalert2';

interface BulkActionButtonProps {
  selectedCount: number;
  onDeleteAll: () => void;
}

export function BulkActionButton({ selectedCount, onDeleteAll }: BulkActionButtonProps) {
  if (selectedCount === 0) return null;

  const handleDelete = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedCount} transactions!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete!'
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteAll();
      }
    });
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-lg border border-gray-200 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-4 z-50 animate-in slide-in-from-bottom-4 w-auto max-w-[calc(100%-2rem)]">
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{selectedCount} selected</span>
      <Button 
        variant="outline" 
        onClick={handleDelete}
        className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 py-1 px-3 sm:px-4 min-h-[38px]"
      >
        <Trash2 size={16} />
        <span className="hidden xs:inline">Delete All</span>
        <span className="xs:hidden">Delete</span>
      </Button>
    </div>
  );
}
