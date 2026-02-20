import { z } from 'zod';

export const terminalBlockSchema = z.object({
  reason: z.string().min(1, { message: "La raison du blocage est obligatoire." }),
});

export type TerminalBlockValues = z.infer<typeof terminalBlockSchema>;

export const defaultValues: TerminalBlockValues = {
  reason: '',
};