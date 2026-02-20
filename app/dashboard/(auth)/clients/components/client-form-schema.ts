import { z } from "zod";

// Schema with conditional validation
export const clientFormSchema = z.object({
  type: z.enum(["INDIVIDUAL", "COMPANY", "GOVERNMENT"]),
  firstName: z.string().optional(),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Le numéro de téléphone est requis"),
  alternatePhone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  maritalStatus: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]).optional(),
  nationality: z.string().optional(),
  idType: z.enum(["CNIB", "PASSPORT", "DRIVER_LICENSE", "OTHER"]).optional(),
  idNumber: z.string().optional(),
  idExpiryDate: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default("Burkina Faso"),
  postalCode: z.string().optional(),
  taxId: z.string().optional(),
  organizationId: z.string().optional(),
  organizationType: z.enum(["STRUCTURE", "SUPER_STRUCTURE"]).optional(),
  preferredLanguage: z.enum(["fr", "en", "moore", "dioula"]).optional(),
  acceptMarketing: z.boolean().default(false),
  acceptSms: z.boolean().default(false),
  enrollInLoyalty: z.boolean().default(false),
  notes: z.string().optional(),
  metadata: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validate firstName for INDIVIDUAL
  if (data.type === "INDIVIDUAL" && (!data.firstName || data.firstName.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le prénom est obligatoire pour les particuliers",
      path: ["firstName"]
    });
  }
  
  // Validate taxId for COMPANY
  if (data.type === "COMPANY" && (!data.taxId || data.taxId.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le numéro fiscal est obligatoire pour les entreprises",
      path: ["taxId"]
    });
  }
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const defaultValues: ClientFormValues = {
  type: "INDIVIDUAL",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  alternatePhone: "",
  country: "Burkina Faso",
  preferredLanguage: "fr",
  acceptMarketing: false,
  acceptSms: false,
  enrollInLoyalty: false,
  notes: "",
  metadata: "",
};
