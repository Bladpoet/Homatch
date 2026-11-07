'use client';
// Chat thread. Consecutive bubbles from the same person group together (tail only on
// the last one), a centred time divider appears after a 30-minute gap, and messages
// that arrive while the thread is open fade + rise 8px. Keep the props.
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { cx } from '@/components/ui/cx';
import { formatRelative, formatTime } from '@/lib/format';
import type { Message } from '@/lib/types';

export type ChatThreadProps = { messages: Message[]; meId: string };

const GROUP_GAP = 5 * 60_000;
const DIVIDER_GAP = 30 * 60_000;
const t = (m: Message) => new Date(m.createdAt).getTime();

export function ChatThread({ messages, meId }: ChatThreadProps) {
  const reduce = useReducedMotion();
  const end = useRef<HTMLDivElement>(null);
  const initial = useRef<Set<string> | null>(null);
  if (initial.current === null && messages.length) initial.current = new Set(messages.map((m) => m.id));

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end', behavior: initial.current && messages.length > initial.current.size ? 'smooth' : 'auto' });
  }, [messages.length]);

  return (
    <ol className="flex flex-col px-4 py-4">
      {messages.map((m, i) => {
        const prev = messages[i - 1];
        const next = messages[i + 1];
        const mine = m.senderId === meId;
        const divider = !prev || t(m) - t(prev) > DIVIDER_GAP;
        const startsGroup = divider || prev.senderId !== m.senderId || t(m) - t(prev) > GROUP_GAP;
        const endsGroup = !next || next.senderId !== m.senderId || t(next) - t(m) > GROUP_GAP || t(next) - t(m) > DIVIDER_GAP;
        const fresh = initial.current ? !initial.current.has(m.id) : false;

        return (
          <li key={m.id} className={cx('flex flex-col', startsGroup && i > 0 && 'mt-3', !startsGroup && 'mt-0.5')}>
            {divider && (
              <span className="mb-3 self-center text-caption font-medium text-ink-subtle">{formatRelative(m.createdAt)} · {formatTime(m.createdAt)}</span>
            )}
            <motion.div
              className={cx('flex flex-col', mine ? 'items-end' : 'items-start')}
              initial={fresh ? (reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }) : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: mine ? '100% 100%' : '0% 100%' }}
            >
              <p
                className={cx(
                  'max-w-[78%] rounded-[20px] px-3.5 py-2 text-body break-words',
                  mine ? 'bg-accent text-on-accent' : 'bg-surface text-ink shadow-[0_1px_1px_rgb(0_0_0/0.06)]',
                  mine && !startsGroup && 'rounded-tr-md',
                  mine && !endsGroup && 'rounded-br-md',
                  mine && endsGroup && 'rounded-br-sm',
                  !mine && !startsGroup && 'rounded-tl-md',
                  !mine && !endsGroup && 'rounded-bl-md',
                  !mine && endsGroup && 'rounded-bl-sm',
                )}
              >
                {m.body}
              </p>
              {endsGroup && (
                <time className="mt-1 px-1 text-[11px] text-ink-subtle tabular-nums" dateTime={m.createdAt}>
                  {formatTime(m.createdAt)}
                </time>
              )}
            </motion.div>
          </li>
        );
      })}
      <div ref={end} />
    </ol>
  );
}
