"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCalculationFields, useCreateCalculationField, useUpdateCalculationField, useDeleteCalculationField } from "@/data/catalog";
import { CalculationFieldModal } from "./modals/CalculationFieldModal";
import { CalculationFieldsList } from "./cards/CalculationFieldsList";
import { CalculationFieldFormData } from "@/lib/utils/formValidators";
import { ServiceProduct } from "@/types/catalog";

interface CalculationFieldsTabProps {
  serviceProduct: ServiceProduct;
}

export function CalculationFieldsTab({ serviceProduct }: CalculationFieldsTabProps) {
  const [showCreateField, setShowCreateField] = useState(false);
  const [showEditField, setShowEditField] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  
  const { data: calculationFields, isLoading: isLoadingFields } = useCalculationFields(serviceProduct.id);
  const { mutate: createCalculationField, isPending: isCreating } = useCreateCalculationField();
  const { mutate: updateCalculationField, isPending: isUpdating } = useUpdateCalculationField();
  const { mutate: deleteCalculationField, isPending: isDeleting } = useDeleteCalculationField();

  const handleCreateField = async (data: CalculationFieldFormData) => {
    return new Promise<void>((resolve, reject) => {
      createCalculationField({
        ...data,
        serviceId: serviceProduct.id,
        key: data.fieldKey,
        dataType: data.fieldType,
        calculationRole: data.fieldRole,
      }, {
        onSuccess: () => {
          setShowCreateField(false);
          resolve();
        },
        onError: (error) => {
          console.error("Error creating calculation field:", error);
          reject(error);
        }
      });
    });
  };

  const handleUpdateField = async (data: CalculationFieldFormData) => {
    if (!editingField) return;
    
    return new Promise<void>((resolve, reject) => {
      updateCalculationField({
        id: editingField.id,
        data: {
          ...data,
          serviceId: serviceProduct.id,
          key: data.fieldKey,
          dataType: data.fieldType,
          calculationRole: data.fieldRole,
        }
      }, {
        onSuccess: () => {
          setShowEditField(false);
          setEditingField(null);
          resolve();
        },
        onError: (error) => {
          console.error("Error updating calculation field:", error);
          reject(error);
        }
      });
    });
  };

  const handleDeleteField = async (fieldId: string) => {
    return new Promise<void>((resolve, reject) => {
      deleteCalculationField({ id : fieldId , serviceId : serviceProduct?.id }, {
        onSuccess: () => {
          resolve();
        },
        onError: (error) => {
          console.error("Error deleting calculation field:", error);
          reject(error);
        }
      });
    });
  };

  const handleEditField = (field: any) => {
    setEditingField(field);
    setShowEditField(true);
  };

  const handleCancelEdit = () => {
    setShowEditField(false);
    setEditingField(null);
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Champs de calcul</h3>
          <p className="text-sm text-muted-foreground">
            Définissez les champs utilisés pour les calculs de prix
          </p>
        </div>
        <Button onClick={() => setShowCreateField(true)}>
          Créer un champ
        </Button>
      </div>

      {/* Liste des champs */}
      <CalculationFieldsList
        fields={calculationFields || []}
        isLoading={isLoadingFields}
        onEdit={handleEditField}
        onDelete={handleDeleteField}
        onCreateNew={() => setShowCreateField(true)}
      />

      {/* Modal de création */}
      <CalculationFieldModal
        isOpen={showCreateField}
        onClose={() => setShowCreateField(false)}
        onSubmit={handleCreateField}
        isLoading={isCreating}
      />

      {/* Modal d'édition */}
      <CalculationFieldModal
        isOpen={showEditField}
        onClose={handleCancelEdit}
        onSubmit={handleUpdateField}
        initialData={editingField}
        isLoading={isUpdating}
      />
    </div>
  );
}