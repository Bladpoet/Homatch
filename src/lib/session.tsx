'use client';
// The signed-in user for everything under (app)/. AppShell provides it once it has
// verified the user exists and is onboarded, so pages can rely on a non-null user.
import { createContext, useContext } from 'react';
import type { Profile } from './types';

const UserContext = createContext<Profile | null>(null);

export const UserProvider = UserContext.Provider;

export function useUser(): Profile {
  const user = useContext(UserContext);
  if (!user) throw new Error('useUser() must be used inside (app)/ — AppShell provides the user.');
  return user;
}
