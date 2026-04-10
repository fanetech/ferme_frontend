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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useCreateInventoryItem } from "@/data/inventory";

const categoryOptions = [
  { value: "SEED", label: "Semence" }, { value: "FERTILIZER", label: "Engrais" },
  { value: "PESTICIDE", label: "Pesticide" }, { value: "HERBICIDE", label: "Herbicide" },
  { value: "FEED", label: "Aliment" }, { value: "MEDICATION", label: "Médicament" },
  { value: "EQUIPMENT", label: "Équipement" }, { value: "TOOL", label: "Outil" },
  { value: "FUEL", label: "Carburant" }, { value: "PACKAGING", label: "Emballage" },
  { value: "OTHER", label: "Autre" },
];

const formSchema = z.object({
  code: z.string().min(1, "Le code est obligatoire").max(50),
  name: z.string().min(1, "Le nom est obligatoire").max(200),
  category: z.string().min(1, "La catégorie est obligatoire"),
  unit: z.string().min(1, "L'unité est obligatoire").max(50),
  currentStock: z.coerce.number().min(0).optional(),
  minimumStock: z.coerce.number().min(0).optional(),
  reorderPoint: z.coerce.number().min(0).optional(),
  unitPrice: z.coerce.number().min(0).optional(),
  brand: z.string().optional(),
  supplier: z.string().optional(),
  storageLocation: z.string().optional(),
  isPerishable: z.boolean().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ItemFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmId: string;
}

export function ItemFormModal({ open, onOpenChange, farmId }: ItemFormModalProps) {
  const createMutation = useCreateInventoryItem();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: "", name: "", category: "", unit: "", currentStock: 0, minimumStock: undefined, reorderPoint: undefined, unitPrice: undefined, brand: "", supplier: "", storageLocation: "", isPerishable: false, description: "" },
  });

  useEffect(() => { if (open) form.reset(); }, [open, form]);

  const onSubmit = (data: FormData) => {
    createMutation.mutate(
      { farmId, code: data.code, name: data.name, category: data.category as any, unit: data.unit, currentStock: data.currentStock, minimumStock: data.minimumStock, reorderPoint: data.reorderPoint, unitPrice: data.unitPrice, brand: data.brand || undefined, supplier: data.supplier || undefined, storageLocation: data.storageLocation || undefined, isPerishable: data.isPerishable, description: data.description || undefined },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nouvel article</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem><FormLabel>Code</FormLabel><FormControl><Input placeholder="INV-001" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Catégorie</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger></FormControl>
                    <SelectContent>{categoryOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Unité</FormLabel><FormControl><Input placeholder="kg, L, pièce" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="Engrais NPK 15-15-15" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-4 gap-4">
              <FormField control={form.control} name="currentStock" render={({ field }) => (
                <FormItem><FormLabel>Stock actuel</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="minimumStock" render={({ field }) => (
                <FormItem><FormLabel>Stock minimum</FormLabel><FormControl><Input type="number" step="0.01" placeholder="10" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="reorderPoint" render={({ field }) => (
                <FormItem><FormLabel>Seuil réappro.</FormLabel><FormControl><Input type="number" step="0.01" placeholder="20" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="unitPrice" render={({ field }) => (
                <FormItem><FormLabel>Prix unit. (FCFA)</FormLabel><FormControl><Input type="number" step="1" placeholder="500" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="brand" render={({ field }) => (
                <FormItem><FormLabel>Marque</FormLabel><FormControl><Input placeholder="Marque" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="supplier" render={({ field }) => (
                <FormItem><FormLabel>Fournisseur</FormLabel><FormControl><Input placeholder="Fournisseur" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="storageLocation" render={({ field }) => (
                <FormItem><FormLabel>Emplacement</FormLabel><FormControl><Input placeholder="Magasin A" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="flex items-center gap-4">
              <FormField control={form.control} name="isPerishable" render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel className="font-normal">Périssable</FormLabel>
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Description..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
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
