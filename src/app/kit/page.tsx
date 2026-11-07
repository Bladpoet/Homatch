'use client';
// Kamsi's UI kit showcase. Every ui/ component, every state. Add new ones here.
import { Heart, X } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { Sheet } from '@/components/ui/Sheet';
import { AREAS } from '@/lib/config';

export default function Kit() {
  const [picked, setPicked] = useState<string[]>(['Rathmines']);
  const [sheet, setSheet] = useState(false);
  const toggle = (a: string) => setPicked((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]));

  return (
    <div className="flex-1 space-y-8 overflow-y-auto p-4">
      <h1 className="text-display font-bold">UI kit</h1>

      <Section title="Type">
        <p className="text-display font-bold">Display €2,150</p>
        <p className="text-title font-semibold">Title: Sunny 2-bed with garden</p>
        <p className="text-body">Body: Ground-floor flat in a red-brick Victorian.</p>
        <p className="text-label">Label: Rathmines · 2 bed · 1 bath</p>
        <p className="text-caption text-ink-muted">Caption: 3 likes</p>
        <p className="text-stamp font-black text-like">LIKE</p>
      </Section>

      <Section title="Color">
        <div className="grid grid-cols-4 gap-2 text-[10px]">
          {['bg', 'surface', 'surface-2', 'line', 'ink', 'ink-muted', 'ink-subtle', 'accent', 'like', 'pass', 'rewind', 'backdrop'].map((c) => (
            <div key={c} className="space-y-1">
              <div className="h-10 rounded-input border border-line" style={{ background: `var(--color-${c})` }} />
              {c}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Button">
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
        </div>
        <Button size="lg">Large, full width</Button>
      </Section>

      <Section title="IconButton">
        <div className="flex items-center gap-4">
          <IconButton label="Pass" tone="pass" size="lg"><X size={30} /></IconButton>
          <IconButton label="Like" tone="like" size="md"><Heart size={24} /></IconButton>
          <IconButton label="Like" size="sm"><Heart size={18} /></IconButton>
          <IconButton label="Disabled" disabled><Heart size={24} /></IconButton>
        </div>
      </Section>

      <Section title="Chip">
        <div className="flex flex-wrap gap-1.5">
          <Chip>Static</Chip>
          <Chip tone="success">Within budget</Chip>
          <Chip tone="muted">Available later</Chip>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {AREAS.slice(0, 8).map((a) => (
            <Chip key={a} selected={picked.includes(a)} onToggle={() => toggle(a)}>{a}</Chip>
          ))}
        </div>
      </Section>

      <Section title="Avatar">
        <div className="flex items-center gap-3">
          <Avatar src="https://randomuser.me/api/portraits/women/44.jpg" alt="Maya" size={32} />
          <Avatar src="https://randomuser.me/api/portraits/women/44.jpg" alt="Maya" />
          <Avatar src="https://randomuser.me/api/portraits/women/44.jpg" alt="Maya" size={72} ring />
        </div>
      </Section>

      <Section title="Sheet">
        <Button variant="secondary" onClick={() => setSheet(true)}>Open sheet</Button>
        <Sheet open={sheet} onClose={() => setSheet(false)} title="A sheet">
          <p className="p-4 text-body">Drag down to dismiss (K1a). Esc and the backdrop close it already.</p>
        </Sheet>
      </Section>

      {/* K1b: Segmented, Input, RangeSlider, Stepper, Toast */}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-label font-semibold tracking-wide text-ink-muted uppercase">{title}</h2>
      {children}
    </section>
  );
}
