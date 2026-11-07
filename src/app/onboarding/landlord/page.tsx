'use client';
// PLACEHOLDER → Coleman builds the create-listing stepper in C6 (docs/PRODUCT.md §2).
import Link from 'next/link';

export default function LandlordOnboarding() {
  return (
    <div className="flex flex-1 flex-col justify-end gap-4 p-6">
      <h1 className="text-display font-bold">List a place</h1>
      <p className="text-body text-ink-muted">
        Create-listing stepper goes here (task C6): photos, basics, rent and dates, rules, description.
      </p>
      <Link href="/discover" className="flex h-14 items-center justify-center rounded-button bg-accent font-semibold text-on-accent">
        Back to Discover
      </Link>
    </div>
  );
}
