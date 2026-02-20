export interface UserAuditLogsResponse {
  // === INFORMATIONS UTILISATEUR ===
  userId: string;
  userEmail: string;
  userFullName: string;
  
  // === LOGS D'AUDIT ===
  auditLogs: AuditLogEntry[];
  
  // === PAGINATION ===
  pagination: PaginationInfo;
  
  // === STATISTIQUES ESSENTIELLES ===
  stats: AuditStats;
}

export interface AuditLogEntry {
  id: string;
  endpoint: string;
  httpMethod: string;
  action: string;
  requestTime: string;
  durationMs: number;
  statusCode: number;
  successful: boolean;
  errorMessage?: string;
  clientIp: string;
  deviceType?: string;
  securityViolation: boolean;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  icon?: string;
  color?: string;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AuditStats {
  totalLogs: number;
  last24Hours: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  securityViolations: number;
  topActions: ActionCount[];
}

export interface ActionCount {
  action: string;
  count: number;
}

// Interface pour les paramètres de recherche
export interface AuditSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  startDate?: string;
  endDate?: string;
  httpMethod?: string;
  statusCode?: number;
  onlyErrors?: boolean;
  onlySecurityViolations?: boolean;
}

// Interface pour les statistiques globales d'audit
export interface AuditStatsResponse {
  startDate: string;
  endDate: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  requestsByEndpoint: Record<string, number>;
  requestsByUser: Record<string, number>;
  requestsByStatusCode: Record<number, number>;
  responseTimeByEndpoint: Record<string, {
    avg: number;
    min: number;
    max: number;
    count: number;
  }>;
  slowestRequests: AuditLogResponse[];
}

// Interface pour la réponse détaillée d'un log
export interface AuditLogResponse {
  id: string;
  requestId?: string;
  sessionId?: string;
  userId?: string;
  username?: string;
  userEmail?: string;
  endpoint: string;
  httpMethod: string;
  requestTime: string;
  responseTime?: string;
  durationMs: number;
  statusCode: number;
  clientIp: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  errorMessage?: string;
  securityViolation: boolean;
  accessGranted: boolean;
  summary?: string;
}

// Types pour l'UI
export type AuditDisplayMode = 'table' | 'timeline';

export interface AuditActionIconMap {
  [key: string]: {
    icon: string;
    color: string;
    label: string;
  };
}

// Constantes pour l'UI
export const AUDIT_ACTION_ICONS: AuditActionIconMap = {
  'USER_CREATE': { icon: 'user-plus', color: '#22c55e', label: 'Création utilisateur' },
  'USER_UPDATE': { icon: 'user-check', color: '#3b82f6', label: 'Modification utilisateur' },
  'USER_DELETE': { icon: 'user-x', color: '#ef4444', label: 'Suppression utilisateur' },
  'LOGIN': { icon: 'log-in', color: '#10b981', label: 'Connexion' },
  'LOGOUT': { icon: 'log-out', color: '#6b7280', label: 'Déconnexion' },
  'PASSWORD_CHANGE': { icon: 'key', color: '#f59e0b', label: 'Changement mot de passe' },
  'PERMISSION_GRANT': { icon: 'shield-check', color: '#8b5cf6', label: 'Octroi permission' },
  'PERMISSION_REVOKE': { icon: 'shield-x', color: '#ef4444', label: 'Révocation permission' },
  'ROLE_ASSIGN': { icon: 'user-cog', color: '#06b6d4', label: 'Attribution rôle' },
  'ROLE_REMOVE': { icon: 'user-minus', color: '#f97316', label: 'Retrait rôle' },
  'SESSION_CREATE': { icon: 'monitor', color: '#22c55e', label: 'Nouvelle session' },
  'SESSION_REVOKE': { icon: 'monitor-x', color: '#ef4444', label: 'Révocation session' },
  'TRANSACTION_CREATE': { icon: 'credit-card', color: '#10b981', label: 'Transaction' },
  'DATA_EXPORT': { icon: 'download', color: '#6366f1', label: 'Export données' },
  'SECURITY_VIOLATION': { icon: 'alert-triangle', color: '#dc2626', label: 'Violation sécurité' },
  'DEFAULT': { icon: 'activity', color: '#64748b', label: 'Action système' }
};

export const SEVERITY_COLORS = {
  'INFO': '#22c55e',
  'WARN': '#f59e0b', 
  'ERROR': '#ef4444',
  'CRITICAL': '#dc2626'
} as const;

export const HTTP_METHOD_COLORS = {
  'GET': '#10b981',
  'POST': '#3b82f6',
  'PUT': '#f59e0b',
  'DELETE': '#ef4444',
  'PATCH': '#8b5cf6'
} as const;