import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HttpClient } from "@/data/client/http-client";
import { API_ENDPOINTS } from "@/data/client/endpoints";
import type { ApiResponse } from "@/types";
import type { EmployeeResponse, TaskResponse, AttendanceResponse, CreateEmployeeRequest, CreateTaskRequest, CreateAttendanceRequest } from "@/types/hr";

export const EMPLOYEE_KEYS = {
  ALL: ["employees"] as const,
  BY_FARM: (farmId: string) => ["employees", "farm", farmId] as const,
  DETAIL: (id: string) => ["employees", id] as const,
};

export const TASK_KEYS = {
  ALL: ["tasks"] as const,
  DETAIL: (id: string) => ["tasks", id] as const,
  BY_EMPLOYEE: (empId: string) => ["tasks", "employee", empId] as const,
  BY_STATUS: (status: string) => ["tasks", "status", status] as const,
  OVERDUE: ["tasks", "overdue"] as const,
};

export const ATTENDANCE_KEYS = {
  ALL: ["attendance"] as const,
  BY_EMPLOYEE: (empId: string) => ["attendance", "employee", empId] as const,
};

export const employeeApi = {
  byFarm: (farmId: string) =>
    HttpClient.get<ApiResponse<EmployeeResponse[]>>(API_ENDPOINTS.hr.employees.byFarm(farmId)),
  activeByFarm: (farmId: string) =>
    HttpClient.get<ApiResponse<EmployeeResponse[]>>(API_ENDPOINTS.hr.employees.activeByFarm(farmId)),
  getById: (id: string) =>
    HttpClient.get<ApiResponse<EmployeeResponse>>(API_ENDPOINTS.hr.employees.get(id)),
  create: (data: CreateEmployeeRequest) =>
    HttpClient.post<ApiResponse<EmployeeResponse>>(API_ENDPOINTS.hr.employees.create, data),
  update: (id: string, data: Partial<CreateEmployeeRequest>) =>
    HttpClient.put<ApiResponse<EmployeeResponse>>(API_ENDPOINTS.hr.employees.update(id), data),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.hr.employees.delete(id)),
};

export const taskApi = {
  getById: (id: string) =>
    HttpClient.get<ApiResponse<TaskResponse>>(API_ENDPOINTS.hr.tasks.get(id)),
  create: (data: CreateTaskRequest) =>
    HttpClient.post<ApiResponse<TaskResponse>>(API_ENDPOINTS.hr.tasks.create, data),
  update: (id: string, data: Partial<CreateTaskRequest>) =>
    HttpClient.put<ApiResponse<TaskResponse>>(API_ENDPOINTS.hr.tasks.update(id), data),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.hr.tasks.delete(id)),
  byEmployee: (empId: string) =>
    HttpClient.get<ApiResponse<TaskResponse[]>>(API_ENDPOINTS.hr.tasks.byEmployee(empId)),
  byStatus: (status: string) =>
    HttpClient.get<ApiResponse<TaskResponse[]>>(API_ENDPOINTS.hr.tasks.byStatus(status)),
  overdue: () =>
    HttpClient.get<ApiResponse<TaskResponse[]>>(API_ENDPOINTS.hr.tasks.overdue),
};

export const attendanceApi = {
  getById: (id: string) =>
    HttpClient.get<ApiResponse<AttendanceResponse>>(API_ENDPOINTS.hr.attendance.get(id)),
  create: (data: CreateAttendanceRequest) =>
    HttpClient.post<ApiResponse<AttendanceResponse>>(API_ENDPOINTS.hr.attendance.create, data),
  update: (id: string, data: Partial<CreateAttendanceRequest>) =>
    HttpClient.put<ApiResponse<AttendanceResponse>>(API_ENDPOINTS.hr.attendance.update(id), data),
  delete: (id: string) =>
    HttpClient.delete<ApiResponse<void>>(API_ENDPOINTS.hr.attendance.delete(id)),
  byEmployee: (empId: string) =>
    HttpClient.get<ApiResponse<AttendanceResponse[]>>(API_ENDPOINTS.hr.attendance.byEmployee(empId)),
  byDateRange: (startDate: string, endDate: string) =>
    HttpClient.get<ApiResponse<AttendanceResponse[]>>(`${API_ENDPOINTS.hr.attendance.byDateRange}?startDate=${startDate}&endDate=${endDate}`),
};

// ======================================
// QUERY HOOKS
// ======================================

export function useFarmEmployees(farmId: string) {
  return useQuery({ queryKey: EMPLOYEE_KEYS.BY_FARM(farmId), queryFn: () => employeeApi.byFarm(farmId), enabled: !!farmId });
}

export function useEmployee(id: string) {
  return useQuery({ queryKey: EMPLOYEE_KEYS.DETAIL(id), queryFn: () => employeeApi.getById(id), enabled: !!id });
}

export function useTasksByEmployee(empId: string) {
  return useQuery({ queryKey: TASK_KEYS.BY_EMPLOYEE(empId), queryFn: () => taskApi.byEmployee(empId), enabled: !!empId });
}

export function useTasksByStatus(status: string) {
  return useQuery({ queryKey: TASK_KEYS.BY_STATUS(status), queryFn: () => taskApi.byStatus(status), enabled: !!status });
}

export function useOverdueTasks() {
  return useQuery({ queryKey: TASK_KEYS.OVERDUE, queryFn: () => taskApi.overdue() });
}

export function useEmployeeAttendance(empId: string) {
  return useQuery({ queryKey: ATTENDANCE_KEYS.BY_EMPLOYEE(empId), queryFn: () => attendanceApi.byEmployee(empId), enabled: !!empId });
}

// ======================================
// MUTATION HOOKS
// ======================================

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeeApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: EMPLOYEE_KEYS.ALL }); toast.success("Employé ajouté"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: TASK_KEYS.ALL }); toast.success("Tâche créée"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}

export function useCreateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAttendanceRequest) => attendanceApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ATTENDANCE_KEYS.ALL }); toast.success("Présence enregistrée"); },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Erreur"),
  });
}
