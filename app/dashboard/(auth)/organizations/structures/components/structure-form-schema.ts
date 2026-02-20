import { z } from "zod";
import type { Structure } from "@/types/organization";

// Schéma de validation pour le formulaire Structure
export const structureFormSchema = z.object({
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
  
  // Champs optionnels - Informations générales
  description: z.string()
    .max(1000, "La description ne doit pas dépasser 1000 caractères")
    .optional()
    .or(z.literal("")),
  
  // Contact
  contact: z.string()
    .max(100, "Le nom du contact ne doit pas dépasser 100 caractères")
    .optional()
    .or(z.literal("")),
  email: z.string()
    .email("L'adresse email n'est pas valide")
    .max(255, "L'email ne doit pas dépasser 255 caractères")
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .max(20, "Le téléphone ne doit pas dépasser 20 caractères")
    .regex(/^(\+)?[0-9\s\-\.()]*$/, "Le numéro de téléphone contient des caractères non valides")
    .optional()
    .or(z.literal("")),
  
  // Localisation
  address: z.string()
    .max(500, "L'adresse ne doit pas dépasser 500 caractères")
    .optional()
    .or(z.literal("")),
  city: z.string()
    .max(100, "La ville ne doit pas dépasser 100 caractères")
    .optional()
    .or(z.literal("")),
  country: z.string()
    .max(100, "Le pays ne doit pas dépasser 100 caractères")
    .optional()
    .or(z.literal("")),
  postalCode: z.string()
    .max(20, "Le code postal ne doit pas dépasser 20 caractères")
    .optional()
    .or(z.literal("")),
  gpsCoordinates: z.string()
    .refine((val) => {
      if (!val || val === "") return true;
      // Nettoyer les espaces et vérifier le format
      const cleaned = val.replace(/\s/g, '');
      return /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(cleaned);
    }, "Format attendu: latitude,longitude (ex: 12.3686,-1.5275)")
    .optional()
    .or(z.literal("")),
  
  // Branding - Couleurs avec validation hexadécimale
  primaryColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "La couleur primaire doit être au format hexadécimal (#RRGGBB)")
    .optional()
    .or(z.literal("")),
  secondaryColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "La couleur secondaire doit être au format hexadécimal (#RRGGBB)")
    .optional()
    .or(z.literal("")),
  headerColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "La couleur d'en-tête doit être au format hexadécimal (#RRGGBB)")
    .optional()
    .or(z.literal("")),
  footerColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "La couleur de pied de page doit être au format hexadécimal (#RRGGBB)")
    .optional()
    .or(z.literal("")),
  
  // Logo - Fichier optionnel
  logo: z.instanceof(File, { message: "Le logo doit être un fichier valide" })
    .refine((file) => file.size <= 2 * 1024 * 1024, "Le fichier ne doit pas dépasser 2MB")
    .refine(
      (file) => ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"].includes(file.type),
      "Le fichier doit être une image (JPEG, PNG ou SVG)"
    )
    .optional()
});

export type StructureFormValues = z.infer<typeof structureFormSchema>;

// Valeurs par défaut pour le formulaire
export const defaultStructureValues: Partial<StructureFormValues> = {
  status: "ACTIVE",
  country: "BF", // Burkina Faso par défaut
  primaryColor: "#007bff",
  secondaryColor: "#6c757d", 
  headerColor: "#ffffff",
  footerColor: "#f8f9fa"
};

// Fonction pour transformer les données du serveur vers le formulaire
export const transformServerDataToFormValues = (data: any): StructureFormValues => {
  console.log("Transforming server data:", data); // Debug
  
  return {
    superStructureId: data.superStructureId || data.superStructure?.id || "",
    code: data.code || "",
    name: data.name || "",
    description: data.description || "",
    status: (data.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
    contact: data.contact || "",
    email: data.email || "",
    phone: data.phone || "",
    address: data.address || "",
    city: data.city || "",
    country: data.country || "BF",
    postalCode: data.postalCode || "",
    gpsCoordinates: data.gpsCoordinates || "",
    primaryColor: data.primaryColor || "#007bff",
    secondaryColor: data.secondaryColor || "#6c757d",
    headerColor: data.headerColor || "#ffffff",
    footerColor: data.footerColor || "#f8f9fa",
    // logo sera géré séparément via l'état du composant
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