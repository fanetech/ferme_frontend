"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCreateLivestock, useAllAnimalTypes } from "@/data/livestock";

const genderOptions = [
  { value: "M", label: "Mâle" }, { value: "F", label: "Femelle" }, { value: "OTHER", label: "Autre" },
];

const healthOptions = [
  { value: "HEALTHY", label: "En bonne santé" }, { value: "SICK", label: "Malade" },
  { value: "INJURED", label: "Blessé" }, { value: "RECOVERING", label: "En rétablissement" },
  { value: "QUARANTINE", label: "Quarantaine" },
];

const formSchema = z.object({
  animalTypeId: z.string().min(1, "Le type est obligatoire"),
  tagNumber: z.string().optional(),
  name: z.string().optional(),
  breed: z.string().optional(),
  gender: z.enum(["M", "F", "OTHER"], { required_error: "Le genre est obligatoire" }),
  birthDate: z.string().optional(),
  acquisitionDate: z.string().optional(),
  acquisitionSource: z.string().optional(),
  acquisitionCost: z.coerce.number().optional(),
  currentWeightKg: z.coerce.number().optional(),
  healthStatus: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface LivestockFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmId: string;
}

export function LivestockFormModal({ open, onOpenChange, farmId }: LivestockFormModalProps) {
  const createMutation = useCreateLivestock();
  const { data: typesData } = useAllAnimalTypes();
  const animalTypes = typesData?.data ?? [];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { animalTypeId: "", tagNumber: "", name: "", breed: "", gender: undefined, birthDate: "", acquisitionDate: "", acquisitionSource: "", acquisitionCost: undefined, currentWeightKg: undefined, healthStatus: "HEALTHY", notes: "" },
  });

  useEffect(() => { if (open) form.reset(); }, [open, form]);

  const onSubmit = (data: FormData) => {
    createMutation.mutate(
      { farmId, data: { farmId, animalTypeId: data.animalTypeId, gender: data.gender as any, tagNumber: data.tagNumber || undefined, name: data.name || undefined, breed: data.breed || undefined, birthDate: data.birthDate || undefined, acquisitionDate: data.acquisitionDate || undefined, acquisitionSource: data.acquisitionSource || undefined, acquisitionCost: data.acquisitionCost, currentWeightKg: data.currentWeightKg, healthStatus: data.healthStatus as any || undefined, notes: data.notes || undefined } },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nouvel animal</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="animalTypeId" render={({ field }) => (
                <FormItem><FormLabel>Type d'animal</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                    <SelectContent>{animalTypes.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.nameFr} {t.breed ? `(${t.breed})` : ""}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem><FormLabel>Genre</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Genre" /></SelectTrigger></FormControl>
                    <SelectContent>{genderOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="Nom de l'animal" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="tagNumber" render={({ field }) => (
                <FormItem><FormLabel>N° d'identification</FormLabel><FormControl><Input placeholder="TAG-001" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="breed" render={({ field }) => (
                <FormItem><FormLabel>Race</FormLabel><FormControl><Input placeholder="Race" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="birthDate" render={({ field }) => (
                <FormItem><FormLabel>Date de naissance</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="currentWeightKg" render={({ field }) => (
                <FormItem><FormLabel>Poids (kg)</FormLabel><FormControl><Input type="number" step="0.1" placeholder="45" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="healthStatus" render={({ field }) => (
                <FormItem><FormLabel>Santé</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{healthOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="acquisitionDate" render={({ field }) => (
                <FormItem><FormLabel>Date d'acquisition</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="acquisitionSource" render={({ field }) => (
                <FormItem><FormLabel>Source</FormLabel><FormControl><Input placeholder="Marché, éleveur..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="acquisitionCost" render={({ field }) => (
                <FormItem><FormLabel>Coût (FCFA)</FormLabel><FormControl><Input type="number" placeholder="50000" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Notes..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
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
