// STUB(C0) → Kamsi builds the real one in K1a. Keep the props.
import Image from 'next/image';
import { cx } from './cx';

export type AvatarProps = { src: string; alt: string; size?: number; ring?: boolean };

export function Avatar({ src, alt, size = 48, ring }: AvatarProps) {
  return (
    <span
      className={cx('relative inline-block shrink-0 overflow-hidden rounded-full bg-surface-2', ring && 'ring-2 ring-accent ring-offset-2 ring-offset-bg')}
      style={{ width: size, height: size }}
    >
      <Image src={src} alt={alt} fill sizes={`${size * 2}px`} className="object-cover" />
    </span>
  );
}
