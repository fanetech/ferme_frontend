// ======================================
// LIVESTOCK MODULE TYPES
// ======================================

import type { Gender } from './user'

export type AnimalCategory = 'CATTLE' | 'SHEEP' | 'GOAT' | 'POULTRY' | 'PIG' | 'RABBIT' | 'FISH' | 'DONKEY' | 'HORSE' | 'CAMEL' | 'OTHER'
export type HealthStatus = 'HEALTHY' | 'SICK' | 'INJURED' | 'RECOVERING' | 'QUARANTINE' | 'DECEASED' | 'UNKNOWN'
export type LivestockStatus = 'ACTIVE' | 'SOLD' | 'DECEASED' | 'STOLEN' | 'LOST' | 'TRANSFERRED' | 'SLAUGHTERED'
export type ReproductiveStatus = 'NOT_READY' | 'READY' | 'PREGNANT' | 'LACTATING' | 'RESTING' | 'STERILE' | 'CASTRATED' | 'NOT_APPLICABLE'
export type ProductionStatus = 'NOT_PRODUCING' | 'PRODUCING' | 'PEAK_PRODUCTION' | 'DECLINING' | 'STOPPED'
export type ProductionType = 'MILK' | 'EGGS' | 'WOOL' | 'HONEY' | 'MEAT' | 'MANURE' | 'OTHER'
export type CareType = 'VACCINATION' | 'DEWORMING' | 'TREATMENT' | 'SURGERY' | 'CHECKUP' | 'INJURY_CARE' | 'BIRTH_ASSISTANCE' | 'DENTAL_CARE' | 'HOOF_CARE' | 'OTHER'

// ======================================
// ANIMAL TYPE
// ======================================

export interface AnimalTypeResponse {
  id: string
  code: string
  nameFr: string
  nameMoore?: string
  nameDioula?: string
  nameFulfulde?: string
  scientificName?: string
  category: AnimalCategory
  breed?: string
  averageLifespanYears?: number
  maturityAgeMonths?: number
  gestationDays?: number
  averageWeightKg?: number
  feedConsumptionPerDayKg?: number
  waterConsumptionPerDayLiters?: number
  spaceRequirementSqm?: number
  vaccinationSchedule?: Record<string, any>
  commonDiseases?: Record<string, any>
  description?: string
  metadata?: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface CreateAnimalTypeRequest {
  code: string
  nameFr: string
  nameMoore?: string
  nameDioula?: string
  nameFulfulde?: string
  scientificName?: string
  category: AnimalCategory
  breed?: string
  averageLifespanYears?: number
  maturityAgeMonths?: number
  gestationDays?: number
  averageWeightKg?: number
  feedConsumptionPerDayKg?: number
  waterConsumptionPerDayLiters?: number
  spaceRequirementSqm?: number
  vaccinationSchedule?: Record<string, any>
  commonDiseases?: Record<string, any>
  description?: string
  metadata?: Record<string, any>
}

// ======================================
// LIVESTOCK
// ======================================

export interface LivestockResponse {
  id: string
  farmId: string
  farmName: string
  animalTypeId: string
  animalTypeCode: string
  animalTypeName: string
  tagNumber?: string
  rfidCode?: string
  name?: string
  breed?: string
  gender: Gender
  birthDate?: string
  ageInMonths?: number
  acquisitionDate?: string
  acquisitionSource?: string
  acquisitionCost?: number
  motherId?: string
  motherTagNumber?: string
  fatherId?: string
  fatherTagNumber?: string
  currentWeightKg?: number
  bodyConditionScore?: number
  healthStatus: HealthStatus
  reproductiveStatus?: ReproductiveStatus
  productionStatus?: ProductionStatus
  pregnancyStartDate?: string
  expectedDeliveryDate?: string
  lastCalvingDate?: string
  numberOfOffspring: number
  exitDate?: string
  exitReason?: string
  exitPrice?: number
  status: LivestockStatus
  notes?: string
  photoUrls?: string[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateLivestockRequest {
  farmId: string
  animalTypeId: string
  tagNumber?: string
  rfidCode?: string
  name?: string
  breed?: string
  gender: Gender
  birthDate?: string
  acquisitionDate?: string
  acquisitionSource?: string
  acquisitionCost?: number
  motherId?: string
  fatherId?: string
  currentWeightKg?: number
  bodyConditionScore?: number
  healthStatus?: HealthStatus
  reproductiveStatus?: ReproductiveStatus
  productionStatus?: ProductionStatus
  pregnancyStartDate?: string
  notes?: string
  photoUrls?: string[]
  metadata?: Record<string, any>
}

// ======================================
// VETERINARY CARE
// ======================================

export interface VeterinaryCareResponse {
  id: string
  livestockId: string
  livestockTagNumber?: string
  livestockName?: string
  careType: CareType
  careTypeName: string
  careDate: string
  symptoms?: string
  diagnosis?: string
  treatment?: string
  medicationName?: string
  medicationDosage?: string
  medicationFrequency?: string
  treatmentDurationDays?: number
  veterinarianName?: string
  veterinarianContact?: string
  cost?: number
  followUpDate?: string
  outcome?: string
  notes?: string
  documentUrls?: string[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateVeterinaryCareRequest {
  livestockId: string
  careType: CareType
  careDate: string
  symptoms?: string
  diagnosis?: string
  treatment?: string
  medicationName?: string
  medicationDosage?: string
  medicationFrequency?: string
  treatmentDurationDays?: number
  veterinarianName?: string
  veterinarianContact?: string
  cost?: number
  followUpDate?: string
  outcome?: string
  notes?: string
  documentUrls?: string[]
  metadata?: Record<string, any>
}

// ======================================
// ANIMAL PRODUCTION
// ======================================

export interface AnimalProductionResponse {
  id: string
  livestockId: string
  livestockTagNumber?: string
  livestockName?: string
  productionType: ProductionType
  productionTypeName: string
  productionDate: string
  quantity: number
  unit: string
  qualityGrade?: string
  fatContentPercentage?: number
  proteinContentPercentage?: number
  collectionTime?: string
  storageLocation?: string
  storageTemperature?: number
  quantitySold?: number
  quantityConsumed?: number
  quantityLost?: number
  quantityRemaining?: number
  lossReason?: string
  notes?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateAnimalProductionRequest {
  livestockId: string
  productionType: ProductionType
  productionDate: string
  quantity: number
  unit: string
  qualityGrade?: string
  fatContentPercentage?: number
  proteinContentPercentage?: number
  collectionTime?: string
  storageLocation?: string
  storageTemperature?: number
  notes?: string
  metadata?: Record<string, any>
}
