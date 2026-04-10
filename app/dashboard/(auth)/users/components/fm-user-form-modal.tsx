"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCreateFmUser, useUpdateFmUser } from "@/data/fm-users";
import type { UserResponse } from "@/types/user";

const createSchema = z.object({
  code: z.string().min(1, "Le code est obligatoire").max(50),
  firstName: z.string().min(1, "Le prénom est obligatoire").max(100),
  lastName: z.string().min(1, "Le nom est obligatoire").max(100),
  phoneNumber: z.string().min(8, "Numéro invalide").max(20),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  password: z.string().min(6, "Minimum 6 caractères"),
  gender: z.enum(["M", "F", "OTHER"]).optional(),
  languagePreference: z.string().optional(),
});

const editSchema = createSchema.omit({ password: true, code: true });

type CreateFormData = z.infer<typeof createSchema>;
type EditFormData = z.infer<typeof editSchema>;

interface FmUserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserResponse | null;
  mode: "create" | "edit";
}

export function FmUserFormModal({ open, onOpenChange, user, mode }: FmUserFormModalProps) {
  const createMutation = useCreateFmUser();
  const updateMutation = useUpdateFmUser();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<CreateFormData>({
    resolver: zodResolver(mode === "create" ? createSchema : editSchema),
    defaultValues: {
      code: "", firstName: "", lastName: "", phoneNumber: "", email: "", password: "", gender: undefined, languagePreference: "fr",
    },
  });

  useEffect(() => {
    if (mode === "edit" && user) {
      form.reset({
        code: user.code,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email ?? "",
        password: "",
        gender: user.gender ?? undefined,
        languagePreference: user.languagePreference ?? "fr",
      });
    } else {
      form.reset({ code: "", firstName: "", lastName: "", phoneNumber: "", email: "", password: "", gender: undefined, languagePreference: "fr" });
    }
  }, [mode, user, form, open]);

  const onSubmit = (data: CreateFormData) => {
    if (mode === "edit" && user) {
      const { code, password, ...updateData } = data;
      updateMutation.mutate(
        { id: user.id, data: { ...updateData, email: updateData.email || undefined } },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(
        { ...data, email: data.email || undefined } as any,
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nouvel utilisateur" : "Modifier l'utilisateur"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mode === "create" && (
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl><Input placeholder="USR-001" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl><Input placeholder="Prénom" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl><Input placeholder="Nom" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="phoneNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl><Input type="tel" placeholder="+226 XX XX XX XX" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email (optionnel)</FormLabel>
                <FormControl><Input type="email" placeholder="email@exemple.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {mode === "create" && (
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl><Input type="password" placeholder="Minimum 6 caractères" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem>
                <FormLabel>Genre</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="M">Homme</SelectItem>
                    <SelectItem value="F">Femme</SelectItem>
                    <SelectItem value="OTHER">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button type="submit" disabled={isPending} className="bg-green-600 hover:bg-green-700">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "create" ? "Créer" : "Enregistrer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
