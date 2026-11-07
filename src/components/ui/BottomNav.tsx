'use client';
// Bottom tab bar: Discover · Likes · Matches · Profile, with a sliding active
// indicator and badges (Liked-you count, unread/new matches).
import { Heart, House, MessageCircle, User } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { spring } from '@/styles/motion';
import { cx } from './cx';

export type BottomNavProps = { matchesBadge?: number; likesBadge?: number };

const tabs = [
  { href: '/discover', label: 'Discover', Icon: House },
  { href: '/likes', label: 'Likes', Icon: Heart },
  { href: '/matches', label: 'Matches', Icon: MessageCircle },
  { href: '/profile', label: 'Profile', Icon: User },
] as const;

export function BottomNav({ matchesBadge = 0, likesBadge = 0 }: BottomNavProps) {
  const path = usePathname();
  const reduce = useReducedMotion();
  const badges: Record<string, number> = { '/likes': likesBadge, '/matches': matchesBadge };

  return (
    <nav aria-label="Main" className="relative flex shrink-0 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]">
      {tabs.map(({ href, label, Icon }) => {
        const active = path.startsWith(href) || (href === '/matches' && path.startsWith('/chat'));
        const badge = badges[href] ?? 0;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cx(
              'relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-caption font-medium transition-colors',
              active ? 'text-accent' : 'text-ink-subtle',
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-indicator"
                transition={reduce ? { duration: 0 } : spring.snappy}
                className="absolute top-0 h-[3px] w-8 rounded-b-full bg-accent"
              />
            )}
            <span className="relative">
              <Icon size={23} strokeWidth={active ? 2.4 : 2} fill={active && href === '/likes' ? 'currentColor' : 'none'} />
              {badge > 0 && (
                <motion.span
                  key={badge}
                  initial={reduce ? false : { scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="absolute -top-1 -right-2.5 min-w-[18px] rounded-full bg-pass px-1 text-center text-[10px] leading-[18px] font-bold text-white ring-2 ring-surface"
                >
                  {badge > 9 ? '9+' : badge}
                </motion.span>
              )}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
