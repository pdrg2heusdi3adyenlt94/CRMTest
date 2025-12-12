'use client';

import { ClientSdk } from 'better-auth/react';
import { auth } from '@/auth';

interface Props {
  children: React.ReactNode;
}

export function SessionProviderWrapper({ children }: Props) {
  return <ClientSdk authClient={auth}>{children}</ClientSdk>;
}