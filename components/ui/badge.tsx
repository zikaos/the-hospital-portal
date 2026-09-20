import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'active';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#0671B8] text-white',
    secondary: 'bg-[#F4F4F6] text-[#6B6B6B]',
    outline: 'border border-[#E8E8EC] text-[#0A0A0A] bg-white',
    pending: 'bg-[#FAB217]/15 text-[#966B00] border border-[#FAB217]/30',
    confirmed: 'bg-[#00A8A7]/15 text-[#007372] border border-[#00A8A7]/30',
    completed: 'bg-[#0671B8]/12 text-[#0671B8] border border-[#0671B8]/25',
    cancelled: 'bg-[#F37521]/15 text-[#C25208] border border-[#F37521]/30',
    active: 'bg-[#00A8A7]/15 text-[#007372] border border-[#00A8A7]/30',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-3 py-0.5 text-[12px] font-medium tracking-normal select-none',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
