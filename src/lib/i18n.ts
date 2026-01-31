import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const en = {
  translation: {
    // Navigation
    nav: {
      home: 'Home',
      properties: 'Properties',
      projects: 'Projects',
      about: 'About',
      contact: 'Contact',
      login: 'Login',
      register: 'Register',
      dashboard: 'Dashboard',
      myPortal: 'My Portal',
      logout: 'Logout',
    },
    // Hero Section
    hero: {
      title: 'Discover Luxury Living',
      subtitle: 'Exceptional properties in the most prestigious locations',
      searchPlaceholder: 'Search by location, project, or property type...',
      explore: 'Explore Properties',
      viewProjects: 'View Projects',
    },
    // Property
    property: {
      featured: 'Featured Properties',
      featuredSubtitle: 'Handpicked selections for the discerning buyer',
      beds: 'Beds',
      baths: 'Baths',
      area: 'Area',
      sqft: 'sq ft',
      sqm: 'm²',
      price: 'Price',
      startingFrom: 'Starting from',
      status: {
        available: 'Available',
        reserved: 'Reserved',
        sold: 'Sold',
      },
      tags: {
        hot: 'Hot',
        new: 'New',
        bestValue: 'Best Value',
      },
      construction: 'Construction',
      delivery: 'Delivery',
      finishing: 'Finishing',
      view: 'View',
      paymentPlan: 'Payment Plan',
      details: 'View Details',
      compare: 'Compare',
      favorite: 'Add to Favorites',
      brochure: 'Download Brochure',
      inquire: 'Inquire Now',
      whatsapp: 'WhatsApp',
      call: 'Call Us',
    },
    // Search & Filters
    search: {
      title: 'Find Your Perfect Property',
      priceRange: 'Price Range',
      areaRange: 'Area Range',
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      propertyType: 'Property Type',
      status: 'Status',
      project: 'Project',
      location: 'Location',
      sortBy: 'Sort By',
      results: 'Results',
      noResults: 'No properties found',
      clearFilters: 'Clear Filters',
      apply: 'Apply Filters',
      any: 'Any',
      min: 'Min',
      max: 'Max',
    },
    // Projects
    projects: {
      title: 'Premium Projects',
      subtitle: 'Explore our exclusive developments',
      units: 'Units',
      progress: 'Progress',
      viewProject: 'View Project',
    },
    // Contact & Leads
    contact: {
      title: 'Get in Touch',
      subtitle: 'Our team is ready to assist you',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      message: 'Message',
      submit: 'Send Message',
      success: 'Message sent successfully!',
      error: 'Failed to send message. Please try again.',
    },
    // Auth
    auth: {
      login: 'Sign In',
      register: 'Create Account',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember me',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      signUp: 'Sign up',
      signIn: 'Sign in',
      welcome: 'Welcome back',
      createAccountTitle: 'Create your account',
      loginSubtitle: 'Access your exclusive property portfolio',
      registerSubtitle: 'Join our premium real estate community',
    },
    // Dashboard
    dashboard: {
      title: 'Dashboard',
      overview: 'Overview',
      properties: 'Properties',
      leads: 'Leads',
      clients: 'Clients',
      settings: 'Settings',
      totalProperties: 'Total Properties',
      activeLeads: 'Active Leads',
      totalClients: 'Total Clients',
      resaleRequests: 'Resale Requests',
    },
    // Client Portal
    portal: {
      myAssets: 'My Assets',
      documents: 'Documents',
      requestResale: 'Request Resale',
      activityLog: 'Activity Log',
      welcome: 'Welcome to your portal',
    },
    // Common
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      close: 'Close',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      all: 'All',
      none: 'None',
      yes: 'Yes',
      no: 'No',
      currency: 'EGP',
    },
    // Footer
    footer: {
      about: 'About Us',
      services: 'Services',
      properties: 'Properties',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      rights: 'All rights reserved',
      newsletter: 'Subscribe to Newsletter',
      newsletterPlaceholder: 'Enter your email',
      subscribe: 'Subscribe',
    },
  },
};

// Arabic translations
const ar = {
  translation: {
    // Navigation
    nav: {
      home: 'الرئيسية',
      properties: 'العقارات',
      projects: 'المشاريع',
      about: 'من نحن',
      contact: 'اتصل بنا',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      dashboard: 'لوحة التحكم',
      myPortal: 'بوابتي',
      logout: 'تسجيل الخروج',
    },
    // Hero Section
    hero: {
      title: 'اكتشف الحياة الفاخرة',
      subtitle: 'عقارات استثنائية في أرقى المواقع',
      searchPlaceholder: 'ابحث حسب الموقع أو المشروع أو نوع العقار...',
      explore: 'استكشف العقارات',
      viewProjects: 'عرض المشاريع',
    },
    // Property
    property: {
      featured: 'العقارات المميزة',
      featuredSubtitle: 'اختيارات مختارة بعناية للمشتري المتميز',
      beds: 'غرف نوم',
      baths: 'حمامات',
      area: 'المساحة',
      sqft: 'قدم مربع',
      sqm: 'م²',
      price: 'السعر',
      startingFrom: 'يبدأ من',
      status: {
        available: 'متاح',
        reserved: 'محجوز',
        sold: 'مباع',
      },
      tags: {
        hot: 'ساخن',
        new: 'جديد',
        bestValue: 'أفضل قيمة',
      },
      construction: 'الإنشاء',
      delivery: 'التسليم',
      finishing: 'التشطيب',
      view: 'الإطلالة',
      paymentPlan: 'خطة الدفع',
      details: 'عرض التفاصيل',
      compare: 'مقارنة',
      favorite: 'أضف للمفضلة',
      brochure: 'تحميل الكتيب',
      inquire: 'استفسر الآن',
      whatsapp: 'واتساب',
      call: 'اتصل بنا',
    },
    // Search & Filters
    search: {
      title: 'اعثر على عقارك المثالي',
      priceRange: 'نطاق السعر',
      areaRange: 'نطاق المساحة',
      bedrooms: 'غرف النوم',
      bathrooms: 'الحمامات',
      propertyType: 'نوع العقار',
      status: 'الحالة',
      project: 'المشروع',
      location: 'الموقع',
      sortBy: 'ترتيب حسب',
      results: 'النتائج',
      noResults: 'لم يتم العثور على عقارات',
      clearFilters: 'مسح الفلاتر',
      apply: 'تطبيق الفلاتر',
      any: 'أي',
      min: 'الحد الأدنى',
      max: 'الحد الأقصى',
    },
    // Projects
    projects: {
      title: 'المشاريع المميزة',
      subtitle: 'استكشف تطويراتنا الحصرية',
      units: 'وحدات',
      progress: 'التقدم',
      viewProject: 'عرض المشروع',
    },
    // Contact & Leads
    contact: {
      title: 'تواصل معنا',
      subtitle: 'فريقنا جاهز لمساعدتك',
      name: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      message: 'الرسالة',
      submit: 'إرسال الرسالة',
      success: 'تم إرسال الرسالة بنجاح!',
      error: 'فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.',
    },
    // Auth
    auth: {
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور؟',
      rememberMe: 'تذكرني',
      noAccount: 'ليس لديك حساب؟',
      hasAccount: 'لديك حساب بالفعل؟',
      signUp: 'سجل الآن',
      signIn: 'دخول',
      welcome: 'مرحباً بعودتك',
      createAccountTitle: 'أنشئ حسابك',
      loginSubtitle: 'الوصول إلى محفظتك العقارية الحصرية',
      registerSubtitle: 'انضم إلى مجتمعنا العقاري المميز',
    },
    // Dashboard
    dashboard: {
      title: 'لوحة التحكم',
      overview: 'نظرة عامة',
      properties: 'العقارات',
      leads: 'العملاء المحتملين',
      clients: 'العملاء',
      settings: 'الإعدادات',
      totalProperties: 'إجمالي العقارات',
      activeLeads: 'العملاء المحتملين النشطين',
      totalClients: 'إجمالي العملاء',
      resaleRequests: 'طلبات إعادة البيع',
    },
    // Client Portal
    portal: {
      myAssets: 'أصولي',
      documents: 'المستندات',
      requestResale: 'طلب إعادة البيع',
      activityLog: 'سجل النشاط',
      welcome: 'مرحباً بك في بوابتك',
    },
    // Common
    common: {
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      view: 'عرض',
      close: 'إغلاق',
      confirm: 'تأكيد',
      back: 'رجوع',
      next: 'التالي',
      previous: 'السابق',
      search: 'بحث',
      filter: 'فلتر',
      sort: 'ترتيب',
      all: 'الكل',
      none: 'لا شيء',
      yes: 'نعم',
      no: 'لا',
      currency: 'ج.م',
    },
    // Footer
    footer: {
      about: 'من نحن',
      services: 'خدماتنا',
      properties: 'العقارات',
      contact: 'اتصل بنا',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الخدمة',
      rights: 'جميع الحقوق محفوظة',
      newsletter: 'اشترك في النشرة الإخبارية',
      newsletterPlaceholder: 'أدخل بريدك الإلكتروني',
      subscribe: 'اشترك',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
      ar,
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

export const changeLanguage = (lang: 'en' | 'ar') => {
  i18n.changeLanguage(lang);
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
};

export const getCurrentLanguage = () => i18n.language as 'en' | 'ar';
export const isRTL = () => i18n.language === 'ar';
