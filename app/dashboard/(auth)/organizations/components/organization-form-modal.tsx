"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCreateOrganization, useUpdateOrganization } from "@/data/organizations";
import type { OrganizationResponse } from "@/types/organization";
import { useEffect } from "react";

const formSchema = z.object({
  code: z.string().min(1, "Le code est obligatoire").max(50),
  name: z.string().min(1, "Le nom est obligatoire"),
  type: z.enum(["COOPERATIVE", "GROUPEMENT", "ENTREPRISE", "ONG"], {
    required_error: "Le type est obligatoire",
  }),
  description: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  province: z.string().optional(),
  commune: z.string().optional(),
  village: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface OrganizationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization?: OrganizationResponse | null;
  mode: "create" | "edit";
}

const typeOptions = [
  { value: "COOPERATIVE", label: "Coopérative" },
  { value: "GROUPEMENT", label: "Groupement" },
  { value: "ENTREPRISE", label: "Entreprise" },
  { value: "ONG", label: "ONG" },
];

export function OrganizationFormModal({
  open,
  onOpenChange,
  organization,
  mode,
}: OrganizationFormModalProps) {
  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      type: undefined,
      description: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      province: "",
      commune: "",
      village: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && organization) {
      form.reset({
        code: organization.code,
        name: organization.name,
        type: organization.type,
        description: organization.description ?? "",
        contactPerson: organization.contactPerson ?? "",
        email: organization.email ?? "",
        phone: organization.phone ?? "",
        address: organization.address ?? "",
        province: organization.province ?? "",
        commune: organization.commune ?? "",
        village: organization.village ?? "",
      });
    } else {
      form.reset({
        code: "",
        name: "",
        type: undefined,
        description: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        province: "",
        commune: "",
        village: "",
      });
    }
  }, [mode, organization, form, open]);

  const onSubmit = (data: FormData) => {
    const payload = {
      code: data.code,
      name: data.name,
      type: data.type,
      description: data.description || undefined,
      contactPerson: data.contactPerson || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      province: data.province || undefined,
      commune: data.commune || undefined,
      village: data.village || undefined,
    };
    if (mode === "edit" && organization) {
      updateMutation.mutate(
        { id: organization.id, data: payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nouvelle organisation" : "Modifier l'organisation"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="ORG-001" disabled={mode === "edit"} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de l'organisation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description (optionnel)" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personne de contact</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du contact" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+226 XX XX XX XX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemple.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl>
                      <Input placeholder="Province" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="commune"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commune</FormLabel>
                    <FormControl>
                      <Input placeholder="Commune" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="village"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Village</FormLabel>
                    <FormControl>
                      <Input placeholder="Village" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input placeholder="Adresse complète" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
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
