// ======================================
// NOTIFICATION MODULE TYPES
// ======================================

export type NotificationType = 'ALERT' | 'INFO' | 'WARNING' | 'SUCCESS' | 'REMINDER' | 'TASK' | 'SYSTEM'
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type NotificationChannel = 'IN_APP' | 'SMS' | 'EMAIL' | 'PUSH' | 'WHATSAPP'
export type AlertCondition = 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN_OR_EQUAL' | 'CONTAINS' | 'NOT_CONTAINS' | 'BETWEEN' | 'IN_RANGE' | 'OUT_OF_RANGE'

// ======================================
// NOTIFICATION
// ======================================

export interface NotificationResponse {
  id: string
  farmId?: string
  userId: string
  notificationType: NotificationType
  priority: NotificationPriority
  subject: string
  body: string
  channels?: NotificationChannel[]
  targetId?: string
  targetType?: string
  actionUrl?: string
  isRead: boolean
  readAt?: string
  isSent: boolean
  sentAt?: string
  scheduledFor?: string
  metadata?: Record<string, any>
  createdAt: string
}

export interface NotificationSummaryResponse {
  id: string
  notificationType: NotificationType
  priority: NotificationPriority
  subject: string
  isRead: boolean
  isSent: boolean
  sentAt?: string
  createdAt: string
  targetId?: string
  targetType?: string
}

export interface SendNotificationRequest {
  recipientIds: string[]
  farmId?: string
  notificationType: NotificationType
  priority?: NotificationPriority
  subject: string
  body: string
  templateCode?: string
  templateVariables?: Record<string, any>
  channels?: NotificationChannel[]
  targetId?: string
  targetType?: string
  actionUrl?: string
  scheduledFor?: string
  metadata?: Record<string, any>
}

export interface NotificationStatsResponse {
  totalNotifications: number
  unreadNotifications: number
  readNotifications: number
  sentNotifications: number
  pendingNotifications: number
  failedNotifications: number
  notificationsByType?: Record<string, number>
  notificationsByPriority?: Record<string, number>
  notificationsLast24Hours: number
  notificationsLast7Days: number
  notificationsLast30Days: number
}

// ======================================
// ALERT RULE
// ======================================

export interface AlertRuleResponse {
  id: string
  farmId: string
  ruleCode: string
  name: string
  description?: string
  entityType: string
  fieldName: string
  condition: AlertCondition
  thresholdValue?: string
  comparisonValue?: string
  priority: NotificationPriority
  channels?: NotificationChannel[]
  checkIntervalMinutes: number
  cooldownMinutes: number
  lastCheckedAt?: string
  lastTriggeredAt?: string
  triggerCount: number
  isActive: boolean
  recipientIds?: string[]
  additionalFilters?: Record<string, any>
  notes?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateAlertRuleRequest {
  ruleCode: string
  name: string
  description?: string
  entityType: string
  fieldName: string
  condition: AlertCondition
  thresholdValue?: string
  comparisonValue?: string
  priority?: NotificationPriority
  channels?: NotificationChannel[]
  checkIntervalMinutes?: number
  cooldownMinutes?: number
  recipientIds?: string[]
  additionalFilters?: Record<string, any>
  notes?: string
  metadata?: Record<string, any>
}
