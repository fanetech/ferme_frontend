"use client";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useDeleteRole } from "@/data/roles-permissions";
import type { RoleResponse } from "@/types/role";

interface RoleDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleResponse | null;
}

export function RoleDeleteDialog({ open, onOpenChange, role }: RoleDeleteDialogProps) {
  const deleteMutation = useDeleteRole();
  if (!role) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le rôle</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer le rôle <span className="font-semibold">{role.name}</span> ?
            Les utilisateurs ayant ce rôle perdront les permissions associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteMutation.mutate(role.id, { onSuccess: () => onOpenChange(false) })}
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
