// ======================================
// TERMINAL TYPES
// ======================================

export type { FilterConfig } from "@/types/data-table";

export interface Terminal {
  id: string;
  structureId?: string;
  structureName?: string;
  superStructureId?: string;
  superStructureName?: string;
  serialNumber: string;
  activationCode: string;
  model: string;
  manufacturer: string;
  osVersion: string;
  appVersion: string;
  status: TerminalStatus;
  activatedAt?: string;
  expirationDate?: string;
  metadata?: TerminalMetadata;
  createdAt: string;
  updatedAt: string;
  isOnline: boolean;
  isExpired: boolean;
  daysUntilExpiration?: number;
  lastConnectionAt?: string;
}

export interface TerminalMetadata {
  location?: string;
  contact?: string;
  reportedBy?: string;
  incidentNumber?: string;
  policeReport?: string;
  reactivatedAt?: string;
  [key: string]: any;
}

export type TerminalStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' | 'EXPIRED' | 'LOCKED' | 'DEACTIVATED';

export interface TerminalSearchParams {
  searchTerm?: string;
  structureId?: string;
  superStructureId?: string;
  status?: TerminalStatus | string;
  isOnline?: boolean;
  model?: string;
  lastConnectionFrom?: string;
  lastConnectionTo?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface TerminalSearchRequest {
  searchTerm?: string;
  structureId?: string;
  superStructureId?: string;
  status?: TerminalStatus;
  isOnline?: boolean;
  model?: string;
  lastConnectionFrom?: string;
  lastConnectionTo?: string;
}

export interface TerminalFormData {
  structureId?: string;
  superStructureId?: string;
  serialNumber: string;
  activationCode?: string;
  model: string;
  manufacturer: string;
  osVersion: string;
  appVersion: string;
  status: TerminalStatus;
  expirationDate?: string;
  metadata?: TerminalMetadata;
}

export type TerminalUpdateStatusType = 'MARK_AS_LOST' | 'SET_IN_MAINTENANCE' | 'REACTIVATE' | 'DEACTIVATE' | 'LOCK' | 'DELETE';

export interface BatchUploadProgress {
  isUploading: boolean;
  progress: number;
  currentStep: string;
}

export interface UpdateTerminalStatus {
  action: TerminalUpdateStatusType,
  reason?: string,
  additionalMetadata?: string
}

export interface TerminalPaginatedResponse {
  content: Terminal[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// ======================================
// BATCH TERMINAL TYPES
// ======================================

export interface BatchTerminalError {
  rowNumber: number;
  serialNumber: string;
  error: string;
  rowData: any;
}

export interface BatchTerminalResult {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  createdTerminals: Terminal[];
  errors: BatchTerminalError[];
}

export interface BatchTerminalResponse {
  success: boolean;
  status: number;
  message: string;
  data: BatchTerminalResult;
}

export interface BatchUploadOptions {
  structureId?: string;
  superStructureId?: string;
  activateImmediately?: boolean;
  skipErrors?: boolean;
}
