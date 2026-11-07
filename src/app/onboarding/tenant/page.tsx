'use client';
// Tenant onboarding: Start matching sheet → About you → "Finding homes that fit you…"
import { ChevronLeft, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PreferencesForm } from '@/components/onboarding/PreferencesForm';
import { cx } from '@/components/ui/cx';
import { getTenant, getTenantDeck, saveProfile, saveTenantPrefs } from '@/lib/api';
import { useCurrentUser } from '@/lib/hooks';
import { defaultPrefs } from '@/lib/prefs';
import type { TenantPrefs } from '@/lib/types';
import { duration, ease } from '@/styles/motion';

type Step = 'prefs' | 'about' | 'finding';

const AVATARS = [
  'https://randomuser.me/api/portraits/men/75.jpg',
  'https://randomuser.me/api/portraits/women/50.jpg',
  'https://randomuser.me/api/portraits/men/36.jpg',
  'https://randomuser.me/api/portraits/women/17.jpg',
  'https://randomuser.me/api/portraits/men/8.jpg',
  'https://randomuser.me/api/portraits/women/79.jpg',
];

const NOTE_STARTERS = [
  'Quiet professional, home most evenings.',
  'Long-term renter with great references.',
  'Tidy, friendly, and I pay on the 1st.',
  'Looking for 12 months or more.',
];

const NOTE_MAX = 140;

export default function TenantOnboarding() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { user, loading } = useCurrentUser();
  const [step, setStep] = useState<Step>('prefs');
  const [prefs, setPrefs] = useState<TenantPrefs>(() => defaultPrefs());
  const [avatar, setAvatar] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) return router.replace('/demo');
    if (user.role !== 'tenant') return router.replace('/discover');
    setAvatar(user.avatarUrl);
    setNote(user.introNote ?? '');
    // Already onboarded (e.g. redoing it): start from their saved prefs.
    if (user.onboarded) getTenant(user.id).then((t) => setPrefs(t.prefs));
  }, [user, loading, router]);

  const finish = async (withNote: boolean) => {
    if (!user) return;
    setStep('finding');
    await saveTenantPrefs(user.id, prefs, { avatarUrl: avatar ?? user.avatarUrl });
    await saveProfile(user.id, { introNote: withNote ? note.trim() || undefined : user.introNote });
    const deck = await getTenantDeck(user.id);
    setPhotos(deck.slice(0, 3).map((d) => d.listing.photos[0]));
    setTimeout(() => router.replace('/discover'), 1700);
  };

  const slide = {
    initial: { opacity: 0, x: reduce ? 0 : 32 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduce ? 0 : -32 },
    transition: { duration: duration.slow, ease: ease.out },
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-surface">
      <AnimatePresence mode="wait" initial={false}>
        {step === 'prefs' && (
          <motion.div key="prefs" {...slide} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <header className="px-6 pt-4 pb-6">
              <div className="flex items-center justify-between">
                <span className="text-label font-extrabold tracking-tight text-accent">homatch</span>
                <Link href="/demo" aria-label="Close" className="-mr-2 flex size-11 items-center justify-center rounded-full text-ink-muted">
                  <X size={24} />
                </Link>
              </div>
              <h1 className="mt-3 text-[1.625rem] leading-tight font-bold tracking-tight">Start matching</h1>
              <p className="mt-1.5 text-body text-ink-muted">Tell us what you&apos;re after. You can change it any time.</p>
            </header>
            <PreferencesForm value={prefs} onChange={setPrefs} onSubmit={() => setStep('about')} submitLabel="Start matching" />
          </motion.div>
        )}

        {step === 'about' && (
          <motion.div key="about" {...slide} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <header className="px-6 pt-4 pb-2">
              <button
                type="button"
                aria-label="Back"
                onClick={() => setStep('prefs')}
                className="-ml-2 flex size-11 items-center justify-center rounded-full text-ink"
              >
                <ChevronLeft size={26} />
              </button>
              <h1 className="mt-2 text-[1.625rem] leading-tight font-bold tracking-tight">About you</h1>
              <p className="mt-1.5 text-body text-ink-muted">Landlords you like will see this. Keep it short and real.</p>
            </header>

            <div className="flex-1 space-y-7 px-6 pt-4 pb-6">
              <section>
                <h3 className="mb-3 text-label font-semibold">Your photo</h3>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((src) => (
                    <button
                      key={src}
                      type="button"
                      aria-pressed={avatar === src}
                      aria-label="Choose this photo"
                      onClick={() => setAvatar(src)}
                      className={cx(
                        'relative aspect-square overflow-hidden rounded-full transition-[box-shadow,transform] active:scale-95',
                        avatar === src ? 'ring-3 ring-accent ring-offset-2 ring-offset-surface' : 'opacity-70',
                      )}
                    >
                      <Image src={src} alt="" fill sizes="96px" className="object-cover" />
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-baseline justify-between">
                  <h3 className="text-label font-semibold">A note to landlords</h3>
                  <span className={cx('text-caption tabular-nums', note.length > NOTE_MAX - 20 ? 'text-pass' : 'text-ink-subtle')}>
                    {note.length}/{NOTE_MAX}
                  </span>
                </div>
                <textarea
                  value={note}
                  maxLength={NOTE_MAX}
                  rows={3}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Say something a landlord would want to know…"
                  className="w-full resize-none rounded-input border border-line bg-surface px-4 py-3 text-body outline-none placeholder:text-ink-subtle focus:border-ink"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {NOTE_STARTERS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNote((n) => (n ? `${n} ${s}` : s).slice(0, NOTE_MAX))}
                      className="h-9 rounded-chip bg-surface-2 px-3.5 text-label text-ink-muted active:scale-[0.97]"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <footer className="sticky bottom-0 flex gap-3 border-t border-line bg-surface px-6 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => finish(false)}
                className="h-14 flex-1 rounded-button border border-line font-semibold text-ink-muted active:scale-[0.97]"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => finish(true)}
                className="h-14 flex-[2] rounded-button bg-linear-to-r from-accent to-accent-strong font-semibold text-on-accent shadow-cta active:scale-[0.97]"
              >
                Show me homes
              </button>
            </footer>
          </motion.div>
        )}

        {step === 'finding' && (
          <motion.div key="finding" {...slide} className="flex flex-1 flex-col items-center justify-center gap-8 px-8 text-center">
            <Finding photos={photos} reduce={!!reduce} />
            <div>
              <h1 className="text-title font-bold">Finding homes that fit you…</h1>
              <p className="mt-2 text-body text-ink-muted">Reading every listing against what you told us.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Finding({ photos, reduce }: { photos: string[]; reduce: boolean }) {
  const fan = [-12, 0, 12];
  return (
    <div className="relative h-44 w-56">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute top-2 left-1/2 h-40 w-32 -ml-16 overflow-hidden rounded-card bg-surface-2 shadow-card"
          initial={{ rotate: 0, x: 0, opacity: 0, y: 12 }}
          animate={
            reduce
              ? { opacity: 1, y: 0, rotate: fan[i], x: fan[i] * 4 }
              : { opacity: 1, y: 0, rotate: [0, fan[i], fan[i], fan[2 - i], fan[i]], x: [0, fan[i] * 4, fan[i] * 4, fan[2 - i] * 4, fan[i] * 4] }
          }
          transition={{ duration: reduce ? 0.2 : 1.6, delay: i * 0.06, ease: ease.inOut, times: reduce ? undefined : [0, 0.3, 0.5, 0.75, 1] }}
          style={{ zIndex: i === 1 ? 3 : 1 }}
        >
          {photos[i] && <Image src={photos[i]} alt="" fill sizes="128px" className="object-cover" />}
        </motion.div>
      ))}
      <motion.span
        className="absolute -top-3 -right-1 z-10 flex size-11 items-center justify-center rounded-full bg-accent text-on-accent shadow-cta"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.2 }}
      >
        <Sparkles size={20} />
      </motion.span>
    </div>
  );
}
