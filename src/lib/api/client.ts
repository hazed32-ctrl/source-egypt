/**
 * API Client
 * Axios-based HTTP client with interceptors for auth and error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getApiUrl, API_TIMEOUT } from './config';
import { ApiError, AuthTokens } from './types';

// Token storage keys
const ACCESS_TOKEN_KEY = 'source_access_token';
const REFRESH_TOKEN_KEY = 'source_refresh_token';

// Token management
export const tokenManager = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (tokens: AuthTokens): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken();
  },
};

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: getApiUrl(),
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // For HttpOnly cookies
  });

  // Request interceptor - add auth token
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenManager.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle errors and token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Handle 401 - attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = tokenManager.getRefreshToken();
          if (refreshToken) {
            const response = await axios.post(`${getApiUrl()}/auth/refresh`, {
              refreshToken,
            });

            const newTokens: AuthTokens = response.data.data;
            tokenManager.setTokens(newTokens);

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            }
            return client(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect to login
          tokenManager.clearTokens();
          window.location.href = '/auth';
          return Promise.reject(refreshError);
        }
      }

      // Transform error to consistent format
      const apiError: ApiError = {
        success: false,
        error: {
          code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
          message: error.response?.data?.error?.message || error.message || 'An unexpected error occurred',
          details: error.response?.data?.error?.details,
        },
      };

      return Promise.reject(apiError);
    }
  );

  return client;
};

// Export singleton instance
export const apiClient = createApiClient();

// Helper for GET requests
export const get = async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
  const response = await apiClient.get<{ data: T }>(url, { params });
  return response.data.data;
};

// Helper for POST requests
export const post = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await apiClient.post<{ data: T }>(url, data);
  return response.data.data;
};

// Helper for PUT requests
export const put = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await apiClient.put<{ data: T }>(url, data);
  return response.data.data;
};

// Helper for PATCH requests
export const patch = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await apiClient.patch<{ data: T }>(url, data);
  return response.data.data;
};

// Helper for DELETE requests
export const del = async <T>(url: string): Promise<T> => {
  const response = await apiClient.delete<{ data: T }>(url);
  return response.data.data;
};

// File upload helper
export const uploadFile = async <T>(url: string, file: File, additionalData?: Record<string, string>): Promise<T> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  const response = await apiClient.post<{ data: T }>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
};

// Log current mode
if (IS_MOCK_MODE) {
  console.log('[API Client] Running in MOCK mode - API calls will be intercepted by mock handlers');
}
