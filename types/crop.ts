// ======================================
// CROP MODULE TYPES
// ======================================

export type Season = 'DRY_SEASON' | 'RAINY_SEASON' | 'WINTER' | 'SPRING' | 'SUMMER' | 'AUTUMN'
export type ParcelStatus = 'ACTIVE' | 'FALLOW' | 'RESTING' | 'DEGRADED' | 'UNDER_RESTORATION' | 'INACTIVE'
export type IrrigationType = 'NONE' | 'RAIN_FED' | 'DRIP' | 'SPRINKLER' | 'FLOOD' | 'MANUAL' | 'MIXED'
export type CultivationStatus = 'PLANNED' | 'LAND_PREPARATION' | 'PLANTED' | 'GERMINATING' | 'GROWING' | 'FLOWERING' | 'FRUITING' | 'READY_FOR_HARVEST' | 'HARVESTING' | 'HARVESTED' | 'FAILED' | 'ABANDONED'
export type ActivityType = 'LAND_CLEARING' | 'PLOWING' | 'HARROWING' | 'SEEDING' | 'TRANSPLANTING' | 'WATERING' | 'FERTILIZING' | 'WEEDING' | 'PEST_CONTROL' | 'DISEASE_TREATMENT' | 'PRUNING' | 'THINNING' | 'MULCHING' | 'HARVESTING' | 'POST_HARVEST' | 'MONITORING' | 'OTHER'

// ======================================
// CROP TYPE
// ======================================

export interface CropTypeResponse {
  id: string
  code: string
  nameFr: string
  nameMoore?: string
  nameDioula?: string
  nameFulfulde?: string
  scientificName?: string
  family?: string
  growthCycleDays?: number
  waterRequirementMm?: number
  optimalTempMin?: number
  optimalTempMax?: number
  expectedYieldTonnesPerHectare?: number
  marketPricePerKg?: number
  description?: string
  photoUrl?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateCropTypeRequest {
  code: string
  nameFr: string
  nameMoore?: string
  nameDioula?: string
  nameFulfulde?: string
  scientificName?: string
  family?: string
  category?: string
  growthCycleDays?: number
  waterRequirements?: string
  optimalTemperatureMin?: number
  optimalTemperatureMax?: number
  expectedYieldPerHectare?: number
  yieldUnit?: string
  marketPricePerUnit?: number
  description?: string
  plantingSeasons?: Record<string, any>
  cultivationTips?: Record<string, any>
  metadata?: Record<string, any>
}

// ======================================
// PARCEL
// ======================================

export interface ParcelResponse {
  id: string
  farmId: string
  farmName: string
  code: string
  name: string
  areaHectares?: number
  gpsBoundaries?: string
  elevation?: number
  slopePercentage?: number
  soilPh?: number
  organicMatterPercentage?: number
  irrigationType?: IrrigationType
  waterAccess?: boolean
  fallowSince?: number
  status: ParcelStatus
  notes?: string
  photoUrls?: string[]
  metadata?: Record<string, any>
  cultivationCount?: number
  createdAt: string
  updatedAt?: string
}

export interface CreateParcelRequest {
  farmId: string
  code: string
  name: string
  areaHectares?: number
  gpsBoundaries?: string
  elevation?: number
  slopePercentage?: number
  soilPh?: number
  organicMatterPercentage?: number
  irrigationType?: IrrigationType
  waterAccess?: boolean
  fallowSince?: number
  status?: ParcelStatus
  notes?: string
  photoUrls?: string[]
  metadata?: Record<string, any>
}

// ======================================
// CULTIVATION
// ======================================

export interface CultivationResponse {
  id: string
  parcelId: string
  parcelCode: string
  parcelName: string
  cropTypeId: string
  cropTypeCode: string
  cropTypeName: string
  seasonYear: number
  season: Season
  variety?: string
  seedSource?: string
  seedQuality?: string
  seedQuantityKg?: number
  plantingDate?: string
  expectedGerminationDate?: string
  actualGerminationDate?: string
  expectedFloweringDate?: string
  actualFloweringDate?: string
  actualMaturityDate?: string
  expectedHarvestDate?: string
  actualHarvestDate?: string
  targetYieldTonnesPerHectare?: number
  actualYieldTonnesPerHectare?: number
  harvestedQuantityKg?: number
  lossQuantityKg?: number
  lossReason?: string
  status: CultivationStatus
  notes?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateCultivationRequest {
  parcelId: string
  cropTypeId: string
  seasonYear: number
  season: Season
  variety?: string
  seedSource?: string
  seedQuality?: string
  seedQuantityKg?: number
  plantingDate?: string
  expectedGerminationDate?: string
  expectedFloweringDate?: string
  expectedHarvestDate?: string
  targetYieldTonnesPerHectare?: number
  notes?: string
  metadata?: Record<string, any>
}

// ======================================
// AGRICULTURAL ACTIVITY
// ======================================

export interface AgriculturalActivityResponse {
  id: string
  cultivationId: string
  activityType: ActivityType
  activityTypeName: string
  activityDate: string
  startTime?: string
  endTime?: string
  durationHours?: number
  description?: string
  weatherConditions?: string
  workerCount?: number
  laborCostFcfa?: number
  inputCostFcfa?: number
  equipmentCostFcfa?: number
  totalCostFcfa?: number
  equipmentUsed?: string
  inputsUsed?: string[]
  photoUrls?: string[]
  notes?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateAgriculturalActivityRequest {
  cultivationId: string
  activityType: ActivityType
  activityDate: string
  startTime?: string
  endTime?: string
  description?: string
  weatherConditions?: string
  workerCount?: number
  laborCostFcfa?: number
  inputCostFcfa?: number
  equipmentCostFcfa?: number
  equipmentUsed?: string
  inputsUsed?: string[]
  photoUrls?: string[]
  notes?: string
  metadata?: Record<string, any>
}

// ======================================
// TIMELINE
// ======================================

export interface TimelineEvent {
  eventType: string
  eventDate: string
  title: string
  description?: string
  activity?: AgriculturalActivityResponse
  order: number
}

export interface CultivationTimelineResponse {
  cultivation: CultivationResponse
  timeline: TimelineEvent[]
}
