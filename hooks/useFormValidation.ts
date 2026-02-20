import { useState } from "react";
import { ValidationResult, FormulaValidationResult } from "@/lib/utils/internalServiceTypes";

export const useFormValidation = () => {
  const [conditionValidation, setConditionValidation] = useState<ValidationResult>({ 
    isValid: true 
  });
  
  const [formulaValidation, setFormulaValidation] = useState<FormulaValidationResult>({ 
    isValid: true 
  });

  // Validation en temps réel des conditions JSON
  const validateConditions = (value: string) => {
    if (!value || value.trim() === '') {
      setConditionValidation({ isValid: true });
      return;
    }

    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== 'object' || parsed === null) {
        setConditionValidation({
          isValid: false,
          error: "Les conditions doivent être un objet JSON"
        });
        return;
      }

      // Validation des opérateurs MongoDB
      const validOperators = ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin', '$regex', '$exists', '$and', '$or'];
      const validateObject = (obj: any): boolean => {
        for (const [key, value] of Object.entries(obj)) {
          if (key.startsWith('$')) {
            if (!validOperators.includes(key)) {
              setConditionValidation({
                isValid: false,
                error: `Opérateur '${key}' non reconnu. Utilisez: ${validOperators.join(', ')}`
              });
              return false;
            }
          }
          if (typeof value === 'object' && value !== null) {
            if (!validateObject(value)) return false;
          }
        }
        return true;
      };

      if (validateObject(parsed)) {
        setConditionValidation({ isValid: true, parsed });
      }
    } catch (e) {
      setConditionValidation({
        isValid: false,
        error: "JSON invalide: " + (e as Error).message
      });
    }
  };

  // Validation en temps réel des formules
  const validateFormula = (value: string) => {
    if (!value || value.trim() === '') {
      setFormulaValidation({ isValid: true });
      return;
    }

    const suggestions: string[] = [];
    const errors: string[] = [];

    // Vérification des mots-clés interdits
    const forbiddenKeywords = ['eval', 'function', 'var', 'let', 'const', 'import', 'export', 'require'];
    for (const keyword of forbiddenKeywords) {
      if (value.includes(keyword)) {
        errors.push(`Mot-clé interdit: '${keyword}'`);
      }
    }

    // Vérification des parenthèses
    let parenthesesCount = 0;
    for (let char of value) {
      if (char === '(') parenthesesCount++;
      if (char === ')') parenthesesCount--;
      if (parenthesesCount < 0) {
        errors.push("Parenthèse fermante sans ouverture");
        break;
      }
    }
    if (parenthesesCount > 0) {
      errors.push("Parenthèses non fermées");
    }

    // Suggestions d'amélioration
    if (value.includes('Math.')) {
      suggestions.push("✅ Utilisation de fonctions Math détectée");
    }
    if (value.includes('?') && value.includes(':')) {
      suggestions.push("✅ Opérateur ternaire détecté");
    }
    if (/\b(superficie|zone|type)\b/.test(value)) {
      suggestions.push("✅ Variables de champ détectées");
    }

    setFormulaValidation({
      isValid: errors.length === 0,
      error: errors.length > 0 ? errors.join(', ') : undefined,
      suggestions
    });
  };

  return {
    conditionValidation,
    formulaValidation,
    validateConditions,
    validateFormula
  };
};