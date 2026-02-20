"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormModal } from "@/components/ui/modal/FormModal";
import { Form } from "@/components/ui/form";
import { PricingRuleForm } from "../forms/PricingRuleForm";
import { pricingRuleSchema, PricingRuleFormData } from "@/lib/utils/formValidators";
import { CalculationFieldCardData } from "@/lib/utils/internalServiceTypes";
import { PricingType } from "@/types/catalog";
import { DollarSign } from "lucide-react";

interface PricingRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PricingRuleFormData) => Promise<void>;
  calculationFields: CalculationFieldCardData[];
  initialData?: Partial<PricingRuleFormData>;
  isLoading?: boolean;
}

export function PricingRuleModal({
  isOpen,
  onClose,
  onSubmit,
  calculationFields,
  initialData,
  isLoading = false
}: PricingRuleModalProps) {
  const isEditing = !!initialData?.ruleName;

  const form = useForm<PricingRuleFormData>({
    resolver: zodResolver(pricingRuleSchema),
    defaultValues: {
      ruleName: initialData?.ruleName || "",
      description: initialData?.description || "",
      pricingType: initialData?.pricingType || PricingType.FIXED_AMOUNT,
      value: initialData?.value,
      conditions: initialData?.conditions || "",
      customFormula: initialData?.customFormula || "",
      formulaVariables: initialData?.formulaVariables || "",
      priority: initialData?.priority || 10,
      applyOrder: initialData?.applyOrder || 1,
      validFrom: initialData?.validFrom || "",
      validTo: initialData?.validTo || "",
      maxApplications: initialData?.maxApplications || undefined,
      isCumulative: initialData?.isCumulative ?? true,
      isActive: initialData?.isActive ?? true,
    },
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
    control,
    setValue,
    watch,
    reset
  } = form;

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      reset({
        ruleName: initialData?.ruleName || "",
        description: initialData?.description || "",
        pricingType: initialData?.pricingType || PricingType.FIXED_AMOUNT,
        value: initialData?.value,
        conditions: initialData?.conditions || "",
        customFormula: initialData?.customFormula || "",
        formulaVariables: initialData?.formulaVariables || "",
        priority: initialData?.priority || 10,
        applyOrder: initialData?.applyOrder || 1,
        validFrom: initialData?.validFrom || "",
        validTo: initialData?.validTo || "",
        maxApplications: initialData?.maxApplications || undefined,
        isCumulative: initialData?.isCumulative ?? true,
        isActive: initialData?.isActive ?? true,
      });
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = async (data: PricingRuleFormData) => {
    await onSubmit(data);
  };

  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <DollarSign className="h-5 w-5 text-primary" />
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Modifier la règle de tarification" : "Créer une règle de tarification"}
      titleIcon={titleIcon}
      subtitle={isEditing ? "Modifiez les paramètres de la règle" : "Configurez une nouvelle règle pour vos calculs de prix"}
      onSubmit={handleSubmit(handleFormSubmit)}
      submitLabel={isEditing ? "Mettre à jour la règle" : "Créer la règle"}
      isSubmitting={isLoading || isSubmitting}
      isDirty={isDirty}
      footerNote={isEditing ? "Les modifications seront appliquées immédiatement" : "La règle sera ajoutée à la configuration du service"}
    >
      <Form {...form}>
        <PricingRuleForm
          control={control}
          setValue={setValue}
          watch={watch}
          calculationFields={calculationFields}
        />
      </Form>
    </FormModal>
  );
}
