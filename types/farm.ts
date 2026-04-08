// ======================================
// FARM TYPES
// ======================================

export type FarmType = 'CROP' | 'LIVESTOCK' | 'MIXED' | 'AQUACULTURE'
export type FarmStatus = 'ACTIVE' | 'INACTIVE' | 'ABANDONED'
export type SoilType = 'CLAY' | 'SANDY' | 'LOAM' | 'SILTY' | 'PEATY' | 'CHALKY' | 'OTHER'
export type WaterSource = 'WELL' | 'RIVER' | 'RAIN' | 'IRRIGATION_CANAL'

export interface FarmResponse {
  id: string
  organizationId?: string
  organizationName?: string
  code: string
  name: string
  type: FarmType
  ownerName?: string
  ownerPhone?: string
  managerName?: string
  establishmentDate?: string
  totalAreaHectares?: number
  cultivableAreaHectares?: number
  gpsBoundariesWkt?: string
  centerLatitude?: number
  centerLongitude?: number
  address?: string
  province?: string
  commune?: string
  village?: string
  waterSource?: WaterSource
  soilType?: SoilType
  certificationStatus?: string
  status: FarmStatus
  photoUrls?: string[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateFarmRequest {
  organizationId?: string
  code: string
  name: string
  type: FarmType
  ownerName: string
  ownerPhone: string
  managerName?: string
  establishmentDate?: string
  totalAreaHectares?: number
  cultivableAreaHectares?: number
  gpsBoundariesWkt?: string
  centerLatitude?: number
  centerLongitude?: number
  address?: string
  province?: string
  commune?: string
  village?: string
  waterSource?: WaterSource
  soilType?: string
  certificationStatus?: string
  metadata?: Record<string, any>
}

export interface UpdateFarmRequest {
  organizationId?: string
  name?: string
  type?: FarmType
  ownerName?: string
  ownerPhone?: string
  managerName?: string
  establishmentDate?: string
  totalAreaHectares?: number
  cultivableAreaHectares?: number
  gpsBoundariesWkt?: string
  centerLatitude?: number
  centerLongitude?: number
  address?: string
  province?: string
  commune?: string
  village?: string
  waterSource?: WaterSource
  soilType?: string
  certificationStatus?: string
  status?: FarmStatus
  metadata?: Record<string, any>
}

export interface FarmStatisticsResponse {
  totalParcels: number
  totalParcelAreaHectares: number
  activeCultivations: number
  totalLivestock: number
  healthyLivestock: number
  activeEmployees: number
  permanentEmployees: number
  seasonalEmployees: number
  inventoryItemsCount: number
  totalInventoryValue: number
  lowStockAlertsCount: number
  currentMonthRevenue: number
  currentMonthExpenses: number
  currentMonthProfit: number
  availableProducts: number
  pendingOrders: number
  activeIoTSensors: number
  tasksInProgress: number
  overdueTasks: number
}
