"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, AlertTriangle, Building } from "lucide-react";
import { toast } from "sonner";

import { FormModal } from "@/components/ui/modal/FormModal";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useDeleteStructure } from "@/data/organization";
import type { Structure } from "@/types/organization";
import { structureDeleteSchema, defaultValues, StructureDeleteValues } from "./schemas/structure-delete-schema";

interface StructureDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  structure: Structure | null;
}

export function StructureDeleteDialog({
  isOpen,
  onClose,
  structure
}: StructureDeleteDialogProps) {
  const deleteMutation = useDeleteStructure();
  
  const form = useForm<StructureDeleteValues>({
    resolver: zodResolver(structureDeleteSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
    reset,
    control,
    watch,
  } = form;

  const confirmationText = watch("confirmationText");
  const expectedConfirmationText = structure?.name || "";
  const isConfirmationValid = confirmationText === expectedConfirmationText;

  useEffect(() => {
    if (!isOpen) {
      reset(defaultValues);
    }
  }, [isOpen, reset]);

  const onSubmit = async (values: StructureDeleteValues) => {
    if (!structure || !isConfirmationValid) return;

    try {
      await deleteMutation.mutateAsync(structure.id);
      toast.success("Structure supprimée avec succès");
      onClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Erreur lors de la suppression";
      toast.error(errorMessage);
    }
  };

  const titleIcon = (
    <div className="p-2.5 bg-destructive/10 dark:bg-destructive/20 rounded-lg shadow-sm dark:shadow-none">
      <Trash2 className="h-5 w-5 text-destructive" />
    </div>
  );

  if (!structure) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Supprimer la structure"
      titleIcon={titleIcon}
      subtitle={`Vous êtes sur le point de supprimer définitivement la structure "${structure.name}".`}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Supprimer définitivement"
      isSubmitting={deleteMutation.isPending}
      isDirty={isDirty}
      size="lg"
      footerNote="Cette action est irréversible et supprimera toutes les données associées."
    >
      <Form {...form}>
        <div className="space-y-6">
          {/* Informations sur la structure */}
          <div className="bg-muted/30 dark:bg-muted/10 rounded-lg p-4 space-y-3 border border-border/50">
            <div className="flex items-center gap-3">
              {structure.logoUrl ? (
                <img
                  src={structure.logoUrl}
                  alt={`Logo ${structure.name}`}
                  className="h-12 w-12 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <Building className="h-6 w-6 text-primary" />
                </div>
              )}
              <div>
                <h4 className="font-semibold text-foreground">{structure.name}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{structure.code}</Badge>
                  {structure.superStructureName && (
                    <span className="text-sm text-muted-foreground">
                      → {structure.superStructureName}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {structure.description && (
              <p className="text-sm text-muted-foreground">
                {structure.description}
              </p>
            )}
          </div>

          {/* Avertissements */}
          <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Attention :</strong> Cette action supprimera également :
              <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                <li>Les catégories associées à cette structure</li>
                <li>Les utilisateurs rattachés à cette structure</li>
                <li>Les transactions et opérations liées</li>
                <li>Les configurations et paramètres spécifiques</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Impact détecté */}
          {structure.totalCategories !== undefined && structure.totalCategories > 0 && (
            <Alert className="border-destructive/20 bg-destructive/5 dark:bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-destructive dark:text-destructive-foreground">
                <strong>Impact détecté :</strong> Cette structure contient{" "}
                <strong>{structure.totalCategories} catégorie(s)</strong> qui seront également supprimées.
              </AlertDescription>
            </Alert>
          )}

          {/* Raison de la suppression */}
          <FormField
            control={control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raison de la suppression *</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Décrivez la raison de la suppression de cette structure"
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirmation par saisie du nom */}
          <FormField
            control={control}
            name="confirmationText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmation *</FormLabel>
                <FormDescription>
                  Pour confirmer la suppression, tapez le nom exact de la structure :
                </FormDescription>
                <div className="space-y-2">
                  <div className="text-sm font-mono bg-muted/50 dark:bg-muted/20 p-2 rounded border border-border">
                    {expectedConfirmationText}
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Tapez le nom exact de la structure"
                      className={isConfirmationValid ? "border-green-500 dark:border-green-400" : ""}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </FormModal>
  );
}
