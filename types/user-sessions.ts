export interface UserActiveSessionsResponse {
  // === INFORMATIONS UTILISATEUR ===
  userId: string;
  userEmail: string;
  userFullName: string;
  
  // === SESSIONS ACTIVES ===
  activeSessions: ActiveSession[];
  
  // === RÉSUMÉ ===
  summary: ActiveSessionsSummary;
}

export interface ActiveSession {
  // Identifiants
  sessionId: string;
  accessTokenJti?: string;
  status: string;
  
  // Timing
  createdAt: string;
  expiresAt: string;
  lastAccessAt: string;
  durationMinutes: number;
  remainingMinutes: number;
  
  // Statuts
  isCurrentSession: boolean;
  isLongSession: boolean;
  
  // Device
  deviceId?: string;
  deviceName?: string;
  deviceType: 'MOBILE' | 'DESKTOP' | 'TABLET' | 'WEB';
  operatingSystem?: string;
  browser?: string;
  deviceInfo?: string;
  isMobile: boolean;
  
  // Localisation
  ipAddress: string;
  location?: string;
  timezone?: string;
  locationInfo?: string;
  
  // Activité
  accessCount: number;
  firstAccessAt: string;
  
  // Sécurité
  isNewLocation: boolean;
  isSuspicious: boolean;
}

export interface ActiveSessionsSummary {
  totalActiveSessions: number;
  oldestSessionMinutes: number;
  newestSessionMinutes: number;
  averageSessionDuration: number;
  totalAccessCount: number;
  distinctDevices: number;
  distinctLocations: number;
  deviceBreakdown: DeviceBreakdown;
  longSessionsCount: number;
  newLocationsCount: number;
  suspiciousSessionsCount: number;
  securityScore: number;
  generatedAt: string;
}

export interface DeviceBreakdown {
  mobile: number;
  desktop: number;
  tablet: number;
  web: number;
}

export interface SessionStatsResponse {
  userId: string;
  activeSessionsCount: number;
  uniqueIpCount: number;
  hasLongSessions: boolean;
}

export interface RevokeSessionRequest {
  sessionId: string;
  reason?: string;
}

export interface RevokeAllSessionsRequest {
  userId: string;
  reason?: string;
}