/**
 * API Configuration
 * Manages API base URL and environment settings
 */

// Use environment variable or fallback to mock mode
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Enable mock mode when no API URL is configured
export const IS_MOCK_MODE = !API_BASE_URL;

// API version prefix
export const API_VERSION = '/api/v1';

// Full API URL
export const getApiUrl = () => {
  if (IS_MOCK_MODE) {
    return ''; // Mock handlers will intercept
  }
  return `${API_BASE_URL}${API_VERSION}`;
};

// Timeout configuration
export const API_TIMEOUT = 30000; // 30 seconds

// Retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
};

// Config loaded
