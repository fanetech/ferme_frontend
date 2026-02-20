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
  Monitor, 
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  User,
  X,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import type { User as UserType } from "@/types/users";
import type { ActiveSession } from "@/types/user-sessions";
import { useRevokeSession, useRevokeAllUserSessions } from "@/data/users";

interface RevokeSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  session?: ActiveSession; // undefined pour "révoquer toutes"
  onSuccess?: () => void;
}

export function RevokeSessionModal({
  isOpen,
  onClose,
  user,
  session,
  onSuccess
}: RevokeSessionModalProps) {
  const [reason, setReason] = useState("");
  
  const revokeSessionMutation = useRevokeSession();
  const revokeAllSessionsMutation = useRevokeAllUserSessions();
  
  const isRevokeAll = !session;
  const isSubmitting = revokeSessionMutation.isPending || revokeAllSessionsMutation.isPending;

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
      case 'web':
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isRevokeAll) {
        await revokeAllSessionsMutation.mutateAsync({
          userId: user.id,
          reason: reason || undefined
        });
        toast.success("Toutes les sessions ont été révoquées avec succès");
      } else {
        await revokeSessionMutation.mutateAsync({
          sessionId: session!.sessionId,
          reason: reason || undefined
        });
        toast.success(`Session révoquée avec succès`);
      }

      onSuccess?.();
      handleClose();
      
    } catch (error) {
      console.error('Erreur lors de la révocation:', error);
      toast.error("Erreur lors de la révocation de la session");
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-destructive" />
          <span>{isRevokeAll ? "Révoquer toutes les sessions" : "Révoquer la session"}</span>
        </div>
      }
      subtitle={`Révocation ${isRevokeAll ? "de toutes les sessions actives" : "d'une session"} pour ${user.fullName}`}
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
                ? " L'utilisateur sera immédiatement déconnecté de tous ses appareils."
                : " L'utilisateur sera immédiatement déconnecté de cet appareil."
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

          {/* Détails de la session (si révocation individuelle) */}
          {!isRevokeAll && session && (
            <div className="border rounded-lg p-4 bg-destructive/5">
              <div className="flex items-center gap-2 mb-3">
                {getDeviceIcon(session.deviceType)}
                <span className="font-medium">Session à révoquer</span>
                {session.isCurrentSession && (
                  <Badge variant="default" className="text-xs">
                    Session actuelle
                  </Badge>
                )}
                {session.isSuspicious && (
                  <Badge variant="destructive" className="text-xs">
                    Suspecte
                  </Badge>
                )}
              </div>
              
              <div className="space-y-3">
                {/* Device Info */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Appareil</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type :</span>
                      <span className="ml-2 font-medium">{session.deviceType}</span>
                    </div>
                    {session.deviceName && (
                      <div>
                        <span className="text-muted-foreground">Nom :</span>
                        <span className="ml-2 font-medium">{session.deviceName}</span>
                      </div>
                    )}
                    {session.operatingSystem && (
                      <div>
                        <span className="text-muted-foreground">OS :</span>
                        <span className="ml-2 font-medium">{session.operatingSystem}</span>
                      </div>
                    )}
                    {session.browser && (
                      <div>
                        <span className="text-muted-foreground">Navigateur :</span>
                        <span className="ml-2 font-medium">{session.browser}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Info */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Localisation</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">IP :</span>
                      <span className="ml-2 font-mono text-xs">{session.ipAddress}</span>
                    </div>
                    {session.location && (
                      <div>
                        <span className="text-muted-foreground">Lieu :</span>
                        <span className="ml-2">{session.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timing Info */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Temporalité</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Créée le :</span>
                      <span className="ml-2">{formatDateTime(session.createdAt).date} à {formatDateTime(session.createdAt).time}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Durée :</span>
                      <span className="ml-2">{formatDuration(session.durationMinutes)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dernier accès :</span>
                      <span className="ml-2">{formatDateTime(session.lastAccessAt).date} à {formatDateTime(session.lastAccessAt).time}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Accès :</span>
                      <span className="ml-2">{session.accessCount} fois</span>
                    </div>
                  </div>
                </div>
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
              placeholder="Expliquez pourquoi vous révoquez cette session (activité suspecte, fin de mission, etc.)..."
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
                  {isRevokeAll ? "Révocation de toutes les sessions actives" : "Révocation d'une session"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Utilisateur :</span>
                <span className="font-medium">{user.fullName}</span>
              </div>
              {!isRevokeAll && session && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Appareil :</span>
                  <span className="font-medium">{session.deviceName || session.deviceType}</span>
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