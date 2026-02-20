"use client";

import { useState } from "react";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Ban } from "lucide-react";

import { useRevokeSession } from "@/data/sessions";

interface SingleRevokeModalProps {
  sessionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SingleRevokeModal({ sessionId, isOpen, onClose, onSuccess }: SingleRevokeModalProps) {
  const [reason, setReason] = useState("");
  
  const revokeSessionMutation = useRevokeSession();

  const handleConfirm = async () => {
    if (!sessionId) return;

    try {
      await revokeSessionMutation.mutateAsync(sessionId);
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("Erreur lors de la révocation:", error);
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Confirmer la révocation"
      titleIcon={<Ban className="h-5 w-5 text-red-500" />}
      size="sm"
      noPadding={true}
      contentClassName={"overflow-y-auto p-3"}
    >
      <div className="space-y-6">
        {/* Avertissement */}
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
              <h4 className="font-medium text-red-800">Attention</h4>
              <p className="text-sm text-red-700">
                Cette action va révoquer la session et déconnecter immédiatement l'utilisateur.
              </p>
            </div>
          </div>

          {/* Raison optionnelle */}
          <div className="space-y-2">
            <Label htmlFor="reason">Raison de la révocation (optionnelle)</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Suspicion d'activité malveillante, demande de l'utilisateur, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Cette raison sera enregistrée dans les logs d'audit pour traçabilité.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirm}
              disabled={revokeSessionMutation.isPending}
            >
              <Ban className="h-4 w-4 mr-2" />
              {revokeSessionMutation.isPending ? "Révocation..." : "Révoquer la session"}
            </Button>
          </div>
        </div>
    </BaseModal>
  );
}