// Types for Client module

// Client Types
export type ClientType = 'INDIVIDUAL' | 'COMPANY' | 'GOVERNMENT';
export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'SUSPENDED';
export type OrganizationType = 'STRUCTURE' | 'SUPER_STRUCTURE';
export type IdType = 'CNIB' | 'PASSPORT' | 'DRIVER_LICENSE' | 'OTHER';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
export type PreferredLanguage = 'fr' | 'en' | 'moore' | 'dioula';

// Client Interface
export interface Client {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  type: ClientType;
  status: ClientStatus;
  dateOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  nationality?: string;
  idType?: IdType;
  idNumber?: string;
  idExpiryDate?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  preferredLanguage?: PreferredLanguage;
  acceptMarketing?: boolean;
  acceptSms?: boolean;
  isLoyaltyMember?: boolean;
  loyaltyPoints?: number;
  loyaltyTier?: string;
  loyaltyJoinDate?: string;
  profileCompletion?: number;
  tags?: string[];
  metadata?: Record<string, any>;
  notes?: string;
  totalTransactions?: number;
  totalAmount?: number;
  averageTransactionAmount?: number;
  lastTransactionDate?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  organizationId?: string;
  organizationType?: OrganizationType;
  organizationName?: string;
  organizationCode?: string;
  taxId?: string;
}

// Create Client Request
export interface CreateClientRequest {
  type: ClientType;
  lastName: string;
  firstName?: string; // Required for INDIVIDUAL
  email: string;
  phone: string;
  organizationId?: string;
  organizationType?: OrganizationType;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  taxId?: string; // Required for COMPANY
  metadata?: string;
  // Additional fields for UI convenience
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  nationality?: string;
  idType?: IdType;
  idNumber?: string;
  idExpiryDate?: string;
  preferredLanguage?: PreferredLanguage;
  acceptMarketing?: boolean;
  acceptSms?: boolean;
  enrollInLoyalty?: boolean;
  notes?: string;
}

// Update Client Request
export interface UpdateClientRequest {
  lastName?: string;
  firstName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  taxId?: string;
  status?: ClientStatus;
  organizationId?: string;
  organizationType?: OrganizationType;
  metadata?: string;
  // Additional fields for UI convenience
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  nationality?: string;
  idType?: IdType;
  idNumber?: string;
  idExpiryDate?: string;
  preferredLanguage?: PreferredLanguage;
  acceptMarketing?: boolean;
  acceptSms?: boolean;
  notes?: string;
}

// Quick Registration DTO
export interface QuickClientRegistrationDto {
  type: ClientType;
  lastName: string;
  firstName?: string;
  email: string;
  phone: string;
  taxId?: string;
  address?: string;
  city?: string;
  organizationId?: string;
  organizationType?: OrganizationType;
  enrollInLoyalty?: boolean;
}

// Search Criteria
export interface ClientSearchCriteria {
  searchTerm?: string;
  type?: ClientType;
  status?: ClientStatus;
  isLoyaltyMember?: boolean;
  minTransactions?: number;
  maxTransactions?: number;
  minAmount?: number;
  maxAmount?: number;
  createdFrom?: string;
  createdTo?: string;
  lastTransactionFrom?: string;
  lastTransactionTo?: string;
  tags?: string[];
  city?: string;
  country?: string;
  organizationId?: string;
  hasEmail?: boolean;
  hasAlternatePhone?: boolean;
  profileCompletionMin?: number;
  profileCompletionMax?: number;
}

// Search Parameters for API
export interface ClientSearchParams {
  page?: number;
  size?: number;
  searchTerm?: string;
  type?: ClientType[];
  status?: ClientStatus[];
  city?: string;
  country?: string;
  organizationId?: string;
  organizationType?: string;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  // Legacy fields for POST endpoint (if still needed)
  isLoyaltyMember?: boolean;
  createdFrom?: string;
  createdTo?: string;
}

// Client Response
export interface ClientResponse extends Client {
  _links?: {
    self?: { href: string };
    update?: { href: string };
    delete?: { href: string };
    block?: { href: string };
    unblock?: { href: string };
    enrollLoyalty?: { href: string };
  };
}

// Client Stats Response
export interface ClientStatsResponse {
  totalClients: number;
  activeClients: number;
  blockedClients: number;
  inactiveClients: number;
  clientsByType: {
    INDIVIDUAL: number;
    COMPANY: number;
    GOVERNMENT: number;
  };
  loyaltyMembers: number;
  averageTransactionsPerClient: number;
  averageAmountPerClient: number;
  topClients?: ClientResponse[];
  monthlyGrowth?: number;
  retentionRate?: number;
  newClientsThisMonth?: number;
  newClientsLastMonth?: number;
  averageProfileCompletion?: number;
}

// Paginated Response
export interface PaginatedClientsResponse {
  content: ClientResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: {
    sort: {
      sorted: boolean;
      ascending: boolean;
      descending: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
}
