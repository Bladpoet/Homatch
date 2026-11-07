'use client';
// STUB(C0) → Jazz builds the real one in J4. Keep the props.
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { formatBudget, formatDate } from '@/lib/format';
import type { Fit, Tenant } from '@/lib/types';
import { ReasonChips } from './ReasonChips';

export type TenantDetailProps = {
  tenant: Tenant;
  fit: Fit;
  open: boolean;
  onClose: () => void;
  onPass?: () => void;
  onLike?: () => void;
};

export function TenantDetail({ tenant, fit, open, onClose, onPass, onLike }: TenantDetailProps) {
  const p = tenant.prefs;
  return (
    <Sheet open={open} onClose={onClose} title={tenant.name}>
      <div className="px-4 pt-3">
        <div className="relative aspect-square overflow-hidden rounded-card bg-surface-2">
          <Image src={tenant.avatarUrl} alt={tenant.name} fill sizes="360px" className="object-cover" />
        </div>
      </div>
      <div className="space-y-5 p-4">
        <div>
          <p className="text-title font-semibold">
            {tenant.occupation}
            {tenant.age ? `, ${tenant.age}` : ''}
          </p>
          {tenant.bio && <p className="mt-2 text-body">{tenant.bio}</p>}
        </div>
        <section>
          <h3 className="mb-2 text-label font-semibold">Why they fit this place</h3>
          <ReasonChips fit={fit} max={6} />
        </section>
        <dl className="grid grid-cols-2 gap-3 text-label">
          <Spec k="Budget" v={formatBudget(p.budgetMin, p.budgetMax)} />
          <Spec k="Move in by" v={formatDate(p.moveInBy)} />
          <Spec k="Household" v={`${p.householdSize} ${p.householdSize === 1 ? 'person' : 'people'}`} />
          <Spec k="Pets" v={p.pets ? 'Yes' : 'No'} />
          <Spec k="Smoker" v={p.smoker ? 'Yes' : 'No'} />
          <Spec k="Lease" v={`${p.leaseMonths} months`} />
        </dl>
        <section>
          <h3 className="mb-2 text-label font-semibold">Looking in</h3>
          <p className="text-body text-ink-muted">{p.areas.join(', ') || 'Anywhere'}</p>
        </section>
      </div>
      {(onPass || onLike) && (
        <div className="sticky bottom-0 flex gap-3 bg-surface px-4 pt-2">
          {onPass && (
            <Button variant="secondary" size="lg" onClick={onPass}>
              Pass
            </Button>
          )}
          {onLike && (
            <Button size="lg" onClick={onLike}>
              Yes
            </Button>
          )}
        </div>
      )}
    </Sheet>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-input bg-surface-2 px-3 py-2">
      <dt className="text-caption text-ink-muted">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}
