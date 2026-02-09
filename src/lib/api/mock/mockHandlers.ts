/**
 * Mock Handlers
 * Simulates API responses for development
 * NOTE: Only contains handlers still actively used by pages not yet migrated to Supabase.
 */

import { IS_MOCK_MODE } from '../config';
import {
  Property,
  PropertyListItem,
  PropertyFilters,
  CMSPage,
  CMSPopup,
  SyncLog,
  PaginatedResponse,
} from '../types';
import {
  mockProperties,
  mockPropertyListItems,
  mockCMSPages,
  mockPopups,
  mockSyncLogs,
} from './mockData';

// Simulate network delay
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// ============ Properties Handlers ============
export const mockPropertiesApi = {
  list: async (filters?: PropertyFilters): Promise<PaginatedResponse<PropertyListItem>> => {
    await delay(400);
    
    let filtered = [...mockPropertyListItems];
    
    if (filters?.status) {
      filtered = filtered.filter((p) => p.status === filters.status);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter((p) => 
        p.title.toLowerCase().includes(search) || 
        p.location.toLowerCase().includes(search)
      );
    }
    if (filters?.minPrice) {
      filtered = filtered.filter((p) => p.price >= (filters.minPrice || 0));
    }
    if (filters?.maxPrice) {
      filtered = filtered.filter((p) => p.price <= (filters.maxPrice || Infinity));
    }
    if (filters?.bedrooms) {
      filtered = filtered.filter((p) => p.bedrooms >= (filters.bedrooms || 0));
    }

    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'area_desc':
          filtered.sort((a, b) => b.area - a.area);
          break;
        default:
          break;
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    return {
      data: paged,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  },

  getById: async (id: string): Promise<Property | null> => {
    await delay(300);
    return mockProperties.find((p) => p.id === id) || null;
  },

  compare: async (ids: string[]): Promise<Property[]> => {
    await delay(300);
    return mockProperties.filter((p) => ids.includes(p.id) && p.status === 'published');
  },

  submitForApproval: async (id: string): Promise<Property> => {
    await delay(300);
    const index = mockProperties.findIndex((p) => p.id === id);
    if (index === -1) {
      throw { success: false, error: { code: 'NOT_FOUND', message: 'Property not found' } };
    }
    mockProperties[index].status = 'pending_approval';
    mockProperties[index].submittedAt = new Date().toISOString();
    return mockProperties[index];
  },
};

// ============ CMS Handlers ============
export const mockCMSApi = {
  getPages: async (): Promise<CMSPage[]> => {
    await delay(300);
    return mockCMSPages;
  },

  getPageBySlug: async (slug: string): Promise<CMSPage | null> => {
    await delay(200);
    return mockCMSPages.find((p) => p.slug === slug) || null;
  },

  updatePage: async (id: string, data: Partial<CMSPage>): Promise<CMSPage> => {
    await delay(400);
    const index = mockCMSPages.findIndex((p) => p.id === id);
    if (index === -1) {
      throw { success: false, error: { code: 'NOT_FOUND', message: 'Page not found' } };
    }
    mockCMSPages[index] = { ...mockCMSPages[index], ...data, updatedAt: new Date().toISOString() };
    return mockCMSPages[index];
  },

  getPopups: async (): Promise<CMSPopup[]> => {
    await delay(200);
    return mockPopups;
  },

  getActivePopups: async (): Promise<CMSPopup[]> => {
    await delay(200);
    return mockPopups.filter((p) => p.isActive);
  },
};

// ============ Sync Handlers ============
export const mockSyncApi = {
  getLogs: async (): Promise<SyncLog[]> => {
    await delay(300);
    return mockSyncLogs;
  },

  triggerSync: async (type: 'inventory' | 'properties' | 'documents'): Promise<SyncLog> => {
    await delay(1000);
    const newLog: SyncLog = {
      id: `sync-${Date.now()}`,
      type,
      source: type === 'documents' ? 'google_drive' : 'google_sheets',
      status: 'completed',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      rowsProcessed: Math.floor(Math.random() * 50) + 10,
      rowsUpdated: Math.floor(Math.random() * 20),
      rowsFailed: 0,
    };
    mockSyncLogs.unshift(newLog);
    return newLog;
  },
};

// Log mock mode status
if (IS_MOCK_MODE) {
  console.log('[Mock Handlers] Mock API handlers loaded');
}