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
import { useSendNotification } from "@/data/notifications";

const typeOptions = [
  { value: "INFO", label: "Information" }, { value: "WARNING", label: "Avertissement" },
  { value: "ALERT", label: "Alerte" }, { value: "REMINDER", label: "Rappel" },
  { value: "TASK", label: "Tâche" }, { value: "SYSTEM", label: "Système" },
];

const priorityOptions = [
  { value: "LOW", label: "Basse" }, { value: "MEDIUM", label: "Moyenne" },
  { value: "HIGH", label: "Haute" }, { value: "URGENT", label: "Urgente" },
];

const formSchema = z.object({
  subject: z.string().min(1, "Le sujet est obligatoire"),
  body: z.string().min(1, "Le message est obligatoire"),
  notificationType: z.string().min(1, "Le type est obligatoire"),
  priority: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

export function SendNotificationModal({ open, onOpenChange }: Props) {
  const sendMutation = useSendNotification();
  const form = useForm<FormData>({ resolver: zodResolver(formSchema), defaultValues: { subject: "", body: "", notificationType: "INFO", priority: "MEDIUM" } });
  useEffect(() => { if (open) form.reset({ subject: "", body: "", notificationType: "INFO", priority: "MEDIUM" }); }, [open, form]);

  const onSubmit = (data: FormData) => {
    sendMutation.mutate(
      { subject: data.subject, body: data.body, notificationType: data.notificationType as any, priority: data.priority as any, recipientIds: [] },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Envoyer une notification</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="notificationType" render={({ field }) => (
                <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{typeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="priority" render={({ field }) => (
                <FormItem><FormLabel>Priorité</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{priorityOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="subject" render={({ field }) => (<FormItem><FormLabel>Sujet</FormLabel><FormControl><Input placeholder="Sujet de la notification" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="body" render={({ field }) => (<FormItem><FormLabel>Message</FormLabel><FormControl><Textarea placeholder="Contenu du message..." rows={4} {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
              <Button type="submit" disabled={sendMutation.isPending} className="bg-green-600 hover:bg-green-700">{sendMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Envoyer</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
