import { z } from "zod";
import { PricingType, DataType } from "@/types/catalog";

enum CalculationFieldRole {
  INPUT = "INPUT",
  OUTPUT = "OUTPUT",
  INTERMEDIATE = "INTERMEDIATE"
}

// Schema pour les règles de pricing
export const pricingRuleSchema = z.object({
  ruleName: z.string()
    .min(1, "Le nom de la règle est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  description: z.string()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .optional(),
  pricingType: z.nativeEnum(PricingType, {
    errorMap: () => ({ message: "Le type de tarification est requis" })
  }),
  value: z.number()
    .default(1)
    .optional(), // Optionnel pour le type FORMULA
  conditions: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      try {
        JSON.parse(val);
        return true;
      } catch (e) {
        return false;
      }
    }, "Format JSON invalide")
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      try {
        const parsed = JSON.parse(val);
        return typeof parsed === 'object' && parsed !== null;
      } catch (e) {
        return false;
      }
    }, "Les conditions doivent être un objet JSON valide"),
  customFormula: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      // Syntaxe flexible : accepte avec ou sans #{}
      // Vérifie si c'est une formule SpEL valide
      const trimmed = val.trim();
      
      // Si la formule contient #{}, vérifier que les accolades sont équilibrées
      if (trimmed.includes('#{')) {
        const openBraces = (trimmed.match(/#{/g) || []).length;
        const closeBraces = (trimmed.match(/}/g) || []).length;
        return openBraces === closeBraces;
      }
      
      // Sinon, accepter toute formule non vide (syntaxe sans #{})
      return true;
    }, "Formule invalide : vérifiez la syntaxe SpEL"),
  formulaVariables: z.string().optional(),
  priority: z.number()
    .int("La priorité doit être un nombre entier")
    .min(1, "La priorité doit être au moins 1")
    .max(100, "La priorité ne peut pas dépasser 100")
    .default(10),
  applyOrder: z.number()
    .int("L'ordre d'application doit être un nombre entier")
    .min(1, "L'ordre d'application doit être au moins 1")
    .default(1),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  maxApplications: z.number()
    .int("Le nombre maximum d'applications doit être un entier")
    .positive("Le nombre maximum d'applications doit être positif")
    .optional(),
  isCumulative: z.boolean().default(true),
  isActive: z.boolean().default(true),
}).superRefine((data, ctx) => {
  // Validation conditionnelle pour le type FORMULA
  if (data.pricingType === PricingType.FORMULA) {
    // Pour FORMULA, customFormula est requis
    if (!data.customFormula || data.customFormula.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La formule est requise pour le type FORMULA",
        path: ["customFormula"],
      });
    }
  } else {
    // Pour les autres types, value est requis
    if (data.value == null || data.value <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La valeur est requise pour ce type de tarification",
        path: ["value"],
      });
    }
  }
});

// Schema pour les champs de calcul
export const calculationFieldSchema = z.object({
  fieldName: z.string().min(1, "Le nom du champ est requis"),
  fieldKey: z.string().min(1, "La clé du champ est requise"),
  fieldType: z.nativeEnum(DataType),
  fieldRole: z.nativeEnum(CalculationFieldRole),
  label: z.string().min(1, "Le libellé est requis"),
  description: z.string().optional(),
  isRequired: z.boolean().optional(),
  defaultValue: z.string().optional(),
  placeholder: z.string().optional(),
  isAmountField: z.boolean().default(false),
  isBaseAmount: z.boolean().default(false),
  validationRules: z.string().optional(),
  displayOrder: z.number().min(0).optional(),
  isVisible: z.boolean().optional(),
  formula: z.string().optional(),
});

// Types inférés
export type PricingRuleFormData = z.infer<typeof pricingRuleSchema>;
export type CalculationFieldFormData = z.infer<typeof calculationFieldSchema>;
export { CalculationFieldRole };