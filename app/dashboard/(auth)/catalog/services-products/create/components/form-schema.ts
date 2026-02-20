import { z } from "zod";
import { ServiceType, ServiceNature } from "@/types/catalog";

export const serviceProductFormSchema = z.object({
  // Type et nature
  serviceNature: z.nativeEnum(ServiceNature, {
    required_error: "Veuillez sélectionner une nature de service"
  }),
  // Informations de base
  superStructureId: z.string().optional(), // Pour filtrage seulement, non envoyé au serveur
  structureId: z.string().min(1, "La structure est obligatoire"),
  categoryId: z.string().min(1, "La catégorie est obligatoire"),
  name: z.string().min(1, "Le nom est obligatoire").max(255, "Le nom ne doit pas dépasser 255 caractères"),
  description: z.string().optional(),
  code: z.string().optional(),

  // Tarification
  amount: z.number().min(0, "Le montant doit être positif"),
  currency: z.string().min(3, "La devise est requise"),
  isTaxable: z.boolean().default(false),
  taxRate: z.number().min(0, "Le taux de taxe doit être positif").max(100, "Le taux de taxe ne peut pas dépasser 100%").optional(),

  // Options
  requiresValidation: z.boolean().default(false),
  allowPartialPayment: z.boolean().default(false),
  displayOrder: z.number().min(0, "L'ordre d'affichage doit être positif").optional(),

  // Produit - Stock
  barcode: z.string().optional(),
  initialStock: z.number().min(0, "Le stock initial doit être positif").optional(),
  minStock: z.number().min(0, "Le stock minimum doit être positif").optional(),
  stockAlertThreshold: z.number().min(0, "Le seuil d'alerte doit être positif").optional(),

  // Service Interne - Calculs
  calculationMethod: z.enum(["FIXED", "FORMULA", "TIERED"]).optional(),
  calculationFields: z.array(z.object({
    key: z.string(),
    label: z.string(),
    type: z.string(),
    required: z.boolean(),
    defaultValue: z.string().optional()
  })).optional(),

  // Service Externe - API
  apiConfig: z.object({
    baseUrl: z.string().url("URL invalide").optional(),
    authType: z.enum(["NONE", "API_KEY", "BASIC", "BEARER", "OAUTH2"]).optional(),
    authData: z.record(z.string()).optional(),
    timeout: z.number().min(1000).max(60000).optional(),
    retryCount: z.number().min(0).max(10).optional()
  }).optional(),

  // Métadonnées
  metadata: z.record(z.any()).optional()
}).refine((data) => {
  // Si taxable, le taux est requis
  if (data.isTaxable && (!data.taxRate || data.taxRate <= 0)) {
    return false;
  }
  return true;
}, {
  message: "Le taux de taxe est requis si le service/produit est taxable",
  path: ["taxRate"]
}).refine((data) => {
  // Validation spécifique pour les produits
  if (data.serviceNature === ServiceNature.PRODUCT) {
    if (data.minStock !== undefined && data.stockAlertThreshold !== undefined) {
      return data.stockAlertThreshold >= data.minStock;
    }
  }
  return true;
}, {
  message: "Le seuil d'alerte doit être supérieur ou égal au stock minimum",
  path: ["stockAlertThreshold"]
});

export type ServiceProductFormData = z.infer<typeof serviceProductFormSchema>;