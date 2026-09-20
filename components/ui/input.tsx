import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-[38px] w-full rounded-[6px] border bg-[#FFFFFF] px-3.5 py-2.5 text-[14px] text-[#0A0A0A] placeholder:text-[#9C9C9C] transition-colors focus-visible:outline-none focus-visible:border-[#0671B8] focus-visible:ring-[3px] focus-visible:ring-[#0671B8]/12 disabled:cursor-not-allowed disabled:bg-[#FAFAFA] disabled:opacity-60',
          error ? 'border-[#F37521] focus-visible:border-[#F37521] focus-visible:ring-[#F37521]/15' : 'border-[#E8E8EC]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
