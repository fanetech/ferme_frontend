// ========================================
// ENUMS
// ========================================

export enum ServiceType {
  SERVICE = "SERVICE",
  PRODUCT = "PRODUCT"
}

export enum ServiceNature {
  PRODUCT = "PRODUCT",
  INTERNAL_SERVICE = "INTERNAL_SERVICE",
  EXTERNAL_SERVICE = "EXTERNAL_SERVICE"
}

export enum AuthType {
  NONE = "NONE",
  API_KEY = "API_KEY",
  BASIC = "BASIC",
  BEARER = "BEARER",
  OAUTH2 = "OAUTH2",
  CUSTOM = "CUSTOM"
}

export enum DataType {
  STRING = "STRING",
  INTEGER = "INTEGER",
  DECIMAL = "DECIMAL",
  BOOLEAN = "BOOLEAN",
  DATE = "DATE",
  DATETIME = "DATETIME",
  EMAIL = "EMAIL",
  PHONE = "PHONE",
  URL = "URL",
  JSON = "JSON"
}

export enum EndpointType {
  CONSULTATION = "CONSULTATION",
  VALIDATION = "VALIDATION",
  VERIFICATION = "VERIFICATION",
  CANCELLATION = "CANCELLATION",
  WEBHOOK = "WEBHOOK",
  REFUND = "REFUND",
  AUTHENTICATION = "AUTHENTICATION",
  PING = "PING"
}

export enum PricingType {
  FIXED_AMOUNT = "FIXED_AMOUNT",
  PERCENTAGE = "PERCENTAGE",
  MULTIPLIER = "MULTIPLIER",
  ADDITION = "ADDITION",
  REDUCTION = "REDUCTION",
  PER_UNIT = "PER_UNIT",
  FORMULA = "FORMULA"
}

export enum StockOperationType {
  ADD = "ADD",
  REMOVE = "REMOVE",
  SET = "SET"
}

export enum ServiceStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  OUT_OF_STOCK = "OUT_OF_STOCK"
}

// ========================================
// MAIN ENTITIES
// ========================================

export interface ServiceProduct {
  id: string;
  structureId: string;
  structureName?: string;
  structureCode?: string;
  categoryId: string;
  categoryName?: string;
  code: string;
  type: ServiceType;
  serviceNature: ServiceNature;
  name: string;
  description?: string;
  image?: string;
  qrCode?: string;
  barcode?: string;
  amount: number;
  currency: string;
  unitMeasure?: string;
  isTaxable: boolean;
  taxRate?: number;
  taxAmount?: number;
  totalAmount?: number;
  stockQuantity?: number;
  minStock?: number;
  stockAlertThreshold?: number;
  lastStockUpdate?: string;
  status: string;
  requiresValidation: boolean;
  allowPartialPayment: boolean;
  displayOrder?: number;
  metadata?: string;
  hasConfiguration?: boolean;
  serviceConfigId?: string;
  providerName?: string;
  isTestMode?: boolean;
  apiStatus?: string;
  isOutOfStock?: boolean;
  needsRestocking?: boolean;
  hasLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
  version?: number;
}

export interface ServiceConfig {
  // === INFORMATIONS DE BASE ===
  id: string;
  serviceId: string;
  serviceName?: string;
  serviceCode?: string;
  serviceDescription?: string;
  
  // === CONFIGURATION RÉSEAU ===
  baseUrl?: string;
  testBaseUrl?: string;
  globalHeaders?: Record<string, string>;
  
  // === AUTHENTIFICATION ===
  authType: AuthType;
  authUsername?: string;
  authPassword?: string; // Encrypted
  authToken?: string; // Encrypted
  apiKey?: string; // Encrypted
  oauthClientId?: string;
  oauthTokenUrl?: string;
  
  // === CONFIGURATION GLOBALE ===
  fullPaymentRequired?: boolean;
  generateReceipt?: boolean;
  webhookNotification?: boolean;
  webhookUrl?: string;
  retryPolicy?: string;
  retryCount?: number;
  timeout?: number;
  connectionTimeout?: number;
  readTimeout?: number;
  successCodes?: string;
  responseFormat?: string;
  
  // === STATUT ET MODE ===
  status: string;
  isTestMode: boolean;
  
  // === ENDPOINTS AVEC LEURS DONNÉES COMPLÈTES ===
  endpoints?: EndpointComplete[];
  
  // === STATISTIQUES GLOBALES ===
  statistics?: ServiceStatistics;
  
  // === MÉTADONNÉES ===
  metadata?: Record<string, any>;
  
  // === AUDIT ===
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

export interface EndpointComplete {
  // === INFORMATIONS DE BASE ===
  id: string;
  serviceConfigId: string;
  endpointType: string;
  method: string;
  path: string;
  fullUrl?: string;
  
  // === CONFIGURATION HTTP ===
  contentType?: string;
  acceptType?: string;
  headers?: Record<string, string>;
  
  // === AUTHENTIFICATION ===
  authRequired?: boolean;
  useDifferentAuth?: boolean;
  specificAuthToken?: string;
  
  // === CONFIGURATION TECHNIQUE ===
  timeout?: number;
  connectTimeout?: number;
  readTimeout?: number;
  retryCount?: number;
  retryDelay?: number;
  backoffPolicy?: string;
  maxRetryDelay?: number;
  
  // === FORMAT ET VALIDATION ===
  responseFormat?: string;
  successCodes?: string;
  errorCodes?: string;
  
  // === TRANSFORMATION ===
  requestTransform?: Record<string, any>;
  responseTransform?: Record<string, any>;
  requestSchema?: Record<string, any>;
  responseSchema?: Record<string, any>;
  
  // === CACHE ===
  cacheEnabled?: boolean;
  cacheTtl?: number;
  
  // === DONNÉES LIÉES À CET ENDPOINT ===
  dataFields?: DataFieldComplete[];
  responseMappings?: ResponseMappingComplete[];
  
  // === STATISTIQUES DE L'ENDPOINT ===
  statistics?: EndpointStatistics;
  
  // === MÉTADONNÉES ===
  metadata?: Record<string, any>;
  
  // === AUDIT ===
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

export interface DataFieldComplete {
  // === IDENTIFIANTS ===
  id: string;
  serviceConfigId: string;
  endpointConfigId: string;
  endpointType?: string;
  
  // === DÉFINITION DU CHAMP ===
  code: string;
  key: string;
  label: string;
  description?: string;
  dataType: string;
  defaultValue?: string;
  
  // === COMPORTEMENT ===
  isRequired: boolean;
  isReadonly: boolean;
  isHidden: boolean;
  allowMultiple: boolean;
  
  // === VALIDATION ===
  validationRegex?: string;
  errorMessage?: string;
  minLength?: number;
  maxLength?: number;
  minValue?: string;
  maxValue?: string;
  
  // === AFFICHAGE ===
  displayOrder?: number;
  placeholder?: string;
  hintText?: string;
  inputType?: string;
  displayFormat?: string;
  inputMask?: string;
  
  // === OPTIONS (pour les listes) ===
  options?: FieldOption[];
  
  // === DÉPENDANCES ===
  dependsOn?: string;
  dependencyCondition?: Record<string, any>;
  
  // === MÉTADONNÉES ===
  metadata?: Record<string, any>;
  
  // === AUDIT ===
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

export interface ResponseMappingComplete {
  // === IDENTIFIANTS ===
  id: string;
  serviceConfigId: string;
  endpointConfigId: string;
  endpointType?: string;
  
  // === MAPPING ===
  jsonPath: string;
  customDataKey: string;
  displayName: string;
  dataType: string;
  
  // === PROPRIÉTÉS ===
  isAmount: boolean;
  isReference: boolean;
  isStatus: boolean;
  isEditable: boolean;
  isRequired: boolean;
  isHidden: boolean;
  
  // === CONFIGURATION ===
  defaultValue?: string;
  displayOrder?: number;
  format?: string;
  transformation?: string;
  
  // === MÉTADONNÉES ===
  metadata?: Record<string, any>;
  
  // === AUDIT ===
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

export interface ServiceCalculationField {
  id: string;
  serviceId: string;
  key: string;
  label: string;
  description?: string;
  dataType: DataType;
  defaultValue?: string;
  isRequired: boolean;
  isReadonly: boolean;
  isHidden: boolean;
  validationRegex?: string;
  errorMessage?: string;
  minLength?: number;
  maxLength?: number;
  minValue?: string;
  maxValue?: string;
  displayOrder?: number;
  placeholder?: string;
  hintText?: string;
  inputType?: string;
  options?: string;
  allowMultiple: boolean;
  displayFormat?: string;
  inputMask?: string;
  unitLabel?: string;
  dependsOn?: string;
  dependencyCondition?: string;
  calculationRole: string; // INPUT, OUTPUT, INTERMEDIATE
  formula?: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PricingRule {
  id: string;
  serviceId: string;
  ruleName: string;
  description?: string;
  ruleCode?: string;
  conditions?: string; // JSON
  pricingType: PricingType;
  value: number;
  currency: string;
  priority: number;
  applyOrder?: number;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
  isCumulative: boolean;
  maxApplications?: number;
  minAmount?: number;
  maxAmount?: number;
  excludesRules?: string; // JSON
  requiresRules?: string; // JSON
  customFormula?: string;
  formulaVariables?: string; // JSON
  applicationCount?: number;
  lastApplied?: string;
  totalAmountApplied?: number;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// LEGACY COMPATIBILITY TYPES
// ========================================

// Types de compatibilité pour l'ancien système
export interface EndpointConfig extends EndpointComplete {
  endpointUrl: string;
  httpMethod: string;
  isActive: boolean;
  requestBodyTemplate?: string;
  requestQueryParams?: string;
  specificHeaders?: string;
  specificAuth?: string;
  successCondition?: string;
  errorMapping?: string;
  priority?: number;
  description?: string;
}

export interface ServiceDataField extends DataFieldComplete {}

export interface ResponseMapping extends ResponseMappingComplete {
  transformExpression?: string;
  formatPattern?: string;
  minValue?: string;
  maxValue?: string;
  prefix?: string;
  suffix?: string;
  icon?: string;
  cssClass?: string;
  displayCondition?: string;
  dependsOn?: string;
}

// ========================================
// REQUEST/RESPONSE DTOs
// ========================================

export interface CreateServiceProductRequest {
  structureId: string;
  categoryId: string;
  code?: string;
  type: ServiceType;
  serviceNature: ServiceNature;
  name: string;
  description?: string;
  image?: string;
  barcode?: string;
  amount: number;
  currency?: string;
  unitMeasure?: string;
  isTaxable?: boolean;
  taxRate?: number;
  initialStock?: number;
  minStock?: number;
  stockAlertThreshold?: number;
  requiresValidation?: boolean;
  allowPartialPayment?: boolean;
  displayOrder?: number;
  metadata?: Record<string, any>;
}

export interface UpdateServiceProductRequest {
  categoryId?: string;
  name?: string;
  description?: string;
  image?: string;
  barcode?: string;
  amount?: number;
  currency?: string;
  unitMeasure?: string;
  isTaxable?: boolean;
  taxRate?: number;
  minStock?: number;
  stockAlertThreshold?: number;
  requiresValidation?: boolean;
  allowPartialPayment?: boolean;
  displayOrder?: number;
  metadata?: Record<string, any>;
  status?: string;
}

export interface UpdateStockRequest {
  quantity: number;
  operationType: StockOperationType;
  reason?: string;
  reference?: string;
}

export interface ServiceProductSearchParams {
  page?: number;
  size?: number;
  searchTerm?: string;
  serviceNatures?: ServiceNature[];
  structureId?: string;
  categoryId?: string;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  inStock?: boolean;
  needsRestocking?: boolean;
  lowStock?: boolean;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

// ========================================
// SIMPLIFIED DTOs FOR LISTS
// ========================================

export interface ServiceProductListItem {
  id: string;
  code: string;
  name: string;
  type: ServiceType;
  serviceNature: ServiceNature;
  amount: number;
  currency: string;
  status: string;
  structureName?: string;
  categoryName?: string;
  hasConfiguration?: boolean;
  stockQuantity?: number;
  isOutOfStock?: boolean;
  displayOrder?: number;
  createdAt: string;
}

export interface ServiceConfigSummary {
  id: string;
  serviceId: string;
  authType: AuthType;
  status: string;
  isTestMode: boolean;
  apiStatus?: string;
  endpointCount?: number;
  fieldCount?: number;
}

// ========================================
// UTILITY TYPES
// ========================================

export interface ServiceStats {
  totalServices: number;
  totalProducts: number;
  totalActive: number;
  totalInactive: number;
  productsInStock: number;
  productsOutOfStock: number;
  totalStockValue: number;
  lastUpdate: string;
}

export interface ServiceStatistics {
  totalEndpoints: number;
  totalFields: number;
  requiredFields: number;
  totalMappings: number;
  totalOptions: number;
  
  // Répartition par endpoint
  fieldsByEndpoint?: Record<string, number>;
  mappingsByEndpoint?: Record<string, number>;
  
  // Statistiques de validation
  fieldsWithValidation: number;
  fieldsWithDependencies: number;
  fieldsWithOptions: number;
  
  // Dernière utilisation
  lastUsed?: string;
  usageCount: number;
}

export interface EndpointStatistics {
  fieldCount: number;
  requiredFieldCount: number;
  mappingCount: number;
  optionCount: number;
  
  // Performance
  averageResponseTime?: number;
  successRate?: number;
  totalCalls: number;
  lastCall?: string;
  
  // Validation
  hasValidation: boolean;
  hasTransformations: boolean;
  hasCache: boolean;
  hasCustomAuth: boolean;
}

export interface FieldOption {
  value: string;
  label: string;
  description?: string;
  isDefault?: boolean;
  isDisabled?: boolean;
  metadata?: Record<string, any>;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// ========================================
// FILTERS AND CONFIGS
// ========================================

export interface ServiceFilterConfig {
  serviceNatures?: ServiceNature[];
  structures?: Array<{ id: string; name: string }>;
  categories?: Array<{ id: string; name: string }>;
  statuses?: Array<{ value: string; label: string }>;
  priceRange?: { min: number; max: number };
}

export interface ServiceFormConfig {
  mode: 'create' | 'edit';
  type?: ServiceType;
  serviceNature?: ServiceNature;
  structureId?: string;
  categoryId?: string;
  duplicateFrom?: string;
}



// Types pour la simulation de service externe
export interface ExternalServiceExecutionRequest {
  endpointId: string;
  fieldData: Record<string, any>;
  simulationMode?: boolean;
  traceId?: string;
  options?: Record<string, any>;
}

export interface ExternalServiceSimulationResultDto {
  endpointId: string;
  endpointName: string;
  endpointType: string;
  requestData: Record<string, any>;
  httpResponse: {
    statusCode: number;
    headers: Record<string, string>;
    body: any;
    size: number;
    responseTime: number;
  };
  extractedData: Record<string, any>;
  mappingResults: Array<{
    mappingId: string;
    fieldKey: string;
    fieldName: string;
    jsonPath: string;
    expectedValue?: any;
    extractedValue?: any;
    success: boolean;
    error?: string;
  }>;
  debugInfo?: {
    requestSent: any;
    responseReceived: any;
    processingTime: number;
    errors: string[];
    warnings: string[];
  };
  metadata: {
    executedAt: string;
    executionId: string;
    serviceConfigId: string;
    totalMappings: number;
    successfulMappings: number;
    failedMappings: number;
  };
}