"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormModal } from "@/components/ui/modal/FormModal";
import { Form } from "@/components/ui/form";
import { CalculationFieldForm } from "../forms/CalculationFieldForm";
import { calculationFieldSchema, CalculationFieldFormData, CalculationFieldRole } from "@/lib/utils/formValidators";
import { DataType } from "@/types/catalog";
import { Calculator } from "lucide-react";

interface CalculationFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CalculationFieldFormData) => Promise<void>;
  initialData?: Partial<CalculationFieldFormData>;
  isLoading?: boolean;
}

export function CalculationFieldModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false
}: CalculationFieldModalProps) {
  const [options, setOptions] = useState<Array<{value: string, label: string}>>([]);
  const [fieldMode, setFieldMode] = useState<"text" | "select" | "checkbox">("text");

  const isEditing = !!initialData?.fieldName;

  const form = useForm<CalculationFieldFormData>({
    resolver: zodResolver(calculationFieldSchema),
    defaultValues: {
      fieldName: initialData?.fieldName || "",
      fieldKey: initialData?.fieldKey || "",
      fieldType: initialData?.fieldType || DataType.STRING,
      fieldRole: initialData?.fieldRole || CalculationFieldRole.INPUT,
      label: initialData?.label || "",
      description: initialData?.description || "",
      isRequired: initialData?.isRequired || false,
      isAmountField: initialData?.isAmountField || false,
      isBaseAmount: initialData?.isBaseAmount || false,
      defaultValue: initialData?.defaultValue || "",
      placeholder: initialData?.placeholder || "",
      validationRules: initialData?.validationRules || "",
      displayOrder: initialData?.displayOrder || 0,
      isVisible: initialData?.isVisible || true,
      formula: initialData?.formula || "",
      minValue: "",
      maxValue: "",
      minLength: "",
      maxLength: "",
    },
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
    control,
    setValue,
    getValues,
    watch,
    reset
  } = form;

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      reset({
        fieldName: initialData?.fieldName || "",
        fieldKey: initialData?.fieldKey || "",
        fieldType: initialData?.fieldType || DataType.STRING,
        fieldRole: initialData?.fieldRole || CalculationFieldRole.INPUT,
        label: initialData?.label || "",
        description: initialData?.description || "",
        isRequired: initialData?.isRequired || false,
        isAmountField: initialData?.isAmountField || false,
        isBaseAmount: initialData?.isBaseAmount || false,
        defaultValue: initialData?.defaultValue || "",
        placeholder: initialData?.placeholder || "",
        validationRules: initialData?.validationRules || "",
        displayOrder: initialData?.displayOrder || 0,
        isVisible: initialData?.isVisible || true,
        formula: initialData?.formula || "",
        minValue: "",
        maxValue: "",
        minLength: "",
        maxLength: "",
      });

      // Reset options and field mode
      setOptions([]);
      setFieldMode("text");
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (data: CalculationFieldFormData) => {
    // Construire les règles de validation
    const validationRules: any = {};

    // Ajouter les options si en mode select
    if (fieldMode === "select" && options.length > 0) {
      validationRules.options = options;
    }

    // Ajouter les règles min/max pour les nombres
    const fieldType = getValues("fieldType");
    if (fieldType === DataType.INTEGER || fieldType === DataType.DECIMAL) {
      const minValue = getValues("minValue");
      const maxValue = getValues("maxValue");
      if (minValue) validationRules.min = minValue;
      if (maxValue) validationRules.max = maxValue;
    }

    // Ajouter les règles min/max length pour les strings
    if (fieldType === DataType.STRING) {
      const minLength = getValues("minLength");
      const maxLength = getValues("maxLength");
      if (minLength) validationRules.minLength = parseInt(minLength);
      if (maxLength) validationRules.maxLength = parseInt(maxLength);
    }

    // Sauvegarder les règles si elles existent
    if (Object.keys(validationRules).length > 0) {
      data.validationRules = JSON.stringify(validationRules);
    }

    await onSubmit(data);
  };

  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <Calculator className="h-5 w-5 text-primary" />
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Modifier le champ de calcul" : "Créer un champ de calcul"}
      titleIcon={titleIcon}
      subtitle={isEditing ? "Modifiez les paramètres du champ" : "Ajoutez un nouveau champ pour les calculs de prix"}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitLabel={isEditing ? "Mettre à jour le champ" : "Créer le champ"}
      isSubmitting={isLoading || isSubmitting}
      isDirty={isDirty}
      footerNote={isEditing ? "Les modifications seront appliquées immédiatement" : "Le champ sera ajouté à la configuration du service"}
    >
      <Form {...form}>
        <CalculationFieldForm
          control={control}
          setValue={setValue}
          getValues={getValues}
          watch={watch}
          initialData={initialData}
          options={options}
          setOptions={setOptions}
          fieldMode={fieldMode}
          setFieldMode={setFieldMode}
        />
      </Form>
    </FormModal>
  );
}
