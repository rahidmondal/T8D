const API_BASE_URL_KEY = 't8d-api-base-url';
const TOKEN_KEY = 't8d-auth-token';
const USER_KEY = 't8d-auth-user';

export const saveApiBaseUrl = (url: string) => {
  try {
    localStorage.setItem(API_BASE_URL_KEY, url);
  } catch (e) {
    console.error('Could not save API Base URL to storage:', e);
  }
};

export const getApiBaseUrl = (): string | null => {
  try {
    return localStorage.getItem(API_BASE_URL_KEY);
  } catch (e) {
    console.error('Could not read API Base URL from storage:', e);
    return null;
  }
};

export const saveToken = (token: string) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Could not save token to storage:', e);
  }
};

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.error('Could not read token from storage:', e);
    return null;
  }
};

export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('Could not remove token from storage:', e);
  }
};

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export const saveUser = (user: AuthUser) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Could not save user data to storage:', e);
  }
};

export const getStoredUser = (): AuthUser | null => {
  const storedUser = getStorageItemSafe(USER_KEY);

  try {
    return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
  } catch {
    return null;
  }
};

export const removeUser = () => {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (e) {
    console.error('Could not remove user data from storage:', e);
  }
};

const getStorageItemSafe = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error(`Could not read item "${key}" from storage:`, e);
    return null;
  }
};
