"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceProduct } from "@/types/catalog";
import { PricingRulesTab } from "./PricingRulesTab";
import { CalculationFieldsTab } from "./CalculationFieldsTab";
import { FieldTestSheet } from "../test/components/FieldTestSheet";
import { useCalculationFields } from "@/data/catalog";

interface InternalServiceConfigurationProps {
  serviceProduct: ServiceProduct;
}

export function InternalServiceConfiguration({ serviceProduct }: InternalServiceConfigurationProps) {
  const { data: calculationFields = [] } = useCalculationFields(serviceProduct.id);

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton de test */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Configuration du service interne</h2>
          <p className="text-sm text-muted-foreground">
            Configurez les champs de calcul et les règles de pricing
          </p>
        </div>
        <FieldTestSheet 
          serviceProduct={serviceProduct} 
          calculationFields={calculationFields}
        />
      </div>

      <Tabs defaultValue="fields" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fields">Champs de calcul</TabsTrigger>
          <TabsTrigger value="pricing">Règles de pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="fields">
          <CalculationFieldsTab serviceProduct={serviceProduct} />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingRulesTab serviceProduct={serviceProduct} />
        </TabsContent>
      </Tabs>
    </div>
  );
}