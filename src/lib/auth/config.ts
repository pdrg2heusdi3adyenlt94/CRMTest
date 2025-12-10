import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    // V2: Add Google, GitHub, Microsoft
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
  },
  jwt: {
    enabled: true,
  },
  user: {
    // Add custom fields for role and organization
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "USER",
      },
      organizationId: {
        type: "string",
        required: true,
        defaultValue: "",
      },
    },
  },
});