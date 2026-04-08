"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCreateSensor } from "@/data/iot";
import type { IoTSensorResponse } from "@/types/iot";

const sensorTypeOptions = [
  { value: "TEMPERATURE", label: "Température" },
  { value: "HUMIDITY", label: "Humidité" },
  { value: "SOIL_MOISTURE", label: "Humidité du sol" },
  { value: "SOIL_PH", label: "pH du sol" },
  { value: "LIGHT", label: "Luminosité" },
  { value: "CO2", label: "CO2" },
  { value: "WATER_LEVEL", label: "Niveau d'eau" },
  { value: "RAIN_GAUGE", label: "Pluviomètre" },
  { value: "MOTION", label: "Mouvement" },
  { value: "CAMERA", label: "Caméra" },
];

const formSchema = z.object({
  sensorCode: z.string().min(1, "Le code est obligatoire").max(50),
  name: z.string().min(1, "Le nom est obligatoire").max(200),
  sensorType: z.string().min(1, "Le type est obligatoire"),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  unit: z.string().optional(),
  readingIntervalMinutes: z.coerce.number().optional(),
  minValue: z.coerce.number().optional(),
  maxValue: z.coerce.number().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SensorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmId: string;
}

export function SensorFormModal({ open, onOpenChange, farmId }: SensorFormModalProps) {
  const createMutation = useCreateSensor();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { sensorCode: "", name: "", sensorType: "", manufacturer: "", model: "", serialNumber: "", unit: "", readingIntervalMinutes: undefined, minValue: undefined, maxValue: undefined },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  const onSubmit = (data: FormData) => {
    createMutation.mutate(
      { farmId, data: { sensorCode: data.sensorCode, name: data.name, sensorType: data.sensorType as any, manufacturer: data.manufacturer || undefined, model: data.model || undefined, serialNumber: data.serialNumber || undefined, unit: data.unit || undefined, readingIntervalMinutes: data.readingIntervalMinutes, minValue: data.minValue, maxValue: data.maxValue } },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau capteur</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="sensorCode" render={({ field }) => (
                <FormItem><FormLabel>Code</FormLabel><FormControl><Input placeholder="SENS-001" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="sensorType" render={({ field }) => (
                <FormItem><FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Type de capteur" /></SelectTrigger></FormControl>
                    <SelectContent>{sensorTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nom</FormLabel><FormControl><Input placeholder="Capteur température serre A" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="manufacturer" render={({ field }) => (
                <FormItem><FormLabel>Fabricant</FormLabel><FormControl><Input placeholder="Fabricant" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="model" render={({ field }) => (
                <FormItem><FormLabel>Modèle</FormLabel><FormControl><Input placeholder="Modèle" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="serialNumber" render={({ field }) => (
                <FormItem><FormLabel>N° série</FormLabel><FormControl><Input placeholder="N° série" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Unité</FormLabel><FormControl><Input placeholder="°C, %, mm" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="minValue" render={({ field }) => (
                <FormItem><FormLabel>Valeur min</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="maxValue" render={({ field }) => (
                <FormItem><FormLabel>Valeur max</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="readingIntervalMinutes" render={({ field }) => (
              <FormItem><FormLabel>Intervalle de lecture (min)</FormLabel><FormControl><Input type="number" placeholder="15" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-green-600 hover:bg-green-700">
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Créer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
