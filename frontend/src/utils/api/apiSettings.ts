const API_BASE_URL_KEY = 't8d-api-base-url';
const TOKEN_KEY = 't8d-auth-token';
const USER_KEY = 't8d-auth-user';

export const saveApiBaseUrl = (url: string) => {
  localStorage.setItem(API_BASE_URL_KEY, url);
};

export const getApiBaseUrl = (): string | null => {
  return localStorage.getItem(API_BASE_URL_KEY);
};

export const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export const saveUser = (user: AuthUser) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStoredUser = (): AuthUser | null => {
  const storedUser = localStorage.getItem(USER_KEY);
  try {
    return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
  } catch {
    return null;
  }
};

export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};
