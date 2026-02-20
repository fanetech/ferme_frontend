"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PricingRuleCard } from "./PricingRuleCard";
import { DeleteConfirmationModal } from "../ui/DeleteConfirmationModal";
import { PricingRuleCardData } from "@/lib/utils/internalServiceTypes";

interface PricingRulesListProps {
  rules: PricingRuleCardData[];
  isLoading: boolean;
  onEdit: (rule: PricingRuleCardData) => void;
  onDelete: (ruleId: string) => Promise<void>;
  onCreateNew: () => void;
}

export function PricingRulesList({ 
  rules, 
  isLoading, 
  onEdit, 
  onDelete, 
  onCreateNew 
}: PricingRulesListProps) {
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    ruleId: string;
    ruleName: string;
  }>({
    isOpen: false,
    ruleId: "",
    ruleName: ""
  });

  const handleDeleteClick = (ruleId: string, ruleName: string) => {
    setDeleteModal({
      isOpen: true,
      ruleId,
      ruleName
    });
  };

  const handleDeleteConfirm = async () => {
    await onDelete(deleteModal.ruleId);
    setDeleteModal({
      isOpen: false,
      ruleId: "",
      ruleName: ""
    });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      ruleId: "",
      ruleName: ""
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Règles existantes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Chargement des règles...</div>
            </div>
          ) : rules?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune règle de pricing configurée</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={onCreateNew}
              >
                Créer la première règle
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {rules?.map((rule) => (
                <PricingRuleCard
                  key={rule.id}
                  rule={rule}
                  onEdit={onEdit}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la règle de pricing"
        description="Cette action supprimera définitivement la règle de pricing."
        itemName={deleteModal.ruleName}
      />
    </>
  );
}