import { getApiBaseUrl, getToken } from './apiSettings';

interface ApiClientOptions extends RequestInit {
  isPublic?: boolean;
}

const joinUrl = (base: string, endpoint: string): string => {
  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${normalizedBase}${normalizedEndpoint}`;
};

/**
 * A generic and type-safe wrapper for the browser's fetch() API.
 * - Reads Base URL from localStorage
 * - Automatically attaches the Authorization header for protected routes
 * - Throws an error on non-OK responses
 * - Allows the caller to specify the expected return type
 */
export const apiClient = async <T>(endpoint: string, options: ApiClientOptions = {}): Promise<T | null> => {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('API Base URL is not set. Please set it in the Sync Manager.');
  }

  const token = getToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (!options.isPublic && token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(joinUrl(baseUrl, endpoint), {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText;
    try {
      const errorBody = JSON.parse(errorText) as { message?: string };
      if (errorBody.message) {
        errorMessage = errorBody.message;
      }
    } catch {
      // It wasn't JSON, so we'll just use the raw text as the error.
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
    return null;
  }

  return (await response.json()) as T;
};
