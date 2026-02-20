"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Trash2, Loader2, Globe, Shield } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

import { EndpointConfig } from "@/types/catalog";
import { useDeleteEndpointConfig } from "@/data/catalog";
import { toast } from "sonner";

interface EndpointDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  endpoint: EndpointConfig;
  onSuccess: () => void;
}

export function EndpointDeleteDialog({ 
  isOpen, 
  onClose, 
  endpoint, 
  onSuccess 
}: EndpointDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate: deleteEndpoint } = useDeleteEndpointConfig();

  const handleDelete = async () => {
    setIsDeleting(true);
    
    deleteEndpoint(
      { 
        id: endpoint.id, 
        configId: endpoint.serviceConfigId 
      }, 
      {
        onSuccess: () => {
          onSuccess();
          onClose();
        },
        onError: (error) => {
          setIsDeleting(false);
        }
      }
    );
  };

  const getEndpointTypeBadge = (type: string) => {
    const colors = {
      CONSULTATION: "bg-blue-100 text-blue-800",
      VALIDATION: "bg-green-100 text-green-800",
      VERIFICATION: "bg-purple-100 text-purple-800",
      CANCELLATION: "bg-orange-100 text-orange-800",
      WEBHOOK: "bg-pink-100 text-pink-800",
      REFUND: "bg-red-100 text-red-800"
    };
    
    const labels = {
      CONSULTATION: "Consultation",
      VALIDATION: "Validation",
      VERIFICATION: "Vérification",
      CANCELLATION: "Annulation",
      WEBHOOK: "Webhook",
      REFUND: "Remboursement"
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: "bg-green-100 text-green-800",
      POST: "bg-blue-100 text-blue-800",
      PUT: "bg-yellow-100 text-yellow-800",
      DELETE: "bg-red-100 text-red-800",
      PATCH: "bg-purple-100 text-purple-800"
    };
    
    return (
      <Badge className={colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {method}
      </Badge>
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Supprimer l'endpoint
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. L'endpoint sera définitivement supprimé.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Informations sur l'endpoint */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Endpoint à supprimer</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getEndpointTypeBadge(endpoint.endpointType)}
                {getMethodBadge(endpoint.method)}
              </div>
              
              <div className="font-mono text-sm bg-background px-2 py-1 rounded">
                {endpoint.path}
              </div>
              
              {endpoint.authRequired && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  Authentification requise
                </div>
              )}
            </div>
          </div>

          {/* Avertissement */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Attention :</strong> Cette action supprimera définitivement l'endpoint et toutes ses configurations associées.
            </AlertDescription>
          </Alert>
        </div>

        <Separator />

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isDeleting}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}