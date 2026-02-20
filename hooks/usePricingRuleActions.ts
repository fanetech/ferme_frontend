import { useState } from "react";
import { 
  useCreatePricingRule, 
  useUpdatePricingRule, 
  useDeletePricingRule 
} from "@/data/catalog";
import { PricingRuleFormData } from "@/lib/utils/formValidators";

export const usePricingRuleActions = (serviceId: string) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  const createMutation = useCreatePricingRule();
  const updateMutation = useUpdatePricingRule();
  const deleteMutation = useDeletePricingRule();

  const createPricingRule = async (data: PricingRuleFormData) => {
    setIsCreating(true);
    try {
      await createMutation.mutateAsync({
        ...data,
        serviceId,
      });
      return true;
    } catch (error) {
      console.error("Error creating pricing rule:", error);
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const updatePricingRule = async (ruleId: string, data: PricingRuleFormData) => {
    setIsUpdating(true);
    try {
      await updateMutation.mutateAsync({
        id: ruleId,
        data: {
          ...data,
          serviceId,
        }
      });
      return true;
    } catch (error) {
      console.error("Error updating pricing rule:", error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deletePricingRule = async (ruleId: string) => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({id : ruleId , serviceId : serviceId});
      return true;
    } catch (error) {
      console.error("Error deleting pricing rule:", error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const startEdit = (rule: any) => {
    setEditingRule(rule);
  };

  const cancelEdit = () => {
    setEditingRule(null);
  };

  return {
    // États
    isCreating,
    isUpdating,
    isDeleting,
    editingRule,
    
    // Actions
    createPricingRule,
    updatePricingRule,
    deletePricingRule,
    startEdit,
    cancelEdit,
    
    // Flags de statut
    isLoading: isCreating || isUpdating || isDeleting,
  };
};