'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={() => onOpenChange(false)}
      onClick={(e) => {
        if (e.target === dialogRef.current) onOpenChange(false);
      }}
      className="m-auto p-0 bg-transparent max-w-lg w-full backdrop:bg-[#0A0A0A]/40 backdrop:backdrop-blur-sm border-none shadow-none rounded-[12px] overflow-visible"
    >
      {open && children}
    </dialog>
  );
}

export function DialogContent({
  className,
  children,
  onClose,
}: {
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      className={cn(
        'relative w-full rounded-[12px] border border-[#E8E8EC] bg-white p-6 shadow-xl',
        className
      )}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-[6px] p-1.5 text-[#9C9C9C] hover:text-[#0A0A0A] hover:bg-[#F4F4F6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0671B8]/30"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col space-y-1 pb-4 border-b border-[#E8E8EC]', className)}>
      {children}
    </div>
  );
}

export function DialogTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h3 className={cn('text-[18px] font-bold tracking-tight text-[#0A0A0A]', className)}>
      {children}
    </h3>
  );
}

export function DialogDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn('text-[13px] text-[#6B6B6B]', className)}>
      {children}
    </p>
  );
}

export function DialogFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex items-center justify-end space-x-2 pt-4 border-t border-[#E8E8EC] mt-5', className)}>
      {children}
    </div>
  );
}
