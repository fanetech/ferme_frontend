import { z } from "zod";
import type { Category } from "@/types/organization";
import { CATEGORY_ICONS } from "@/lib/constants/category-icons";

// Schéma de validation pour le formulaire Category
export const categoryFormSchema = z.object({
  // Champs obligatoires
  superStructureId: z.string().min(1, "La super structure est obligatoire"),
  code: z.string()
    .min(1, "Le code est obligatoire")
    .max(50, "Le code ne doit pas dépasser 50 caractères")
    .regex(/^[A-Z0-9-_]+$/, "Le code doit contenir uniquement des lettres majuscules, chiffres, tirets et underscores"),
  name: z.string()
    .min(1, "Le nom est obligatoire")
    .max(200, "Le nom ne doit pas dépasser 200 caractères"),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    errorMap: () => ({ message: "Le statut doit être ACTIVE ou INACTIVE" })
  }),
  
  // Champs optionnels
  description: z.string()
    .max(1000, "La description ne doit pas dépasser 1000 caractères")
    .optional()
    .or(z.literal("")),
    
  // Icône avec validation des codes disponibles
  icon: z.string()
    .refine((val) => {
      if (!val || val === "") return true;
      return Object.keys(CATEGORY_ICONS).includes(val);
    }, {
      message: "L'icône sélectionnée n'est pas valide"
    })
    .optional()
    .or(z.literal("")),
    
  // Couleur avec validation hexadécimale
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "La couleur doit être au format hexadécimal (#RRGGBB)")
    .optional()
    .or(z.literal("")),
    
  // Ordre d'affichage
  displayOrder: z.number()
    .int("L'ordre d'affichage doit être un nombre entier")
    .min(0, "L'ordre d'affichage doit être positif")
    .max(999, "L'ordre d'affichage ne peut pas dépasser 999")
    .optional()
    .or(z.literal("")),
    
  // Métadonnées JSON optionnelles
  metadata: z.string()
    .refine((val) => {
      if (!val || val === "") return true;
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    }, "Les métadonnées doivent être au format JSON valide")
    .optional()
    .or(z.literal(""))
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// Valeurs par défaut pour le formulaire
export const defaultCategoryValues: Partial<CategoryFormValues> = {
  status: "ACTIVE",
  color: "#007bff",
  displayOrder: 1,
  icon: "building",
  description: "",
  metadata: ""
};

// Fonction pour transformer les données du serveur vers le formulaire
export const transformServerDataToFormValues = (data: any): CategoryFormValues => {
  console.log("Transforming server data:", data); // Debug
  
  return {
    superStructureId: data.superStructureId || "",
    code: data.code || "",
    name: data.name || "",
    description: data.description || "",
    status: (data.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
    icon: data.icon || "building",
    color: data.color || "#007bff",
    displayOrder: data.displayOrder ?? 1,
    metadata: data.metadata || ""
  };
};

// Messages d'erreur personnalisés en français pour les erreurs d'enum
export const formatEnumError = (error: string): string => {
  if (error.includes("Invalid enum value")) {
    if (error.includes("status")) {
      return "Le statut doit être 'Actif' ou 'Inactif'";
    }
  }
  return error;
};

// Validation des données avant envoi à l'API
export const transformFormValuesToServerData = (values: CategoryFormValues) => {
  const data: any = {
    superStructureId: values.superStructureId,
    code: values.code.toUpperCase(), // S'assurer que le code est en majuscules
    name: values.name,
    status: values.status
  };

  // Ajouter les champs optionnels seulement s'ils ont une valeur
  if (values.description && values.description.trim() !== "") {
    data.description = values.description.trim();
  }
  
  if (values.icon && values.icon !== "") {
    data.icon = values.icon;
  }
  
  if (values.color && values.color !== "") {
    data.color = values.color;
  }
  
  if (values.displayOrder !== undefined && values.displayOrder !== "") {
    data.displayOrder = Number(values.displayOrder);
  }
  
  if (values.metadata && values.metadata.trim() !== "") {
    // Valider que c'est du JSON valide avant d'envoyer
    try {
      JSON.parse(values.metadata);
      data.metadata = values.metadata.trim();
    } catch {
      // Si le JSON n'est pas valide, on ignore le champ
      console.warn("Métadonnées JSON invalides, champ ignoré");
    }
  }

  return data;
};

// Palette de couleurs prédéfinies pour les catégories
export const CATEGORY_COLOR_PALETTE = [
  "#007bff", // Bleu
  "#6f42c1", // Violet
  "#e83e8c", // Rose
  "#dc3545", // Rouge
  "#fd7e14", // Orange
  "#ffc107", // Jaune
  "#28a745", // Vert
  "#20c997", // Teal
  "#17a2b8", // Cyan
  "#6c757d", // Gris
  "#343a40", // Gris foncé
  "#495057", // Gris moyen
  "#2c5282", // Bleu foncé
  "#553c9a", // Violet foncé
  "#805ad5", // Violet clair
  "#38b2ac", // Teal clair
  "#48bb78", // Vert clair
  "#ed8936", // Orange foncé
  "#ecc94b", // Jaune clair
  "#4299e1"  // Bleu clair
];