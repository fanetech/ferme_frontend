export interface ValidationResult {
  isValid: boolean;
  error?: string;
  parsed?: any;
}

export interface FormulaValidationResult {
  isValid: boolean;
  error?: string;
  suggestions?: string[];
}

export interface PricingRuleFormData {
  ruleName: string;
  description?: string;
  pricingType: string;
  value: number;
  conditions?: string;
  customFormula?: string;
  formulaVariables?: string;
  priority: number;
  applyOrder: number;
  validFrom?: string;
  validTo?: string;
  maxApplications?: number;
  isCumulative: boolean;
  isActive: boolean;
}

export interface CalculationFieldFormData {
  fieldName: string;
  fieldKey: string;
  fieldType: string;
  fieldRole: string;
  label: string;
  description?: string;
  isRequired?: boolean;
  isAmountField?: boolean;
  isBaseAmount?: boolean;
  defaultValue?: string;
  placeholder?: string;
  validationRules?: string;
  displayOrder?: number;
  isVisible?: boolean;
  formula?: string;
}

export interface ConditionOperator {
  op: string;
  desc: string;
  example: string;
}

export interface ConditionTemplate {
  label: string;
  template: string;
  desc: string;
}

export interface MathOperator {
  symbol: string;
  desc: string;
  color: string;
}

export interface PricingRuleCardData {
  id: string;
  ruleName: string;
  description?: string;
  pricingType: string;
  value: number;
  conditions?: string;
  customFormula?: string;
  formulaVariables?: string;
  priority: number;
  applyOrder: number;
  isActive: boolean;
  applicationCount?: number;
  createdAt: string;
  updatedAt: string;
  currentlyValid: boolean;
}

export interface CalculationFieldCardData {
  id: string;
  fieldKey: string;
  fieldName: string;
  label: string;
  description?: string;
  fieldType: string;
  fieldRole: string;
  isRequired: boolean;
  isReadonly: boolean;
  isHidden: boolean;
  isVisible: boolean;
  isAmountField: boolean;
  isBaseAmount: boolean;
  displayOrder: number;
  validationRules?: string;
  options?: string;
  defaultValue?: string;
  placeholder?: string;
  serviceId: string;
  serviceName: string;
  serviceCode: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
  usageCount: number;
  calculated: boolean;
  formula?: string;
}