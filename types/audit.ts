// ======================================
// AUDIT & LOG TYPES
// ======================================

export type AuditAction =
  | "CREATE" | "UPDATE" | "DELETE" | "READ"
  | "LOGIN" | "LOGOUT" | "APPROVE" | "REJECT"
  | "EXPORT" | "IMPORT" | "SYNC";

export type LogLevel = "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL";

export type SyncStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "PARTIAL" | "CONFLICT";

// ======================================
// AUDIT LOG
// ======================================

export interface AuditLogResponse {
  id: string
  userId?: string
  userName?: string
  actionTimestamp: string
  action: AuditAction
  entityType?: string
  entityId?: string
  entityName?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  changedFields?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  deviceId?: string
  requestUrl?: string
  requestMethod?: string
  statusCode?: number
  errorMessage?: string
  description?: string
  metadata?: Record<string, any>
  successful: boolean
  error: boolean
  createdAt: string
}

// ======================================
// SYSTEM LOG
// ======================================

export interface SystemLogResponse {
  id: string
  requestId?: string
  sessionId?: string
  userId?: string
  username?: string
  userEmail?: string
  authenticationType?: string
  permissionUsed?: string
  accessGranted?: boolean
  endpoint?: string
  httpMethod?: string
  requestTime: string
  requestParams?: string
  responseTime?: string
  durationMs?: number
  statusCode?: number
  errorMessage?: string
  clientIp?: string
  userAgent?: string
  deviceType?: string
  browser?: string
  os?: string
  securityViolation?: boolean
  securityDetails?: string
  action?: string
  entityType?: string
  entityId?: string
  logLevel?: LogLevel
  message?: string
  tags?: string
  createdAt: string
  successful: boolean
  clientError: boolean
  serverError: boolean
  severity?: string
  icon?: string
  color?: string
}

export interface SystemLogSearchRequest {
  userId?: string
  endpoint?: string
  statusCode?: number
  clientIp?: string
  action?: string
  startDate?: string
  endDate?: string
  page?: number
  size?: number
}

// ======================================
// SYNC LOG
// ======================================

export interface SyncLogResponse {
  id: string
  farmId?: string
  farmName?: string
  userId?: string
  userName?: string
  deviceId?: string
  deviceName?: string
  status: SyncStatus
  startedAt: string
  completedAt?: string
  durationMs?: number
  recordsSent?: number
  recordsReceived?: number
  recordsFailed?: number
  conflictsDetected?: number
  conflictsResolved?: number
  dataSizeBytes?: number
  errorMessage?: string
  successRate?: number
  successful: boolean
  syncDetails?: Record<string, any>
  metadata?: Record<string, any>
  createdAt: string
}

// ======================================
// AUDIT STATS
// ======================================

export interface EndpointStats {
  avgMs: number
  minMs: number
  maxMs: number
  count: number
}

export interface AuditStatsResponse {
  totalRequests?: number
  successfulRequests?: number
  failedRequests?: number
  successRate?: number
  averageResponseTimeMs?: number
  breakdownByStatus?: Record<string, number>
  topEndpoints?: Record<string, EndpointStats>
}
