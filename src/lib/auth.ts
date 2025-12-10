import { User } from '@/types/user';

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: string | null;
}

// Mock database for users (in production, this would be a real database)
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: '$2a$10$N7x1K3Y5z6v9w8U4R3P2OuJ1n0M5l4K3Y5z6v9w8U4R3P2OuJ1n0M', // 'password123' hashed
    role: 'ADMIN',
    createdAt: new Date(),
    lastLoginAt: null,
    organizationId: 'org-1',
  },
  {
    id: '2',
    name: 'Sales User',
    email: 'sales@example.com',
    password: '$2a$10$N7x1K3Y5z6v9w8U4R3P2OuJ1n0M5l4K3Y5z6v9w8U4R3P2OuJ1n0M', // 'password123' hashed
    role: 'USER',
    createdAt: new Date(),
    lastLoginAt: null,
    organizationId: 'org-1',
  },
];

const sessions: Session[] = [];

export class AuthService {
  static async register(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResult> {
    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email === email);
    if (existingUser) {
      return {
        user: null,
        session: null,
        error: 'User with this email already exists',
      };
    }

    // In a real application, we would hash the password here
    const hashedPassword = await this.hashPassword(password);

    // Create new user
    const newUser: User = {
      id: (mockUsers.length + 1).toString(),
      name,
      email,
      password: hashedPassword,
      role: 'USER', // Default role
      createdAt: new Date(),
      lastLoginAt: null,
      organizationId: 'org-1', // Default organization
    };

    mockUsers.push(newUser);

    // Create session
    const session = await this.createSession(newUser.id);
    
    return {
      user: newUser,
      session,
      error: null,
    };
  }

  static async login(email: string, password: string): Promise<AuthResult> {
    // Find user by email
    const user = mockUsers.find(user => user.email === email);
    if (!user) {
      return {
        user: null,
        session: null,
        error: 'Invalid email or password',
      };
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return {
        user: null,
        session: null,
        error: 'Invalid email or password',
      };
    }

    // Update last login
    user.lastLoginAt = new Date();

    // Create session
    const session = await this.createSession(user.id);
    
    return {
      user,
      session,
      error: null,
    };
  }

  static async logout(sessionId: string): Promise<boolean> {
    const sessionIndex = sessions.findIndex(session => session.id === sessionId);
    if (sessionIndex !== -1) {
      sessions.splice(sessionIndex, 1);
      return true;
    }
    return false;
  }

  static async verifySession(sessionId: string): Promise<{ user: User | null; isValid: boolean }> {
    const session = sessions.find(session => session.id === sessionId && session.expiresAt > new Date());
    if (session) {
      const user = mockUsers.find(user => user.id === session.userId);
      return {
        user: user || null,
        isValid: !!user,
      };
    }
    return {
      user: null,
      isValid: false,
    };
  }

  static async requestPasswordReset(email: string): Promise<boolean> {
    // In a real application, this would send an email with a reset token
    const user = mockUsers.find(user => user.email === email);
    if (!user) {
      // Return true even if user doesn't exist to prevent email enumeration
      return true;
    }

    // Generate reset token and save it (in a real app, this would be stored in the database)
    console.log(`Password reset requested for ${email}`);
    return true;
  }

  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // In a real application, this would validate the token and update the password
    console.log(`Password reset attempted with token: ${token}`);
    return true;
  }

  static async hashPassword(password: string): Promise<string> {
    // In a real application, use a proper password hashing library like bcrypt
    // For this mock implementation, we'll just return a placeholder
    return '$2a$10$N7x1K3Y5z6v9w8U4R3P2OuJ1n0M5l4K3Y5z6v9w8U4R3P2OuJ1n0M';
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    // In a real application, use a proper password verification library
    // For this mock implementation, we'll just check against the known hash
    return hashedPassword === '$2a$10$N7x1K3Y5z6v9w8U4R3P2OuJ1n0M5l4K3Y5z6v9w8U4R3P2OuJ1n0M';
  }

  private static async createSession(userId: string): Promise<Session> {
    // Remove any existing sessions for this user
    const existingSessions = sessions.filter(session => session.userId === userId);
    existingSessions.forEach(session => {
      const index = sessions.indexOf(session);
      if (index !== -1) sessions.splice(index, 1);
    });

    // Create new session
    const session: Session = {
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      userId,
      token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(),
    };

    sessions.push(session);
    return session;
  }
}