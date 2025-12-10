import { betterAuth } from 'better-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: {
    provider: 'prisma',
    client: prisma,
  },
  secret: process.env.AUTH_SECRET || 'fallback-secret-for-development',
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'github'],
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
  },
});

export const { signIn, signUp, signOut, authHandler } = auth;