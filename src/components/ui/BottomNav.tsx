'use client';
// STUB(C0) → Kamsi builds the real one in K1b (sliding active indicator). Keep the props.
import { House, MessageCircle, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from './cx';

export type BottomNavProps = { matchesBadge?: number };

const tabs = [
  { href: '/discover', label: 'Discover', Icon: House },
  { href: '/matches', label: 'Matches', Icon: MessageCircle },
  { href: '/profile', label: 'Profile', Icon: User },
];

export function BottomNav({ matchesBadge = 0 }: BottomNavProps) {
  const path = usePathname();
  return (
    <nav
      aria-label="Main"
      className="flex shrink-0 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      {tabs.map(({ href, label, Icon }) => {
        const active = path.startsWith(href) || (href === '/matches' && path.startsWith('/chat'));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cx('relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-caption', active ? 'text-ink' : 'text-ink-subtle')}
          >
            <span className="relative">
              <Icon size={24} strokeWidth={active ? 2.4 : 2} />
              {href === '/matches' && matchesBadge > 0 && (
                <span className="absolute -top-1 -right-2 min-w-4 rounded-full bg-pass px-1 text-center text-[10px] leading-4 font-bold text-white">
                  {matchesBadge}
                </span>
              )}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
