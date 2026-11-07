'use client';
// PLACEHOLDER → Kamsi builds the 5-step stepper in K2 (docs/PRODUCT.md §1).
// Until then: one button that saves sensible defaults so Sam isn't stuck.
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { saveTenantPrefs } from '@/lib/api';
import { useCurrentUser } from '@/lib/hooks';

export default function TenantOnboarding() {
  const router = useRouter();
  const { user } = useCurrentUser();

  return (
    <div className="flex flex-1 flex-col justify-end gap-4 p-6">
      <h1 className="text-display font-bold">Let&apos;s find your place</h1>
      <p className="text-body text-ink-muted">
        Onboarding stepper goes here (task K2): budget, areas, move-in, household, photo and bio.
      </p>
      <Button
        size="lg"
        disabled={!user}
        onClick={async () => {
          if (!user) return;
          await saveTenantPrefs(user.id, {
            budgetMin: 1400,
            budgetMax: 2000,
            areas: ['Drumcondra', 'Phibsborough', 'Dublin City Centre'],
            moveInBy: '2026-12-15',
            bedroomsMin: 1,
            leaseMonths: 12,
            pets: false,
            smoker: false,
            householdSize: 1,
          });
          router.replace('/discover');
        }}
      >
        Use demo preferences
      </Button>
    </div>
  );
}
