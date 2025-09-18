'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi, ApiError } from '../../lib/api';

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuthStatus = async () => {
    try {
      const authStatus = localStorage.getItem('adminAuth');
      const token = localStorage.getItem('adminToken');

      if (authStatus === 'true' && token) {
        // Verify token is still valid by fetching user profile
        const response = await authApi.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear auth state
          localStorage.removeItem('adminAuth');
          localStorage.removeItem('adminToken');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear auth state on error
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        setUser(response.data.admin);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}