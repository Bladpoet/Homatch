// STUB(C0) → Jazz builds the real one in J3. Keep the props.
// Sits between "Likes you" and "Discover" in the landlord deck. Swiping it either way
// (or tapping Continue) just moves on — it's never recorded as a swipe.
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function DividerCard({ onContinue }: { onContinue: () => void }) {
  return (
    <article className="absolute inset-x-3 top-1 bottom-0 flex flex-col items-center justify-center gap-4 rounded-deck-card bg-surface p-8 text-center shadow-deck-card">
      <Sparkles size={36} className="text-accent" />
      <h2 className="text-title font-semibold">That&apos;s everyone who liked this place</h2>
      <p className="text-body text-ink-muted">Here are renters whose preferences fit it. Swipe right and they&apos;ll match with you if they like it back.</p>
      <Button onClick={onContinue}>Show me</Button>
    </article>
  );
}
