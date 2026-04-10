"use client";

import { useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateFarm, useUpdateFarm } from "@/data/farms";
import { useOrganizations } from "@/data/organizations";
import { setApiErrors } from "@/lib/utils/set-form-errors";
import type { FarmResponse } from "@/types/farm";

const formSchema = z.object({
  code: z.string().min(1, "Le code est obligatoire").max(50),
  name: z.string().min(1, "Le nom est obligatoire"),
  type: z.enum(["CROP", "LIVESTOCK", "MIXED", "AQUACULTURE"], {
    required_error: "Le type est obligatoire",
  }),
  organizationId: z.string().optional(),
  ownerName: z.string().min(1, "Le propriétaire est obligatoire"),
  ownerPhone: z.string().min(1, "Le téléphone est obligatoire"),
  managerName: z.string().optional(),
  totalAreaHectares: z.coerce.number().optional(),
  cultivableAreaHectares: z.coerce.number().optional(),
  province: z.string().optional(),
  commune: z.string().optional(),
  village: z.string().optional(),
  address: z.string().optional(),
  waterSource: z.string().optional(),
  soilType: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface FarmFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farm?: FarmResponse | null;
  mode: "create" | "edit";
}

const typeOptions = [
  { value: "CROP", label: "Culture" },
  { value: "LIVESTOCK", label: "Élevage" },
  { value: "MIXED", label: "Mixte" },
  { value: "AQUACULTURE", label: "Aquaculture" },
];

const waterSourceOptions = [
  { value: "WELL", label: "Puits" },
  { value: "RIVER", label: "Rivière" },
  { value: "RAIN", label: "Pluie" },
  { value: "IRRIGATION_CANAL", label: "Canal d'irrigation" },
];

const soilTypeOptions = [
  { value: "CLAY", label: "Argileux" },
  { value: "SANDY", label: "Sableux" },
  { value: "LOAM", label: "Limoneux" },
  { value: "SILTY", label: "Silteux" },
  { value: "PEATY", label: "Tourbeux" },
  { value: "CHALKY", label: "Calcaire" },
  { value: "OTHER", label: "Autre" },
];

export function FarmFormModal({ open, onOpenChange, farm, mode }: FarmFormModalProps) {
  const createMutation = useCreateFarm();
  const updateMutation = useUpdateFarm();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: orgsData } = useOrganizations(0, 100);
  const organizations = orgsData?.data?.content ?? [];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "", name: "", type: undefined, organizationId: "",
      ownerName: "", ownerPhone: "", managerName: "",
      totalAreaHectares: undefined, cultivableAreaHectares: undefined,
      province: "", commune: "", village: "", address: "",
      waterSource: "", soilType: "",
    },
  });

  useEffect(() => {
    if (mode === "edit" && farm) {
      form.reset({
        code: farm.code,
        name: farm.name,
        type: farm.type,
        organizationId: farm.organizationId ?? "",
        ownerName: farm.ownerName ?? "",
        ownerPhone: farm.ownerPhone ?? "",
        managerName: farm.managerName ?? "",
        totalAreaHectares: farm.totalAreaHectares ?? undefined,
        cultivableAreaHectares: farm.cultivableAreaHectares ?? undefined,
        province: farm.province ?? "",
        commune: farm.commune ?? "",
        village: farm.village ?? "",
        address: farm.address ?? "",
        waterSource: farm.waterSource ?? "",
        soilType: farm.soilType ?? "",
      });
    } else {
      form.reset({
        code: "", name: "", type: undefined, organizationId: "",
        ownerName: "", ownerPhone: "", managerName: "",
        totalAreaHectares: undefined, cultivableAreaHectares: undefined,
        province: "", commune: "", village: "", address: "",
        waterSource: "", soilType: "",
      });
    }
  }, [mode, farm, form, open]);

  const handleError = (error: any) => {
    toast.dismiss(); // dismiss generic toast from data layer
    if (!setApiErrors(form, error)) {
      toast.error(error?.response?.data?.message || "Erreur");
    }
  };

  const onSubmit = (data: FormData) => {
    if (mode === "edit" && farm) {
      const { code, ...rest } = data;
      updateMutation.mutate(
        { id: farm.id, data: { ...rest, organizationId: rest.organizationId || undefined, waterSource: rest.waterSource as any || undefined, soilType: rest.soilType || undefined } },
        { onSuccess: () => onOpenChange(false), onError: handleError }
      );
    } else {
      createMutation.mutate(
        { ...data, organizationId: data.organizationId || undefined, waterSource: data.waterSource as any || undefined, soilType: data.soilType || undefined } as any,
        { onSuccess: () => onOpenChange(false), onError: handleError }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nouvelle ferme" : "Modifier la ferme"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Code & Type */}
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl><Input placeholder="FARM-001" disabled={mode === "edit"} {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Type de ferme" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {typeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Name */}
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de la ferme</FormLabel>
                <FormControl><Input placeholder="Ferme de Bobo" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Organization */}
            <FormField control={form.control} name="organizationId" render={({ field }) => (
              <FormItem>
                <FormLabel>Organisation (optionnel)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner une organisation" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Owner */}
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="ownerName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Propriétaire</FormLabel>
                  <FormControl><Input placeholder="Nom du propriétaire" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="ownerPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone propriétaire</FormLabel>
                  <FormControl><Input type="tel" placeholder="+226 XX XX XX XX" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Manager */}
            <FormField control={form.control} name="managerName" render={({ field }) => (
              <FormItem>
                <FormLabel>Gestionnaire (optionnel)</FormLabel>
                <FormControl><Input placeholder="Nom du gestionnaire" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Area */}
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="totalAreaHectares" render={({ field }) => (
                <FormItem>
                  <FormLabel>Superficie totale (ha)</FormLabel>
                  <FormControl><Input type="number" step="0.01" placeholder="10.5" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="cultivableAreaHectares" render={({ field }) => (
                <FormItem>
                  <FormLabel>Superficie cultivable (ha)</FormLabel>
                  <FormControl><Input type="number" step="0.01" placeholder="8.0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Location */}
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="province" render={({ field }) => (
                <FormItem><FormLabel>Province</FormLabel><FormControl><Input placeholder="Province" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="commune" render={({ field }) => (
                <FormItem><FormLabel>Commune</FormLabel><FormControl><Input placeholder="Commune" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="village" render={({ field }) => (
                <FormItem><FormLabel>Village</FormLabel><FormControl><Input placeholder="Village" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            {/* Soil & Water */}
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="soilType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de sol</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Type de sol" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {soilTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="waterSource" render={({ field }) => (
                <FormItem>
                  <FormLabel>Source d'eau</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Source d'eau" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {waterSourceOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

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
