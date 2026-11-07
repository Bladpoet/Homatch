'use client';
// STUB(C0) → Kamsi builds the real one in K4 (auto-growing input, send button
// scales in). Keep the props. Quick replies show only when given (empty thread).
import { ArrowUp } from 'lucide-react';
import { useState } from 'react';
import { cx } from '@/components/ui/cx';

export type ComposerProps = { onSend: (body: string) => void; quickReplies?: string[] };

export function Composer({ onSend, quickReplies }: ComposerProps) {
  const [text, setText] = useState('');
  const send = (body: string) => {
    if (!body.trim()) return;
    onSend(body.trim());
    setText('');
  };

  return (
    <div className="shrink-0 border-t border-line bg-surface pb-[max(8px,env(safe-area-inset-bottom))]">
      {quickReplies && quickReplies.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-3 pt-2">
          {quickReplies.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="h-9 shrink-0 rounded-chip border border-line px-3 text-label whitespace-nowrap active:scale-[0.97]"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <form
        className="flex items-end gap-2 px-3 pt-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(text);
            }
          }}
          placeholder="Message"
          aria-label="Message"
          className="max-h-32 min-h-11 flex-1 resize-none rounded-[22px] bg-surface-2 px-4 py-2.5 text-body outline-none placeholder:text-ink-subtle"
        />
        <button
          type="submit"
          aria-label="Send"
          disabled={!text.trim()}
          className={cx('flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent transition-opacity', !text.trim() && 'opacity-30')}
        >
          <ArrowUp size={20} strokeWidth={2.6} />
        </button>
      </form>
    </div>
  );
}
