// STUB(C0) → Jazz builds the real one in J1. Keep the props.
import { Heart, RotateCcw, X } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';

export type DeckControlsProps = {
  onPass: () => void;
  onLike: () => void;
  onRewind?: () => void;
  disabled?: boolean;
};

export function DeckControls({ onPass, onLike, onRewind, disabled }: DeckControlsProps) {
  return (
    <div className="flex items-center justify-center gap-5 py-3">
      <IconButton label="Pass" tone="pass" size="lg" onClick={onPass} disabled={disabled}>
        <X size={30} strokeWidth={2.6} />
      </IconButton>
      {onRewind && (
        <IconButton label="Undo last swipe" size="sm" onClick={onRewind} className="text-rewind">
          <RotateCcw size={20} strokeWidth={2.4} />
        </IconButton>
      )}
      <IconButton label="Like" tone="like" size="lg" onClick={onLike} disabled={disabled}>
        <Heart size={28} strokeWidth={2.6} />
      </IconButton>
    </div>
  );
}
