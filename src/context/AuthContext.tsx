import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types/user';
import { AuthService, AuthResult, Session } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on initial load
  useEffect(() => {
    const checkExistingSession = async () => {
      const storedSessionId = localStorage.getItem('sessionId');
      
      if (storedSessionId) {
        const { user: verifiedUser, isValid } = await AuthService.verifySession(storedSessionId);
        
        if (isValid && verifiedUser) {
          setUser(verifiedUser);
          // We don't store the full session object in localStorage for security reasons
          // Instead, we recreate it with just the ID
          setSession({ id: storedSessionId, userId: verifiedUser.id, token: '', expiresAt: new Date(), createdAt: new Date() });
        } else {
          // Clear invalid session
          localStorage.removeItem('sessionId');
        }
      }
      
      setLoading(false);
    };

    checkExistingSession();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const result = await AuthService.login(email, password);
      
      if (result.user && result.session) {
        setUser(result.user);
        setSession(result.session);
        localStorage.setItem('sessionId', result.session.id); // Store session ID for persistence
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        user: null,
        session: null,
        error: 'An unexpected error occurred during login',
      };
    }
  };

  const logout = async () => {
    try {
      if (session) {
        await AuthService.logout(session.id);
      }
      
      setUser(null);
      setSession(null);
      localStorage.removeItem('sessionId');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    try {
      const result = await AuthService.register(name, email, password);
      
      if (result.user && result.session) {
        setUser(result.user);
        setSession(result.session);
        localStorage.setItem('sessionId', result.session.id);
      }
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        user: null,
        session: null,
        error: 'An unexpected error occurred during registration',
      };
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    try {
      return await AuthService.requestPasswordReset(email);
    } catch (error) {
      console.error('Password reset request error:', error);
      return false;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      return await AuthService.resetPassword(token, newPassword);
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  const isAuthenticated = !!(user && session);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        logout,
        register,
        requestPasswordReset,
        resetPassword,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};