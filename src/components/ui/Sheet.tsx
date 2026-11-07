'use client';
// STUB(C0) → Kamsi builds the real one in K1a (spring open, drag-to-dismiss). Keep the props.
// Bottom sheet. Contained inside PhoneFrame (see PhoneFrame layout contract).
import { useEffect } from 'react';

export type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <button aria-label="Close" className="absolute inset-0 bg-scrim" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[92%] overflow-y-auto rounded-t-sheet bg-surface pb-[max(16px,env(safe-area-inset-bottom))] shadow-sheet"
      >
        <div className="sticky top-0 z-10 flex flex-col items-center bg-surface pt-2 pb-1">
          <div className="h-1 w-10 rounded-full bg-line" />
          {title && <h2 className="mt-3 text-title font-semibold">{title}</h2>}
        </div>
        {children}
      </div>
    </div>
  );
}
