import * as z from "zod";

export const terminalFormSchema = z.object({
  structureId: z.string().optional(),
  superStructureId: z.string().optional(),
  serialNumber: z.string()
    .min(1, "Le numéro de série est requis")
    .regex(/^TPE-\d{4}-\d{3}$/, "Format invalide. Utilisez TPE-YYYY-XXX"),
  activationCode: z.string().optional(),
  model: z.string().min(1, "Le modèle est requis"),
  manufacturer: z.string().min(1, "Le fabricant est requis"),
  osVersion: z.string().min(1, "La version du système est requise"),
  appVersion: z.string()
    .min(1, "La version de l'application est requise")
    .regex(/^\d+\.\d+\.\d+$/, "Format invalide. Utilisez X.Y.Z"),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'LOCKED', 'PENDING', 'EXPIRED', 'DEACTIVATED']),
  expirationDate: z.string().optional(),
  metadata: z.object({
    location: z.string().optional(),
    contact: z.string().optional(),
    reportedBy: z.string().optional(),
    incidentNumber: z.string().optional(),
    policeReport: z.string().optional(),
  }).optional(),
});

export type TerminalFormValues = z.infer<typeof terminalFormSchema>;

export const defaultValues: Partial<TerminalFormValues> = {
  status: 'PENDING',
  manufacturer: 'AvePlus Technologies',
  osVersion: 'Android 11',
  appVersion: '1.0.0',
  metadata: {
    location: '',
    contact: '',
    reportedBy: '',
    incidentNumber: '',
    policeReport: '',
  }
};
