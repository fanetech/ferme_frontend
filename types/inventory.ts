// ======================================
// INVENTORY MODULE TYPES
// ======================================

export type ItemCategory = 'SEED' | 'FERTILIZER' | 'PESTICIDE' | 'HERBICIDE' | 'FEED' | 'MEDICATION' | 'EQUIPMENT' | 'TOOL' | 'FUEL' | 'PACKAGING' | 'OTHER'
export type MovementType = 'PURCHASE' | 'SALE' | 'USAGE' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT' | 'RETURN' | 'EXPIRED' | 'DAMAGED' | 'LOST'

// ======================================
// INVENTORY ITEM
// ======================================

export interface InventoryItemResponse {
  id: string
  farmId: string
  code: string
  name: string
  category: ItemCategory
  brand?: string
  supplier?: string
  unit: string
  currentStock: number
  minimumStock?: number
  maximumStock?: number
  reorderPoint?: number
  unitPrice?: number
  totalValue?: number
  storageLocation?: string
  storageConditions?: string
  isPerishable: boolean
  expiryAlertDays?: number
  description?: string
  isActive: boolean
  isLowStock?: boolean
  needsReorder?: boolean
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateInventoryItemRequest {
  farmId: string
  code: string
  name: string
  category: ItemCategory
  brand?: string
  supplier?: string
  unit: string
  currentStock?: number
  minimumStock?: number
  maximumStock?: number
  reorderPoint?: number
  unitPrice?: number
  storageLocation?: string
  storageConditions?: string
  isPerishable?: boolean
  expiryAlertDays?: number
  description?: string
  metadata?: Record<string, any>
}

// ======================================
// STOCK MOVEMENT
// ======================================

export interface StockMovementResponse {
  id: string
  inventoryItemId: string
  inventoryItemName: string
  movementType: MovementType
  movementDate: string
  quantity: number
  unitPrice?: number
  totalPrice?: number
  batchNumber?: string
  manufacturingDate?: string
  expiryDate?: string
  supplierName?: string
  supplierContact?: string
  referenceType?: string
  referenceId?: string
  stockBefore?: number
  stockAfter?: number
  performedByName?: string
  approvedByName?: string
  approvedAt?: string
  notes?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt?: string
}

export interface CreateStockMovementRequest {
  inventoryItemId: string
  movementType: MovementType
  movementDate: string
  quantity: number
  unitPrice?: number
  batchNumber?: string
  manufacturingDate?: string
  expiryDate?: string
  supplierName?: string
  supplierContact?: string
  referenceType?: string
  referenceId?: string
  notes?: string
  metadata?: Record<string, any>
}
