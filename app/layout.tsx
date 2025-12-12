import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { CommandPalette } from '@/components/command-palette'
import { AuthProviderWrapper } from '@/components/auth/auth-provider'
import ErrorBoundary from '@/components/error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CRM App',
  description: 'Modern CRM system built with Next.js, Prisma, and TypeScript',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProviderWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <CommandPalette />
          </ThemeProvider>
        </AuthProviderWrapper>
      </body>
    </html>
  )
}