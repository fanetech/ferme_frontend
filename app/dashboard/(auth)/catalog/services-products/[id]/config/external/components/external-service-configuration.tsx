"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceProduct } from "@/types/catalog";
import { 
  Settings, 
  Globe, 
  Database,
  ArrowUpDown
} from "lucide-react";

// Import des composants des tabs
import { ServiceInfoTab } from "./ServiceInfoTab";
import { EndpointsTab } from "./EndpointsTab";
import { DataFieldsTab } from "./DataFieldsTab";
import { ResponseMappingsTab } from "./ResponseMappingsTab";
import { ExternalServiceTestSheet } from "../test/components/ExternalServiceTestSheet";
import { useGetOrCreateServiceConfig, useServiceConfig } from "@/data/catalog";

interface ExternalServiceConfigurationProps {
  serviceProduct: ServiceProduct;
}

export function ExternalServiceConfiguration({ serviceProduct }: ExternalServiceConfigurationProps) {
  // Faire la requête une seule fois au niveau parent avec la condition hasConfiguration
  const { data: serviceConfig, isLoading } = useServiceConfig(
    serviceProduct.id,
    serviceProduct.hasConfiguration
  );

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton de test */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Configuration du service externe</h2>
          <p className="text-sm text-muted-foreground">
            Configurez les endpoints, mappings API et authentification
          </p>
        </div>
        <ExternalServiceTestSheet serviceProduct={serviceProduct} serviceConfig={serviceConfig} />
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Informations
          </TabsTrigger>
          <TabsTrigger value="endpoints" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="fields" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Champs
          </TabsTrigger>
          <TabsTrigger value="mappings" className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Mappings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <ServiceInfoTab 
            serviceProduct={serviceProduct} 
            serviceConfig={serviceConfig}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="endpoints">
          <EndpointsTab 
            serviceProduct={serviceProduct} 
            serviceConfig={serviceConfig}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="fields">
          <DataFieldsTab 
            serviceProduct={serviceProduct} 
            serviceConfig={serviceConfig}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="mappings">
          <ResponseMappingsTab 
            serviceProduct={serviceProduct} 
            serviceConfig={serviceConfig}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}