import { z } from "zod";
import type { User, UserType, UserStatus, AccountStatus } from "@/types/users";

// Schéma de validation pour le formulaire User
export const userFormSchema = z.object({
  // Champs obligatoires
  username: z.string()
    .min(1, "Le nom d'utilisateur est obligatoire")
    .max(50, "Le nom d'utilisateur ne doit pas dépasser 50 caractères")
    .regex(/^[a-zA-Z0-9._-]+$/, "Le nom d'utilisateur doit contenir uniquement des lettres, chiffres, points, tirets et underscores"),
  
  email: z.string()
    .min(1, "L'email est obligatoire")
    .email("Format d'email invalide")
    .max(255, "L'email ne doit pas dépasser 255 caractères"),
  
  firstName: z.string()
    .min(1, "Le prénom est obligatoire")
    .max(100, "Le prénom ne doit pas dépasser 100 caractères"),
  
  lastName: z.string()
    .min(1, "Le nom est obligatoire")
    .max(100, "Le nom ne doit pas dépasser 100 caractères"),
  
  userType: z.enum(["ADMIN", "SUPER_ADMIN", "USER", "GUEST", "SERVICE_ACCOUNT"], {
    errorMap: () => ({ message: "Le type d'utilisateur est obligatoire" })
  }),
  
  userStatus: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING", "BLOCKED"], {
    errorMap: () => ({ message: "Le statut utilisateur est obligatoire" })
  }),
  
  // Champs optionnels
  phoneNumber: z.string()
    .max(20, "Le numéro de téléphone ne doit pas dépasser 20 caractères")
    .regex(/^[\+]?[0-9\s\-\(\)\.]*$/, "Format de téléphone invalide")
    .optional()
    .or(z.literal("")),
  
  alternateEmail: z.string()
    .email("Format d'email invalide")
    .max(255, "L'email alternatif ne doit pas dépasser 255 caractères")
    .optional()
    .or(z.literal("")),
  
  // Organisation
  structureId: z.string()
    .optional()
    .or(z.literal("")),
  
  departmentId: z.string()
    .optional()
    .or(z.literal("")),
  
  // Rôles
  roleIds: z.array(z.string()).default([]),
  
  // Préférences
  language: z.string()
    .max(10, "La langue ne doit pas dépasser 10 caractères")
    .optional()
    .or(z.literal("")),
  
  timezone: z.string()
    .max(50, "Le fuseau horaire ne doit pas dépasser 50 caractères")
    .optional()
    .or(z.literal("")),
  
  // Sécurité (en mode création uniquement)
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre")
    .optional()
    .or(z.literal("")),
  
  confirmPassword: z.string()
    .optional()
    .or(z.literal("")),
  
  // Options
  sendWelcomeEmail: z.boolean().default(true),
  requirePasswordChange: z.boolean().default(false),
  twoFactorEnabled: z.boolean().default(false),
  
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
}).refine((data) => {
  // Validation des mots de passe correspondants en mode création
  if (data.password && data.password !== "") {
    return data.confirmPassword === data.password;
  }
  return true;
}, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

export type UserFormValues = z.infer<typeof userFormSchema>;

// Valeurs par défaut pour le formulaire
export const defaultUserValues: Partial<UserFormValues> = {
  userType: "USER",
  userStatus: "ACTIVE",
  language: "fr",
  timezone: "Europe/Paris",
  sendWelcomeEmail: true,
  requirePasswordChange: false,
  twoFactorEnabled: false,
  roleIds: [],
  metadata: ""
};

// Fonction pour transformer les données du serveur vers le formulaire
export const transformServerDataToFormValues = (data: any): UserFormValues => {
  console.log("Transforming user server data:", data); // Debug
  
  return {
    username: data.username || "",
    email: data.email || "",
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    phoneNumber: data.phoneNumber || "",
    alternateEmail: data.alternateEmail || "",
    userType: (data.userType as UserType) || "USER",
    userStatus: (data.userStatus as UserStatus) || "ACTIVE",
    structureId: data.structureId || "",
    departmentId: data.departmentId || "",
    roleIds: data.roleIds || data.roles?.map((r: any) => r.id) || [],
    language: data.language || "fr",
    timezone: data.timezone || "Europe/Paris",
    password: "", // Jamais pré-rempli
    confirmPassword: "", // Jamais pré-rempli
    sendWelcomeEmail: data.sendWelcomeEmail ?? true,
    requirePasswordChange: data.requirePasswordChange ?? false,
    twoFactorEnabled: data.twoFactorEnabled ?? false,
    metadata: data.metadata || ""
  };
};

// Messages d'erreur personnalisés en français pour les erreurs d'enum
export const formatEnumError = (error: string): string => {
  if (error.includes("Invalid enum value")) {
    if (error.includes("userType")) {
      return "Le type d'utilisateur doit être valide";
    }
    if (error.includes("userStatus")) {
      return "Le statut utilisateur doit être valide";
    }
  }
  return error;
};

// Validation des données avant envoi à l'API
export const transformFormValuesToServerData = (values: UserFormValues, mode: "create" | "edit") => {
  const data: any = {
    username: values.username,
    email: values.email,
    firstName: values.firstName,
    lastName: values.lastName,
    userType: values.userType,
    userStatus: values.userStatus
  };

  // Ajouter les champs optionnels seulement s'ils ont une valeur
  if (values.phoneNumber && values.phoneNumber.trim() !== "") {
    data.phoneNumber = values.phoneNumber.trim();
  }
  
  if (values.alternateEmail && values.alternateEmail.trim() !== "") {
    data.alternateEmail = values.alternateEmail.trim();
  }
  
  if (values.structureId && values.structureId !== "") {
    data.structureId = values.structureId;
  }
  
  if (values.departmentId && values.departmentId !== "") {
    data.departmentId = values.departmentId;
  }
  
  if (values.roleIds && values.roleIds.length > 0) {
    data.roleIds = values.roleIds;
  }
  
  if (values.language && values.language !== "") {
    data.language = values.language;
  }
  
  if (values.timezone && values.timezone !== "") {
    data.timezone = values.timezone;
  }
  
  // Options (seulement en mode création)
  if (mode === "create") {
    data.sendWelcomeEmail = values.sendWelcomeEmail;
    data.requirePasswordChange = values.requirePasswordChange;
    
    // Mot de passe (seulement en mode création et si fourni)
    if (values.password && values.password.trim() !== "") {
      data.password = values.password;
    }
  }
  
  // Sécurité
  data.twoFactorEnabled = values.twoFactorEnabled;
  
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

// Options pour les types d'utilisateurs
export const USER_TYPE_OPTIONS = [
  { value: "USER", label: "Utilisateur" },
  { value: "ADMIN", label: "Administrateur" },
  { value: "SUPER_ADMIN", label: "Super Administrateur" },
  { value: "GUEST", label: "Invité" },
  { value: "SERVICE_ACCOUNT", label: "Compte de Service" }
];

// Options pour les statuts d'utilisateurs
export const USER_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Actif" },
  { value: "INACTIVE", label: "Inactif" },
  { value: "SUSPENDED", label: "Suspendu" },
  { value: "PENDING", label: "En attente" },
  { value: "BLOCKED", label: "Bloqué" }
];

// Options de langues
export const LANGUAGE_OPTIONS = [
  { value: "fr", label: "Français" },
  { value: "en", label: "Anglais" },
  { value: "es", label: "Espagnol" },
  { value: "de", label: "Allemand" },
  { value: "it", label: "Italien" }
];

// Options de fuseaux horaires
export const TIMEZONE_OPTIONS = [
  { value: "Europe/Paris", label: "Europe/Paris (UTC+1)" },
  { value: "Europe/London", label: "Europe/London (UTC+0)" },
  { value: "America/New_York", label: "America/New_York (UTC-5)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (UTC-8)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (UTC+9)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (UTC+10)" }
];