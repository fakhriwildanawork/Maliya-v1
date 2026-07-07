import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../logic/utils/classNames';
import { useViewport } from '../../../logic/context/ViewportContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
}

export default function Modal({ isOpen, onClose, title, children, width = '42rem' }: ModalProps) {
  const { isCompact, isMedium } = useViewport();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  if (isCompact) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-text-primary/40 backdrop-blur-[1px] transition-opacity"
          onClick={onClose}
        />
        {/* Bottom Sheet Container */}
        <div 
          className="relative z-50 w-full bg-bg-main rounded-t-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-in slide-in-from-bottom duration-300 border-t border-border-light"
        >
          {/* Drag Handle Indicator */}
          <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto my-3 flex-shrink-0" />
          
          {title && (
            <div className="flex items-center justify-between px-lg pb-md border-b border-border-light">
              <h2 className="text-lg font-bold text-text-primary">{title}</h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-sidebar transition-colors min-w-[40px] min-h-[40px]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          {!title && (
            <button 
              onClick={onClose}
              className="absolute top-md right-md z-10 w-10 h-10 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-sidebar transition-colors min-w-[40px] min-h-[40px]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          <div className="p-lg overflow-y-auto overflow-x-hidden pb-12">
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
      <div 
        className="absolute inset-0 bg-text-primary/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      <div 
        className="relative w-full bg-bg-main rounded-lg shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{ maxWidth: isMedium ? '90vw' : width }}
      >
        {title && (
          <div className="flex items-center justify-between px-lg py-md border-b border-border-light bg-bg-sidebar">
            <h2 className="text-lg font-bold text-text-primary">{title}</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-main transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {!title && (
          <button 
            onClick={onClose}
            className="absolute top-md right-md z-10 w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-sidebar transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="p-lg overflow-y-auto overflow-x-hidden max-h-[calc(100vh-10rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}
