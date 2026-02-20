"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Tag } from "lucide-react";
import { FormModal } from "@/components/ui/modal/FormModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useDeleteCategory } from "@/data/organization";
import type { Category } from "@/types/organization";
import { getCategoryIcon } from "@/lib/constants/category-icons";

interface CategoryDeleteDialogProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CategoryDeleteDialog({
  category,
  isOpen,
  onClose,
  onSuccess
}: CategoryDeleteDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  
  const deleteMutation = useDeleteCategory();

  if (!category) return null;

  const isConfirmationValid = confirmationText === category.name;
  const categoryIcon = getCategoryIcon(category.icon);
  const IconComponent = categoryIcon.component;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmationValid) return;
    
    try {
      await deleteMutation.mutateAsync(category.id);
      toast.success("Catégorie supprimée avec succès");
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error);
      const errorMessage = error?.response?.data?.message || "Erreur lors de la suppression";
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!deleteMutation.isPending) {
      setConfirmationText("");
      onClose();
    }
  };

  // Estimation de l'impact de la suppression
  const hasImpact = (category.totalServices || 0) > 0;

  const titleIcon = (
    <div className="p-2.5 bg-destructive/10 rounded-lg shadow-sm">
      <Trash2 className="h-5 w-5 text-destructive" />
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Supprimer la catégorie"
      titleIcon={titleIcon}
      subtitle={`Vous êtes sur le point de supprimer la catégorie ${category.name}.`}
      onSubmit={handleSubmit}
      submitLabel="Supprimer la catégorie"
      isSubmitting={deleteMutation.isPending}
      isDirty={confirmationText.length > 0}
      size="md"
      footerNote="Cette action est irréversible."
    >
      <div className="space-y-6">
        {/* Informations sur la catégorie */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: category.color || "#007bff" }}
            >
              <IconComponent className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{category.name}</h3>
                <Badge variant={category.status === "ACTIVE" ? "default" : "secondary"}>
                  {category.status === "ACTIVE" ? "Actif" : "Inactif"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Code: {category.code}
              </p>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Avertissement sur l'impact */}
        {hasImpact && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Attention !</strong> Cette catégorie est utilisée par {category.totalServices} service(s). 
              Sa suppression peut affecter le fonctionnement du système.
            </AlertDescription>
          </Alert>
        )}

        {!hasImpact && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Aucun impact détecté. Cette catégorie peut être supprimée en toute sécurité.
            </AlertDescription>
          </Alert>
        )}

        {/* Confirmation */}
        <div className="space-y-3">
          <Label htmlFor="confirmation" className="text-sm font-medium">
            Pour confirmer la suppression, tapez le nom de la catégorie :
          </Label>
          <div className="space-y-2">
            <div className="text-sm font-mono bg-muted p-2 rounded border">
              {category.name}
            </div>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Tapez le nom de la catégorie"
              className={confirmationText && !isConfirmationValid ? "border-destructive" : ""}
            />
            {confirmationText && !isConfirmationValid && (
              <p className="text-sm text-destructive">
                Le nom ne correspond pas exactement
              </p>
            )}
          </div>
        </div>
      </div>
    </FormModal>
  );
}