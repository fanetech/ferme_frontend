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
import { useCreateParcel } from "@/data/crops";

const irrigationOptions = [
  { value: "NONE", label: "Aucune" }, { value: "RAIN_FED", label: "Pluviale" },
  { value: "DRIP", label: "Goutte à goutte" }, { value: "SPRINKLER", label: "Aspersion" },
  { value: "FLOOD", label: "Submersion" }, { value: "MANUAL", label: "Manuelle" },
  { value: "MIXED", label: "Mixte" },
];

const formSchema = z.object({
  code: z.string().min(1, "Le code est obligatoire").max(50),
  name: z.string().min(1, "Le nom est obligatoire").max(200),
  areaHectares: z.coerce.number().min(0).optional(),
  irrigationType: z.string().optional(),
  soilPh: z.coerce.number().min(0).max(14).optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ParcelFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmId: string;
}

export function ParcelFormModal({ open, onOpenChange, farmId }: ParcelFormModalProps) {
  const createMutation = useCreateParcel();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: "", name: "", areaHectares: undefined, irrigationType: "", soilPh: undefined, notes: "" },
  });

  useEffect(() => { if (open) form.reset(); }, [open, form]);

  const onSubmit = (data: FormData) => {
    createMutation.mutate(
      { farmId, data: { farmId, code: data.code, name: data.name, areaHectares: data.areaHectares, irrigationType: data.irrigationType as any || undefined, soilPh: data.soilPh, notes: data.notes || undefined } },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nouvelle parcelle</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem><FormLabel>Code</FormLabel><FormControl><Input placeholder="PARC-001" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="areaHectares" render={({ field }) => (
                <FormItem><FormLabel>Superficie (ha)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="2.5" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="Parcelle Nord" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="irrigationType" render={({ field }) => (
                <FormItem><FormLabel>Irrigation</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Type d'irrigation" /></SelectTrigger></FormControl>
                    <SelectContent>{irrigationOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="soilPh" render={({ field }) => (
                <FormItem><FormLabel>pH du sol</FormLabel><FormControl><Input type="number" step="0.1" min="0" max="14" placeholder="6.5" {...field} /></FormControl><FormMessage /></FormItem>
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
