export type UserRole = 'SUPER_ADMIN' | 'OWNER' | 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
  lastLoginAt: Date | null;
  organizationId: string;
  hashedPassword?: string;
  emailVerified?: Date;
  image?: string;
  deletedAt?: Date;
}