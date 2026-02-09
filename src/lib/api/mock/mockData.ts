/**
 * Mock Data
 * Static mock data for development and UI testing
 */

import {
  User,
  Property,
  PropertyListItem,
  Inventory,
  ClientAsset,
  Lead,
  CMSPage,
  CMSPopup,
  ResaleRequest,
  SyncLog,
  ThemeSettings,
} from '../types';

// ============ Mock Users ============
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@source-eg.com',
    fullName: 'Ahmed Hassan',
    phone: '+201234567890',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
  },
  {
    id: 'user-2',
    email: 'agent@source-eg.com',
    fullName: 'Sara Mohamed',
    phone: '+201234567891',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-11-15T10:00:00Z',
  },
  {
    id: 'user-3',
    email: 'client@example.com',
    fullName: 'Omar Farouk',
    phone: '+201234567892',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar',
    role: 'client',
    status: 'active',
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-10-20T10:00:00Z',
  },
  {
    id: 'user-4',
    email: 'sales@source-eg.com',
    fullName: 'Layla Ibrahim',
    phone: '+201234567893',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Layla',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-04-05T10:00:00Z',
    updatedAt: '2024-09-30T10:00:00Z',
  },
  {
    id: 'user-5',
    email: 'pending@example.com',
    fullName: '',
    role: 'client',
    status: 'pending',
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
  },
];

// ============ Mock Properties ============
export const mockProperties: Property[] = [
  {
    id: 'prop-1',
    translations: {
      en: {
        title: 'Palm Hills Residence',
        description: 'Luxury villa in the heart of New Cairo with stunning golf course views.',
        slug: 'palm-hills-residence',
      },
      ar: {
        title: 'ريزيدنس بالم هيلز',
        description: 'فيلا فاخرة في قلب القاهرة الجديدة مع إطلالات خلابة على ملعب الجولف.',
        slug: 'palm-hills-residence-ar',
      },
    },
    price: 12500000,
    currency: 'EGP',
    paymentPlan: {
      downPayment: 10,
      installmentYears: 8,
      monthlyPayment: 117187,
    },
    location: {
      city: 'New Cairo',
      area: 'Palm Hills',
    },
    specs: {
      bedrooms: 4,
      bathrooms: 5,
      area: 380,
      finishing: 'fully_finished',
      view: 'garden',
    },
    amenities: ['Swimming Pool', 'Gym', '24/7 Security', 'Kids Area', 'Clubhouse'],
    tags: ['Luxury', 'Golf View', 'Family Home'],
    media: [
      { id: 'm1', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', type: 'image', order: 1 },
      { id: 'm2', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', type: 'image', order: 2 },
    ],
    status: 'published',
    approvedBy: 'user-1',
    approvedAt: '2024-06-15T10:00:00Z',
    publishedAt: '2024-06-15T10:00:00Z',
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
  },
  {
    id: 'prop-2',
    translations: {
      en: {
        title: 'Marina Bay Penthouse',
        description: 'Exclusive penthouse with panoramic sea views in North Coast.',
        slug: 'marina-bay-penthouse',
      },
      ar: {
        title: 'بنتهاوس مارينا باي',
        description: 'بنتهاوس حصري مع إطلالات بانورامية على البحر في الساحل الشمالي.',
        slug: 'marina-bay-penthouse-ar',
      },
    },
    price: 8500000,
    salePrice: 7650000,
    currency: 'EGP',
    location: {
      city: 'North Coast',
      area: 'Marina',
    },
    specs: {
      bedrooms: 3,
      bathrooms: 4,
      area: 250,
      finishing: 'furnished',
      view: 'sea',
    },
    amenities: ['Private Beach', 'Rooftop Terrace', 'Concierge Service'],
    tags: ['Sea View', 'Investment', 'Premium'],
    media: [
      { id: 'm3', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', type: 'image', order: 1 },
    ],
    status: 'published',
    publishedAt: '2024-07-01T10:00:00Z',
    createdAt: '2024-06-20T10:00:00Z',
    updatedAt: '2024-11-15T10:00:00Z',
  },
  {
    id: 'prop-3',
    translations: {
      en: {
        title: 'Sodic East Apartment',
        description: 'Modern apartment in Sodic East with smart home features.',
        slug: 'sodic-east-apartment',
      },
      ar: {
        title: 'شقة سوديك إيست',
        description: 'شقة حديثة في سوديك إيست مع ميزات المنزل الذكي.',
        slug: 'sodic-east-apartment-ar',
      },
    },
    price: 4200000,
    currency: 'EGP',
    paymentPlan: {
      downPayment: 15,
      installmentYears: 6,
    },
    location: {
      city: 'New Cairo',
      area: 'Sodic East',
    },
    specs: {
      bedrooms: 2,
      bathrooms: 2,
      area: 140,
      finishing: 'semi_finished',
    },
    amenities: ['Gym', 'Swimming Pool', 'Parking'],
    tags: ['Smart Home', 'New Launch'],
    media: [
      { id: 'm4', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', type: 'image', order: 1 },
    ],
    status: 'pending_approval',
    submittedBy: 'user-2',
    submittedAt: '2024-11-28T10:00:00Z',
    createdAt: '2024-11-25T10:00:00Z',
    updatedAt: '2024-11-28T10:00:00Z',
  },
  {
    id: 'prop-4',
    translations: {
      en: {
        title: 'Zed East Twin House',
        description: 'Spacious twin house in the vibrant Zed East community.',
        slug: 'zed-east-twin-house',
      },
      ar: {
        title: 'تاون هاوس زيد إيست',
        description: 'تاون هاوس فسيح في مجتمع زيد إيست النابض بالحياة.',
        slug: 'zed-east-twin-house-ar',
      },
    },
    price: 9800000,
    currency: 'EGP',
    location: {
      city: 'New Cairo',
      area: 'Zed East',
    },
    specs: {
      bedrooms: 4,
      bathrooms: 4,
      area: 320,
      finishing: 'core_shell',
      view: 'garden',
    },
    amenities: ['Private Garden', 'Club House', 'Running Track'],
    tags: ['Family Home', 'New Project'],
    media: [
      { id: 'm5', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', type: 'image', order: 1 },
    ],
    status: 'draft',
    submittedBy: 'user-2',
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
  },
];

export const mockPropertyListItems: PropertyListItem[] = mockProperties.map((p) => ({
  id: p.id,
  title: p.translations.en.title,
  slug: p.translations.en.slug,
  price: p.price,
  salePrice: p.salePrice,
  currency: p.currency,
  location: `${p.location.area}, ${p.location.city}`,
  bedrooms: p.specs.bedrooms,
  bathrooms: p.specs.bathrooms,
  area: p.specs.area,
  imageUrl: p.media[0]?.url || '/placeholder.svg',
  status: p.status,
  tags: p.tags,
}));

// ============ Mock Inventory ============
export const mockInventory: Inventory[] = [
  {
    id: 'inv-1',
    propertyId: 'prop-1',
    propertyTitle: 'Palm Hills Residence',
    totalUnits: 50,
    availableUnits: 15,
    reservedUnits: 10,
    soldUnits: 25,
    lastUpdated: '2024-12-01T10:00:00Z',
    syncSource: 'google_sheets',
    lastSyncedAt: '2024-12-01T09:00:00Z',
  },
  {
    id: 'inv-2',
    propertyId: 'prop-2',
    propertyTitle: 'Marina Bay Penthouse',
    totalUnits: 20,
    availableUnits: 5,
    reservedUnits: 3,
    soldUnits: 12,
    lastUpdated: '2024-11-30T10:00:00Z',
    syncSource: 'manual',
  },
  {
    id: 'inv-3',
    propertyId: 'prop-3',
    propertyTitle: 'Sodic East Apartment',
    totalUnits: 100,
    availableUnits: 75,
    reservedUnits: 10,
    soldUnits: 15,
    lastUpdated: '2024-11-28T10:00:00Z',
  },
];

// ============ Mock Client Assets ============
export const mockClientAssets: ClientAsset[] = [
  {
    id: 'asset-1',
    clientId: 'user-3',
    propertyId: 'prop-1',
    propertyTitle: 'Palm Hills Residence - Unit A12',
    propertyImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    location: 'Palm Hills, New Cairo',
    progressPercent: 85,
    deliveryStatus: 'under_construction',
    purchaseDate: '2024-03-15T10:00:00Z',
    expectedDelivery: '2025-06-01T10:00:00Z',
  },
  {
    id: 'asset-2',
    clientId: 'user-3',
    propertyId: 'prop-2',
    propertyTitle: 'Marina Bay Penthouse - Unit P3',
    propertyImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    location: 'Marina, North Coast',
    progressPercent: 100,
    deliveryStatus: 'delivered',
    purchaseDate: '2023-06-20T10:00:00Z',
  },
];

// ============ Mock Leads ============
export const mockLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Mohammed Ali',
    email: 'mohammed@example.com',
    phone: '+201098765432',
    message: 'Interested in Palm Hills properties with payment plan.',
    propertyId: 'prop-1',
    propertyTitle: 'Palm Hills Residence',
    status: 'new',
    source: 'website',
    createdAt: '2024-12-01T14:30:00Z',
    updatedAt: '2024-12-01T14:30:00Z',
  },
  {
    id: 'lead-2',
    name: 'Fatima Hassan',
    email: 'fatima@example.com',
    phone: '+201123456789',
    status: 'contacted',
    assignedTo: 'user-4',
    assignedToName: 'Layla Ibrahim',
    source: 'whatsapp',
    notes: [
      {
        id: 'note-1',
        content: 'Called and scheduled a site visit for next week.',
        authorId: 'user-4',
        authorName: 'Layla Ibrahim',
        createdAt: '2024-11-30T10:00:00Z',
        isInternal: true,
      },
    ],
    createdAt: '2024-11-28T09:15:00Z',
    updatedAt: '2024-11-30T10:00:00Z',
  },
  {
    id: 'lead-3',
    name: 'Karim Nasser',
    email: 'karim@example.com',
    propertyId: 'prop-2',
    propertyTitle: 'Marina Bay Penthouse',
    status: 'qualified',
    assignedTo: 'user-4',
    assignedToName: 'Layla Ibrahim',
    source: 'website',
    createdAt: '2024-11-20T11:00:00Z',
    updatedAt: '2024-11-29T15:00:00Z',
  },
];

// ============ Mock CMS Pages ============
export const mockCMSPages: CMSPage[] = [
  {
    id: 'page-home',
    slug: 'home',
    title: { en: 'Home', ar: 'الرئيسية' },
    metaDescription: {
      en: 'Source EG - Luxury Real Estate in Egypt',
      ar: 'سورس إيجي - العقارات الفاخرة في مصر',
    },
    sections: [
      {
        id: 'sec-1',
        pageId: 'page-home',
        type: 'hero',
        order: 1,
        isVisible: true,
        content: {
          en: {
            headline: 'Discover Luxury Living',
            subheadline: 'Premium properties across Egypt',
            ctaText: 'Explore Properties',
            ctaLink: '/properties',
          },
          ar: {
            headline: 'اكتشف الحياة الفاخرة',
            subheadline: 'عقارات مميزة في أنحاء مصر',
            ctaText: 'استكشف العقارات',
            ctaLink: '/properties',
          },
        },
        settings: {
          backgroundImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920',
          overlayOpacity: 0.6,
        },
      },
      {
        id: 'sec-2',
        pageId: 'page-home',
        type: 'properties',
        order: 2,
        isVisible: true,
        content: {
          en: { title: 'Featured Properties', subtitle: 'Handpicked for you' },
          ar: { title: 'العقارات المميزة', subtitle: 'مختارة خصيصاً لك' },
        },
        settings: { limit: 6, featured: true },
      },
    ],
    isPublished: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-11-01T10:00:00Z',
  },
  {
    id: 'page-about',
    slug: 'about',
    title: { en: 'About Us', ar: 'من نحن' },
    sections: [],
    isPublished: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-06-01T10:00:00Z',
  },
];

// ============ Mock Popups ============
export const mockPopups: CMSPopup[] = [
  {
    id: 'popup-1',
    name: 'New Launch Promo',
    content: {
      en: {
        title: 'Exclusive New Launch!',
        body: 'Get 10% off on all units in our newest project.',
        ctaText: 'Learn More',
        ctaUrl: '/projects/new-launch',
      },
      ar: {
        title: 'إطلاق حصري جديد!',
        body: 'احصل على خصم 10% على جميع الوحدات في أحدث مشاريعنا.',
        ctaText: 'اعرف المزيد',
        ctaUrl: '/projects/new-launch',
      },
    },
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600',
    trigger: 'delay',
    triggerValue: 5000,
    showOnce: true,
    isActive: true,
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-11-01T10:00:00Z',
  },
];

// ============ Mock Resale Requests ============
export const mockResaleRequests: ResaleRequest[] = [
  {
    id: 'resale-1',
    clientId: 'user-3',
    clientName: 'Omar Farouk',
    clientEmail: 'client@example.com',
    assetId: 'asset-2',
    propertyTitle: 'Marina Bay Penthouse - Unit P3',
    status: 'pending',
    notes: 'Looking to sell due to relocation.',
    createdAt: '2024-11-25T10:00:00Z',
    updatedAt: '2024-11-25T10:00:00Z',
  },
];

// ============ Mock Sync Logs ============
export const mockSyncLogs: SyncLog[] = [
  {
    id: 'sync-1',
    type: 'inventory',
    source: 'google_sheets',
    status: 'completed',
    startedAt: '2024-12-01T09:00:00Z',
    finishedAt: '2024-12-01T09:02:15Z',
    rowsProcessed: 50,
    rowsUpdated: 12,
    rowsFailed: 0,
  },
  {
    id: 'sync-2',
    type: 'documents',
    source: 'google_drive',
    status: 'completed',
    startedAt: '2024-11-30T15:00:00Z',
    finishedAt: '2024-11-30T15:10:30Z',
    rowsProcessed: 25,
    rowsUpdated: 25,
    rowsFailed: 2,
    errors: ['File contracts_old.pdf not found', 'Invalid file format for brochure.docx'],
  },
];

// ============ Mock Theme Settings ============
export const mockThemeSettings: ThemeSettings = {
  baseBackground: '#0B0B0D',
  gradientAngle: 180,
  accentColor: '#D4A536',
  watermarkOpacity: 0.02,
  watermarkBlur: 40,
  watermarkScale: 1.5,
  logoUrl: '/logo-watermark.svg',
};

// ============ Current User (for auth) ============
export const mockCurrentUser = mockUsers[0]; // Admin by default
