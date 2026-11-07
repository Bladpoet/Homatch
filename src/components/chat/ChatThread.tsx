'use client';
// STUB(C0) → Kamsi builds the real one in K4 (grouped bubbles, timestamps on
// groups, new messages fade + rise in). Keep the props.
import { useEffect, useRef } from 'react';
import { formatTime } from '@/lib/format';
import type { Message } from '@/lib/types';
import { cx } from '@/components/ui/cx';

export type ChatThreadProps = { messages: Message[]; meId: string };

export function ChatThread({ messages, meId }: ChatThreadProps) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  return (
    <ol className="flex flex-col gap-1.5 px-4 py-4">
      {messages.map((m) => {
        const mine = m.senderId === meId;
        return (
          <li key={m.id} className={cx('flex flex-col', mine ? 'items-end' : 'items-start')}>
            <p
              className={cx(
                'max-w-[78%] rounded-[20px] px-3.5 py-2 text-body',
                mine ? 'rounded-br-md bg-accent text-on-accent' : 'rounded-bl-md bg-surface text-ink shadow-[0_1px_1px_rgb(0_0_0/0.06)]',
              )}
            >
              {m.body}
            </p>
            <time className="mt-0.5 px-1 text-[11px] text-ink-subtle" dateTime={m.createdAt}>
              {formatTime(m.createdAt)}
            </time>
          </li>
        );
      })}
      <div ref={end} />
    </ol>
  );
}
