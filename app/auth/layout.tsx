import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getAuth } from 'lib/auth';

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  // If user is already authenticated, redirect to dashboard
  const session = await getAuth();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
