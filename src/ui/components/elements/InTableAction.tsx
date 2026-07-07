import React from 'react';
import { cn } from '../../../logic/utils/classNames';
import * as TOKENS from '../../styles/tokens';

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
    refresh: cn(TOKENS.TEXT_INCOME, 'hover:bg-green-50'),
    custom: cn(TOKENS.TEXT_SECONDARY, 'hover:bg-gray-100'),
  };

  return (
    <button
      type="button"
      title={title}
      className={cn(
        'p-2 lg:p-1.5 min-h-[2.75rem] min-w-[2.75rem] lg:min-h-0 lg:min-w-0 transition-colors inline-flex items-center justify-center',
        TOKENS.RADIUS_DEFAULT,
        styles[variant],
        className
      )}
      {...props}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
