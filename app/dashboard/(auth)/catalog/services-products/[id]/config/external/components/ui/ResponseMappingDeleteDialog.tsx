"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Trash2, Loader2, MapPin, Type, Hash, Calculator, CheckCircle, Settings } from "lucide-react";
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

import { ResponseMapping, DataType } from "@/types/catalog";
import { useDeleteResponseMapping } from "@/data/catalog";
import { toast } from "sonner";

interface ResponseMappingDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  responseMapping: ResponseMapping;
  onSuccess: () => void;
}

export function ResponseMappingDeleteDialog({ 
  isOpen, 
  onClose, 
  responseMapping, 
  onSuccess 
}: ResponseMappingDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate: deleteMapping } = useDeleteResponseMapping();

  const handleDelete = async () => {
    setIsDeleting(true);
    
    deleteMapping({ 
      id: responseMapping.id, 
      endpointId: responseMapping.endpointConfigId 
    }, {
      onSuccess: () => {
        toast.success("Mapping supprimé avec succès");
        onSuccess();
        onClose();
      },
      onError: (error) => {
        toast.error(`Erreur lors de la suppression : ${error.message}`);
        setIsDeleting(false);
      }
    });
  };

  const getDataTypeIcon = (dataType: DataType) => {
    const icons = {
      [DataType.STRING]: <Type className="h-4 w-4" />,
      [DataType.INTEGER]: <Hash className="h-4 w-4" />,
      [DataType.DECIMAL]: <Calculator className="h-4 w-4" />,
      [DataType.BOOLEAN]: <CheckCircle className="h-4 w-4" />,
      [DataType.DATE]: <Settings className="h-4 w-4" />,
      [DataType.DATETIME]: <Settings className="h-4 w-4" />,
      [DataType.EMAIL]: <Type className="h-4 w-4" />,
      [DataType.PHONE]: <Type className="h-4 w-4" />,
      [DataType.URL]: <Type className="h-4 w-4" />,
      [DataType.JSON]: <Settings className="h-4 w-4" />
    };
    return icons[dataType] || <Settings className="h-4 w-4" />;
  };

  const getDataTypeBadge = (dataType: DataType) => {
    const colors = {
      [DataType.STRING]: "bg-blue-100 text-blue-800",
      [DataType.INTEGER]: "bg-green-100 text-green-800",
      [DataType.DECIMAL]: "bg-yellow-100 text-yellow-800",
      [DataType.BOOLEAN]: "bg-purple-100 text-purple-800",
      [DataType.DATE]: "bg-pink-100 text-pink-800",
      [DataType.DATETIME]: "bg-orange-100 text-orange-800",
      [DataType.EMAIL]: "bg-indigo-100 text-indigo-800",
      [DataType.PHONE]: "bg-teal-100 text-teal-800",
      [DataType.URL]: "bg-cyan-100 text-cyan-800",
      [DataType.JSON]: "bg-gray-100 text-gray-800"
    };
    
    const labels = {
      [DataType.STRING]: "Texte",
      [DataType.INTEGER]: "Nombre entier",
      [DataType.DECIMAL]: "Nombre décimal",
      [DataType.BOOLEAN]: "Booléen",
      [DataType.DATE]: "Date",
      [DataType.DATETIME]: "Date et heure",
      [DataType.EMAIL]: "Email",
      [DataType.PHONE]: "Téléphone",
      [DataType.URL]: "URL",
      [DataType.JSON]: "JSON"
    };
    
    return (
      <Badge className={colors[dataType] || "bg-gray-100 text-gray-800"}>
        {labels[dataType] || dataType}
      </Badge>
    );
  };

  const getMappingTypeIcon = () => {
    if (responseMapping.isAmount) return "💰";
    if (responseMapping.isReference) return "🔗";
    if (responseMapping.isStatus) return "✅";
    return "📝";
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Supprimer le mapping
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Le mapping sera définitivement supprimé.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Informations sur le mapping */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Mapping à supprimer</span>
            </div>
            
            <div className="space-y-3">
              {/* Nom et type */}
              <div className="flex items-center gap-2">
                {getDataTypeIcon(responseMapping.dataType)}
                <span className="font-medium">{responseMapping.displayName}</span>
                {getDataTypeBadge(responseMapping.dataType)}
                <span className="text-lg">{getMappingTypeIcon()}</span>
              </div>
              
              {/* Clé de données */}
              <div className="font-mono text-sm bg-background px-2 py-1 rounded border">
                {responseMapping.customDataKey}
              </div>
              
              {/* JSONPath */}
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">JSONPath:</span>
                <div className="font-mono bg-background px-2 py-1 rounded border mt-1">
                  {responseMapping.jsonPath}
                </div>
              </div>

              {/* Badges informatifs */}
              <div className="flex flex-wrap gap-1 mt-2">
                {responseMapping.isAmount && (
                  <Badge variant="outline" className="text-xs">
                    💰 Montant
                  </Badge>
                )}
                {responseMapping.isReference && (
                  <Badge variant="outline" className="text-xs">
                    🔗 Référence
                  </Badge>
                )}
                {responseMapping.isStatus && (
                  <Badge variant="outline" className="text-xs">
                    ✅ Statut
                  </Badge>
                )}
                {responseMapping.isRequired && (
                  <Badge variant="outline" className="text-xs">
                    Obligatoire
                  </Badge>
                )}
                {responseMapping.isEditable && (
                  <Badge variant="outline" className="text-xs">
                    Modifiable
                  </Badge>
                )}
                {responseMapping.isHidden && (
                  <Badge variant="outline" className="text-xs">
                    Caché
                  </Badge>
                )}
                {responseMapping.transformExpression && (
                  <Badge variant="outline" className="text-xs">
                    Transformation
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Avertissement */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Attention :</strong> Cette action supprimera définitivement le mapping et toutes ses configurations associées. 
              Les données déjà mappées ne seront plus extraites lors des prochaines réponses du service externe.
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