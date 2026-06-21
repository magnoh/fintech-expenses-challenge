import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authApi } from '../api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  setError: (err: string | null) => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
    } catch (err) {
      console.error('Erro ao buscar perfil do usuário atual', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials: { email: string; password: string }) => {
    setError(null);
    try {
      const data = await authApi.login(credentials);
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao realizar login';
      setError(Array.isArray(msg) ? msg[0] : msg);
      throw err;
    }
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    setError(null);
    try {
      await authApi.register(data);
      // Auto login após cadastrar
      await login({ email: data.email, password: data.password });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Erro ao realizar cadastro';
      setError(Array.isArray(msg) ? msg[0] : msg);
      throw err;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    error,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
