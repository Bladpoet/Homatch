'use client';
// Chat. Owner: Kamsi (K4). Wiring is done; restyle freely, keep the data flow.
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ListingDetail } from '@/components/cards/ListingDetail';
import { ChatThread } from '@/components/chat/ChatThread';
import { Composer } from '@/components/chat/Composer';
import { Avatar } from '@/components/ui/Avatar';
import { getMatch, getMessages, markRead, sendMessage } from '@/lib/api';
import { useAppEvents, useAsync } from '@/lib/hooks';
import { useUser } from '@/lib/session';
import { fit } from '@/lib/score';
import type { Message, Tenant } from '@/lib/types';

const QUICK_REPLIES = {
  tenant: ['Is it still available?', 'Could I view it this week?', 'Are bills included?'],
  landlord: ['When would you like to move in?', 'Want to come for a viewing?', 'Tell me a bit about yourself'],
};

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const user = useUser();
  const summary = useAsync(() => getMatch(matchId, user.id), [matchId, user.id]);
  const messages = useAsync(() => getMessages(matchId), [matchId]);
  const [showListing, setShowListing] = useState(false);

  useEffect(() => {
    void markRead(matchId, user.id);
  }, [matchId, user.id, messages.data?.length]);

  useAppEvents(user.id, (e) => {
    if (e.type === 'message' && e.message.matchId === matchId) append(e.message);
    if (e.type === 'reset') void messages.reload();
  });

  const list = messages.data ?? [];
  function append(m: Message) {
    // Dedupe: our own sends arrive both from sendMessage() and as an event.
    messages.setData((prev = []) => [...prev.filter((x) => x.id !== m.id), m]);
  }

  const s = summary.data;
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-line bg-surface px-2">
        <Link href="/matches" aria-label="Back to matches" className="flex size-11 items-center justify-center rounded-full">
          <ChevronLeft size={26} />
        </Link>
        {s && (
          <>
            <Avatar src={s.other.avatarUrl} alt="" size={40} />
            <span className="min-w-0 flex-1 truncate text-body font-semibold">{s.other.name}</span>
            <button
              type="button"
              onClick={() => setShowListing(true)}
              className="flex h-10 max-w-[45%] items-center gap-2 rounded-chip bg-surface-2 pr-3 pl-1"
            >
              <span className="relative size-8 shrink-0 overflow-hidden rounded-full">
                <Image src={s.listing.photos[0]} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <span className="truncate text-caption font-semibold">{s.listing.title}</span>
            </button>
          </>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {s && list.length === 0 && (
          <div className="space-y-4 px-6 pt-10 text-center">
            <p className="text-label text-ink-muted">You matched with {s.other.name.split(' ')[0]}. Say hello.</p>
            {s.other.introNote && (
              <blockquote className="mx-auto max-w-[30ch] rounded-card bg-surface px-4 py-3 text-body italic shadow-[0_1px_2px_rgb(0_0_0/0.06)]">
                <span className="mb-1 block text-caption font-semibold text-ink-muted not-italic">A note from {s.other.name.split(' ')[0]}</span>
                &ldquo;{s.other.introNote}&rdquo;
              </blockquote>
            )}
          </div>
        )}
        <ChatThread messages={list} meId={user.id} />
      </div>

      <Composer
        quickReplies={list.length === 0 ? QUICK_REPLIES[user.role] : undefined}
        onSend={async (body) => append(await sendMessage(matchId, user.id, body))}
      />

      {s && showListing && (
        <ListingDetail
          open
          listing={s.listing}
          owner={user.role === 'tenant' ? s.other : user}
          fit={user.role === 'tenant' ? fit((user as Tenant).prefs, s.listing) : fit((s.other as Tenant).prefs, s.listing)}
          onClose={() => setShowListing(false)}
        />
      )}
    </div>
  );
}
