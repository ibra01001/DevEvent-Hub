import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser, UserRole } from '../types.ts';
import { authApi } from '../services/api.ts';

interface AuthContextType {
  user: IUser | null;
  role: UserRole | 'regular';
  isAdmin: boolean;
  isStaff: boolean;
  isRegularUser: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<IUser>;
  logout: () => void;
  quickSwitch: (role: 'admin' | 'staff' | 'regular') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'devevent_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored user:', e);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch (e) {
        console.error('Failed to persist user session:', e);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<IUser> => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setUser(res.data);
      return res.data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Helper for effortless testing and fast demo switching between the 3 roles
  const quickSwitch = async (targetRole: 'admin' | 'staff' | 'regular') => {
    if (targetRole === 'regular') {
      logout();
      return;
    }
    const creds = targetRole === 'admin'
      ? { email: 'admin@devevent.hub', password: 'admin123' }
      : { email: 'staff@devevent.hub', password: 'staff123' };
    await login(creds.email, creds.password);
  };

  const role: UserRole | 'regular' = user ? user.role : 'regular';
  const isAdmin = role === 'admin';
  const isStaff = role === 'staff';
  const isRegularUser = role === 'regular';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isStaff,
        isRegularUser,
        isLoading,
        login,
        logout,
        quickSwitch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
