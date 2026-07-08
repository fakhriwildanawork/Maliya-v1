import React from 'react';
import { cn } from '../../../logic/utils/classNames';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  isLoading?: boolean;
}

export function Button({ className, variant = 'primary', isLoading, children, disabled, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-primary-light text-white hover:bg-primary-main active:scale-[0.98] active:opacity-90',
    outline: 'border border-border-main text-text-secondary hover:bg-bg-sidebar active:scale-[0.98] active:opacity-95',
    ghost: 'text-text-muted hover:text-text-secondary hover:bg-bg-sidebar active:scale-[0.95] active:opacity-95',
  };
  return (
    <button
      className={cn(
        'px-md py-sm rounded-full font-medium transition-all min-h-[2.75rem] flex items-center justify-center gap-sm',
        variants[variant],
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-[1rem] h-[1rem] animate-spin" />}
      {children}
    </button>
  );
}
