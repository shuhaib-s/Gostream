'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { APP_ROUTES } from '@/lib/constants';
import { auth } from '@/lib/api';

export interface User {
  id: string;
  email: string;
}

export const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await auth.me();
      setIsAuthenticated(true);
      setUser(response.user);
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch (err) {
      // Ignore errors during logout
    }
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = APP_ROUTES.LOGIN;
  };

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      router.push(APP_ROUTES.LOGIN);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    logout,
    requireAuth,
    checkAuth,
  };
};

