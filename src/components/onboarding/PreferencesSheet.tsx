'use client';
// The Start matching form inside a bottom sheet: Discover's filter button and
// Profile → Edit preferences. Loads the tenant's saved prefs, saves on submit.
import { useEffect, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { getTenant, saveTenantPrefs } from '@/lib/api';
import type { TenantPrefs } from '@/lib/types';
import { PreferencesForm } from './PreferencesForm';

export function PreferencesSheet({
  tenantId,
  open,
  onClose,
  onSaved,
}: {
  tenantId: string;
  open: boolean;
  onClose: () => void;
  onSaved?: (p: TenantPrefs) => void;
}) {
  const [prefs, setPrefs] = useState<TenantPrefs | null>(null);
  const [saved, setSaved] = useState<TenantPrefs | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    getTenant(tenantId).then((t) => {
      setPrefs(t.prefs);
      setSaved(t.prefs);
    });
  }, [open, tenantId]);

  return (
    <Sheet open={open} onClose={onClose} title="Your preferences">
      {prefs ? (
        <div className="pt-4">
          <PreferencesForm
            value={prefs}
            onChange={setPrefs}
            onReset={() => saved && setPrefs(saved)}
            submitting={saving}
            submitLabel="Show homes"
            onSubmit={async () => {
              setSaving(true);
              await saveTenantPrefs(tenantId, prefs);
              setSaving(false);
              onSaved?.(prefs);
              onClose();
            }}
          />
        </div>
      ) : (
        <div className="h-96 animate-pulse" />
      )}
    </Sheet>
  );
}
