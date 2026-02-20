"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { UseMutationResult } from "@tanstack/react-query";

import { FormModal } from "@/components/ui/modal/FormModal";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useDeleteSuperStructure } from "@/data/organization";
import { superStructureDeleteSchema, defaultValues, SuperStructureDeleteValues } from "./super-structure-delete-schema";
import type { SuperStructure } from "@/types/organization";

interface SuperStructureDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  superStructure: SuperStructure | null;
  onDeleteSuperStructure?: (superStructure: SuperStructure, reason: string) => void;
  deleteMutation?: UseMutationResult<any, any, any, any>;
}

export function SuperStructureDeleteDialog({
  isOpen,
  onClose,
  superStructure,
  onDeleteSuperStructure,
  deleteMutation: externalDeleteMutation,
}: SuperStructureDeleteDialogProps) {
  const internalDeleteMutation = useDeleteSuperStructure();
  const deleteMutation = externalDeleteMutation || internalDeleteMutation;

  const form = useForm<SuperStructureDeleteValues>({
    resolver: zodResolver(superStructureDeleteSchema),
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

  const onSubmit = async (values: SuperStructureDeleteValues) => {
    if (superStructure) {
      if (onDeleteSuperStructure) {
        onDeleteSuperStructure(superStructure, values.reason);
      } else {
        try {
          await deleteMutation.mutateAsync(superStructure.id);
          onClose();
        } catch (error) {
          // Error handling is done in the mutation
        }
      }
    }
  };

  const titleIcon = (
    <div className="p-2.5 bg-destructive/10 rounded-lg shadow-sm">
      <Trash2 className="h-5 w-5 text-destructive" />
    </div>
  );

  const hasStructures = superStructure?.totalStructures && superStructure.totalStructures > 0;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Supprimer la super structure"
      titleIcon={titleIcon}
      subtitle={`Vous êtes sur le point de supprimer la super structure "${superStructure?.name}".`}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Supprimer la super structure"
      isSubmitting={deleteMutation.isPending}
      isDirty={isDirty}
      footerNote="Cette action est irréversible."
    >
      <Form {...form}>
        <div className="space-y-4">
          <div className="bg-destructive/10 dark:bg-destructive/20 border border-destructive/20 dark:border-destructive/30 rounded-lg p-4">
            <p className="text-sm font-medium text-destructive dark:text-red-400 mb-2">
              ⚠️ Attention - Action dangereuse
            </p>
            <p className="text-sm text-destructive/90 dark:text-red-400/90">
              Cette super structure est probablement liée à de nombreux éléments :
            </p>
            <ul className="text-sm text-destructive/80 dark:text-red-400/80 mt-2 ml-4 list-disc space-y-1">
              <li>Structures rattachées</li>
              <li>Utilisateurs associés</li>
              <li>Transactions enregistrées</li>
              <li>Terminaux configurés</li>
              <li>Données historiques</li>
            </ul>
            {hasStructures && (
              <p className="text-sm font-medium text-destructive dark:text-red-400 mt-3">
                Cette super structure contient {superStructure.totalStructures} structure(s).
              </p>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
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

          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              💡 Il est recommandé de <strong>désactiver</strong> cette super structure plutôt que de la supprimer pour conserver l'historique des données.
            </p>
          </div>
        </div>
      </Form>
    </FormModal>
  );
}
