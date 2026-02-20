"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Trash2, Loader2, Database, Type } from "lucide-react";
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

import { ServiceDataField } from "@/types/catalog";
import { useDeleteDataField } from "@/data/catalog";
import { toast } from "sonner";

interface DataFieldDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dataField: ServiceDataField;
  onSuccess: () => void;
}

export function DataFieldDeleteDialog({ 
  isOpen, 
  onClose, 
  dataField, 
  onSuccess 
}: DataFieldDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate: deleteField } = useDeleteDataField();

  const handleDelete = async () => {
    setIsDeleting(true);
    
    deleteField({ id : dataField.id , endpointId : dataField?.endpointConfigId }, {
      onSuccess: () => {
        toast.success("Champ supprimé avec succès");
        onSuccess();
        onClose();
      },
      onError: (error) => {
        toast.error(`Erreur lors de la suppression : ${error.message}`);
        setIsDeleting(false);
      }
    });
  };

  const getDataTypeBadge = (dataType: string) => {
    const colors = {
      STRING: "bg-blue-100 text-blue-800",
      INTEGER: "bg-green-100 text-green-800",
      DECIMAL: "bg-yellow-100 text-yellow-800",
      BOOLEAN: "bg-purple-100 text-purple-800",
      DATE: "bg-pink-100 text-pink-800",
      DATETIME: "bg-orange-100 text-orange-800",
      EMAIL: "bg-indigo-100 text-indigo-800",
      PHONE: "bg-teal-100 text-teal-800",
      URL: "bg-cyan-100 text-cyan-800",
      JSON: "bg-gray-100 text-gray-800"
    };
    
    const labels = {
      STRING: "Texte",
      INTEGER: "Nombre entier",
      DECIMAL: "Nombre décimal",
      BOOLEAN: "Booléen",
      DATE: "Date",
      DATETIME: "Date et heure",
      EMAIL: "Email",
      PHONE: "Téléphone",
      URL: "URL",
      JSON: "JSON"
    };
    
    return (
      <Badge className={colors[dataType as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {labels[dataType as keyof typeof labels] || dataType}
      </Badge>
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Supprimer le champ
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Le champ sera définitivement supprimé.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Informations sur le champ */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Champ à supprimer</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{dataField.label}</span>
                {getDataTypeBadge(dataField.dataType)}
              </div>
              
              <div className="font-mono text-sm bg-background px-2 py-1 rounded">
                {dataField.key}
              </div>
              
              {dataField.description && (
                <div className="text-sm text-muted-foreground">
                  {dataField.description}
                </div>
              )}

              <div className="flex gap-1 mt-2">
                {dataField.isRequired && (
                  <Badge variant="outline" className="text-xs">
                    Requis
                  </Badge>
                )}
                {dataField.isReadonly && (
                  <Badge variant="outline" className="text-xs">
                    Lecture seule
                  </Badge>
                )}
                {dataField.isHidden && (
                  <Badge variant="outline" className="text-xs">
                    Caché
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Avertissement */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Attention :</strong> Cette action supprimera définitivement le champ et toutes ses configurations associées.
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