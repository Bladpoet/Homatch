'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentUser, subscribe } from './api';
import type { AppEvent, Profile, Role } from './types';

/** The persona picked on /demo for this tab. */
export function useCurrentUser() {
  const [state, setState] = useState<{ user: Profile | null; loading: boolean }>({ user: null, loading: true });
  const refresh = useCallback(async () => {
    const user = await getCurrentUser();
    setState({ user, loading: false });
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  return { ...state, refresh };
}

/**
 * Like useCurrentUser, but redirects: no user → /demo, not onboarded → onboarding,
 * wrong role (if `role` given) → /discover. Render nothing until `user` is set.
 */
export function useRequireUser(role?: Role) {
  const router = useRouter();
  const current = useCurrentUser();
  const { user, loading } = current;
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/demo');
    else if (!user.onboarded) router.replace(`/onboarding/${user.role}`);
    else if (role && user.role !== role) router.replace('/discover');
  }, [user, loading, role, router]);
  const ok = !!user && user.onboarded && (!role || user.role === role);
  return { ...current, user: ok ? user : null };
}

/** Subscribe to realtime events for a user. The handler can change every render. */
export function useAppEvents(userId: string | undefined, handler: (e: AppEvent) => void) {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    if (!userId) return;
    return subscribe(userId, (e) => ref.current(e));
  }, [userId]);
}

/** Load async data with a refetch function. Keeps the previous data while refetching. */
export function useAsync<T>(fn: (() => Promise<T>) | null, deps: unknown[]) {
  const [state, setState] = useState<{ data: T | undefined; loading: boolean; error: Error | null }>({
    data: undefined,
    loading: true,
    error: null,
  });
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });
  const reload = useCallback(async () => {
    const f = fnRef.current;
    if (!f) return;
    setState((s) => ({ ...s, loading: true }));
    try {
      const data = await f();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error: error as Error }));
    }
  }, []);
  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  /** Optimistic local update. Prefer the updater form: it never sees stale data. */
  const setData = useCallback(
    (next: T | ((prev: T | undefined) => T)) =>
      setState((s) => ({ ...s, data: typeof next === 'function' ? (next as (p: T | undefined) => T)(s.data) : next })),
    [],
  );
  return { ...state, reload, setData };
}
