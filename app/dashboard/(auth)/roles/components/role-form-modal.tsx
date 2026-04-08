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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCreateRole, useUpdateRole } from "@/data/roles-permissions";
import type { RoleResponse } from "@/types/role";

const formSchema = z.object({
  code: z.string().min(1, "Le code est obligatoire").max(50).regex(/^[A-Z0-9_]+$/, "Majuscules, chiffres et _ uniquement"),
  name: z.string().min(1, "Le nom est obligatoire").max(100),
  description: z.string().optional(),
  level: z.coerce.number().min(1).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface RoleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: RoleResponse | null;
  mode: "create" | "edit";
}

export function RoleFormModal({ open, onOpenChange, role, mode }: RoleFormModalProps) {
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: "", name: "", description: "", level: undefined },
  });

  useEffect(() => {
    if (mode === "edit" && role) {
      form.reset({
        code: role.code,
        name: role.name,
        description: role.description ?? "",
        level: role.level ?? undefined,
      });
    } else {
      form.reset({ code: "", name: "", description: "", level: undefined });
    }
  }, [mode, role, form, open]);

  const onSubmit = (data: FormData) => {
    if (mode === "edit" && role) {
      const { code, ...rest } = data;
      updateMutation.mutate({ id: role.id, data: rest }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate({ code: data.code, name: data.name, description: data.description || undefined, level: data.level }, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nouveau rôle" : "Modifier le rôle"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="code" render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl><Input placeholder="FARM_MANAGER" disabled={mode === "edit"} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl><Input placeholder="Gestionnaire de ferme" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Description du rôle" rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="level" render={({ field }) => (
              <FormItem>
                <FormLabel>Niveau de hiérarchie</FormLabel>
                <FormControl><Input type="number" min={1} placeholder="1" {...field} /></FormControl>
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
