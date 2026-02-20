// Types pour le module Organisation
export type { FilterConfig } from "@/types/data-table";

export interface Structure {
  id: string;
  superStructureId: string;
  code: string;
  name: string;
  description?: string;
  logo?: string;
  logoUrl?: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  headerColor?: string;
  footerColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  gpsCoordinates?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
  version?: number;
  status: string;
  metadata?: string;
  // Informations calculées/enrichies
  superStructureName?: string;
  superStructureCode?: string;
  totalCategories?: number;
  fullAddress?: string;
}

export interface SuperStructure {
  id: string;
  code: string;
  name: string;
  description?: string;
  logo?: string;
  logoUrl?: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  organizationType?: string;
  headerColor?: string;
  footerColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
  version?: number;
  status: string;
  metadata?: string;
  // Informations calculées
  totalStructures?: number;
  activeStructures?: number;
  totalCategories?: number;
  fullAddress?: string;
}

export interface SuperStructureSearchParams {
  page?: number;
  size?: number;
  searchTerm?: string;
  status?: string;
  organizationType?: string;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface StructureSearchParams {
  page?: number;
  size?: number;
  searchTerm?: string;
  status?: string;
  superStructureId?: string;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface StructureFormData {
  superStructureId: string;
  code: string;
  name: string;
  description?: string;
  logo?: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  headerColor?: string;
  footerColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  gpsCoordinates?: string;
  status: string;
  metadata?: string;
}

export interface SuperStructureFormData {
  code: string;
  name: string;
  description?: string;
  logo?: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  headerColor?: string;
  footerColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  status: string;
  metadata?: string;
}

export interface Category {
  id: string;
  superStructureId: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
  version?: number;
  status: string;
  metadata?: string;
  // Informations calculées/enrichies
  superStructureName?: string;
  totalServices?: number;
}

export interface CategorySearchParams {
  page?: number;
  size?: number;
  searchTerm?: string;
  status?: string;
  superStructureId?: string;
  superStructureName?: string;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface CategoryFormData {
  superStructureId: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  displayOrder?: number;
  status: string;
  metadata?: string;
}

// Types pour la pagination
export interface PaginatedResponse<T> {
  content: T[];
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