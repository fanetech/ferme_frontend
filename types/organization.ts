// ======================================
// ORGANIZATION TYPES
// ======================================

export type OrganizationType = 'COOPERATIVE' | 'GROUPEMENT' | 'ENTREPRISE' | 'ONG'
export type OrganizationStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export interface OrganizationResponse {
  id: string
  code: string
  name: string
  type: OrganizationType
  description?: string
  logo?: string
  registrationNumber?: string
  taxId?: string
  contactPerson?: string
  email?: string
  phone?: string
  alternativePhone?: string
  address?: string
  province?: string
  commune?: string
  village?: string
  gpsCoordinates?: { latitude: number; longitude: number }
  memberCount?: number
  status: OrganizationStatus
  farmCount?: number
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateOrganizationRequest {
  code: string
  name: string
  type: OrganizationType
  description?: string
  logo?: string
  registrationNumber?: string
  taxId?: string
  contactPerson?: string
  email?: string
  phone?: string
  alternativePhone?: string
  address?: string
  province?: string
  commune?: string
  village?: string
  latitude?: number
  longitude?: number
  memberCount?: number
  metadata?: Record<string, any>
}

export interface UpdateOrganizationRequest {
  name?: string
  type?: OrganizationType
  description?: string
  logo?: string
  registrationNumber?: string
  taxId?: string
  contactPerson?: string
  email?: string
  phone?: string
  alternativePhone?: string
  address?: string
  province?: string
  commune?: string
  village?: string
  latitude?: number
  longitude?: number
  memberCount?: number
  status?: OrganizationStatus
  metadata?: Record<string, any>
}
