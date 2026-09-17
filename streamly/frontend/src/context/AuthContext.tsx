import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('streamly_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await apiService.getMe(token);
          setUser(userData);
        } catch {
          localStorage.removeItem('streamly_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await apiService.login(email, password);
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('streamly_token', res.access_token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('streamly_token');
  };

  const switchRole = async (role: UserRole) => {
    const credentialsMap: Record<UserRole, { email: string; pass: string }> = {
      ADMIN: { email: 'admin@streamly.demo', pass: 'StreamlyAdmin2026!' },
      ANALYST: { email: 'analyst@streamly.demo', pass: 'StreamlyAnalyst2026!' },
      VIEWER: { email: 'viewer@streamly.demo', pass: 'StreamlyViewer2026!' }
    };
    const creds = credentialsMap[role];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
