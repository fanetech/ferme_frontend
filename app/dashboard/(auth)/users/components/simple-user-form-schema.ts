import { z } from "zod";

// Schéma simplifié basé sur CreateUserRequest
export const simpleUserFormSchema = z.object({
  // Informations personnelles (obligatoires)
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string()
    .min(8, "Le numéro doit contenir au moins 8 chiffres")
    .refine((value) => {
      // Extraire seulement les chiffres pour compter
      const digitsOnly = value.replace(/\D/g, '');
      
      // Vérifier qu'on a au moins 8 chiffres et au maximum 15
      if (digitsOnly.length < 8 || digitsOnly.length > 15) {
        return false;
      }
      
      // Vérifier le format général avec regex plus simple
      const phoneRegex = /^(\+\d{1,4})?[\s\-\.\(\)\d]+$/;
      return phoneRegex.test(value);
    }, "Format invalide. Ex: 70 12 34 56, +226 70 12 34 56, +33 6 12 34 56 78"),
  
  // Organisation (obligatoire)
  organizationType: z.enum(["STRUCTURE", "SUPER_STRUCTURE"], {
    errorMap: () => ({ message: "Le type d'organisation est requis" })
  }),
  organizationId: z.string().min(1, "L'organisation est requise"),
  
  // Rôles (obligatoire)
  roleIds: z.array(z.string()).min(1, "Au moins un rôle doit être sélectionné"),
  
  // Informations optionnelles
  title: z.string().optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")), // Format: YYYY-MM-DD
  gender: z.string().optional().or(z.literal(""))
});

export type SimpleUserFormValues = z.infer<typeof simpleUserFormSchema>;

// Valeurs par défaut pour le formulaire
export const defaultSimpleUserValues: Partial<SimpleUserFormValues> = {
  organizationType: "STRUCTURE",
  roleIds: [],
  title: "",
  bio: "",
  birthDate: "",
  gender: ""
};

// Options pour les types d'organisation
export const ORGANIZATION_TYPE_OPTIONS = [
  { value: "STRUCTURE", label: "Structure" },
  { value: "SUPER_STRUCTURE", label: "Super Structure" }
];

// Options pour le genre
export const GENDER_OPTIONS = [
  { value: "M", label: "Masculin" },
  { value: "F", label: "Féminin" }
];

// Fonction pour formater le téléphone en temps réel
export const formatPhoneInput = (value: string): string => {
  // Supprimer tout sauf chiffres, espaces, +, -, . et parenthèses
  const cleaned = value.replace(/[^\d\s\+\-\.\(\)]/g, '');
  
  // Garder le formatage existant pour plus de flexibilité
  return cleaned;
};

// Validation des messages d'erreur téléphone
export const phoneValidation = {
  pattern: /^(\+\d{1,4})?[\s\-\.\(\)\d]+$/,
  validate: (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly.length >= 8 && digitsOnly.length <= 15;
  },
  messages: {
    invalid: "Format de téléphone invalide. Utilisez un format international (+XXX) ou local",
    required: "Le numéro de téléphone est requis"
  }
};

// Exemples de formats acceptés pour l'aide utilisateur
export const phoneFormats = {
  valid: [
    "70123456",
    "70 12 34 56", 
    "20 12 34 56",
    "+226 70 12 34 56",
    "+33 6 12 34 56 78",
    "+225 07 12 34 56",
    "+1 555 123 4567",
    "+44 20 7946 0958",
    "(555) 123-4567"
  ],
  invalid: [
    "123", // Trop court
    "abc123456", // Contient des lettres
    "+", // Juste le +
    "" // Vide
  ]
};

// Fonction utilitaire pour valider un numéro de téléphone
export const isValidPhoneNumber = (value: string): boolean => {
  // Extraire seulement les chiffres
  const digitsOnly = value.replace(/\D/g, '');
  
  // Vérifier qu'on a entre 8 et 15 chiffres
  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    return false;
  }
  
  // Vérifier le format général
  const phoneRegex = /^(\+\d{1,4})?[\s\-\.\(\)\d]+$/;
  return phoneRegex.test(value);
};

// Transformation des données du formulaire vers l'API
export const transformSimpleFormToCreateRequest = (values: SimpleUserFormValues) => {
  return {
    organizationType: values.organizationType,
    organizationId: values.organizationId,
    roleIds: values.roleIds, // Nouveau champ pour les rôles
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phone: values.phone,
    title: values.title || undefined,
    bio: values.bio || undefined,
    birthDate: values.birthDate || undefined,
    gender: values.gender || undefined
  };
};