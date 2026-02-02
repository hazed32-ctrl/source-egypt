/**
 * API Type Definitions
 * Shared types for API requests and responses
 */

// ============ User & Auth Types ============

export type UserRole = 'super_admin' | 'admin' | 'agent' | 'sales_agent' | 'sales_manager' | 'marketer' | 'client';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  fullName: string;
  exp: number;
  iat: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// ============ Property Types ============

export type PropertyStatus = 'draft' | 'pending_approval' | 'published' | 'archived';
export type FinishingType = 'core_shell' | 'semi_finished' | 'fully_finished' | 'furnished';
export type ViewType = 'garden' | 'pool' | 'sea' | 'city' | 'landmark' | 'street';

export interface PropertyTranslation {
  title: string;
  description: string;
  slug: string;
}

export interface PropertyMedia {
  id: string;
  url: string;
  type: 'image' | 'video' | 'floor_plan' | '360_view';
  order: number;
  caption?: string;
}

export interface Property {
  id: string;
  translations: {
    en: PropertyTranslation;
    ar: PropertyTranslation;
  };
  price: number;
  salePrice?: number;
  currency: 'EGP' | 'USD';
  paymentPlan?: {
    downPayment: number;
    installmentYears: number;
    monthlyPayment?: number;
  };
  location: {
    city: string;
    area: string;
    coordinates?: { lat: number; lng: number };
  };
  specs: {
    bedrooms: number;
    bathrooms: number;
    area: number; // sqm
    finishing: FinishingType;
    view?: ViewType;
  };
  amenities: string[];
  tags: string[];
  media: PropertyMedia[];
  videoUrl?: string;
  view360Url?: string;
  status: PropertyStatus;
  submittedBy?: string;
  approvedBy?: string;
  submittedAt?: string;
  approvedAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyListItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  salePrice?: number;
  currency: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  imageUrl: string;
  status: PropertyStatus;
  tags: string[];
}

export interface PropertyFilters {
  search?: string;
  city?: string;
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  finishing?: FinishingType;
  tags?: string[];
  status?: PropertyStatus;
  page?: number;
  limit?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'area_asc' | 'area_desc';
}

// ============ Inventory Types ============

export interface Inventory {
  id: string;
  propertyId: string;
  propertyTitle: string;
  totalUnits: number;
  availableUnits: number;
  reservedUnits: number;
  soldUnits: number;
  lastUpdated: string;
  lastSyncedAt?: string;
  syncSource?: 'manual' | 'google_sheets';
}

export interface InventoryUpdate {
  propertyId: string;
  totalUnits?: number;
  availableUnits?: number;
  reservedUnits?: number;
  soldUnits?: number;
}

// ============ Client Assets Types ============

export type DeliveryStatus = 'under_construction' | 'delivered';

export interface ClientAsset {
  id: string;
  clientId: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  location: string;
  progressPercent: number;
  deliveryStatus: DeliveryStatus;
  purchaseDate: string;
  expectedDelivery?: string;
  contractUrl?: string;
}

// ============ Documents Types ============

export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'brochure' | 'floor_plan' | 'other';
  fileType: string;
  fileSize: number;
  propertyId?: string;
  assetId?: string;
  uploadedBy: string;
  uploadedAt: string;
  isPrivate: boolean;
}

export interface SignedUrlResponse {
  url: string;
  expiresAt: string;
}

// ============ Lead Types ============

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  propertyId?: string;
  propertyTitle?: string;
  status: LeadStatus;
  assignedTo?: string;
  assignedToName?: string;
  source: 'website' | 'whatsapp' | 'referral' | 'other';
  notes?: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  isInternal: boolean;
}

// ============ CMS Types ============

export interface CMSSection {
  id: string;
  pageId: string;
  type: 'hero' | 'features' | 'cta' | 'gallery' | 'text' | 'properties' | 'contact' | 'custom';
  order: number;
  isVisible: boolean;
  content: {
    en: Record<string, unknown>;
    ar: Record<string, unknown>;
  };
  settings: Record<string, unknown>;
}

export interface CMSPage {
  id: string;
  slug: string;
  title: {
    en: string;
    ar: string;
  };
  metaDescription?: {
    en: string;
    ar: string;
  };
  sections: CMSSection[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CMSPopup {
  id: string;
  name: string;
  content: {
    en: {
      title: string;
      body: string;
      ctaText?: string;
      ctaUrl?: string;
    };
    ar: {
      title: string;
      body: string;
      ctaText?: string;
      ctaUrl?: string;
    };
  };
  imageUrl?: string;
  trigger: 'immediate' | 'delay' | 'exit_intent' | 'scroll';
  triggerValue?: number; // delay in ms or scroll percentage
  showOnce: boolean;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Resale Request Types ============

export type ResaleStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed';

export interface ResaleRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  assetId: string;
  propertyTitle: string;
  status: ResaleStatus;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Sync Types ============

export type SyncStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface SyncLog {
  id: string;
  type: 'inventory' | 'properties' | 'documents';
  source: 'google_sheets' | 'google_drive';
  status: SyncStatus;
  startedAt: string;
  finishedAt?: string;
  rowsProcessed: number;
  rowsUpdated: number;
  rowsFailed: number;
  errors?: string[];
}

export interface GoogleSheetsConfig {
  inventorySheetId?: string;
  propertiesSheetId?: string;
  columnMappings: Record<string, string>;
  syncFrequency: 'manual' | '5min' | '10min' | '30min' | '1hour';
  lastSyncedAt?: string;
}

export interface GoogleDriveConfig {
  contractsFolderId?: string;
  mediaFolderId?: string;
  lastSyncedAt?: string;
}

// ============ Theme Settings Types ============

export interface ThemeSettings {
  baseBackground: string;
  gradientAngle: number;
  accentColor: string;
  watermarkOpacity: number;
  watermarkBlur: number;
  watermarkScale: number;
  logoUrl?: string;
}

// ============ Pagination Types ============

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============ API Response Types ============

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
