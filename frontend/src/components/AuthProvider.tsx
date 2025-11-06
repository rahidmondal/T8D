import { ReactNode, useCallback, useEffect, useState } from 'react';

import { AuthContext } from '@src/context/AuthContext';
import { apiClient } from '@src/utils/api/apiClient';
import {
  AuthUser,
  getStoredUser,
  getToken,
  removeToken,
  removeUser,
  saveToken,
  saveUser,
} from '@src/utils/api/apiSettings';

interface LoginResponse {
  token: string;
  user: AuthUser;
}

type UserResponse = AuthUser;

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getStoredUser();
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiClient<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      isPublic: true,
    });

    if (data) {
      saveToken(data.token);
      saveUser(data.user);
      setToken(data.token);
      setUser(data.user);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      await apiClient<UserResponse>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
        isPublic: true,
      });
      await login(email, password);
    },
    [login],
  );

  const logout = useCallback(() => {
    removeToken();
    removeUser();
    setToken(null);
    setUser(null);
  }, []);

  const editUser = useCallback(async (updates: { name?: string; password?: string }) => {
    const updatedUser = await apiClient<UserResponse>('/api/v1/user/edit', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    if (updatedUser) {
      saveUser(updatedUser);
      setUser(updatedUser);
    }
  }, []);

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    editUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
