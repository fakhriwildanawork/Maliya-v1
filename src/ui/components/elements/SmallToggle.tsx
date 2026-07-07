import React from 'react';
import { cn } from '../../../logic/utils/classNames';

interface SmallToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function SmallToggle({ checked, onChange }: SmallToggleProps) {
  return (
    <div className="inline-flex items-center justify-center min-h-[44px] min-w-[44px]">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out",
          checked ? "bg-green-500" : "bg-gray-200"
        )}
      >
        <span className="sr-only">Toggle status</span>
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
