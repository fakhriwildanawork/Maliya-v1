import React from 'react';
import { cn } from '../../../logic/utils/classNames';
import { Button } from './Button';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export function PrimaryButton({ className, icon, children, ...props }: PrimaryButtonProps) {
  return (
    <button 
      className={cn("flex items-center justify-center gap-sm px-lg py-sm min-h-[44px] rounded-full font-medium transition-all bg-primary-light hover:bg-primary-main text-white shadow-sm active:scale-[0.98] active:opacity-90", className)} 
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
