"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCreateCultivation, useAllCropTypes } from "@/data/crops";
import type { ParcelResponse } from "@/types/crop";

const seasonOptions = [
  { value: "DRY_SEASON", label: "Saison sèche" }, { value: "RAINY_SEASON", label: "Saison des pluies" },
  { value: "WINTER", label: "Hiver" }, { value: "SPRING", label: "Printemps" },
  { value: "SUMMER", label: "Été" }, { value: "AUTUMN", label: "Automne" },
];

const formSchema = z.object({
  cropTypeId: z.string().min(1, "Le type de culture est obligatoire"),
  seasonYear: z.coerce.number().min(2020).max(2100),
  season: z.string().min(1, "La saison est obligatoire"),
  variety: z.string().optional(),
  plantingDate: z.string().optional(),
  expectedHarvestDate: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CultivationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parcel: ParcelResponse | null;
}

export function CultivationFormModal({ open, onOpenChange, parcel }: CultivationFormModalProps) {
  const createMutation = useCreateCultivation();
  const { data: cropTypesData } = useAllCropTypes();
  const cropTypes = cropTypesData?.data ?? [];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { cropTypeId: "", seasonYear: new Date().getFullYear(), season: "", variety: "", plantingDate: "", expectedHarvestDate: "", notes: "" },
  });

  useEffect(() => { if (open) form.reset({ cropTypeId: "", seasonYear: new Date().getFullYear(), season: "", variety: "", plantingDate: "", expectedHarvestDate: "", notes: "" }); }, [open, form]);

  const onSubmit = (data: FormData) => {
    if (!parcel) return;
    createMutation.mutate(
      { parcelId: parcel.id, data: { parcelId: parcel.id, cropTypeId: data.cropTypeId, seasonYear: data.seasonYear!, season: data.season as any, variety: data.variety || undefined, plantingDate: data.plantingDate || undefined, expectedHarvestDate: data.expectedHarvestDate || undefined, notes: data.notes || undefined } },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nouvelle culture — {parcel?.name}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="cropTypeId" render={({ field }) => (
              <FormItem><FormLabel>Type de culture</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner une culture" /></SelectTrigger></FormControl>
                  <SelectContent>{cropTypes.map((ct: any) => <SelectItem key={ct.id} value={ct.id}>{ct.nameFr}</SelectItem>)}</SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="seasonYear" render={({ field }) => (
                <FormItem><FormLabel>Année</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="season" render={({ field }) => (
                <FormItem><FormLabel>Saison</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Saison" /></SelectTrigger></FormControl>
                    <SelectContent>{seasonOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="variety" render={({ field }) => (
              <FormItem><FormLabel>Variété (optionnel)</FormLabel><FormControl><Input placeholder="Ex: BKN 610" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="plantingDate" render={({ field }) => (
                <FormItem><FormLabel>Date de plantation</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="expectedHarvestDate" render={({ field }) => (
                <FormItem><FormLabel>Récolte prévue</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-green-600 hover:bg-green-700">
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
