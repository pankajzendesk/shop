'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('toyshop.user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse user from localStorage', err);
      }
    }
    setIsInitialized(true);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('toyshop.user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('toyshop.user');
  };

  const authValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isInitialized
  }), [user, isInitialized]);

  return (
    <AuthContext.Provider value={authValue}>
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
