"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { UseMutationResult } from "@tanstack/react-query";

import { FormModal } from "@/components/ui/modal/FormModal";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Terminal, UpdateTerminalStatus } from "@/types";
import { terminalBlockSchema, defaultValues, TerminalBlockValues } from "./terminal-block-schema";

interface TerminalDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  terminal: Terminal | null;
  onUpdateTerminalStatus: (terminal: Terminal, updateData: UpdateTerminalStatus) => void;
  deleteMutation: UseMutationResult<any, any, any, any>;
}

export function TerminalDeleteDialog({
  isOpen,
  onClose,
  terminal,
  onUpdateTerminalStatus,
  deleteMutation,
}: TerminalDeleteDialogProps) {
  const form = useForm<TerminalBlockValues>({
    resolver: zodResolver(terminalBlockSchema),
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

  const onSubmit = async (values: TerminalBlockValues) => {
    if (terminal) {
      onUpdateTerminalStatus(terminal, { action: "DELETE", reason: values.reason });
    }
  };

  const titleIcon = (
    <div className="p-2.5 bg-destructive/10 rounded-lg shadow-sm">
      <Trash2 className="h-5 w-5 text-destructive" />
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Supprimer le terminal"
      titleIcon={titleIcon}
      subtitle={`Vous êtes sur le point de supprimer le terminal ${terminal?.serialNumber}.`}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Supprimer le terminal"
      isSubmitting={deleteMutation.isPending}
      isDirty={isDirty}
      size="md"
      footerNote="Cette action est irréversible."
    >
      <Form {...form}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-white">
            Pour confirmer la suppression, veuillez fournir une raison.
          </p>
          <FormField
            control={control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raison de la suppression *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Décrivez la raison de la suppression"
                    className="min-h-[120px]"
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
