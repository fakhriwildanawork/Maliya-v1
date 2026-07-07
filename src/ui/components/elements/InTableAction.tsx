import React from 'react';
import { cn } from '../../../logic/utils/classNames';

interface InTableActionProps {
  variant: 'edit' | 'delete' | 'refresh' | 'custom';
  title?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: (e: any) => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function InTableAction({ variant, icon: Icon, title, className, ...props }: InTableActionProps) {
  const styles = {
    edit: 'text-blue-500 hover:bg-blue-50',
    delete: 'text-red-500 hover:bg-red-50',
    refresh: 'text-green-600 hover:bg-green-50',
    custom: 'text-gray-500 hover:bg-gray-100',
  };

  return (
    <button
      type="button"
      title={title}
      className={cn(
        'p-2 lg:p-1.5 min-h-[44px] min-w-[44px] lg:min-h-0 lg:min-w-0 rounded-lg transition-colors inline-flex items-center justify-center',
        styles[variant],
        className
      )}
      {...props}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
