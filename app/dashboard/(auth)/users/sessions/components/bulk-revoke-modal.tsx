"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield,
  Ban,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Clock
} from "lucide-react";

import { useRevokeMultipleSessions } from "@/data/sessions";
import type { RevokeMultipleSessionsResponse, RevokeSessionResult } from "@/types/sessions";
import AvePayLoader from "@/components/avepay-loader";

interface BulkRevokeModalProps {
  sessionIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BulkRevokeModal({ sessionIds, isOpen, onClose, onSuccess }: BulkRevokeModalProps) {
  const [reason, setReason] = useState("");
  const [results, setResults] = useState<RevokeMultipleSessionsResponse | null>(null);
  const [step, setStep] = useState<"confirm" | "processing" | "results">("confirm");

  const revokeMultipleMutation = useRevokeMultipleSessions();

  const handleConfirm = async () => {
    if (sessionIds.length === 0) return;

    setStep("processing");
    
    try {
      const response = await revokeMultipleMutation.mutateAsync({
        sessionIds,
        reason: reason.trim() || undefined
      });
      
      setResults(response);
      setStep("results");
      
      // Appeler onSuccess après un délai pour permettre à l'utilisateur de voir les résultats
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
      
    } catch (error) {
      console.error("Erreur lors de la révocation multiple:", error);
      setStep("confirm");
    }
  };

  const handleClose = () => {
    setStep("confirm");
    setReason("");
    setResults(null);
    onClose();
  };

  const getResultIcon = (result: RevokeSessionResult) => {
    return result.success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getResultBadge = (result: RevokeSessionResult) => {
    return result.success ? (
      <Badge className="bg-green-100 text-green-800">Succès</Badge>
    ) : (
      <Badge variant="destructive">Échec</Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-500" />
            {step === "confirm" && "Confirmer la révocation multiple"}
            {step === "processing" && "Révocation en cours..."}
            {step === "results" && "Résultats de la révocation"}
          </DialogTitle>
        </DialogHeader>

        {step === "confirm" && (
          <div className="space-y-6">
            {/* Avertissement */}
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Attention</h4>
                <p className="text-sm text-red-700">
                  Cette action va révoquer {sessionIds.length} session{sessionIds.length > 1 ? 's' : ''} 
                  et déconnecter immédiatement les utilisateurs concernés.
                </p>
              </div>
            </div>

            {/* Informations */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{sessionIds.length}</div>
                  <div className="text-sm text-muted-foreground">Sessions à révoquer</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">⚠️</div>
                  <div className="text-sm text-muted-foreground">Action irréversible</div>
                </CardContent>
              </Card>
            </div>

            {/* Raison optionnelle */}
            <div className="space-y-2">
              <Label htmlFor="reason">Raison de la révocation (optionnelle)</Label>
              <Textarea
                id="reason"
                placeholder="Ex: Suspicion d'activité malveillante, maintenance système, etc."
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
                disabled={revokeMultipleMutation.isPending}
              >
                <Ban className="h-4 w-4 mr-2" />
                Révoquer {sessionIds.length} session{sessionIds.length > 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-8">
              <AvePayLoader />
              <h3 className="text-lg font-medium mt-4">Révocation en cours...</h3>
              <p className="text-muted-foreground text-center">
                Révocation de {sessionIds.length} session{sessionIds.length > 1 ? 's' : ''} en cours. 
                Veuillez patienter...
              </p>
            </div>
          </div>
        )}

        {step === "results" && results && (
          <div className="space-y-6">
            {/* Résumé */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{results.totalRequested}</div>
                  <div className="text-sm text-muted-foreground">Total demandées</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{results.successfulRevocations}</div>
                  <div className="text-sm text-muted-foreground">Réussies</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{results.failedRevocations}</div>
                  <div className="text-sm text-muted-foreground">Échouées</div>
                </CardContent>
              </Card>
            </div>

            {/* Message de succès/échec global */}
            {results.failedRevocations === 0 ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium text-green-800">Révocation réussie</h4>
                  <p className="text-sm text-green-700">
                    Toutes les sessions ont été révoquées avec succès.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">Révocation partielle</h4>
                  <p className="text-sm text-orange-700">
                    {results.successfulRevocations} session{results.successfulRevocations > 1 ? 's' : ''} révoquée{results.successfulRevocations > 1 ? 's' : ''} 
                    avec succès, {results.failedRevocations} ont échoué.
                  </p>
                </div>
              </div>
            )}

            {/* Détails des résultats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Détail des révocations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {results.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getResultIcon(result)}
                        <div>
                          <div className="font-medium text-sm">Session {result.sessionId.slice(-8)}</div>
                          {result.userEmail && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {result.userEmail}
                            </div>
                          )}
                          {result.error && (
                            <div className="text-xs text-red-600 mt-1">
                              Erreur: {result.error}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getResultBadge(result)}
                        <div className="text-xs text-muted-foreground">{result.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end">
              <Button onClick={handleClose}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}