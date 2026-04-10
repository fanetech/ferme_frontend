"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useCreateOrder, useFarmCustomers, useFarmProducts } from "@/data/marketplace";

const lineSchema = z.object({
  productId: z.string().min(1, "Produit requis"),
  quantity: z.coerce.number().min(0.01, "Quantité > 0"),
});

const formSchema = z.object({
  customerId: z.string().min(1, "Le client est obligatoire"),
  deliveryDate: z.string().optional(),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
  orderLines: z.array(lineSchema).min(1, "Au moins un produit"),
});

type FormData = z.infer<typeof formSchema>;

interface Props { open: boolean; onOpenChange: (open: boolean) => void; farmId: string; }

export function OrderFormModal({ open, onOpenChange, farmId }: Props) {
  const createMutation = useCreateOrder();
  const { data: custsData } = useFarmCustomers(farmId);
  const { data: prodsData } = useFarmProducts(farmId);
  const customers = custsData?.data ?? [];
  const products = prodsData?.data ?? [];

  const form = useForm<FormData>({ resolver: zodResolver(formSchema), defaultValues: { customerId: "", deliveryDate: "", deliveryAddress: "", notes: "", orderLines: [{ productId: "", quantity: 1 }] } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "orderLines" });

  useEffect(() => { if (open) form.reset({ customerId: "", deliveryDate: "", deliveryAddress: "", notes: "", orderLines: [{ productId: "", quantity: 1 }] }); }, [open, form]);

  const onSubmit = (data: FormData) => {
    createMutation.mutate(
      { customerId: data.customerId, orderLines: data.orderLines.map((l) => ({ productId: l.productId, quantity: l.quantity })), deliveryDate: data.deliveryDate || undefined, deliveryAddress: data.deliveryAddress || undefined, notes: data.notes || undefined },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nouvelle commande</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="customerId" render={({ field }) => (
              <FormItem><FormLabel>Client</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger></FormControl><SelectContent>{customers.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
            )} />

            {/* Order lines */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <FormLabel>Produits</FormLabel>
                <Button type="button" size="sm" variant="outline" onClick={() => append({ productId: "", quantity: 1 })}><PlusCircle className="mr-1 h-3 w-3" /> Ajouter</Button>
              </div>
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-end">
                    <FormField control={form.control} name={`orderLines.${index}.productId`} render={({ field }) => (
                      <FormItem className="flex-1"><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Produit" /></SelectTrigger></FormControl><SelectContent>{products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} — {p.unitPrice?.toLocaleString()} FCFA/{p.unit}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name={`orderLines.${index}.quantity`} render={({ field }) => (
                      <FormItem className="w-28"><FormControl><Input type="number" step="0.1" min="0.01" placeholder="Qté" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    {fields.length > 1 && <Button type="button" size="icon" variant="ghost" onClick={() => remove(index)} className="text-red-500 h-10 w-10"><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                ))}
              </div>
              {form.formState.errors.orderLines?.message && <p className="text-sm text-red-500 mt-1">{form.formState.errors.orderLines.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="deliveryDate" render={({ field }) => (<FormItem><FormLabel>Date de livraison</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="deliveryAddress" render={({ field }) => (<FormItem><FormLabel>Adresse de livraison</FormLabel><FormControl><Input placeholder="Adresse" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Notes..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>)} />
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
