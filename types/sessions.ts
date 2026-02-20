// Types pour la gestion des sessions actives
// Basés sur les DTOs Java du SessionController

export interface SessionInfoResponse {
  // Identifiants session
  sessionId: string;
  accessTokenJti?: string;
  status: string;
  
  // Informations utilisateur
  userId: string;
  userFullName?: string;
  userEmail?: string;
  
  // Timing
  createdAt: string;
  expiresAt?: string;
  lastAccessAt?: string;
  durationMinutes?: number;
  isExpired?: boolean;
  isActive?: boolean;
  
  // Device/Client
  deviceId?: string;
  deviceName?: string;
  deviceType?: 'MOBILE' | 'DESKTOP' | 'TABLET' | 'WEB';
  operatingSystem?: string;
  browserName?: string;
  browserVersion?: string;
  deviceInfo?: string;
  
  // Localisation
  ipAddress?: string;
  location?: string;
  timezone?: string;
  
  // Sécurité
  userAgent?: string;
  isCurrentSession?: boolean;
  isLongSession?: boolean;
  isMobileDevice?: boolean;
  isWebDevice?: boolean;
  
  // Statistiques
  accessCount?: number;
  firstAccessAt?: string;
}

export interface SessionsListResponse {
  content: SessionInfoResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface SessionSearchParams {
  page?: number;
  size?: number;
  searchTerm?: string;
  deviceType?: 'MOBILE' | 'DESKTOP' | 'TABLET' | 'WEB';
  since?: string;
  userId?: string;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface SessionStatsResponse {
  totalActiveSessions: number;
  distinctActiveUsers: number;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  averageSessionsPerUser: number;
  timestamp: string;
}

// Types pour la révocation multiple
export interface RevokeMultipleSessionsRequest {
  sessionIds: string[];
  reason?: string;
}

export interface RevokeSessionResult {
  sessionId: string;
  status: string;
  userEmail?: string;
  success: boolean;
  error?: string;
}

export interface RevokeMultipleSessionsResponse {
  totalRequested: number;
  successfulRevocations: number;
  failedRevocations: number;
  results: RevokeSessionResult[];
}

// Types pour les sessions suspectes
export interface SuspiciousSessionsParams {
  userId?: string;
  currentIp?: string;
}

// Type pour la validation de session
export interface SessionValidationResponse {
  sessionId: string;
  isValid: boolean;
  isActive: boolean;
  isExpired: boolean;
  status: string;
  expiresAt?: string;
  lastAccessAt?: string;
  error?: string;
}