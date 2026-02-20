// ======================================
// AUTHENTICATION ROUTES
// ======================================

export const AUTH_ROUTES = {
  LOGIN: '/dashboard/login',
  LOGIN_V2: '/dashboard/login/v2',
  REGISTER: '/dashboard/register',
  REGISTER_V1: '/dashboard/register/v1',
  REGISTER_V2: '/dashboard/register/v2',
  FORGOT_PASSWORD: '/dashboard/forgot-password',
  RESET_PASSWORD: '/dashboard/reset-password',
  VERIFY_EMAIL: '/dashboard/verify-email',
  CHANGE_PASSWORD: '/dashboard/change-password',
  FIRST_LOGIN_CHANGE_PASSWORD: '/dashboard/change-password'
} as const;

// ======================================
// DASHBOARD ROUTES
// ======================================

export const DASHBOARD_ROUTES = {
  // Main dashboards
  DEFAULT: '/dashboard/default',
  ECOMMERCE: '/dashboard/ecommerce',
  SALES: '/dashboard/sales',
  CRM: '/dashboard/crm',
  ANALYTICS: '/dashboard/website-analytics',
  PROJECT_MANAGEMENT: '/dashboard/project-management',
  FILE_MANAGER: '/dashboard/file-manager',
  CRYPTO: '/dashboard/crypto',
  ACADEMY: '/dashboard/academy',
  HOSPITAL: '/dashboard/hospital-management',
  HOTEL: '/dashboard/hotel'
} as const;

// ======================================
// APPLICATION ROUTES
// ======================================

export const APP_ROUTES = {
  KANBAN: '/dashboard/apps/kanban',
  AI_CHAT: '/dashboard/apps/ai-chat',
  NOTES: '/dashboard/apps/notes',
  CHAT: '/dashboard/apps/chat',
  MAIL: '/dashboard/apps/mail',
  TODO: '/dashboard/apps/todo-list-app',
  CALENDAR: '/dashboard/apps/calendar',
  FILE_MANAGER_APP: '/dashboard/apps/file-manager',
  API_KEYS: '/dashboard/apps/api-keys',
  POS_SYSTEM: '/dashboard/apps/pos-system'
} as const;

// ======================================
// PAGE ROUTES
// ======================================

export const PAGE_ROUTES = {
  // Users
  USERS: '/dashboard/pages/users',
  PROFILE: '/dashboard/pages/profile',
  
  // Settings
  SETTINGS: '/dashboard/pages/settings',
  SETTINGS_ACCOUNT: '/dashboard/pages/settings/account',
  SETTINGS_APPEARANCE: '/dashboard/pages/settings/appearance',
  SETTINGS_NOTIFICATIONS: '/dashboard/pages/settings/notifications',
  SETTINGS_DISPLAY: '/dashboard/pages/settings/display',
  
  // Products & Orders
  PRODUCTS: '/dashboard/pages/products',
  PRODUCT_DETAIL: '/dashboard/pages/products/[id]',
  PRODUCT_CREATE: '/dashboard/pages/products/create',
  ORDERS: '/dashboard/pages/orders',
  ORDER_DETAIL: '/dashboard/pages/orders/[id]',
  
  // Pricing
  PRICING_COLUMN: '/dashboard/pages/pricing/column',
  PRICING_TABLE: '/dashboard/pages/pricing/table',
  PRICING_SINGLE: '/dashboard/pages/pricing/single',
  
  // Error pages
  ERROR_404: '/dashboard/pages/error/404',
  ERROR_500: '/dashboard/pages/error/500',
  ERROR_403: '/dashboard/pages/error/403'
} as const;

// ======================================
// EXTERNAL ROUTES
// ======================================

export const EXTERNAL_ROUTES = {
  LANDING: '/template/cosmic-landing-page-template',
  COMPONENTS: '/components',
  BLOCKS: '/blocks',
  TEMPLATES: '/templates',
  DOCUMENTATION: '/docs'
} as const;

// ======================================
// API ROUTES
// ======================================

export const API_ROUTES = {
  BASE: '/api/proxy',
  AUTH: {
    LOGIN: '/api/proxy/auth/login',
    LOGOUT: '/api/proxy/auth/logout',
    REGISTER: '/api/proxy/auth/register',
    REFRESH: '/api/proxy/auth/refresh',
    FORGOT_PASSWORD: '/api/proxy/auth/forgot-password',
    RESET_PASSWORD: '/api/proxy/auth/reset-password',
    VERIFY_EMAIL: '/api/proxy/auth/verify-email',
    CURRENT_USER: '/api/proxy/auth/me'
  },
  USERS: {
    LIST: '/api/proxy/users',
    CREATE: '/api/proxy/users',
    GET: '/api/proxy/users/[id]',
    UPDATE: '/api/proxy/users/[id]',
    DELETE: '/api/proxy/users/[id]'
  },
  PRODUCTS: {
    LIST: '/api/proxy/products',
    CREATE: '/api/proxy/products',
    GET: '/api/proxy/products/[id]',
    UPDATE: '/api/proxy/products/[id]',
    DELETE: '/api/proxy/products/[id]'
  },
  ORDERS: {
    LIST: '/api/proxy/orders',
    CREATE: '/api/proxy/orders',
    GET: '/api/proxy/orders/[id]',
    UPDATE: '/api/proxy/orders/[id]',
    DELETE: '/api/proxy/orders/[id]'
  },
  TRANSACTIONS: {
    LIST: '/api/proxy/transactions',
    CREATE: '/api/proxy/transactions',
    GET: '/api/proxy/transactions/[id]',
    CANCEL: '/api/proxy/transactions/[id]/cancel',
    REFUND: '/api/proxy/transactions/[id]/refund'
  },
  TERMINALS: {
    LIST: '/api/proxy/terminals',
    CREATE: '/api/proxy/terminals',
    GET: '/api/proxy/terminals/[id]',
    UPDATE: '/api/proxy/terminals/[id]',
    DELETE: '/api/proxy/terminals/[id]'
  }
} as const;

// ======================================
// ALL ROUTES - Union de toutes les routes
// ======================================

export const ALL_ROUTES = {
  ...AUTH_ROUTES,
  ...DASHBOARD_ROUTES,
  ...APP_ROUTES,
  ...PAGE_ROUTES,
  ...EXTERNAL_ROUTES
} as const;

// ======================================
// ROUTE GROUPS - Groupement logique des routes
// ======================================

export const ROUTE_GROUPS = {
  PUBLIC: [
    AUTH_ROUTES.LOGIN,
    AUTH_ROUTES.LOGIN_V2,
    AUTH_ROUTES.REGISTER,
    AUTH_ROUTES.REGISTER_V1,
    AUTH_ROUTES.REGISTER_V2,
    AUTH_ROUTES.FORGOT_PASSWORD,
    AUTH_ROUTES.RESET_PASSWORD,
    AUTH_ROUTES.VERIFY_EMAIL,
    AUTH_ROUTES.CHANGE_PASSWORD,
    PAGE_ROUTES.ERROR_404,
    PAGE_ROUTES.ERROR_500,
    PAGE_ROUTES.ERROR_403
  ],
  PROTECTED: [
    ...Object.values(DASHBOARD_ROUTES),
    ...Object.values(APP_ROUTES),
    PAGE_ROUTES.USERS,
    PAGE_ROUTES.PROFILE,
    ...Object.values({
      SETTINGS: PAGE_ROUTES.SETTINGS,
      SETTINGS_ACCOUNT: PAGE_ROUTES.SETTINGS_ACCOUNT,
      SETTINGS_APPEARANCE: PAGE_ROUTES.SETTINGS_APPEARANCE,
      SETTINGS_NOTIFICATIONS: PAGE_ROUTES.SETTINGS_NOTIFICATIONS,
      SETTINGS_DISPLAY: PAGE_ROUTES.SETTINGS_DISPLAY
    }),
    PAGE_ROUTES.PRODUCTS,
    PAGE_ROUTES.PRODUCT_CREATE,
    PAGE_ROUTES.ORDERS
  ],
  ADMIN_ONLY: [
    PAGE_ROUTES.USERS,
    APP_ROUTES.API_KEYS,
    PAGE_ROUTES.SETTINGS_DISPLAY
  ]
} as const;

// ======================================
// TYPES TYPESCRIPT
// ======================================

export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES];
export type DashboardRoute = typeof DASHBOARD_ROUTES[keyof typeof DASHBOARD_ROUTES];
export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];
export type PageRoute = typeof PAGE_ROUTES[keyof typeof PAGE_ROUTES];
export type ExternalRoute = typeof EXTERNAL_ROUTES[keyof typeof EXTERNAL_ROUTES];
export type Route = typeof ALL_ROUTES[keyof typeof ALL_ROUTES];
export type ApiRoute = typeof API_ROUTES[keyof typeof API_ROUTES];

// ======================================
// UTILITY FUNCTIONS
// ======================================

/**
 * Vérifie si une route est publique (accessible sans authentification)
 */
export const isPublicRoute = (route: string): boolean => {
  return ROUTE_GROUPS.PUBLIC.includes(route as any);
};

/**
 * Vérifie si une route est protégée (nécessite une authentification)
 */
export const isProtectedRoute = (route: string): boolean => {
  return ROUTE_GROUPS.PROTECTED.includes(route as any);
};

/**
 * Vérifie si une route nécessite des privilèges administrateur
 */
export const isAdminRoute = (route: string): boolean => {
  return ROUTE_GROUPS.ADMIN_ONLY.includes(route as any);
};

/**
 * Obtient la route de redirection par défaut après connexion
 */
export const getDefaultRedirectRoute = (): string => {
  return DASHBOARD_ROUTES.DEFAULT;
};

/**
 * Obtient la route de connexion par défaut
 */
export const getLoginRoute = (): string => {
  return AUTH_ROUTES.LOGIN_V2;
};

/**
 * Génère une URL avec des paramètres dynamiques
 */
export const generateRoute = (route: string, params: Record<string, string>): string => {
  let generatedRoute = route;
  
  Object.entries(params).forEach(([key, value]) => {
    generatedRoute = generatedRoute.replace(`[${key}]`, value);
  });
  
  return generatedRoute;
};

/**
 * Vérifie si une route correspond à un pattern
 */
export const matchesRoute = (currentRoute: string, pattern: string): boolean => {
  // Convertit les patterns [id] en regex
  const regexPattern = pattern.replace(/\[([^\]]+)\]/g, '([^/]+)');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(currentRoute);
};

/**
 * Extrait les paramètres d'une route dynamique
 */
export const extractRouteParams = (currentRoute: string, pattern: string): Record<string, string> => {
  const params: Record<string, string> = {};
  const patternParts = pattern.split('/');
  const routeParts = currentRoute.split('/');
  
  patternParts.forEach((part, index) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      const paramName = part.slice(1, -1);
      params[paramName] = routeParts[index];
    }
  });
  
  return params;
};

/**
 * Obtient le breadcrumb pour une route
 */
export const getRouteBreadcrumb = (route: string): string[] => {
  const parts = route.split('/').filter(Boolean);
  const breadcrumb: string[] = [];
  
  parts.forEach((part, index) => {
    if (part === 'dashboard') {
      breadcrumb.push('Dashboard');
    } else if (part === 'pages') {
      // Skip pages segment
    } else if (part === 'apps') {
      breadcrumb.push('Applications');
    } else {
      // Capitalize first letter and replace hyphens
      const formatted = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      breadcrumb.push(formatted);
    }
  });
  
  return breadcrumb;
};

/**
 * Vérifie si une route est active ou parente de la route actuelle
 */
export const isActiveRoute = (currentRoute: string, checkRoute: string): boolean => {
  if (currentRoute === checkRoute) return true;
  
  // Vérifie si c'est une route parente
  return currentRoute.startsWith(checkRoute + '/');
};

/**
 * Obtient toutes les routes d'une catégorie
 */
export const getRoutesByCategory = (category: keyof typeof ROUTE_GROUPS): string[] => {
  return ROUTE_GROUPS[category] || [];
};