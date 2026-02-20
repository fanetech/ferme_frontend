"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X, User, Users, Settings, Shield, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useDeleteUser } from "@/data/users";
import type { User as UserType } from "@/types/users";
import { UserBadge } from "./user-badge";

interface UserDeleteDialogProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UserDeleteDialog({
  user,
  isOpen,
  onClose,
  onSuccess
}: UserDeleteDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  const deleteMutation = useDeleteUser();

  if (!user) return null;

  const isConfirmationValid = confirmationText === user.username;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  const handleDelete = async () => {
    if (!isConfirmationValid) return;
    
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(user.id);
      toast.success("Utilisateur supprimé avec succès");
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      const errorMessage = error?.response?.data?.message || "Erreur lors de la suppression";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmationText("");
      onClose();
    }
  };

  // Estimation de l'impact de la suppression
  const impactItems = [
    {
      icon: Users,
      label: "Sessions actives",
      count: user.activeSessions || 0,
      description: "sessions utilisateur qui seront terminées"
    },
    {
      icon: Shield,
      label: "Permissions assignées",
      count: user.permissions?.length || 0,
      description: "permissions directes assignées"
    },
    {
      icon: Settings,
      label: "Rôles assignés",
      count: user.roles?.length || 0,
      description: "rôles qui seront révoqués"
    }
  ];

  const hasImpact = impactItems.some(item => item.count > 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Supprimer l'utilisateur
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Toutes les données associées à cet utilisateur seront perdues.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations sur l'utilisateur */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.profilePictureUrl} alt={user.fullName || `${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{user.fullName || `${user.firstName} ${user.lastName}`}</h3>
                  <UserBadge status={user.accountStatus} />
                </div>
                <p className="text-sm text-muted-foreground">
                  @{user.username} • {user.email}
                </p>
                {user.structureName && (
                  <p className="text-sm text-muted-foreground">
                    {user.structureName}
                    {user.departmentName && ` • ${user.departmentName}`}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {user.userType}
                  </Badge>
                  {user.twoFactorEnabled && (
                    <Badge variant="default" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      2FA
                    </Badge>
                  )}
                  {user.emailVerified && (
                    <Badge variant="outline" className="text-xs">
                      Email vérifié
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Avertissement sur l'impact */}
          {hasImpact && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Attention !</strong> Cet utilisateur a des données associées. 
                Sa suppression peut affecter le fonctionnement du système.
              </AlertDescription>
            </Alert>
          )}

          {/* Détails de l'impact */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Impact de la suppression
            </h4>
            
            <div className="space-y-3">
              {impactItems.map((item, index) => {
                const ItemIcon = item.icon;
                const hasCount = item.count > 0;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <ItemIcon className={`h-4 w-4 ${hasCount ? 'text-destructive' : 'text-muted-foreground'}`} />
                      <div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <Badge variant={hasCount ? "destructive" : "outline"}>
                      {item.count}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {!hasImpact && (
              <p className="text-sm text-muted-foreground p-3 bg-muted/20 rounded-lg">
                ✅ Aucun impact majeur détecté. Cet utilisateur peut être supprimé en toute sécurité.
              </p>
            )}
          </div>

          {/* Informations supplémentaires */}
          {(user.lastLoginAt || user.createdAt) && (
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Informations temporelles:</span>
              </div>
              <div className="ml-6 space-y-1">
                {user.lastLoginAt && (
                  <div>Dernière connexion: {new Date(user.lastLoginAt).toLocaleString('fr-FR')}</div>
                )}
                {user.createdAt && (
                  <div>Compte créé le: {new Date(user.createdAt).toLocaleString('fr-FR')}</div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Confirmation */}
          <div className="space-y-3">
            <Label htmlFor="confirmation" className="text-sm font-medium">
              Pour confirmer la suppression, tapez le nom d'utilisateur :
            </Label>
            <div className="space-y-2">
              <div className="text-sm font-mono bg-muted p-2 rounded border">
                {user.username}
              </div>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Tapez le nom d'utilisateur"
                className={confirmationText && !isConfirmationValid ? "border-destructive" : ""}
              />
              {confirmationText && !isConfirmationValid && (
                <p className="text-sm text-destructive">
                  Le nom d'utilisateur ne correspond pas exactement
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmationValid || isDeleting}
            className="min-w-[120px]"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}