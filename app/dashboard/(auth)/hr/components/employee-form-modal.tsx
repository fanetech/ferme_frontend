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
import { useCreateEmployee } from "@/data/hr";

const contractOptions = [
  { value: "PERMANENT", label: "Permanent" }, { value: "TEMPORARY", label: "Temporaire" },
  { value: "SEASONAL", label: "Saisonnier" }, { value: "DAILY", label: "Journalier" },
  { value: "HOURLY", label: "Horaire" }, { value: "CONTRACT", label: "Contrat" },
];

const salaryFreqOptions = [
  { value: "MONTHLY", label: "Mensuel" }, { value: "WEEKLY", label: "Hebdomadaire" },
  { value: "DAILY", label: "Journalier" }, { value: "HOURLY", label: "Horaire" },
];

const formSchema = z.object({
  employeeCode: z.string().min(1, "Le code est obligatoire").max(50),
  firstName: z.string().min(1, "Le prénom est obligatoire").max(100),
  lastName: z.string().min(1, "Le nom est obligatoire").max(100),
  phoneNumber: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  gender: z.enum(["M", "F", "OTHER"]).optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  contractType: z.string().min(1, "Le type de contrat est obligatoire"),
  hireDate: z.string().optional(),
  salary: z.coerce.number().min(0).optional(),
  salaryFrequency: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EmployeeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmId: string;
}

export function EmployeeFormModal({ open, onOpenChange, farmId }: EmployeeFormModalProps) {
  const createMutation = useCreateEmployee();
  const form = useForm<FormData>({ resolver: zodResolver(formSchema), defaultValues: { employeeCode: "", firstName: "", lastName: "", phoneNumber: "", email: "", gender: undefined, position: "", department: "", contractType: "", hireDate: "", salary: undefined, salaryFrequency: "", emergencyContactName: "", emergencyContactPhone: "" } });

  useEffect(() => { if (open) form.reset(); }, [open, form]);

  const onSubmit = (data: FormData) => {
    createMutation.mutate(
      { farmId, employeeCode: data.employeeCode, firstName: data.firstName, lastName: data.lastName, contractType: data.contractType as any, phoneNumber: data.phoneNumber || undefined, email: data.email || undefined, gender: data.gender as any, position: data.position || undefined, department: data.department || undefined, hireDate: data.hireDate || undefined, salary: data.salary, salaryFrequency: data.salaryFrequency as any || undefined, emergencyContactName: data.emergencyContactName || undefined, emergencyContactPhone: data.emergencyContactPhone || undefined },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nouvel employé</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="employeeCode" render={({ field }) => (
                <FormItem><FormLabel>Code</FormLabel><FormControl><Input placeholder="EMP-001" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem><FormLabel>Prénom</FormLabel><FormControl><Input placeholder="Prénom" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="Nom" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem><FormLabel>Téléphone</FormLabel><FormControl><Input type="tel" placeholder="+226..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="email@..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem><FormLabel>Genre</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Genre" /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="M">Homme</SelectItem><SelectItem value="F">Femme</SelectItem><SelectItem value="OTHER">Autre</SelectItem></SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="position" render={({ field }) => (
                <FormItem><FormLabel>Poste</FormLabel><FormControl><Input placeholder="Technicien agricole" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="department" render={({ field }) => (
                <FormItem><FormLabel>Département</FormLabel><FormControl><Input placeholder="Production" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="contractType" render={({ field }) => (
                <FormItem><FormLabel>Contrat</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                    <SelectContent>{contractOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="hireDate" render={({ field }) => (
                <FormItem><FormLabel>Date d'embauche</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="salary" render={({ field }) => (
                <FormItem><FormLabel>Salaire (FCFA)</FormLabel><FormControl><Input type="number" placeholder="75000" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="salaryFrequency" render={({ field }) => (
                <FormItem><FormLabel>Fréquence</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Fréquence" /></SelectTrigger></FormControl>
                    <SelectContent>{salaryFreqOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="emergencyContactName" render={({ field }) => (
                <FormItem><FormLabel>Contact urgence</FormLabel><FormControl><Input placeholder="Nom" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (
                <FormItem><FormLabel>Tél. urgence</FormLabel><FormControl><Input type="tel" placeholder="+226..." {...field} /></FormControl><FormMessage /></FormItem>
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
