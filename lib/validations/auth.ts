import { z } from "zod";

// ======================================
// LOGIN SCHEMA (phone-based — Farm Management)
// ======================================

export const loginSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Le numéro de téléphone est obligatoire")
    .min(8, "Numéro de téléphone invalide")
    .max(20, "Numéro de téléphone trop long"),

  password: z
    .string()
    .min(1, "Le mot de passe est obligatoire")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .max(100, "Le mot de passe est trop long"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ======================================
// FORGOT PASSWORD SCHEMA
// ======================================

export const forgotPasswordSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Le numéro de téléphone est obligatoire")
    .min(8, "Numéro de téléphone invalide")
    .max(20, "Numéro de téléphone trop long"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ======================================
// VERIFY OTP SCHEMA
// ======================================

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est obligatoire")
    .email("L'email n'est pas valide"),
  
  code: z
    .string()
    .min(1, "Le code est obligatoire")
    .length(6, "Le code doit contenir 6 caractères")
    .regex(/^\d+$/, "Le code doit contenir uniquement des chiffres"),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

// ======================================
// RESET PASSWORD SCHEMA
// ======================================

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est obligatoire")
    .email("L'email n'est pas valide"),
  
  code: z
    .string()
    .min(1, "Le code est obligatoire")
    .length(6, "Le code doit contenir 6 caractères"),
  
  newPassword: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(100, "Le mot de passe est trop long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Le mot de passe doit contenir au moins: une minuscule, une majuscule, un chiffre et un caractère spécial"
    ),
  
  confirmPassword: z
    .string()
    .min(1, "Veuillez confirmer le mot de passe"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ======================================
// REGISTER SCHEMA
// ======================================

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, "Le prénom est obligatoire")
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom est trop long"),
  
  lastName: z
    .string()
    .min(1, "Le nom est obligatoire")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom est trop long"),
  
  email: z
    .string()
    .min(1, "L'email est obligatoire")
    .email("L'email n'est pas valide")
    .max(255, "L'email est trop long"),
  
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(100, "Le mot de passe est trop long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Le mot de passe doit contenir au moins: une minuscule, une majuscule, un chiffre et un caractère spécial"
    ),
  
  confirmPassword: z
    .string()
    .min(1, "Veuillez confirmer le mot de passe"),
  
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// ======================================
// CHANGE PASSWORD SCHEMA
// ======================================

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Le mot de passe actuel est obligatoire"),
  
  newPassword: z
    .string()
    .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères")
    .max(100, "Le mot de passe est trop long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Le mot de passe doit contenir au moins: une minuscule, une majuscule, un chiffre et un caractère spécial"
    ),
  
  confirmPassword: z
    .string()
    .min(1, "Veuillez confirmer le nouveau mot de passe"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "Le nouveau mot de passe doit être différent de l'ancien",
  path: ["newPassword"],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;