'use client';
// Bottom sheet. Springs open (300/30); drag the handle/header down to dismiss
// (>25% of its height or >500px/s), otherwise it springs back. Dragging starts only
// from the handle area, so scrolling inside the sheet never fights the gesture.
// Contained inside PhoneFrame (see its layout contract). Keep the props.
import { AnimatePresence, animate, motion, useDragControls, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect, useRef } from 'react';
import { spring } from '@/styles/motion';

export type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export function Sheet({ open, onClose, title, children }: SheetProps) {
  return <AnimatePresence>{open && <Panel onClose={onClose} title={title}>{children}</Panel>}</AnimatePresence>;
}

function Panel({ onClose, title, children }: Omit<SheetProps, 'open'>) {
  const reduce = useReducedMotion();
  const controls = useDragControls();
  const panel = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const backdrop = useTransform(y, (v) => 1 - Math.min(Math.max(v, 0) / 600, 0.6));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Fades as the sheet is dragged down. */}
        <motion.button aria-label="Close" className="absolute inset-0 bg-scrim" style={{ opacity: backdrop }} onClick={onClose} />
      </motion.div>
      <motion.div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[92%] flex-col overflow-hidden rounded-t-sheet bg-surface shadow-sheet"
        style={{ y }}
        initial={reduce ? { opacity: 0 } : { y: '100%' }}
        animate={reduce ? { opacity: 1 } : { y: 0 }}
        exit={reduce ? { opacity: 0 } : { y: '100%' }}
        transition={reduce ? { duration: 0.15 } : spring.sheet}
        drag={reduce ? false : 'y'}
        dragControls={controls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.9 }}
        onDragEnd={(_, info) => {
          const h = panel.current?.offsetHeight ?? 600;
          if (info.offset.y > h * 0.25 || info.velocity.y > 500) onClose();
          else animate(y, 0, spring.sheet);
        }}
      >
        <div
          className="flex shrink-0 cursor-grab touch-none flex-col items-center pt-2 pb-1 active:cursor-grabbing"
          onPointerDown={(e) => controls.start(e)}
        >
          <div className="h-1 w-10 rounded-full bg-line" />
          {title && <h2 className="mt-3 text-title font-semibold">{title}</h2>}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
          {/* Spacer instead of padding: padding would leave a gap under sticky footers. */}
          <div aria-hidden className="h-[max(16px,env(safe-area-inset-bottom))]" />
        </div>
      </motion.div>
    </div>
  );
}
