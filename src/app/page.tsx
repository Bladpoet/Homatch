'use client';
// Entry: send people to their deck if this tab has a persona, otherwise to /demo.
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getCurrentUser } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    getCurrentUser().then((u) => router.replace(u ? '/discover' : '/demo'));
  }, [router]);
  return null;
}
