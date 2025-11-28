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
      const storedUser = localStorage.getItem('adminUser');

      // Strict check: if no token or auth status, immediately set as unauthenticated
      if (!token || authStatus !== 'true') {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // If we have a token and auth status, set authenticated
      setIsAuthenticated(true);
      
      // If we have stored user data, use it immediately
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing stored user data:', e);
        }
      }

      // Then verify token in background
      try {
        const response = await authApi.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
          // Update stored user data
          localStorage.setItem('adminUser', JSON.stringify(response.data));
        }
      } catch (profileError) {
        // If it's an auth error (401/403), clear auth state
        if (profileError instanceof ApiError && (profileError.status === 401 || profileError.status === 403)) {
          console.warn('Token expired or invalid. Clearing auth state...');
          localStorage.removeItem('adminAuth');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          setIsAuthenticated(false);
          setUser(null);
        } else {
          console.warn('Profile fetch failed, but keeping user logged in:', profileError);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear auth state on any error
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
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
      console.log('Attempting login with:', { email });
      const response = await authApi.login(email, password);
      console.log('Login response:', response);

      if (response?.admin && response?.accessToken) {
        console.log('Login successful, setting user and auth state');
        setUser(response.admin);
        setIsAuthenticated(true);
        
        // Store user data for persistence
        localStorage.setItem('adminUser', JSON.stringify(response.admin));
        
        return true;
      }

      console.log('Login failed - invalid response format:', response);
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
      // Clear all stored auth data
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
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