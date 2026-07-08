import React from 'react';
import { cn } from '../../../logic/utils/classNames';
import { Loader2 } from 'lucide-react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  isLoading?: boolean;
}

export function PrimaryButton({ className, icon, children, isLoading, disabled, ...props }: PrimaryButtonProps) {
  return (
    <button 
      className={cn(
        "flex items-center justify-center gap-sm px-lg py-sm min-h-[2.75rem] rounded-full font-medium transition-all bg-primary-light hover:bg-primary-main text-white shadow-sm active:scale-[0.98] active:opacity-90",
        (disabled || isLoading) && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-[1rem] h-[1rem] animate-spin" /> : icon}
      {children}
    </button>
  );
}
