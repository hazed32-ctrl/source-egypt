/**
 * API Module Index
 * Exports all API functionality
 */

// Configuration
export { API_BASE_URL, IS_MOCK_MODE, getApiUrl, API_TIMEOUT } from './config';

// Client
export { apiClient, tokenManager, get, post, put, patch, del, uploadFile } from './client';

// Types
export * from './types';

// Mock handlers (only those still used by pages not yet migrated to Supabase)
export {
  mockPropertiesApi,
  mockCMSApi,
  mockSyncApi,
} from './mock/mockHandlers';

// Mock data (only those still used)
export {
  mockProperties,
  mockPropertyListItems,
  mockCMSPages,
  mockPopups,
  mockSyncLogs,
} from './mock/mockData';