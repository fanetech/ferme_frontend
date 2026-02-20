"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2 } from "lucide-react";

import { FormModal } from "@/components/ui/modal/FormModal";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useDeleteClient } from "@/data/clients";
import type { ClientResponse } from "@/types/clients";

// Schema for deletion confirmation
const clientDeleteSchema = z.object({
  reason: z.string().min(10, "La raison doit contenir au moins 10 caractères"),
});

type ClientDeleteValues = z.infer<typeof clientDeleteSchema>;

const defaultValues: ClientDeleteValues = {
  reason: "",
};

interface ClientDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientResponse | null;
}

export function ClientDeleteDialog({
  isOpen,
  onClose,
  client
}: ClientDeleteDialogProps) {
  const deleteMutation = useDeleteClient();

  const form = useForm<ClientDeleteValues>({
    resolver: zodResolver(clientDeleteSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
    reset,
    control,
  } = form;

  useEffect(() => {
    if (!isOpen) {
      reset(defaultValues);
    }
  }, [isOpen, reset]);

  const onSubmit = async (values: ClientDeleteValues) => {
    if (!client) return;
    
    try {
      await deleteMutation.mutateAsync(client.id);
      reset();
      onClose();
    } catch (error) {
      // L'erreur est gérée par la mutation
    }
  };

  const titleIcon = (
    <div className="p-2.5 bg-destructive/10 dark:bg-destructive/20 rounded-lg shadow-sm dark:shadow-none">
      <Trash2 className="h-5 w-5 text-destructive" />
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Supprimer le client"
      titleIcon={titleIcon}
      subtitle={client ? `${client.firstName} ${client.lastName} (${client.code})` : ""}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Supprimer le client"
      isSubmitting={deleteMutation.isPending}
      isDirty={isDirty}
      size="md"
      footerNote="Cette action est irréversible."
    >
      <Form {...form}>
        <div className="space-y-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 dark:bg-destructive/10 p-4">
            <p className="text-sm text-destructive-foreground dark:text-destructive">
              <strong>Attention :</strong> Cette action supprimera définitivement le client{" "}
              <span className="font-semibold">
                {client?.firstName} {client?.lastName}
              </span>.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Les données du client seront anonymisées conformément aux règles RGPD.
            </p>
          </div>

          <FormField
            control={control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raison de la suppression *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Décrivez la raison de la suppression..."
                    className="min-h-[120px] resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </FormModal>
  );
}
