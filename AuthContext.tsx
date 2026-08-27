import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api, setAuthToken, getAuthToken } from '../lib/api.js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  unreadNotifications: number;
  pendingRequests: number;
  friendsCount: number;
  login: (credentials: { identifier: string; password: string }) => Promise<User>;
  register: (payload: any) => Promise<{ user: User; studentId: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserContext: (updatedFields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const [friendsCount, setFriendsCount] = useState<number>(0);

  const refreshUser = async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.getMe();
      setUser(data.user);
      setUnreadNotifications(data.unreadNotifications || 0);
      setPendingRequests(data.pendingRequests || 0);
      setFriendsCount(data.friendsCount || 0);
    } catch (err) {
      console.warn('Session check failed, clearing token:', err);
      setAuthToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { identifier: string; password: string }) => {
    const data = await api.signIn(credentials);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    await refreshUser();
    return data.user;
  };

  const register = async (payload: any) => {
    const data = await api.signUp(payload);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    await refreshUser();
    return { user: data.user, studentId: data.studentId };
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setUnreadNotifications(0);
    setPendingRequests(0);
    setFriendsCount(0);
  };

  const updateUserContext = (updatedFields: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedFields });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        token,
        unreadNotifications,
        pendingRequests,
        friendsCount,
        login,
        register,
        logout,
        refreshUser,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
