import type { 
  ApiResponse, 
  Terminal, 
  TerminalPaginatedResponse, 
  TerminalSearchParams,
  TerminalFormData,
  TerminalSearchRequest, 
  PaginatedResponse,
  UpdateTerminalStatus,
  BatchTerminalResponse,
  BatchUploadOptions
} from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "./client";

// ====================================
// QUERY KEYS
// ====================================

const terminalKeys = {
  all: ['terminals'] as const,
  lists: () => [...terminalKeys.all, 'list'] as const,
  list: (params: TerminalSearchParams) => [...terminalKeys.lists(), params] as const,
  details: () => [...terminalKeys.all, 'detail'] as const,
  detail: (id: string) => [...terminalKeys.details(), id] as const,
  structures: () => ['structures', 'filter'] as const,
  models: () => ['terminal-models'] as const,
};

// ====================================
// API FUNCTIONS
// ====================================

// Search terminals with pagination and filters
export async function searchTerminals(params: TerminalSearchParams): Promise<TerminalPaginatedResponse> {
  const searchBody: TerminalSearchRequest = {
    searchTerm: params.searchTerm,
    structureId: params.structureId,
    superStructureId: params.superStructureId,
    status: params.status as any,
    isOnline: params.isOnline,
    model: params.model,
    lastConnectionFrom: params.lastConnectionFrom,
    lastConnectionTo: params.lastConnectionTo,
  };

  const queryParams = new URLSearchParams({
    page: (params.page || 0).toString(),
    size: (params.size || 20).toString(),
    sortBy: params.sortBy || 'createdAt',
    sortDirection: params.sortDirection || 'DESC',
  });

  const response = await client.terminals.list(searchBody, queryParams);
  return response.data!;
}

// Get terminal by ID
// export async function getTerminal(id: string): Promise<Terminal> {
//   const response = await api.get<ApiResponse<Terminal>>(`/terminals/${id}`);
//   return response.data.data!;
// }

// Create terminal
export async function createTerminal(data: TerminalFormData): Promise<Terminal> {
  const response = await client.terminals.create(data);
  return response.data!;
}

// Update terminal
export async function updateTerminal(id: string, data: Partial<TerminalFormData>): Promise<Terminal> {
  const response = await client.terminals.update(id, data)
  return response.data!;
}

// Update terminal
export async function updateStatus(id: string, data: Partial<UpdateTerminalStatus>): Promise<Terminal> {
  const response = await client.terminals.updateStatus(id, data)
  return response.data!;
}

// Delete terminal
// export async function deleteTerminal(id: string): Promise<void> {
//   await api.delete(`/terminals/${id}`);
// }

// Activate terminal
// export async function activateTerminal(id: string): Promise<Terminal> {
//   const response = await api.post<ApiResponse<Terminal>>(`/terminals/${id}/activate`);
//   return response.data.data!;
// }

// Deactivate terminal
// export async function deactivateTerminal(id: string): Promise<Terminal> {
//   const response = await api.post<ApiResponse<Terminal>>(`/terminals/${id}/deactivate`);
//   return response.data.data!;
// }

// Block terminal
// export async function blockTerminal(id: string, reason: string): Promise<Terminal> {
//   const response = await api.post<ApiResponse<Terminal>>(`/terminals/${id}/block`, { reason });
//   return response.data.data!;
// }

// Unblock terminal
// export async function unblockTerminal(id: string): Promise<Terminal> {
//   const response = await api.post<ApiResponse<Terminal>>(`/terminals/${id}/unblock`);
//   return response.data.data!;
// }

// Get structures for filter
// export async function getStructuresForFilter(): Promise<{ content: Array<{ id: string; name: string; code: string }> }> {
//   const response = await api.get<ApiResponse<any>>('/structures?size=100&status=ACTIVE');
//   return response.data.data!;
// }

// Get terminal models
// export async function getTerminalModels(): Promise<string[]> {
//   const response = await api.get<ApiResponse<string[]>>('/terminals/models');
//   return response.data.data || ['AvePay Pro', 'AvePay Pro 2000', 'AvePay Lite', 'AvePay Mini'];
// }

// ====================================
// REACT QUERY HOOKS
// ====================================

// Hook to search terminals
export function useTerminals(params: TerminalSearchParams) {
  return useQuery({
    queryKey: terminalKeys.list(params),
    queryFn: () => searchTerminals(params),
    // keepPreviousData: true,
  });
}


// Hook to get terminal details
// export function useTerminal(id: string | null) {
//   return useQuery({
//     queryKey: terminalKeys.detail(id!),
//     queryFn: () => getTerminal(id!),
//     enabled: !!id,
//   });
// }

// Hook to get structures for filter
// export function useStructuresForFilter() {
//   return useQuery({
//     queryKey: terminalKeys.structures(),
//     queryFn: getStructuresForFilter,
//   });
// }

// Hook to get terminal models
// export function useTerminalModels() {
//   return useQuery({
//     queryKey: terminalKeys.models(),
//     queryFn: getTerminalModels,
//   });
// }

// Hook to create terminal
export function useCreateTerminal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTerminal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: terminalKeys.lists() });
    },
  });
}

// Hook to update terminal
export function useUpdateTerminal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TerminalFormData> }) =>
      updateTerminal(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: terminalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: terminalKeys.detail(variables.id) });
    },
  });
}

// Hook to delete terminal
// export function useDeleteTerminal() {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: deleteTerminal,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: terminalKeys.lists() });
//     },
//   });
// }

// Hook to activate terminal
export function useUpdateTerminalStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UpdateTerminalStatus> }) =>
      updateStatus(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: terminalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: terminalKeys.detail(variables.id) });
    },
  });
}

// Hook to deactivate terminal
// export function useDeactivateTerminal() {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: deactivateTerminal,
//     onSuccess: (data, id) => {
//       queryClient.invalidateQueries({ queryKey: terminalKeys.lists() });
//       queryClient.invalidateQueries({ queryKey: terminalKeys.detail(id) });
//     },
//   });
// }

// Hook to block terminal
// export function useBlockTerminal() {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: ({ id, reason }: { id: string; reason: string }) =>
//       blockTerminal(id, reason),
//     onSuccess: (data, variables) => {
//       queryClient.invalidateQueries({ queryKey: terminalKeys.lists() });
//       queryClient.invalidateQueries({ queryKey: terminalKeys.detail(variables.id) });
//     },
//   });
// }

// Hook to unblock terminal
// export function useUnblockTerminal() {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: unblockTerminal,
//     onSuccess: (data, id) => {
//       queryClient.invalidateQueries({ queryKey: terminalKeys.lists() });
//       queryClient.invalidateQueries({ queryKey: terminalKeys.detail(id) });
//     },
//   });
// }

// ====================================
// BATCH TERMINAL FUNCTIONS & HOOKS
// ====================================

// Download batch template
export async function downloadBatchTemplate(): Promise<Blob> {
  return await client.terminals.batch.downloadTemplate();
}

// Upload batch terminals
export async function uploadBatchTerminals(file: File, options: BatchUploadOptions): Promise<BatchTerminalResponse> {
  return await client.terminals.batch.upload(file, options);
}

// Hook to download batch template
export function useDownloadBatchTemplate() {
  return useMutation({
    mutationFn: downloadBatchTemplate,
  });
}

// Hook to upload batch terminals
export function useUploadBatchTerminals() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, options }: { file: File; options: BatchUploadOptions }) =>
      uploadBatchTerminals(file, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: terminalKeys.lists() });
    },
  });
}
