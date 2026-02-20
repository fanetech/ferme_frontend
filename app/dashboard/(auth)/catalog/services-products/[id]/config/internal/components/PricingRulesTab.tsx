"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePricingRules, useCalculationFields } from "@/data/catalog";
import { usePricingRuleActions } from "@/hooks/usePricingRuleActions";
import { PricingRuleModal } from "./modals/PricingRuleModal";
import { PricingRulesList } from "./cards/PricingRulesList";
import { PricingRuleFormData } from "@/lib/utils/formValidators";
import { ServiceProduct } from "@/types/catalog";

interface PricingRulesTabProps {
  serviceProduct: ServiceProduct;
}

export function PricingRulesTab({ serviceProduct }: PricingRulesTabProps) {
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [showEditRule, setShowEditRule] = useState(false);
  
  const { data: pricingRules, isLoading: isLoadingRules } = usePricingRules(serviceProduct.id);
  const { data: calculationFields } = useCalculationFields(serviceProduct.id);
  
  const {
    createPricingRule,
    updatePricingRule,
    deletePricingRule,
    editingRule,
    startEdit,
    cancelEdit,
    isLoading: isActionLoading
  } = usePricingRuleActions(serviceProduct.id);

  const handleCreateRule = async (data: PricingRuleFormData) => {
    const success = await createPricingRule({
      ...data,
      value: data.pricingType === "FORMULA" ? 1 : data.value,
    });
    if (success) {
      setShowCreateRule(false);
    }
  };

  const handleUpdateRule = async (data: PricingRuleFormData) => {
    if (!editingRule) return;
    
    const success = await updatePricingRule(editingRule.id, data);
    if (success) {
      setShowEditRule(false);
      cancelEdit();
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    await deletePricingRule(ruleId);
  };

  const handleEditRule = (rule: any) => {
    startEdit(rule);
    setShowEditRule(true);
  };

  const handleCancelEdit = () => {
    setShowEditRule(false);
    cancelEdit();
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Règles de pricing</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les règles de tarification pour ce service
          </p>
        </div>
        <Button onClick={() => setShowCreateRule(true)}>
          Créer une règle
        </Button>
      </div>

      {/* Liste des règles */}
      <PricingRulesList
        rules={pricingRules || []}
        isLoading={isLoadingRules}
        onEdit={handleEditRule}
        onDelete={handleDeleteRule}
        onCreateNew={() => setShowCreateRule(true)}
      />

      {/* Modal de création */}
      <PricingRuleModal
        isOpen={showCreateRule}
        onClose={() => setShowCreateRule(false)}
        onSubmit={handleCreateRule}
        calculationFields={calculationFields || []}
        isLoading={isActionLoading}
      />

      {/* Modal d'édition */}
      <PricingRuleModal
        isOpen={showEditRule}
        onClose={handleCancelEdit}
        onSubmit={handleUpdateRule}
        calculationFields={calculationFields || []}
        initialData={editingRule}
        isLoading={isActionLoading}
      />
    </div>
  );
}