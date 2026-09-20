import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            'flex h-[38px] w-full appearance-none rounded-[6px] border bg-[#FFFFFF] px-3.5 py-2 text-[14px] text-[#0A0A0A] transition-colors focus-visible:outline-none focus-visible:border-[#0671B8] focus-visible:ring-[3px] focus-visible:ring-[#0671B8]/12 disabled:cursor-not-allowed disabled:bg-[#FAFAFA] disabled:opacity-60 pr-9 cursor-pointer',
            error ? 'border-[#F37521] focus-visible:border-[#F37521]' : 'border-[#E8E8EC]',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6B6B6B]">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
