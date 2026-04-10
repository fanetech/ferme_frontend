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
import { useCreateCustomer } from "@/data/marketplace";

const typeOptions = [
  { value: "INDIVIDUAL", label: "Particulier" }, { value: "COMPANY", label: "Entreprise" },
  { value: "COOPERATIVE", label: "Coopérative" }, { value: "RESTAURANT", label: "Restaurant" },
  { value: "WHOLESALER", label: "Grossiste" }, { value: "RETAILER", label: "Détaillant" },
];

const formSchema = z.object({
  customerCode: z.string().min(1, "Le code est obligatoire").max(50),
  name: z.string().min(1, "Le nom est obligatoire").max(200),
  customerType: z.string().min(1, "Le type est obligatoire"),
  phoneNumber: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().optional(),
  creditLimit: z.coerce.number().min(0).optional(),
  paymentTerms: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Props { open: boolean; onOpenChange: (open: boolean) => void; farmId: string; }

export function CustomerFormModal({ open, onOpenChange, farmId }: Props) {
  const createMutation = useCreateCustomer();
  const form = useForm<FormData>({ resolver: zodResolver(formSchema), defaultValues: { customerCode: "", name: "", customerType: "", phoneNumber: "", email: "", address: "", creditLimit: undefined, paymentTerms: "" } });
  useEffect(() => { if (open) form.reset(); }, [open, form]);

  const onSubmit = (data: FormData) => {
    createMutation.mutate(
      { farmId, customerCode: data.customerCode, name: data.name, customerType: data.customerType as any, phoneNumber: data.phoneNumber || undefined, email: data.email || undefined, address: data.address || undefined, creditLimit: data.creditLimit, paymentTerms: data.paymentTerms || undefined },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nouveau client</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="customerCode" render={({ field }) => (<FormItem><FormLabel>Code</FormLabel><FormControl><Input placeholder="CLI-001" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="customerType" render={({ field }) => (
                <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl><SelectContent>{typeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="Nom du client" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (<FormItem><FormLabel>Téléphone</FormLabel><FormControl><Input type="tel" placeholder="+226..." {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="email@..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Adresse</FormLabel><FormControl><Textarea placeholder="Adresse" rows={2} {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="creditLimit" render={({ field }) => (<FormItem><FormLabel>Limite crédit (FCFA)</FormLabel><FormControl><Input type="number" placeholder="100000" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="paymentTerms" render={({ field }) => (<FormItem><FormLabel>Conditions paiement</FormLabel><FormControl><Input placeholder="Net 30 jours" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
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
