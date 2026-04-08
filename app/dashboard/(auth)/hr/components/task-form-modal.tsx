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
import { useCreateTask } from "@/data/hr";
import type { EmployeeResponse } from "@/types/hr";

const priorityOptions = [
  { value: "LOW", label: "Basse" }, { value: "MEDIUM", label: "Moyenne" },
  { value: "HIGH", label: "Haute" }, { value: "URGENT", label: "Urgente" },
];

const formSchema = z.object({
  title: z.string().min(1, "Le titre est obligatoire").max(200),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().min(1, "La priorité est obligatoire"),
  assignedToId: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.coerce.number().min(0).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: EmployeeResponse[];
}

export function TaskFormModal({ open, onOpenChange, employees }: TaskFormModalProps) {
  const createMutation = useCreateTask();
  const form = useForm<FormData>({ resolver: zodResolver(formSchema), defaultValues: { title: "", description: "", category: "", priority: "MEDIUM", assignedToId: "", dueDate: "", estimatedHours: undefined } });

  useEffect(() => { if (open) form.reset({ title: "", description: "", category: "", priority: "MEDIUM", assignedToId: "", dueDate: "", estimatedHours: undefined }); }, [open, form]);

  const onSubmit = (data: FormData) => {
    createMutation.mutate(
      { title: data.title, description: data.description || undefined, category: data.category || undefined, priority: data.priority as any, assignedToId: data.assignedToId || undefined, dueDate: data.dueDate || undefined, estimatedHours: data.estimatedHours },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nouvelle tâche</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Titre</FormLabel><FormControl><Input placeholder="Arroser la parcelle Nord" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Description..." rows={2} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="priority" render={({ field }) => (
                <FormItem><FormLabel>Priorité</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{priorityOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Catégorie</FormLabel><FormControl><Input placeholder="Culture, Élevage..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="assignedToId" render={({ field }) => (
                <FormItem><FormLabel>Assigné à</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                    <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dueDate" render={({ field }) => (
                <FormItem><FormLabel>Date limite</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="estimatedHours" render={({ field }) => (
              <FormItem><FormLabel>Heures estimées</FormLabel><FormControl><Input type="number" step="0.5" placeholder="2" {...field} /></FormControl><FormMessage /></FormItem>
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
