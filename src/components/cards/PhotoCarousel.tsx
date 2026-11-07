'use client';
// Tap-zone photo carousel for deck cards. All photos are mounted (stacked) so a tap
// swaps instantly with no loading flash. Left half = previous, right half = next.
import { useAnimate, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { cx } from '@/components/ui/cx';

export function PhotoCarousel({
  photos,
  alt,
  render,
  overlay,
}: {
  photos: string[];
  alt: string;
  render: (src: string, alt: string) => React.ReactNode;
  overlay?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [scope, animate] = useAnimate();
  const reduce = useReducedMotion();
  const many = photos.length > 1;

  const step = (dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= photos.length) {
      // End of the set: a small nudge says "that's all".
      if (!reduce) animate(scope.current, { x: [0, dir * 4, 0] }, { duration: 0.2 });
      return;
    }
    setIndex(next);
  };

  return (
    <div ref={scope} className="absolute inset-0">
      {photos.map((src, i) => (
        <div key={src + i} className={cx('absolute inset-0', i === index ? 'opacity-100' : 'opacity-0')} aria-hidden={i !== index}>
          {render(src, i === index ? alt : '')}
        </div>
      ))}

      {many && (
        <div className="absolute inset-x-3 top-2.5 z-10 flex gap-1" aria-hidden>
          {photos.map((_, i) => (
            <span key={i} className={cx('h-1 flex-1 rounded-full', i === index ? 'bg-white' : 'bg-white/35')} />
          ))}
        </div>
      )}

      {many && (
        <div className="absolute inset-x-0 top-0 z-[5] flex h-[58%]">
          <button type="button" aria-label="Previous photo" className="h-full flex-1 cursor-[inherit]" onClick={() => step(-1)} />
          <button type="button" aria-label="Next photo" className="h-full flex-1 cursor-[inherit]" onClick={() => step(1)} />
        </div>
      )}

      {overlay && <div className="pointer-events-none absolute inset-0 z-10 [&>*]:pointer-events-auto">{overlay}</div>}
    </div>
  );
}
