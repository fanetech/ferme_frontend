import { ColumnDef, VisibilityState } from "@tanstack/react-table";

export interface DataTableProps<T> {
  // Données
  data: T[];
  columns: ColumnDef<T>[];
  
  // Pagination serveur
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  
  // Tri serveur
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  onSort?: (field: string, direction: 'ASC' | 'DESC') => void;
  
  // Recherche et filtres
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterConfig[];
  
  // UI
  isLoading?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  
  // Colonnes
  defaultColumnVisibility?: VisibilityState;
  
  // Actions
  onRowAction?: (action: string, row: T) => void;
  createButton?: {
    label: string;
    onClick: () => void;
  };
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'number' | 'input';
  options?: { value: string; label: string }[];
  value?: string | string[];
  onChange: (value: string | string[] | any) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface CreateButtonConfig {
  label: string;
  onClick: () => void;
}