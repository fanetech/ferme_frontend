import { z } from 'zod';

export const superStructureDeleteSchema = z.object({
  reason: z.string().min(1, { message: "La raison de la suppression est obligatoire." }),
});

export type SuperStructureDeleteValues = z.infer<typeof superStructureDeleteSchema>;

export const defaultValues: SuperStructureDeleteValues = {
  reason: '',
};
