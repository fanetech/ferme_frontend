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
import { useCreateProduct } from "@/data/marketplace";

const typeOptions = [
  { value: "CROP", label: "Culture" }, { value: "LIVESTOCK", label: "Élevage" },
  { value: "PROCESSED", label: "Transformé" }, { value: "BY_PRODUCT", label: "Sous-produit" },
  { value: "SERVICE", label: "Service" },
];

const qualityOptions = [
  { value: "PREMIUM", label: "Premium" }, { value: "STANDARD", label: "Standard" },
  { value: "ECONOMY", label: "Économique" }, { value: "REJECT", label: "Rejet" },
];

const formSchema = z.object({
  productCode: z.string().min(1, "Le code est obligatoire").max(50),
  name: z.string().min(1, "Le nom est obligatoire").max(200),
  productType: z.string().min(1, "Le type est obligatoire"),
  unit: z.string().min(1, "L'unité est obligatoire").max(50),
  unitPrice: z.coerce.number().min(0, "Le prix doit être positif"),
  availableQuantity: z.coerce.number().min(0).optional(),
  qualityGrade: z.string().optional(),
  harvestDate: z.string().optional(),
  expiryDate: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Props { open: boolean; onOpenChange: (open: boolean) => void; farmId: string; }

export function ProductFormModal({ open, onOpenChange, farmId }: Props) {
  const createMutation = useCreateProduct();
  const form = useForm<FormData>({ resolver: zodResolver(formSchema), defaultValues: { productCode: "", name: "", productType: "", unit: "", unitPrice: undefined, availableQuantity: 0, qualityGrade: "", harvestDate: "", expiryDate: "", description: "" } });
  useEffect(() => { if (open) form.reset(); }, [open, form]);

  const onSubmit = (data: FormData) => {
    createMutation.mutate(
      { farmId, productCode: data.productCode, name: data.name, productType: data.productType as any, unit: data.unit, unitPrice: data.unitPrice, availableQuantity: data.availableQuantity, qualityGrade: data.qualityGrade as any || undefined, harvestDate: data.harvestDate || undefined, expiryDate: data.expiryDate || undefined, description: data.description || undefined },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nouveau produit</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="productCode" render={({ field }) => (<FormItem><FormLabel>Code</FormLabel><FormControl><Input placeholder="PROD-001" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="productType" render={({ field }) => (
                <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl><SelectContent>{typeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="Maïs grain sec" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="unit" render={({ field }) => (<FormItem><FormLabel>Unité</FormLabel><FormControl><Input placeholder="kg, L, pièce" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="unitPrice" render={({ field }) => (<FormItem><FormLabel>Prix (FCFA)</FormLabel><FormControl><Input type="number" step="1" placeholder="250" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="availableQuantity" render={({ field }) => (<FormItem><FormLabel>Quantité dispo.</FormLabel><FormControl><Input type="number" step="0.1" placeholder="100" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="qualityGrade" render={({ field }) => (
                <FormItem><FormLabel>Qualité</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Qualité" /></SelectTrigger></FormControl><SelectContent>{qualityOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="harvestDate" render={({ field }) => (<FormItem><FormLabel>Date récolte</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="expiryDate" render={({ field }) => (<FormItem><FormLabel>Date expiration</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Description..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-green-600 hover:bg-green-700">{createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
