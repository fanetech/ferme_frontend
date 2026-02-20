"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock } from "lucide-react";
import { UseMutationResult } from "@tanstack/react-query";

import { FormModal } from "@/components/ui/modal/FormModal";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Terminal, UpdateTerminalStatus } from "@/types";
import { terminalBlockSchema, defaultValues, TerminalBlockValues } from "./terminal-block-schema";

interface TerminalBlockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  terminal: Terminal | null;
  onUpdateTerminalStatus: (terminal: Terminal, updateData: UpdateTerminalStatus) => void;
  blockMutation: UseMutationResult<any, any, any, any>;
}

export function TerminalBlockDialog({
  isOpen,
  onClose,
  terminal,
  onUpdateTerminalStatus,
  blockMutation,
}: TerminalBlockDialogProps) {
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
      onUpdateTerminalStatus(terminal, { action: "LOCK", reason: values.reason });
    }
  };

  const titleIcon = (
    <div className="p-2.5 bg-destructive/10 rounded-lg shadow-sm">
      <Lock className="h-5 w-5 text-destructive" />
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Bloquer le terminal"
      titleIcon={titleIcon}
      subtitle={`Vous êtes sur le point de bloquer le terminal ${terminal?.serialNumber}.`}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Bloquer le terminal"
      isSubmitting={blockMutation.isPending}
      isDirty={isDirty}
      size="md"
      footerNote="Le blocage empêchera toute utilisation du terminal."
    >
      <Form {...form}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Cette action est réversible. Vous pourrez débloquer le terminal à tout moment.
          </p>
          <FormField
            control={control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raison du blocage *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Décrivez la raison du blocage (vol, fraude, maintenance, etc.)"
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
