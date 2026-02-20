"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Loader2, AlertTriangle, Users, Shield } from "lucide-react";
import { useRole, useDeleteRole, useActiveRoles } from "@/data/roles";
import { useToast } from "@/hooks/use-toast";

interface DeleteRoleModalProps {
  roleId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteRoleModal({ roleId, isOpen, onClose, onSuccess }: DeleteRoleModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [reassignToRoleId, setReassignToRoleId] = useState<string>("");
  
  const { data: role } = useRole(roleId || "", !!roleId);
  const { data: activeRoles } = useActiveRoles(isOpen && !!role?.userCount);
  const deleteRoleMutation = useDeleteRole();
  const { toast } = useToast();

  const availableRoles = activeRoles?.filter(r => r.id !== roleId) || [];
  const hasUsers = role && role.userCount > 0;
  const canDelete = role?.canBeDeleted;
  const confirmTextExpected = role?.name || "";
  const isConfirmValid = confirmText === confirmTextExpected;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role || !isConfirmValid) return;

    // Si le rôle a des utilisateurs, on doit spécifier un rôle de réassignation
    if (hasUsers && !reassignToRoleId) {
      toast({
        title: "Erreur",
        description: "Vous devez sélectionner un rôle de réassignation pour les utilisateurs.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteRoleMutation.mutateAsync({
        id: role.id,
        reassignToRoleId: reassignToRoleId || undefined
      });

      toast({
        title: "Rôle supprimé",
        description: hasUsers 
          ? `Le rôle "${role.displayName}" a été supprimé et ${role.userCount} utilisateur(s) ont été réassignés.`
          : `Le rôle "${role.displayName}" a été supprimé avec succès.`,
      });

      handleClose();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le rôle. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setConfirmText("");
    setReassignToRoleId("");
    onClose();
  };

  if (!role) return null;

  if (!canDelete) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              Rôle protégé
            </DialogTitle>
            <DialogDescription>
              Ce rôle ne peut pas être supprimé.
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Le rôle "{role.displayName}" est un rôle système ou protégé qui ne peut pas être supprimé. 
              Ces rôles sont essentiels au fonctionnement de l'application.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button onClick={handleClose}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Supprimer le rôle
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Confirmez la suppression du rôle "{role.displayName}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Alertes */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Attention !</strong> Cette action supprimera définitivement le rôle et ne peut pas être annulée.
            </AlertDescription>
          </Alert>

          {hasUsers && (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Ce rôle est actuellement assigné à <strong>{role.userCount} utilisateur(s)</strong>. 
                Vous devez sélectionner un rôle de réassignation ci-dessous.
              </AlertDescription>
            </Alert>
          )}

          {/* Informations du rôle */}
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Rôle à supprimer</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nom:</span>
                <span className="font-mono">{role.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Affichage:</span>
                <span>{role.displayName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Utilisateurs:</span>
                <span>{role.userCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Permissions:</span>
                <span>{role.permissionCount}</span>
              </div>
            </div>
          </div>

          {/* Réassignation des utilisateurs */}
          {hasUsers && (
            <div className="space-y-2">
              <Label htmlFor="reassignRole">Rôle de réassignation *</Label>
              <Select value={reassignToRoleId} onValueChange={setReassignToRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un rôle pour réassigner les utilisateurs" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((availableRole) => (
                    <SelectItem key={availableRole.id} value={availableRole.id}>
                      <div className="flex items-center gap-2">
                        <span>{availableRole.displayName}</span>
                        <span className="text-xs text-muted-foreground">({availableRole.name})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Les {role.userCount} utilisateur(s) actuellement assignés à ce rôle seront automatiquement 
                réassignés au rôle sélectionné.
              </p>
            </div>
          )}

          {/* Confirmation */}
          <div className="space-y-2">
            <Label htmlFor="confirm">
              Tapez <code className="bg-muted px-1 py-0.5 rounded text-sm">{confirmTextExpected}</code> pour confirmer
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Tapez "${confirmTextExpected}" ici`}
              className={confirmText && !isConfirmValid ? "border-red-500" : ""}
            />
            {confirmText && !isConfirmValid && (
              <p className="text-sm text-red-500">
                Le texte de confirmation ne correspond pas
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={deleteRoleMutation.isPending}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="destructive"
            disabled={
              deleteRoleMutation.isPending || 
              !isConfirmValid || 
              (hasUsers && !reassignToRoleId)
            }
          >
            {deleteRoleMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer définitivement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}