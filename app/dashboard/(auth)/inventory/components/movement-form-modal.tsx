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
import { useCreateStockMovement } from "@/data/inventory";

const movementTypeOptions = [
  { value: "PURCHASE", label: "Achat" }, { value: "SALE", label: "Vente" },
  { value: "USAGE", label: "Utilisation" }, { value: "TRANSFER_IN", label: "Transfert entrant" },
  { value: "TRANSFER_OUT", label: "Transfert sortant" }, { value: "ADJUSTMENT", label: "Ajustement" },
  { value: "RETURN", label: "Retour" }, { value: "EXPIRED", label: "Expiré" },
  { value: "DAMAGED", label: "Endommagé" }, { value: "LOST", label: "Perdu" },
];

const formSchema = z.object({
  movementType: z.string().min(1, "Le type est obligatoire"),
  movementDate: z.string().min(1, "La date est obligatoire"),
  quantity: z.coerce.number().min(0.01, "La quantité doit être supérieure à 0"),
  unitPrice: z.coerce.number().min(0).optional(),
  supplierName: z.string().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface MovementFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryItemId: string;
  itemName: string;
}

export function MovementFormModal({ open, onOpenChange, inventoryItemId, itemName }: MovementFormModalProps) {
  const createMutation = useCreateStockMovement();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { movementType: "", movementDate: new Date().toISOString().split("T")[0], quantity: undefined, unitPrice: undefined, supplierName: "", batchNumber: "", expiryDate: "", notes: "" },
  });

  useEffect(() => { if (open) form.reset({ movementType: "", movementDate: new Date().toISOString().split("T")[0], quantity: undefined, unitPrice: undefined, supplierName: "", batchNumber: "", expiryDate: "", notes: "" }); }, [open, form]);

  const onSubmit = (data: FormData) => {
    createMutation.mutate(
      { inventoryItemId, movementType: data.movementType as any, movementDate: `${data.movementDate}T00:00:00`, quantity: data.quantity, unitPrice: data.unitPrice, expiryDate: data.expiryDate || undefined, supplierName: data.supplierName || undefined, batchNumber: data.batchNumber || undefined, notes: data.notes || undefined },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Mouvement de stock — {itemName}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="movementType" render={({ field }) => (
                <FormItem><FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Type de mouvement" /></SelectTrigger></FormControl>
                    <SelectContent>{movementTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="movementDate" render={({ field }) => (
                <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem><FormLabel>Quantité</FormLabel><FormControl><Input type="number" step="0.01" placeholder="10" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="unitPrice" render={({ field }) => (
                <FormItem><FormLabel>Prix unitaire (FCFA)</FormLabel><FormControl><Input type="number" step="1" placeholder="500" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="supplierName" render={({ field }) => (
                <FormItem><FormLabel>Fournisseur</FormLabel><FormControl><Input placeholder="Fournisseur" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="batchNumber" render={({ field }) => (
                <FormItem><FormLabel>N° lot</FormLabel><FormControl><Input placeholder="LOT-001" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="expiryDate" render={({ field }) => (
              <FormItem><FormLabel>Date d'expiration</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Notes..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-green-600 hover:bg-green-700">
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
