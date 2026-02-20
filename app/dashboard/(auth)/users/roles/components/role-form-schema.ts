import { z } from "zod";

// Types pour l'organisation
export const ORGANIZATION_TYPE_OPTIONS = [
  { value: "STRUCTURE", label: "Structure" },
  { value: "SUPER_STRUCTURE", label: "Super Structure" }
] as const;

// Schéma de validation pour le formulaire de rôle
export const roleFormSchema = z.object({
  // Informations du rôle
  displayName: z
    .string()
    .min(3, "Le nom d'affichage doit contenir au moins 3 caractères")
    .max(100, "Le nom d'affichage ne peut dépasser 100 caractères")
    .refine(val => val.trim().length > 0, "Le nom d'affichage est obligatoire"),
  
  description: z
    .string()
    .max(500, "La description ne peut dépasser 500 caractères")
    .optional()
    .or(z.literal("")),
  
  level: z
    .number()
    .min(1, "Le niveau minimum est 1")
    .max(1000, "Le niveau maximum est 1000"),
  
  isActive: z.boolean().default(true),
  
  // Organisation propriétaire (obligatoire)
  ownerType: z.enum(["STRUCTURE", "SUPER_STRUCTURE"], {
    required_error: "Le type d'organisation est obligatoire"
  }),
  
  ownerId: z
    .string()
    .min(1, "L'organisation est obligatoire"),
  
  isInheritable: z.boolean().default(false),
  
  // Permissions initiales (optionnel)
  permissionIds: z.array(z.string()).default([])
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

// Valeurs par défaut
export const defaultRoleValues: RoleFormValues = {
  displayName: "",
  description: "",
  level: 1,
  isActive: true,
  ownerType: "STRUCTURE",
  ownerId: "",
  isInheritable: false,
  permissionIds: []
};

// Fonction pour transformer les données du formulaire vers la requête API
export const transformRoleFormToCreateRequest = (values: RoleFormValues) => {
  // Générer automatiquement le nom technique à partir du nom d'affichage
  const generatedName = values.displayName
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
    
  return {
    name: generatedName,
    displayName: values.displayName.trim(),
    description: values.description?.trim() || undefined,
    level: values.level,
    isActive: values.isActive,
    ownerType: values.ownerType,
    ownerId: values.ownerId,
    isInheritable: values.isInheritable,
    permissionIds: values.permissionIds.length > 0 ? values.permissionIds : undefined
  };
};

// Fonction pour transformer les données d'édition vers la requête API
export const transformRoleFormToUpdateRequest = (values: RoleFormValues) => {
  return {
    displayName: values.displayName.trim(),
    description: values.description?.trim() || undefined,
    level: values.level,
    isActive: values.isActive,
    ownerType: values.ownerType,
    ownerId: values.ownerId,
    isInheritable: values.isInheritable
    // Note : permissionIds sera géré séparément via l'API des permissions
  };
};