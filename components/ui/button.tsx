import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'clinic';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', type = 'button', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-[6px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#0671B8]/15 disabled:pointer-events-none disabled:opacity-50 select-none';

    // Map 'clinic' or 'default' to 'primary'
    const actualVariant = (variant === 'default' || variant === 'clinic') ? 'primary' : variant;

    const variants = {
      primary:
        'bg-[#0671B8] text-white hover:bg-[#035897] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(6,113,184,0.35)] active:translate-y-0 active:shadow-none',
      secondary:
        'bg-transparent border border-[#E8E8EC] text-[#0A0A0A] hover:bg-[#F4F4F6] hover:-translate-y-[1px] active:translate-y-0',
      outline:
        'bg-transparent border border-[#E8E8EC] text-[#0A0A0A] hover:bg-[#F4F4F6] hover:-translate-y-[1px] active:translate-y-0',
      ghost:
        'bg-transparent text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-[#F4F4F6] active:bg-[#E8E8EC]',
      destructive:
        'bg-transparent border border-[#F37521] text-[#F37521] hover:bg-[#F37521]/10 hover:-translate-y-[1px] active:translate-y-0',
    };

    const sizes = {
      default: 'h-[38px] px-4 text-[14px]',
      sm: 'h-8 px-3 text-[12px]',
      lg: 'h-11 px-6 text-[15px]',
      icon: 'h-[38px] w-[38px]',
    };

    return (
      <button
        type={type}
        className={cn(baseStyles, variants[actualVariant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
