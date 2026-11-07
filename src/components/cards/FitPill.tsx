// STUB(C0) → Jazz builds the real one in J2. Keep the props.
export function FitPill({ score }: { score: number }) {
  return (
    <span className="inline-flex h-7 items-center rounded-chip bg-surface/90 px-2.5 text-label font-bold text-ink backdrop-blur">
      {score}% fit
    </span>
  );
}
