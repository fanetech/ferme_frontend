import { PricingRuleCardData, ConditionOperator, ConditionTemplate, MathOperator } from "./internalServiceTypes";

// Formatage des labels de type de pricing
export const getPricingTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'FIXED_AMOUNT': 'Montant fixe',
    'PERCENTAGE': 'Pourcentage',
    'MULTIPLIER': 'Multiplicateur',
    'ADDITION': 'Addition',
    'REDUCTION': 'Réduction',
    'PER_UNIT': 'Par unité'
  };
  return labels[type] || type;
};

// Formatage des valeurs de règles
export const formatRuleValue = (rule: PricingRuleCardData): string => {
  switch (rule.pricingType) {
    case 'FIXED_AMOUNT':
      return `${rule.value.toLocaleString()} FCFA`;
    case 'PER_UNIT':
      return `${rule.value.toLocaleString()} FCFA/unité`;
    case 'MULTIPLIER':
      return `×${rule.value}`;
    case 'PERCENTAGE':
      return `${rule.value > 0 ? '+' : ''}${rule.value}%`;
    case 'ADDITION':
      return `+${rule.value.toLocaleString()} FCFA`;
    case 'REDUCTION':
      return `-${rule.value.toLocaleString()} FCFA`;
    default:
      return rule.value.toString();
  }
};

// Parsing des conditions JSON
export const parseConditions = (conditions: string): any => {
  try {
    return JSON.parse(conditions);
  } catch (e) {
    return null;
  }
};

// Formatage des conditions pour l'affichage
export const formatConditions = (conditions: any): string | null => {
  if (!conditions) return null;
  
  const formatValue = (key: string, value: any): string => {
    if (typeof value === 'object' && value !== null) {
      const operator = Object.keys(value)[0];
      const operatorValue = value[operator];
      
      const operatorLabels: Record<string, string> = {
        '$eq': 'égal à',
        '$ne': 'différent de',
        '$gt': 'supérieur à',
        '$gte': 'supérieur ou égal à',
        '$lt': 'inférieur à',
        '$lte': 'inférieur ou égal à',
        '$in': 'dans',
        '$nin': 'pas dans',
        '$regex': 'correspond au pattern',
        '$exists': 'existe'
      };
      
      const operatorLabel = operatorLabels[operator] || operator;
      
      if (Array.isArray(operatorValue)) {
        return `${key} ${operatorLabel} [${operatorValue.join(', ')}]`;
      }
      return `${key} ${operatorLabel} ${operatorValue}`;
    }
    return `${key} = ${value}`;
  };
  
  if (conditions.$and) {
    return conditions.$and.map((cond: any) => {
      const key = Object.keys(cond)[0];
      return formatValue(key, cond[key]);
    }).join(' ET ');
  }
  
  if (conditions.$or) {
    return conditions.$or.map((cond: any) => {
      const key = Object.keys(cond)[0];
      return formatValue(key, cond[key]);
    }).join(' OU ');
  }
  
  const keys = Object.keys(conditions);
  return keys.map(key => formatValue(key, conditions[key])).join(' ET ');
};

// Opérateurs de condition MongoDB
export const conditionOperators: ConditionOperator[] = [
  { op: "$eq", desc: "Égal à", example: '{"field": {"$eq": "value"}}' },
  { op: "$ne", desc: "Différent de", example: '{"field": {"$ne": "value"}}' },
  { op: "$gt", desc: "Supérieur à", example: '{"field": {"$gt": 100}}' },
  { op: "$gte", desc: "Supérieur ou égal", example: '{"field": {"$gte": 100}}' },
  { op: "$lt", desc: "Inférieur à", example: '{"field": {"$lt": 100}}' },
  { op: "$lte", desc: "Inférieur ou égal", example: '{"field": {"$lte": 100}}' },
  { op: "$in", desc: "Dans la liste", example: '{"field": {"$in": ["A", "B"]}}' },
  { op: "$nin", desc: "Pas dans la liste", example: '{"field": {"$nin": ["A", "B"]}}' },
  { op: "$regex", desc: "Expression régulière", example: '{"field": {"$regex": "^test"}}' },
  { op: "$exists", desc: "Existe", example: '{"field": {"$exists": true}}' },
  { op: "$and", desc: "ET logique", example: '{"$and": [{"a": 1}, {"b": 2}]}' },
  { op: "$or", desc: "OU logique", example: '{"$or": [{"a": 1}, {"b": 2}]}' }
];

// Templates de conditions pré-définis
export const conditionTemplates: ConditionTemplate[] = [
  { 
    label: "Condition simple", 
    template: '{"superficie": {"$gte": 100}}',
    desc: "Superficie supérieure ou égale à 100"
  },
  { 
    label: "Condition multiple (ET)", 
    template: '{"$and": [{"superficie": {"$gte": 100}}, {"zone": {"$eq": "centre"}}]}',
    desc: "Superficie >= 100 ET zone = centre"
  },
  { 
    label: "Condition multiple (OU)", 
    template: '{"$or": [{"type": {"$eq": "premium"}}, {"duree": {"$gte": 12}}]}',
    desc: "Type premium OU durée >= 12 mois"
  },
  { 
    label: "Condition avec liste", 
    template: '{"categorie": {"$in": ["A", "B", "premium"]}}',
    desc: "Catégorie dans la liste A, B ou premium"
  },
  { 
    label: "Condition complexe", 
    template: '{"$and": [{"superficie": {"$gte": 50}}, {"$or": [{"zone": {"$eq": "centre"}}, {"type": {"$eq": "premium"}}]}]}',
    desc: "Superficie >= 50 ET (zone centre OU type premium)"
  }
];

// Opérateurs mathématiques pour les formules
export const mathOperators: MathOperator[] = [
  { symbol: "+", desc: "Addition", color: "text-green-600" },
  { symbol: "-", desc: "Soustraction", color: "text-red-600" },
  { symbol: "*", desc: "Multiplication", color: "text-blue-600" },
  { symbol: "/", desc: "Division", color: "text-purple-600" },
  { symbol: "(", desc: "Parenthèse ouvrante", color: "text-gray-600" },
  { symbol: ")", desc: "Parenthèse fermante", color: "text-gray-600" },
  { symbol: "Math.pow(", desc: "Puissance", color: "text-orange-600" },
  { symbol: "Math.sqrt(", desc: "Racine carrée", color: "text-orange-600" },
  { symbol: "Math.max(", desc: "Maximum", color: "text-indigo-600" },
  { symbol: "Math.min(", desc: "Minimum", color: "text-indigo-600" },
  { symbol: "Math.round(", desc: "Arrondi", color: "text-indigo-600" },
  { symbol: " ? ", desc: "Condition si", color: "text-yellow-600" },
  { symbol: " : ", desc: "Condition sinon", color: "text-yellow-600" },
  { symbol: " > ", desc: "Supérieur à", color: "text-pink-600" },
  { symbol: " < ", desc: "Inférieur à", color: "text-pink-600" },
  { symbol: " == ", desc: "Égal à", color: "text-pink-600" }
];

// Utilitaire pour ajouter un champ aux conditions
export const addFieldToConditions = (currentConditions: string, fieldKey: string): string => {
  if (!currentConditions.trim()) {
    return `{"${fieldKey}": {"$eq": ""}}`;
  }
  
  try {
    const parsed = JSON.parse(currentConditions);
    parsed[fieldKey] = {"$eq": ""};
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    return `{"${fieldKey}": {"$eq": ""}}`;
  }
};

// Utilitaire pour ajouter un opérateur aux conditions
export const addOperatorToConditions = (currentConditions: string, operator: ConditionOperator): string => {
  if (!currentConditions.trim()) {
    return `{"field": {"${operator.op}": ""}}`;
  }
  
  return currentConditions + `\n// ${operator.desc}: ${operator.example}`;
};

// Utilitaire pour formater le JSON
export const formatJSON = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString || "{}");
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    return jsonString;
  }
};