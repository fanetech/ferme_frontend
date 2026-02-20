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
import { Badge } from "@/components/ui/badge";
import { UserBadge } from "./user-badge";
import type { User } from "@/types/users";

interface UserActionConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
  action: string;
  isLoading?: boolean;
}

export function UserActionConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  user,
  action,
  isLoading = false
}: UserActionConfirmDialogProps) {
  if (!user) return null;

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'activate':
        return {
          title: 'Activer l\'utilisateur',
          description: `Cette action activera le compte de ${user.fullName}. L'utilisateur pourra se connecter et accéder à toutes ses fonctionnalités.`,
          confirmText: 'Activer',
          confirmVariant: 'default' as const,
          newStatus: 'ACTIVE' as const
        };
      case 'deactivate':
        return {
          title: 'Désactiver l\'utilisateur',
          description: `Cette action désactivera temporairement le compte de ${user.fullName}. L'utilisateur ne pourra plus se connecter jusqu'à la réactivation.`,
          confirmText: 'Désactiver',
          confirmVariant: 'destructive' as const,
          newStatus: 'INACTIVE' as const
        };
      case 'suspend':
        return {
          title: 'Suspendre l\'utilisateur',
          description: `Cette action suspendra le compte de ${user.fullName}. Cette mesure est généralement prise suite à une violation des règles ou pour des raisons de sécurité.`,
          confirmText: 'Suspendre',
          confirmVariant: 'destructive' as const,
          newStatus: 'SUSPENDED' as const
        };
      case 'lock':
        return {
          title: 'Verrouiller l\'utilisateur',
          description: `Cette action verrouillera le compte de ${user.fullName}. Le compte restera verrouillé jusqu'au déverrouillage manuel par un administrateur.`,
          confirmText: 'Verrouiller',
          confirmVariant: 'destructive' as const,
          newStatus: 'LOCKED' as const
        };
      case 'unlock':
        return {
          title: 'Déverrouiller l\'utilisateur',
          description: `Cette action déverrouillera le compte de ${user.fullName}. L'utilisateur pourra à nouveau tenter de se connecter.`,
          confirmText: 'Déverrouiller',
          confirmVariant: 'default' as const,
          newStatus: 'ACTIVE' as const
        };
      case 'reject':
        return {
          title: 'Rejeter la demande',
          description: `Cette action rejetera la demande d'activation de ${user.fullName}. L'utilisateur devra soumettre une nouvelle demande.`,
          confirmText: 'Rejeter',
          confirmVariant: 'destructive' as const,
          newStatus: 'INACTIVE' as const
        };
      default:
        return {
          title: 'Confirmer l\'action',
          description: `Êtes-vous sûr de vouloir effectuer cette action sur le compte de ${user.fullName} ?`,
          confirmText: 'Confirmer',
          confirmVariant: 'default' as const,
          newStatus: user.accountStatus
        };
    }
  };

  const config = getActionConfig(action);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {config.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div>
              {config.description}
            </div>
            
            {/* Informations utilisateur */}
            <div className="p-3 bg-muted/50 rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Utilisateur :</span>
                <span className="text-sm">{user.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email :</span>
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Statut actuel :</span>
                <UserBadge status={user.accountStatus} />
              </div>
              {config.newStatus !== user.accountStatus && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nouveau statut :</span>
                  <UserBadge status={config.newStatus} />
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            variant={config.confirmVariant}
            disabled={isLoading}
          >
            {isLoading ? 'Traitement...' : config.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}