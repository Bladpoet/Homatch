'use client';
// Persona picker = our login. Owner: Coleman (C1 polishes it).
// Each tab has its own persona (sessionStorage), so open two tabs: Maya + David.
import { RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { cx } from '@/components/ui/cx';
import { listPersonas, resetDemo, setCurrentUser } from '@/lib/api';
import { PERSONAS } from '@/lib/config';
import { useAsync } from '@/lib/hooks';
import type { Profile } from '@/lib/types';

const STARS: string[] = [PERSONAS.maya, PERSONAS.david, PERSONAS.sam];

export default function DemoPage() {
  const router = useRouter();
  const personas = useAsync(listPersonas, []);
  const [resetting, setResetting] = useState(false);

  const all = personas.data ?? [];
  const stars = STARS.map((id) => all.find((p) => p.id === id)).filter(Boolean) as Profile[];
  const rest = all.filter((p) => !STARS.includes(p.id));

  const pick = async (p: Profile) => {
    await setCurrentUser(p.id);
    router.push(p.onboarded ? '/discover' : `/onboarding/${p.role}`);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="px-5 pt-8 pb-4">
        <p className="text-title font-extrabold tracking-tight text-accent">homatch</p>
        <h1 className="mt-4 text-display font-bold">Who are you today?</h1>
      </header>

      <section className="space-y-2 px-4">
        {stars.map((p) => (
          <PersonaRow key={p.id} p={p} onPick={pick} big />
        ))}
      </section>

      <details className="mt-6 px-4">
        <summary className="cursor-pointer py-2 text-label font-semibold text-ink-muted">Everyone else ({rest.length})</summary>
        <div className="space-y-1 pt-2">
          {rest.map((p) => (
            <PersonaRow key={p.id} p={p} onPick={pick} />
          ))}
        </div>
      </details>

      <div className="mt-auto p-4 pt-8">
        <Button
          variant="secondary"
          size="lg"
          disabled={resetting}
          onClick={async () => {
            setResetting(true);
            await resetDemo();
            await personas.reload();
            setResetting(false);
          }}
        >
          <RotateCcw size={18} /> {resetting ? 'Resetting…' : 'Reset demo'}
        </Button>
      </div>
    </div>
  );
}

function PersonaRow({ p, onPick, big }: { p: Profile; onPick: (p: Profile) => void; big?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onPick(p)}
      className={cx('flex w-full items-center gap-3 rounded-card text-left active:scale-[0.99]', big ? 'bg-surface p-3 shadow-[0_1px_2px_rgb(0_0_0/0.06)]' : 'p-2')}
    >
      <Avatar src={p.avatarUrl} alt="" size={big ? 56 : 40} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body font-semibold">{p.name}</span>
        <span className="block truncate text-caption text-ink-muted">{p.occupation ?? p.bio}</span>
      </span>
      <span
        className={cx(
          'shrink-0 rounded-chip px-2.5 py-1 text-caption font-bold',
          p.role === 'tenant' ? 'bg-accent/10 text-accent' : 'bg-rewind/15 text-ink',
        )}
      >
        {p.role === 'tenant' ? (p.onboarded ? 'Tenant' : 'New tenant') : 'Landlord'}
      </span>
    </button>
  );
}
