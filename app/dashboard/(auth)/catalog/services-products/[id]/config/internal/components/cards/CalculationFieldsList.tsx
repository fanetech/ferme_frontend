"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculationFieldCard } from "./CalculationFieldCard";
import { DeleteConfirmationModal } from "../ui/DeleteConfirmationModal";
import { CalculationFieldCardData } from "@/lib/utils/internalServiceTypes";

interface CalculationFieldsListProps {
  fields: CalculationFieldCardData[];
  isLoading: boolean;
  onEdit: (field: CalculationFieldCardData) => void;
  onDelete: (fieldId: string) => Promise<void>;
  onCreateNew: () => void;
}

export function CalculationFieldsList({ 
  fields, 
  isLoading, 
  onEdit, 
  onDelete, 
  onCreateNew 
}: CalculationFieldsListProps) {
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    fieldId: string;
    fieldName: string;
  }>({
    isOpen: false,
    fieldId: "",
    fieldName: ""
  });

  const handleDeleteClick = (fieldId: string, fieldName: string) => {
    setDeleteModal({
      isOpen: true,
      fieldId,
      fieldName
    });
  };

  const handleDeleteConfirm = async () => {
    await onDelete(deleteModal.fieldId);
    setDeleteModal({
      isOpen: false,
      fieldId: "",
      fieldName: ""
    });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      fieldId: "",
      fieldName: ""
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Champs configurés</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Chargement des champs...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {fields?.map((field) => (
                <CalculationFieldCard
                  key={field.id}
                  field={field}
                  onEdit={onEdit}
                  onDelete={handleDeleteClick}
                />
              ))}

              {(!fields || fields.length === 0) && (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">Aucun champ configuré</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={onCreateNew}
                  >
                    Créer le premier champ
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le champ de calcul"
        description="Cette action supprimera définitivement le champ de calcul."
        itemName={deleteModal.fieldName}
      />
    </>
  );
}