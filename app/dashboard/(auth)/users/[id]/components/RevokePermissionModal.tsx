"use client";

import { useState } from "react";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  AlertTriangle, 
  Key, 
  Clock, 
  Calendar,
  User,
  X,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import type { User as UserType } from "@/types/users";
import type { PermissionDetails } from "@/types/user-permissions";
import { useRevokeUserPermission, useRevokeAllUserPermissions } from "@/data/users";

interface RevokePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  permission?: PermissionDetails; // undefined pour "révoquer toutes"
  onSuccess?: () => void;
}

export function RevokePermissionModal({
  isOpen,
  onClose,
  user,
  permission,
  onSuccess
}: RevokePermissionModalProps) {
  const [reason, setReason] = useState("");
  
  const revokePermissionMutation = useRevokeUserPermission();
  const revokeAllPermissionsMutation = useRevokeAllUserPermissions();
  
  const isRevokeAll = !permission;
  const isSubmitting = revokePermissionMutation.isPending || revokeAllPermissionsMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isRevokeAll) {
        await revokeAllPermissionsMutation.mutateAsync({
          userId: user.id,
          reason: reason || undefined
        });
        toast.success("Toutes les permissions directes ont été révoquées avec succès");
      } else {
        await revokePermissionMutation.mutateAsync({
          userId: user.id,
          permissionId: permission!.permissionId,
          reason: reason || undefined
        });
        toast.success(`Permission "${permission!.permissionName}" révoquée avec succès`);
      }

      onSuccess?.();
      handleClose();
      
    } catch (error) {
      console.error('Erreur lors de la révocation:', error);
      toast.error("Erreur lors de la révocation de la permission");
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-destructive" />
          <span>{isRevokeAll ? "Révoquer toutes les permissions" : "Révoquer la permission"}</span>
        </div>
      }
      subtitle={`Révocation ${isRevokeAll ? "de toutes les permissions directes" : "d'une permission"} pour ${user.fullName}`}
      size="lg"
      noPadding={true}
      className="max-w-2xl"
      bodyClassName="flex flex-col flex-1 min-h-0"
    >
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Alerte de confirmation */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Attention :</strong> Cette action est irréversible. 
              {isRevokeAll 
                ? " Toutes les permissions directes et temporaires seront définitivement révoquées."
                : " La permission sera définitivement révoquée."
              }
            </AlertDescription>
          </Alert>

          {/* Informations utilisateur */}
          <div className="border rounded-lg p-4 bg-muted/20">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium">Utilisateur concerné</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nom :</span>
                <span className="font-medium">{user.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email :</span>
                <span className="font-medium">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Détails de la permission (si révocation individuelle) */}
          {!isRevokeAll && permission && (
            <div className="border rounded-lg p-4 bg-destructive/5">
              <div className="flex items-center gap-2 mb-3">
                <Key className="h-4 w-4 text-destructive" />
                <span className="font-medium">Permission à révoquer</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{permission.permissionName}</span>
                  {permission.permissionType && (
                    <Badge 
                      variant={permission.permissionType === 'TEMPORARY' ? 'secondary' : 'default'} 
                      className="text-xs"
                    >
                      {permission.permissionType === 'TEMPORARY' ? 'Temporaire' : 'Direct'}
                    </Badge>
                  )}
                  {permission.isExpired && (
                    <Badge variant="destructive" className="text-xs">
                      Expiré
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Code: <span className="font-mono">{permission.permissionCode}</span>
                </p>
                
                {permission.permissionDescription && (
                  <p className="text-sm text-muted-foreground">
                    {permission.permissionDescription}
                  </p>
                )}

                {/* Informations temporelles */}
                {(permission.grantedAt || permission.validFrom || permission.expiresAt) && (
                  <div className="pt-2 border-t space-y-1">
                    {permission.grantedAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Accordé le {formatDateTime(permission.grantedAt).date} à {formatDateTime(permission.grantedAt).time}
                          {permission.grantedByName && ` par ${permission.grantedByName}`}
                        </span>
                      </div>
                    )}
                    {permission.validFrom && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          Valide depuis {formatDateTime(permission.validFrom).date} à {formatDateTime(permission.validFrom).time}
                        </span>
                      </div>
                    )}
                    {permission.expiresAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          Expire le {formatDateTime(permission.expiresAt).date} à {formatDateTime(permission.expiresAt).time}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {permission.reason && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Raison de l'attribution :</p>
                    <p className="text-sm bg-muted/50 p-2 rounded text-muted-foreground italic">
                      "{permission.reason}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Champ raison de révocation (optionnel) */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Raison de la révocation (optionnelle)
            </Label>
            <Textarea
              id="reason"
              placeholder="Expliquez pourquoi vous révoquez cette permission (audit, fin de mission, etc.)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Cette information sera conservée dans les logs d'audit
            </p>
          </div>

          {/* Résumé de l'action */}
          <div className="border rounded-lg p-4 bg-muted/10">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Résumé de l'action
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Action :</span>
                <span className="font-medium text-destructive">
                  {isRevokeAll ? "Révocation de toutes les permissions directes" : "Révocation d'une permission"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Utilisateur :</span>
                <span className="font-medium">{user.fullName}</span>
              </div>
              {!isRevokeAll && permission && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Permission :</span>
                  <span className="font-medium">{permission.permissionName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Raison :</span>
                <span className="font-medium">
                  {reason.trim() || "Non spécifiée"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer fixe */}
        <div className="flex-shrink-0 px-6 py-4 bg-muted/50 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground hidden sm:block">
              Cette action sera enregistrée dans les logs d'audit
            </p>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none min-w-[120px] h-10"
              >
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
              <Button 
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none min-w-[140px] h-10"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Révocation...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Révoquer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </BaseModal>
  );
}