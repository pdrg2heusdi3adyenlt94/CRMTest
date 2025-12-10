'use client';

import { SessionProvider } from 'better-auth/react';
import { auth } from '@/auth';

interface Props {
  children: React.ReactNode;
}

export function SessionProviderWrapper({ children }: Props) {
  return <SessionProvider authClient={auth}>{children}</SessionProvider>;
}