"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Settings } from "lucide-react";
import { ServiceProduct } from "@/types/catalog";
import { EndpointsList } from "./cards/EndpointsList";
import AvePayLoader from "@/components/avepay-loader";

interface EndpointsTabProps {
  serviceProduct: ServiceProduct;
  serviceConfig?: any;
  isLoading?: boolean;
}

export function EndpointsTab({ serviceProduct, serviceConfig, isLoading }: EndpointsTabProps) {

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <AvePayLoader />
        </CardContent>
      </Card>
    );
  }

  if (!serviceConfig) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Gestion des endpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Configuration requise</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Vous devez d'abord configurer les informations de base du service externe 
              dans l'onglet "Informations" avant de pouvoir créer des endpoints.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <EndpointsList serviceConfig={serviceConfig} />;
}