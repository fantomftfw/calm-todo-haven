
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiCall } from '../utils/api';

interface User {
  id: string;
  email: string;
  name?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const userData = await apiCall('/api/me', { token });
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await apiCall('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    
    const { token: newToken, user: userData } = response;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const signup = async (email: string, password: string, name?: string) => {
    const response = await apiCall('/api/auth/signup', {
      method: 'POST',
      body: { email, password, name }
    });
    
    const { token: newToken, user: userData } = response;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    loading,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
