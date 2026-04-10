// ======================================
// HR MODULE TYPES
// ======================================

import type { Gender } from './user'

export type ContractType = 'PERMANENT' | 'TEMPORARY' | 'SEASONAL' | 'DAILY' | 'HOURLY' | 'CONTRACT'
export type SalaryFrequency = 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'HOURLY'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD'
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'HOLIDAY' | 'SICK_LEAVE' | 'ANNUAL_LEAVE' | 'UNPAID_LEAVE'

// ======================================
// EMPLOYEE
// ======================================

export interface EmployeeResponse {
  id: string
  farmId: string
  employeeCode: string
  firstName: string
  lastName: string
  fullName?: string
  phoneNumber?: string
  email?: string
  gender?: Gender
  birthDate?: string
  nationalId?: string
  address?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  position?: string
  department?: string
  contractType: ContractType
  hireDate?: string
  contractEndDate?: string
  salary?: number
  salaryFrequency?: SalaryFrequency
  bankAccount?: string
  bankName?: string
  socialSecurityNumber?: string
  skills?: Record<string, any>
  profilePicture?: string
  isActive: boolean
  terminationDate?: string
  terminationReason?: string
  notes?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateEmployeeRequest {
  farmId: string
  employeeCode: string
  firstName: string
  lastName: string
  phoneNumber?: string
  email?: string
  gender?: Gender
  birthDate?: string
  nationalId?: string
  address?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  position?: string
  department?: string
  contractType: ContractType
  hireDate?: string
  contractEndDate?: string
  salary?: number
  salaryFrequency?: SalaryFrequency
  bankAccount?: string
  bankName?: string
  socialSecurityNumber?: string
  skills?: Record<string, any>
  profilePicture?: string
  notes?: string
  metadata?: Record<string, any>
}

// ======================================
// TASK
// ======================================

export interface TaskResponse {
  id: string
  title: string
  description?: string
  category?: string
  priority: TaskPriority
  assignedToId?: string
  assignedToName?: string
  assignedById?: string
  assignedByName?: string
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  linkedParcelId?: string
  linkedCultivationId?: string
  linkedLivestockId?: string
  status: TaskStatus
  isOverdue?: boolean
  startedAt?: string
  completedAt?: string
  notes?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
  category?: string
  priority: TaskPriority
  assignedToId?: string
  dueDate?: string
  estimatedHours?: number
  linkedParcelId?: string
  linkedCultivationId?: string
  linkedLivestockId?: string
  notes?: string
  metadata?: Record<string, any>
}

// ======================================
// ATTENDANCE
// ======================================

export interface AttendanceResponse {
  id: string
  employeeId: string
  employeeName: string
  attendanceDate: string
  checkInTime?: string
  checkOutTime?: string
  scheduledHours?: number
  actualHours?: number
  overtimeHours?: number
  status: AttendanceStatus
  absenceReason?: string
  checkInLocation?: string
  checkOutLocation?: string
  notes?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateAttendanceRequest {
  employeeId: string
  attendanceDate: string
  checkInTime?: string
  checkOutTime?: string
  scheduledHours?: number
  status: AttendanceStatus
  absenceReason?: string
  checkInLocation?: string
  checkOutLocation?: string
  notes?: string
  metadata?: Record<string, any>
}
