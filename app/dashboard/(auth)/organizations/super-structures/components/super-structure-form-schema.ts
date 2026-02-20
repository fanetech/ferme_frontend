import { z } from "zod";
import { ORGANIZATION_TYPES } from "@/lib/constants/organization-types";

// Constantes pour la validation
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"];

export const superStructureFormSchema = z.object({
  // Section 1: Informations principales
  code: z.string()
    .min(1, "Le code est obligatoire")
    .max(50, "Le code ne doit pas dépasser 50 caractères")
    .regex(/^[A-Z0-9_-]+$/, "Le code doit contenir uniquement des lettres majuscules, chiffres, tirets et underscores"),
  
  name: z.string()
    .min(1, "Le nom est obligatoire")
    .max(255, "Le nom ne doit pas dépasser 255 caractères"),
  
  description: z.string()
    .max(1000, "La description ne doit pas dépasser 1000 caractères")
    .optional()
    .or(z.literal("")),
  
  status: z.enum(["ACTIVE", "INACTIVE"], {
    required_error: "Le statut est obligatoire",
  }),

  organizationType: z.enum(
    ORGANIZATION_TYPES.map(type => type.code) as [string, ...string[]], 
    {
      required_error: "Veuillez sélectionner un type d'organisation",
      invalid_type_error: "Veuillez sélectionner un type d'organisation valide",
    }
  ),

  // Section 2: Contact
  contact: z.string()
    .max(100, "Le contact ne doit pas dépasser 100 caractères")
    .optional()
    .or(z.literal("")),
  
  email: z.string()
    .email("L'email n'est pas valide")
    .max(100, "L'email ne doit pas dépasser 100 caractères")
    .optional()
    .or(z.literal("")),
  
  phone: z.string()
    .max(50, "Le téléphone ne doit pas dépasser 50 caractères")
    .regex(/^(\+?\d{1,4}[\s.-]?)?(\(?\d{1,4}\)?[\s.-]?)?[\d\s.-]{6,}$/, "Format de téléphone invalide")
    .optional()
    .or(z.literal("")),

  // Section 3: Localisation
  address: z.string()
    .max(500, "L'adresse ne doit pas dépasser 500 caractères")
    .optional()
    .or(z.literal("")),
  
  city: z.string()
    .max(100, "La ville ne doit pas dépasser 100 caractères")
    .optional()
    .or(z.literal("")),
  
  postalCode: z.string()
    .max(20, "Le code postal ne doit pas dépasser 20 caractères")
    .optional()
    .or(z.literal("")),
  
  country: z.string()
    .max(100, "Le pays ne doit pas dépasser 100 caractères")
   ,

  // Section 4: Branding
  primaryColor: z.string()
    .regex(/^#[0-9A-F]{6}$/i, "Format de couleur invalide")
    .default("#007bff")
    .optional(),
  
  secondaryColor: z.string()
    .regex(/^#[0-9A-F]{6}$/i, "Format de couleur invalide")
    .default("#6c757d")
    .optional(),
  
  headerColor: z.string()
    .regex(/^#[0-9A-F]{6}$/i, "Format de couleur invalide")
    .default("#ffffff")
    .optional(),
  
  footerColor: z.string()
    .regex(/^#[0-9A-F]{6}$/i, "Format de couleur invalide")
    .default("#f8f9fa")
    .optional(),

  // Section 5: Logo (optionnel)
  logo: z.instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      return file.size <= MAX_FILE_SIZE;
    }, "Le fichier ne doit pas dépasser 2MB")
    .refine((file) => {
      if (!file) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file.type);
    }, "Format accepté: JPG, PNG, SVG"),
});

// Type du formulaire
export type SuperStructureFormValues = z.infer<typeof superStructureFormSchema>;

// Valeurs par défaut pour un nouveau formulaire
export const defaultSuperStructureValues: Partial<SuperStructureFormValues> = {
  status: "ACTIVE",
  organizationType: "OTHER",
  country: "BF",
  primaryColor: "#007bff",
  secondaryColor: "#6c757d",
  headerColor: "#ffffff",
  footerColor: "#f8f9fa",
};

// Fonction helper pour transformer les données du serveur en valeurs de formulaire
export const transformServerDataToFormValues = (data: any): Partial<SuperStructureFormValues> => {
  return {
    code: data.code || "",
    name: data.name || "",
    description: data.description || "",
    status: data.status || "ACTIVE",
    organizationType: data.organizationType || "OTHER",
    contact: data.contact || "",
    email: data.email || "",
    phone: data.phone || "",
    address: data.address || "",
    city: data.city || "",
    postalCode: data.postalCode || "",
    country: data.country || "BF",
    primaryColor: data.primaryColor || "#007bff",
    secondaryColor: data.secondaryColor || "#6c757d",
    headerColor: data.headerColor || "#ffffff",
    footerColor: data.footerColor || "#f8f9fa",
    // Logo sera géré séparément car c'est un File
  };
};