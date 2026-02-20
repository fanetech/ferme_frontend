"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ban, CheckCircle, Shield } from "lucide-react";

import { FormModal } from "@/components/ui/modal/FormModal";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import type { ClientResponse } from "@/types/clients";

// Dynamic schema based on action
const createActionSchema = (requireReason: boolean) => {
  if (requireReason) {
    return z.object({
      reason: z.string().min(10, "La raison doit contenir au moins 10 caractères"),
    });
  }
  return z.object({
    reason: z.string().optional(),
  });
};

type ActionFormValues = {
  reason?: string;
};

interface ClientActionConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  client: ClientResponse | null;
  action: string;
  isLoading?: boolean;
}

export function ClientActionConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  client,
  action,
  isLoading = false
}: ClientActionConfirmDialogProps) {
  const [actionDetails, setActionDetails] = useState<{
    title: string;
    description: string;
    requireReason: boolean;
    confirmText: string;
    confirmStyle: string;
    icon: React.ReactNode;
  }>({
    title: "",
    description: "",
    requireReason: false,
    confirmText: "",
    confirmStyle: "",
    icon: null,
  });

  // Set action details based on action type
  useEffect(() => {
    const getDetails = () => {
      switch (action) {
        case 'block':
          return {
            title: "Bloquer le client",
            description: `Le client ${client?.firstName} ${client?.lastName} ne pourra plus effectuer de transactions.`,
            requireReason: true,
            confirmText: "Bloquer le client",
            confirmStyle: "bg-orange-600 hover:bg-orange-700",
            icon: (
              <div className="p-2.5 bg-orange-500/10 dark:bg-orange-500/20 rounded-lg shadow-sm dark:shadow-none">
                <Ban className="h-5 w-5 text-orange-600 dark:text-orange-500" />
              </div>
            ),
          };
        case 'unblock':
        case 'activate':
          return {
            title: action === 'unblock' ? "Débloquer le client" : "Activer le client",
            description: `Le client ${client?.firstName} ${client?.lastName} pourra à nouveau effectuer des transactions.`,
            requireReason: false,
            confirmText: action === 'unblock' ? "Débloquer le client" : "Activer le client",
            confirmStyle: "bg-green-600 hover:bg-green-700",
            icon: (
              <div className="p-2.5 bg-green-500/10 dark:bg-green-500/20 rounded-lg shadow-sm dark:shadow-none">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
              </div>
            ),
          };
        case 'suspend':
          return {
            title: "Suspendre le client",
            description: `Le client ${client?.firstName} ${client?.lastName} sera temporairement suspendu.`,
            requireReason: true,
            confirmText: "Suspendre le client",
            confirmStyle: "bg-yellow-600 hover:bg-yellow-700",
            icon: (
              <div className="p-2.5 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-lg shadow-sm dark:shadow-none">
                <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              </div>
            ),
          };
        case 'deactivate':
          return {
            title: "Désactiver le client",
            description: `Le client ${client?.firstName} ${client?.lastName} sera désactivé (suppression douce).`,
            requireReason: true,
            confirmText: "Désactiver le client",
            confirmStyle: "bg-gray-600 hover:bg-gray-700",
            icon: (
              <div className="p-2.5 bg-gray-500/10 dark:bg-gray-500/20 rounded-lg shadow-sm dark:shadow-none">
                <Shield className="h-5 w-5 text-gray-600 dark:text-gray-500" />
              </div>
            ),
          };
        default:
          return {
            title: "Confirmer l'action",
            description: "Êtes-vous sûr de vouloir effectuer cette action ?",
            requireReason: false,
            confirmText: "Confirmer",
            confirmStyle: "",
            icon: (
              <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
                <Shield className="h-5 w-5 text-primary" />
              </div>
            ),
          };
      }
    };

    setActionDetails(getDetails());
  }, [action, client]);

  const form = useForm<ActionFormValues>({
    resolver: zodResolver(createActionSchema(actionDetails.requireReason)),
    defaultValues: {
      reason: "",
    },
  });

  const {
    handleSubmit,
    formState: { isDirty },
    reset,
    control,
  } = form;

  useEffect(() => {
    if (!isOpen) {
      reset({ reason: "" });
    }
  }, [isOpen, reset]);

  const onSubmit = async (values: ActionFormValues) => {
    onConfirm(actionDetails.requireReason ? values.reason : undefined);
    reset();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
      title={actionDetails.title}
      titleIcon={actionDetails.icon}
      subtitle={client ? `${client.firstName} ${client.lastName} (${client.code})` : ""}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={actionDetails.confirmText}
      isSubmitting={isLoading}
      isDirty={isDirty}
      size="md"
      footerNote={
        action === 'block' 
          ? "Le client sera notifié de cette action." 
          : action === 'unblock' || action === 'activate'
          ? "Le client retrouvera tous ses droits."
          : action === 'suspend'
          ? "Le client sera temporairement suspendu."
          : action === 'deactivate'
          ? "Cette action est réversible (soft delete)."
          : undefined
      }
    >
      <Form {...form}>
        <div className="space-y-4">
          {/* Action description */}
          <div className={`rounded-lg border p-4 ${
            action === 'block' 
              ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30'
              : action === 'unblock' || action === 'activate'
              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30'
              : action === 'suspend'
              ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30'
              : action === 'deactivate'
              ? 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/30'
              : 'border-border bg-muted/50'
          }`}>
            <p className="text-sm">
              {actionDetails.description}
            </p>
            {action === 'block' && (
              <p className="text-sm text-muted-foreground mt-2">
                Cette action peut être annulée ultérieurement en débloquant le client.
              </p>
            )}
            {action === 'suspend' && (
              <p className="text-sm text-muted-foreground mt-2">
                Le client peut être réactivé à tout moment.
              </p>
            )}
            {action === 'deactivate' && (
              <p className="text-sm text-muted-foreground mt-2">
                Cette suppression douce peut être annulée en réactivant le client.
              </p>
            )}
          </div>

          {/* Reason field (only for block action) */}
          {actionDetails.requireReason && (
            <FormField
              control={control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raison de l'action *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Décrivez la raison de cette action..."
                      className="min-h-[100px] resize-none"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Cette information sera enregistrée dans l'historique des actions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Additional information based on action */}
          {(action === 'unblock' || action === 'activate') && (
            <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Après déblocage :
                  </p>
                  <ul className="mt-1 space-y-1 text-green-800 dark:text-green-200">
                    <li>• Le client pourra effectuer des transactions</li>
                    <li>• L'accès aux services sera restauré</li>
                    <li>• Le statut passera à "Actif"</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {action === 'block' && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30 p-4">
              <div className="flex items-start gap-2">
                <Ban className="h-4 w-4 text-orange-600 dark:text-orange-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    Après blocage :
                  </p>
                  <ul className="mt-1 space-y-1 text-orange-800 dark:text-orange-200">
                    <li>• Le client ne pourra plus effectuer de transactions</li>
                    <li>• L'accès aux services sera suspendu</li>
                    <li>• Le statut passera à "Bloqué"</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {action === 'suspend' && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30 p-4">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">
                    Après suspension :
                  </p>
                  <ul className="mt-1 space-y-1 text-yellow-800 dark:text-yellow-200">
                    <li>• Le client sera temporairement suspendu</li>
                    <li>• Les transactions seront mises en pause</li>
                    <li>• Le statut passera à "Suspendu"</li>
                    <li>• Réactivation possible à tout moment</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {action === 'deactivate' && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/30 p-4">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-gray-600 dark:text-gray-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Après désactivation :
                  </p>
                  <ul className="mt-1 space-y-1 text-gray-800 dark:text-gray-200">
                    <li>• Le client sera marqué comme inactif</li>
                    <li>• Suppression douce (données conservées)</li>
                    <li>• Le statut passera à "Inactif"</li>
                    <li>• Réactivation possible ultérieurement</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </Form>
    </FormModal>
  );
}
