import { z } from 'zod';

export const structureDeleteSchema = z.object({
  reason: z.string().min(1, { message: "La raison de la suppression est obligatoire." }),
  confirmationText: z.string().min(1, { message: "Veuillez confirmer le nom de la structure." }),
});

export type StructureDeleteValues = z.infer<typeof structureDeleteSchema>;

export const defaultValues: StructureDeleteValues = {
  reason: '',
  confirmationText: '',
};
