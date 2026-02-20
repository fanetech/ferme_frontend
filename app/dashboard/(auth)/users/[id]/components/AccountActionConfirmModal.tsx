"use client";

import { BaseModal } from "@/components/ui/modal/BaseModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserBadge } from "../../components/user-badge";
import { getUserStatusConfig } from "../../components/user-status-mapper";
import type { User } from "@/types/users";
import { 
  CheckCircle, 
  XCircle, 
  Lock, 
  Unlock, 
  UserX, 
  UserCheck,
  AlertTriangle
} from "lucide-react";

interface AccountActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
  action: string;
  isLoading?: boolean;
}

export function AccountActionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  user,
  action,
  isLoading = false
}: AccountActionConfirmModalProps) {
  if (!user) return null;

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'activate':
        return {
          title: 'Activer le compte',
          description: `Cette action activera le compte de ${user.fullName}. L'utilisateur pourra se connecter et accéder à toutes ses fonctionnalités.`,
          confirmText: 'Activer le compte',
          confirmVariant: 'default' as const,
          newStatus: 'ACTIVE' as const,
          icon: <UserCheck className="h-5 w-5 text-green-600" />,
          color: 'text-green-600'
        };
      case 'deactivate':
        return {
          title: 'Désactiver le compte',
          description: `Cette action désactivera temporairement le compte de ${user.fullName}. L'utilisateur ne pourra plus se connecter jusqu'à la réactivation.`,
          confirmText: 'Désactiver le compte',
          confirmVariant: 'destructive' as const,
          newStatus: 'INACTIVE' as const,
          icon: <UserX className="h-5 w-5 text-gray-600" />,
          color: 'text-gray-600'
        };
      case 'suspend':
        return {
          title: 'Suspendre le compte',
          description: `Cette action suspendra le compte de ${user.fullName}. Cette mesure est généralement prise suite à une violation des règles ou pour des raisons de sécurité.`,
          confirmText: 'Suspendre le compte',
          confirmVariant: 'destructive' as const,
          newStatus: 'SUSPENDED' as const,
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          color: 'text-red-600'
        };
      case 'lock':
        return {
          title: 'Verrouiller le compte',
          description: `Cette action verrouillera le compte de ${user.fullName}. Le compte restera verrouillé jusqu'au déverrouillage manuel par un administrateur.`,
          confirmText: 'Verrouiller le compte',
          confirmVariant: 'destructive' as const,
          newStatus: 'LOCKED' as const,
          icon: <Lock className="h-5 w-5 text-orange-600" />,
          color: 'text-orange-600'
        };
      case 'unlock':
        return {
          title: 'Déverrouiller le compte',
          description: `Cette action déverrouillera le compte de ${user.fullName}. L'utilisateur pourra à nouveau tenter de se connecter.`,
          confirmText: 'Déverrouiller le compte',
          confirmVariant: 'default' as const,
          newStatus: 'ACTIVE' as const,
          icon: <Unlock className="h-5 w-5 text-green-600" />,
          color: 'text-green-600'
        };
      case 'reject':
        return {
          title: 'Rejeter la demande',
          description: `Cette action rejettera la demande d'activation de ${user.fullName}. L'utilisateur devra soumettre une nouvelle demande.`,
          confirmText: 'Rejeter la demande',
          confirmVariant: 'destructive' as const,
          newStatus: 'INACTIVE' as const,
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          color: 'text-red-600'
        };
      default:
        return {
          title: 'Confirmer l\'action',
          description: `Êtes-vous sûr de vouloir effectuer cette action sur le compte de ${user.fullName} ?`,
          confirmText: 'Confirmer',
          confirmVariant: 'default' as const,
          newStatus: user.accountStatus,
          icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
          color: 'text-yellow-600'
        };
    }
  };

  const config = getActionConfig(action);
  const currentStatusConfig = getUserStatusConfig(user.accountStatus);
  const newStatusConfig = getUserStatusConfig(config.newStatus);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="p-0"
      title={
        <div className="flex items-center gap-3">
          {config.icon}
          <span>{config.title}</span>
        </div>
      }
    >
      <div className="">
        {/* Description de l'action */}
        <div className="text-sm text-muted-foreground">
          {config.description}
        </div>
        
        {/* Informations utilisateur */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-sm">Informations du compte</h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Utilisateur :</span>
              <p className="font-medium">{user.fullName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email :</span>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          {/* Changement de statut */}
          <div className="pt-2 border-t border-border space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Statut actuel :</span>
                <UserBadge status={user.status} />
              </div>
              
              {config.newStatus !== user.status && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Nouveau statut :</span>
                  <UserBadge status={config.newStatus} />
                </div>
              )}
            </div>
            
            {/* États booléens */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Actif :</span>
                <span className={user.active ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {user.active ? "Oui" : "Non"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Verrouillé :</span>
                <span className={user.locked ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                  {user.locked ? "Oui" : "Non"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Avertissement pour les actions destructives */}
        {config.confirmVariant === 'destructive' && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Action irréversible</p>
                <p className="text-destructive/80 mt-1">
                  Cette action aura un impact immédiat sur l'accès de l'utilisateur. 
                  Assurez-vous d'avoir informé l'utilisateur si nécessaire.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Traitement...' : config.confirmText}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}