// ======================================
// AUTHENTICATION ROUTES
// ======================================

export const AUTH_ROUTES = {
  LOGIN: '/dashboard/login',
  LOGIN_V2: '/dashboard/login/v2',
  REGISTER: '/dashboard/register',
  FORGOT_PASSWORD: '/dashboard/forgot-password',
  RESET_PASSWORD: '/dashboard/reset-password',
  CHANGE_PASSWORD: '/dashboard/change-password',
} as const;

// ======================================
// DASHBOARD ROUTES
// ======================================

export const DASHBOARD_ROUTES = {
  DEFAULT: '/dashboard/default',
  ORGANIZATIONS: '/dashboard/organizations',
  FARMS: '/dashboard/farms',
  CROPS: '/dashboard/crops',
  LIVESTOCK: '/dashboard/livestock',
  INVENTORY: '/dashboard/inventory',
  HR: '/dashboard/hr',
  FINANCE: '/dashboard/finance',
  MARKETPLACE: '/dashboard/marketplace',
  IOT: '/dashboard/iot',
  WEATHER: '/dashboard/weather',
  NOTIFICATIONS: '/dashboard/notifications',
  USERS: '/dashboard/users',
  ROLES: '/dashboard/roles',
  PERMISSIONS: '/dashboard/permissions',
  SETTINGS: '/dashboard/settings',
} as const;

// ======================================
// ERROR ROUTES
// ======================================

export const ERROR_ROUTES = {
  NOT_FOUND: '/dashboard/pages/error/404',
  SERVER_ERROR: '/dashboard/pages/error/500',
  FORBIDDEN: '/dashboard/pages/error/403',
} as const;

// ======================================
// ALL ROUTES
// ======================================

export const ALL_ROUTES = {
  ...AUTH_ROUTES,
  ...DASHBOARD_ROUTES,
  ...ERROR_ROUTES,
} as const;

// ======================================
// ROUTE GROUPS
// ======================================

export const ROUTE_GROUPS = {
  PUBLIC: [
    AUTH_ROUTES.LOGIN,
    AUTH_ROUTES.LOGIN_V2,
    AUTH_ROUTES.REGISTER,
    AUTH_ROUTES.FORGOT_PASSWORD,
    AUTH_ROUTES.RESET_PASSWORD,
    AUTH_ROUTES.CHANGE_PASSWORD,
    ERROR_ROUTES.NOT_FOUND,
    ERROR_ROUTES.SERVER_ERROR,
    ERROR_ROUTES.FORBIDDEN,
  ],
  PROTECTED: Object.values(DASHBOARD_ROUTES),
} as const;

// ======================================
// TYPES
// ======================================

export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES];
export type DashboardRoute = typeof DASHBOARD_ROUTES[keyof typeof DASHBOARD_ROUTES];

// ======================================
// UTILITY FUNCTIONS
// ======================================

export const isPublicRoute = (route: string): boolean => {
  return ROUTE_GROUPS.PUBLIC.includes(route as any);
};

export const isProtectedRoute = (route: string): boolean => {
  return ROUTE_GROUPS.PROTECTED.includes(route as any);
};

export const getDefaultRedirectRoute = (): string => {
  return DASHBOARD_ROUTES.DEFAULT;
};

export const getLoginRoute = (): string => {
  return AUTH_ROUTES.LOGIN_V2;
};

export const generateRoute = (route: string, params: Record<string, string>): string => {
  let generatedRoute = route;
  Object.entries(params).forEach(([key, value]) => {
    generatedRoute = generatedRoute.replace(`[${key}]`, value);
  });
  return generatedRoute;
};

export const isActiveRoute = (currentRoute: string, checkRoute: string): boolean => {
  if (currentRoute === checkRoute) return true;
  return currentRoute.startsWith(checkRoute + '/');
};
