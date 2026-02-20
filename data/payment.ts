import type { 
  ApiResponse, 
  PaginatedResponse,
} from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "./client/index";

// ====================================
// TYPES
// ====================================

export interface PaymentSearchCriteria {
  structureId?: string;
  clientId?: string;
  paymentReference?: string;
  statuses?: string[];
  paymentMethods?: string[];
  paymentTypes?: string[];
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  currency?: string;
  gatewayProvider?: string;
  gatewayTransactionId?: string;
  cardMask?: string;
  cardType?: string;
  phoneNumber?: string;
  descriptionContains?: string;
  has3DS?: boolean;
  isTestOnly?: boolean;
  minRiskScore?: number;
  maxRiskScore?: number;
  initiatedByUserId?: string;
  hasRefunds?: boolean;
  recurringOnly?: boolean;
  clientIpAddress?: string;
}

export interface PaymentSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  criteria: PaymentSearchCriteria;
}

// New interfaces for the updated payment structure
export interface ServiceProduct {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface PaymentAttempt {
  attemptId: string;
  paymentId: string;
  attemptNumber: number;
  status: string;
  paymentMethod: string;
  attemptAmount: number;
  gatewayTransactionId?: string;
  retryable: boolean;
  initiatedAt: string;
  completedAt?: string;
  processingTimeMs?: number;
  successful: boolean;
  pending: boolean;
  failed: boolean;
}

export interface PaymentMethod {
  methodId: string;
  paymentId: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  status: string;
  usageOrder: number;
  cardMask?: string;
  mobileMoneyReference?: string;
  bankTransferReference?: string;
  gatewayTransactionId?: string;
  gatewayReference?: string;
  usedAt?: string;
  confirmedAt?: string;
  pending: boolean;
  successful: boolean;
}

export interface Refund {
  refundId: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason: string;
  status: string;
  refundedAt?: string;
  gatewayRefundId?: string;
}

export interface Payment {
  id: string;
  paymentReference: string;
  paymentType: 'SINGLE' | 'SPLIT' | 'RECURRING' | 'INSTALLMENT';
  status: 'INITIATED' | 'PENDING' | 'PROCESSING' | 'PENDING_AUTHENTICATION' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  paymentMethod: 'CARD' | 'MOBILE_MONEY' | 'CASH' | 'BANK_TRANSFER';
  requestedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  feeAmount: number;
  taxAmount: number;
  refundedAmount: number;
  currency: string;
  serviceProducts: ServiceProduct[];
  initiatedByName: string;
  gatewayTransactionId?: string;
  pan?: string;
  cardName?: string;
  rrn?: string;
  requires3DS: boolean;
  description?: string;
  initiatedAt: string;
  processedAt?: string;
  completedAt?: string;
  failedAt?: string;
  cancelledAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  isTest: boolean;
  requiresManualValidation: boolean;
  notificationSent: boolean;
  receiptGenerated: boolean;
  attempts: PaymentAttempt[];
  paymentMethods: PaymentMethod[];
  refunds: Refund[];
  completed: boolean;
  completionPercentage: number;
  processing: boolean;
  failed: boolean;
  cancellable: boolean;
  refundable: boolean;
  partiallyPaid: boolean;
  refundableAmount: number;
}

// Updated RefundRequest interface matching the backend DTO
export interface RefundRequest {
  amount?: number; // Optional - null for full refund
  reason: string; // Required
  notes?: string; // Optional additional notes
  refundType?: 'FULL' | 'PARTIAL'; // Type of refund
  notifyClient?: boolean; // Default true
  reasonCode?: string; // Reason code for categorization
  externalReference?: string; // External reference ID
}

export interface CancelPaymentRequest {
  reason: string;
}

export interface ValidatePaymentRequest {
  isManualValidation: boolean;
  validatorNotes?: string;
  transactionReference?: string;
}

export interface RetryPaymentRequest {
  newPaymentMethod?: string;
  retryReason?: string;
  updatedPaymentData?: Record<string, any>;
  isManualRetry?: boolean;
  forceRetry?: boolean;
  delaySeconds?: number;
  cardPaymentRequest?: {
    paymentId: string;
    pan?: string;
    cardName?: string;
    rrn?: string;
    status?: string;
    responseMessage?: string;
    responseCode?: string;
    isManualRetry?: boolean;
    isForcedRetry?: boolean;
    retryReason?: string;
    attemptId?: string;
  };
  mobileMoneyRequest?: {
    paymentId: string;
    phoneNumber: string;
    provider: string;
    pin?: string;
    accountHolderName?: string;
    accountType?: string;
    sessionId?: string;
    deviceData?: string;
    otp?: string;
    merchantReference?: string;
  };
}

export type PaymentPaginatedResponse = PaginatedResponse<Payment>;

// ====================================
// QUERY KEYS
// ====================================

const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (params: PaymentSearchParams) => [...paymentKeys.lists(), params] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  statistics: () => [...paymentKeys.all, 'statistics'] as const,
};

// ====================================
// API FUNCTIONS
// ====================================

// Search payments with pagination and filters
export async function searchPayments(params: PaymentSearchParams): Promise<PaymentPaginatedResponse> {
  const queryParams = new URLSearchParams({
    page: (params.page || 0).toString(),
    size: (params.size || 20).toString(),
    sort: `${params.sortBy || 'createdAt'},${params.sortDirection || 'DESC'}`,
  });

  const response = await client.payments.search(params.criteria, queryParams);
  return response.data!;
}

// Get payment by ID
export async function getPayment(id: string): Promise<Payment> {
  const response = await client.payments.getById(id);
  return response.data!;
}

// Get payment by reference
export async function getPaymentByReference(reference: string): Promise<Payment> {
  const response = await client.payments.getByReference(reference);
  return response.data!;
}

// Cancel payment
export async function cancelPayment(id: string, data: CancelPaymentRequest): Promise<Payment> {
  const response = await client.payments.cancel(id, data);
  return response.data!;
}

// Validate payment
export async function validatePayment(id: string, data: ValidatePaymentRequest): Promise<Payment> {
  const response = await client.payments.validate(id, data);
  return response.data!;
}

// Process refund
export async function processRefund(id: string, data: RefundRequest): Promise<any> {
  const response = await client.payments.refund(id, data);
  return response.data!;
}

// Check payment status
export async function checkPaymentStatus(id: string): Promise<any> {
  const response = await client.payments.checkStatus(id);
  return response.data!;
}

// Generate receipt
export async function generateReceipt(id: string): Promise<any> {
  const response = await client.payments.generateReceipt(id);
  return response.data!;
}

// Retry payment
export async function retryPayment(id: string, data: RetryPaymentRequest): Promise<Payment> {
  const response = await client.payments.retry(id, data);
  return response.data!;
}

// ====================================
// REACT QUERY HOOKS
// ====================================

// Hook to search payments
export function usePayments(params: PaymentSearchParams) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => searchPayments(params),
  });
}

// Hook to get payment details
export function usePayment(id: string | null) {
  return useQuery({
    queryKey: paymentKeys.detail(id!),
    queryFn: () => getPayment(id!),
    enabled: !!id,
  });
}

// Hook to get payment by reference
export function usePaymentByReference(reference: string | null) {
  return useQuery({
    queryKey: ['payment', 'reference', reference],
    queryFn: () => getPaymentByReference(reference!),
    enabled: !!reference,
  });
}

// Hook to cancel payment
export function useCancelPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelPaymentRequest }) =>
      cancelPayment(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(variables.id) });
    },
  });
}

// Hook to validate payment
export function useValidatePayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ValidatePaymentRequest }) =>
      validatePayment(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(variables.id) });
    },
  });
}

// Hook to process refund
export function useProcessRefund() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RefundRequest }) =>
      processRefund(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(variables.id) });
    },
  });
}

// Hook to check payment status
export function useCheckPaymentStatus() {
  return useMutation({
    mutationFn: checkPaymentStatus,
  });
}

// Hook to generate receipt
export function useGenerateReceipt() {
  return useMutation({
    mutationFn: generateReceipt,
  });
}

// Hook to retry payment
export function useRetryPayment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RetryPaymentRequest }) =>
      retryPayment(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(variables.id) });
    },
  });
}