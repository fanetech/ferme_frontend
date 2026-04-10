"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useDeleteOrganization } from "@/data/organizations";
import type { OrganizationResponse } from "@/types/organization";

interface OrganizationDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: OrganizationResponse | null;
}

export function OrganizationDeleteDialog({
  open,
  onOpenChange,
  organization,
}: OrganizationDeleteDialogProps) {
  const deleteMutation = useDeleteOrganization();

  if (!organization) return null;

  const handleDelete = () => {
    deleteMutation.mutate(organization.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer l'organisation</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer l'organisation{" "}
            <span className="font-semibold">{organization.name}</span> ? Cette action est
            irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
