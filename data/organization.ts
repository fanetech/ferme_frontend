import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import client from './client';
import type { 
  SuperStructure, 
  SuperStructureSearchParams, 
  SuperStructureFormData,
  Structure,
  StructureSearchParams,
  StructureFormData,
  Category,
  CategorySearchParams,
  CategoryFormData,
  PaginatedResponse 
} from '@/types/organization';
import type { ApiResponse } from '@/types';

// Query keys
export const organizationKeys = {
  all: ['organization'] as const,
  superStructures: () => [...organizationKeys.all, 'super-structures'] as const,
  superStructuresList: (params?: SuperStructureSearchParams) => [...organizationKeys.superStructures(), 'list', params] as const,
  superStructureDetail: (id: string) => [...organizationKeys.superStructures(), id] as const,
  structures: () => [...organizationKeys.all, 'structures'] as const,
  structuresList: (params?: StructureSearchParams) => [...organizationKeys.structures(), 'list', params] as const,
  structureDetail: (id: string) => [...organizationKeys.structures(), id] as const,
  categories: () => [...organizationKeys.all, 'categories'] as const,
  categoriesList: (params?: CategorySearchParams) => [...organizationKeys.categories(), 'list', params] as const,
  categoryDetail: (id: string) => [...organizationKeys.categories(), id] as const,
};

// Hooks pour les Super Structures

// Liste simple pour les filtres (sans pagination)
export const useSuperStructuresForFilter = () => {
  return useQuery({
    queryKey: [...organizationKeys.superStructures(), 'filter'],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', '0');
      queryParams.append('size', '1000'); // Large size pour récupérer toutes les super structures
      queryParams.append('status', 'ACTIVE'); // Seulement les actives
      queryParams.append('sortBy', 'name');
      queryParams.append('sortDir', 'ASC');
      
      const response = await client.organization.superStructures.list(queryParams);
      return response.data;
    },
  });
};

// Liste paginée avec filtres
export const useSuperStructures = (params?: SuperStructureSearchParams) => {
  return useQuery({
    queryKey: organizationKeys.superStructuresList(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.organizationType) queryParams.append('organizationType', params.organizationType);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
      
      const response = await client.organization.superStructures.list(queryParams);
      return response.data;
    },
  });
};

// Détails d'une super structure
export const useSuperStructure = (id: string) => {
  return useQuery({
    queryKey: organizationKeys.superStructureDetail(id),
    queryFn: async () => {
      const response = await client.organization.superStructures.get(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// Création d'une super structure
export const useCreateSuperStructure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: SuperStructureFormData | FormData) => {
      const response = await client.organization.superStructures.create(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.superStructures() });
    },
  });
};

// Mise à jour d'une super structure
export const useUpdateSuperStructure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SuperStructureFormData | FormData }) => {
      const response = await client.organization.superStructures.update(id, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.superStructureDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: organizationKeys.superStructures() });
    },
  });
};

// Suppression d'une super structure
export const useDeleteSuperStructure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.organization.superStructures.delete(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.superStructures() });
    },
  });
};

// Hooks pour les Structures

// Liste simple pour les filtres (sans pagination)
export const useStructuresForFilter = () => {
  return useQuery({
    queryKey: [...organizationKeys.structures(), 'filter'],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', '0');
      queryParams.append('size', '1000'); // Large size pour récupérer toutes les structures
      queryParams.append('status', 'ACTIVE'); // Seulement les actives
      queryParams.append('sortBy', 'name');
      queryParams.append('sortDir', 'ASC');
      
      const response = await client.organization.structures.list(queryParams);
      return response.data;
    },
  });
};

// Liste paginée avec filtres
export const useStructures = (params?: StructureSearchParams) => {
  return useQuery({
    queryKey: organizationKeys.structuresList(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.superStructureId) queryParams.append('superStructureId', params.superStructureId);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
      
      const response = await client.organization.structures.list(queryParams);
      return response.data;
    },
  });
};

// Détails d'une structure
export const useStructure = (id: string) => {
  return useQuery({
    queryKey: organizationKeys.structureDetail(id),
    queryFn: async () => {
      const response = await client.organization.structures.get(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// Création d'une structure
export const useCreateStructure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: StructureFormData | FormData) => {
      const response = await client.organization.structures.create(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.structures() });
    },
  });
};

// Mise à jour d'une structure
export const useUpdateStructure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: StructureFormData | FormData }) => {
      const response = await client.organization.structures.update(id, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.structureDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: organizationKeys.structures() });
    },
  });
};

// Suppression d'une structure
export const useDeleteStructure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.organization.structures.delete(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.structures() });
    },
  });
};

// Hooks pour les Catégories

// Liste simple pour les filtres (sans pagination)
export const useCategoriesForFilter = () => {
  return useQuery({
    queryKey: [...organizationKeys.categories(), 'filter'],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', '0');
      queryParams.append('size', '1000'); // Large size pour récupérer toutes les catégories
      queryParams.append('status', 'ACTIVE'); // Seulement les actives
      queryParams.append('sortBy', 'name');
      queryParams.append('sortDir', 'ASC');
      
      const response = await client.organization.categories.list(queryParams);
      return response.data;
    },
  });
};

// Liste paginée avec filtres
export const useCategories = (params?: CategorySearchParams) => {
  return useQuery({
    queryKey: organizationKeys.categoriesList(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.searchTerm) queryParams.append('searchTerm', params.searchTerm);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.superStructureId) queryParams.append('superStructureId', params.superStructureId);
      if (params?.superStructureName) queryParams.append('superStructureName', params.superStructureName);
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
      
      const response = await client.organization.categories.list(queryParams);
      return response.data;
    },
  });
};

// Détails d'une catégorie
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: organizationKeys.categoryDetail(id),
    queryFn: async () => {
      const response = await client.organization.categories.get(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// Création d'une catégorie
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await client.organization.categories.create(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.categories() });
      // Invalider aussi les structures car le totalCategories peut changer
      queryClient.invalidateQueries({ queryKey: organizationKeys.structures() });
      queryClient.invalidateQueries({ queryKey: organizationKeys.superStructures() });
    },
  });
};

// Mise à jour d'une catégorie
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryFormData }) => {
      const response = await client.organization.categories.update(id, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.categoryDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: organizationKeys.categories() });
      // Invalider aussi les structures car le totalCategories peut changer
      queryClient.invalidateQueries({ queryKey: organizationKeys.structures() });
      queryClient.invalidateQueries({ queryKey: organizationKeys.superStructures() });
    },
  });
};

// Suppression d'une catégorie
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await client.organization.categories.delete(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.categories() });
      // Invalider aussi les structures car le totalCategories peut changer
      queryClient.invalidateQueries({ queryKey: organizationKeys.structures() });
      queryClient.invalidateQueries({ queryKey: organizationKeys.superStructures() });
    },
  });
};