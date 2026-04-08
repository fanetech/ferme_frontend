// ======================================
// MARKETPLACE MODULE TYPES
// ======================================

export type CustomerType = 'INDIVIDUAL' | 'COMPANY' | 'COOPERATIVE' | 'RESTAURANT' | 'WHOLESALER' | 'RETAILER'
export type ProductType = 'CROP' | 'LIVESTOCK' | 'PROCESSED' | 'BY_PRODUCT' | 'SERVICE'
export type QualityGrade = 'PREMIUM' | 'STANDARD' | 'ECONOMY' | 'REJECT'
export type OrderStatus = 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED'

// ======================================
// CUSTOMER
// ======================================

export interface CustomerResponse {
  id: string
  farmId: string
  customerCode: string
  name: string
  customerType: CustomerType
  phoneNumber?: string
  email?: string
  address?: string
  latitude?: number
  longitude?: number
  taxId?: string
  creditLimit?: number
  paymentTerms?: string
  preferredProducts?: string[]
  isActive: boolean
  notes?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateCustomerRequest {
  farmId: string
  customerCode: string
  name: string
  customerType: CustomerType
  phoneNumber?: string
  email?: string
  address?: string
  latitude?: number
  longitude?: number
  taxId?: string
  creditLimit?: number
  paymentTerms?: string
  preferredProducts?: string[]
  notes?: string
  metadata?: Record<string, any>
}

// ======================================
// PRODUCT
// ======================================

export interface ProductResponse {
  id: string
  farmId: string
  productCode: string
  name: string
  productType: ProductType
  sourceId?: string
  sourceType?: string
  qualityGrade?: QualityGrade
  unit: string
  unitPrice: number
  currency: string
  availableQuantity: number
  harvestDate?: string
  expiryDate?: string
  certification?: string
  description?: string
  isAvailable: boolean
  photoUrls?: string[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateProductRequest {
  farmId: string
  productCode: string
  name: string
  productType: ProductType
  sourceId?: string
  sourceType?: string
  qualityGrade?: QualityGrade
  unit: string
  unitPrice: number
  currency?: string
  availableQuantity?: number
  harvestDate?: string
  expiryDate?: string
  certification?: string
  description?: string
  photoUrls?: string[]
  metadata?: Record<string, any>
}

// ======================================
// SALE ORDER
// ======================================

export interface SaleOrderLineResponse {
  id: string
  productId: string
  productName: string
  lineNumber: number
  quantity: number
  unit: string
  unitPrice: number
  discountAmount?: number
  discountPercentage?: number
  taxRate?: number
  taxAmount?: number
  lineTotal: number
  notes?: string
  metadata?: Record<string, any>
}

export interface SaleOrderResponse {
  id: string
  customerId: string
  customerName: string
  orderNumber: string
  orderDate: string
  deliveryDate?: string
  actualDeliveryDate?: string
  deliveryAddress?: string
  totalAmount: number
  taxAmount: number
  discountAmount: number
  netAmount: number
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  createdById?: string
  createdByName?: string
  approvedById?: string
  approvedByName?: string
  isApproved: boolean
  notes?: string
  metadata?: Record<string, any>
  orderLines: SaleOrderLineResponse[]
  createdAt: string
  updatedAt?: string
}

export interface SaleOrderLineRequest {
  productId: string
  quantity: number
  discountAmount?: number
  discountPercentage?: number
  taxRate?: number
  notes?: string
  metadata?: Record<string, any>
}

export interface CreateSaleOrderRequest {
  customerId: string
  deliveryDate?: string
  deliveryAddress?: string
  notes?: string
  metadata?: Record<string, any>
  orderLines: SaleOrderLineRequest[]
}

export interface UpdateOrderStatusRequest {
  orderStatus?: OrderStatus
  paymentStatus?: PaymentStatus
  statusNote?: string
}
