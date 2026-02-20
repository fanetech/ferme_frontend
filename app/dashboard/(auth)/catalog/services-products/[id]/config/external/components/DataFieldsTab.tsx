"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Database, Settings, Globe } from "lucide-react";
import { ServiceProduct } from "@/types/catalog";
import { useEndpointConfigs } from "@/data/catalog";
import { DataFieldsList } from "./cards/DataFieldsList";
import AvePayLoader from "@/components/avepay-loader";

interface DataFieldsTabProps {
  serviceProduct: ServiceProduct;
  serviceConfig?: any;
  isLoading?: boolean;
}

export function DataFieldsTab({ serviceProduct, serviceConfig, isLoading }: DataFieldsTabProps) {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>("");
  const { data: endpoints = [], isLoading: isLoadingEndpoints } = useEndpointConfigs(
    serviceConfig?.id || "", 
    !!serviceConfig?.id
  );

  // Sélectionner le premier endpoint par défaut
  const defaultEndpoint = endpoints.length > 0 ? endpoints[0] : null;
  const currentEndpointId = selectedEndpointId || defaultEndpoint?.id || "";

  if (isLoading || isLoadingEndpoints) {
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
            <Database className="h-5 w-5" />
            Champs de données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Configuration requise</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Vous devez d'abord configurer les informations de base du service externe 
              dans l'onglet "Informations" avant de pouvoir configurer les champs de données.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (endpoints.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Champs de données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Endpoints requis</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Vous devez d'abord créer des endpoints dans l'onglet "Endpoints" 
              avant de pouvoir configurer les champs de données.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEndpointTypeBadge = (type: string) => {
    const colors = {
      CONSULTATION: "bg-blue-100 text-blue-800",
      VALIDATION: "bg-green-100 text-green-800",
      VERIFICATION: "bg-purple-100 text-purple-800",
      CANCELLATION: "bg-orange-100 text-orange-800",
      WEBHOOK: "bg-pink-100 text-pink-800",
      REFUND: "bg-red-100 text-red-800"
    };
    
    const labels = {
      CONSULTATION: "Consultation",
      VALIDATION: "Validation",
      VERIFICATION: "Vérification",
      CANCELLATION: "Annulation",
      WEBHOOK: "Webhook",
      REFUND: "Remboursement"
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: "bg-green-100 text-green-800",
      POST: "bg-blue-100 text-blue-800",
      PUT: "bg-yellow-100 text-yellow-800",
      DELETE: "bg-red-100 text-red-800",
      PATCH: "bg-purple-100 text-purple-800"
    };
    
    return (
      <Badge className={colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {method}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Sélecteur d'endpoint */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Champs de données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Sélectionnez un endpoint pour configurer ses champs de données
              </label>
              <Select 
                value={currentEndpointId} 
                onValueChange={setSelectedEndpointId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un endpoint" />
                </SelectTrigger>
                <SelectContent>
                  {endpoints.map((endpoint) => (
                    <SelectItem key={endpoint.id} value={endpoint.id}>
                      <div className="flex items-center gap-2">
                        {getEndpointTypeBadge(endpoint.endpointType)}
                        {getMethodBadge(endpoint.method)}
                        <span className="font-mono text-sm">{endpoint.path}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentEndpointId && (
              <div className="text-sm text-muted-foreground">
                Configuration des champs pour l'endpoint sélectionné
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des champs pour l'endpoint sélectionné */}
      {currentEndpointId && (
        <DataFieldsList 
          serviceConfig={serviceConfig} 
          endpointId={currentEndpointId}
        />
      )}
    </div>
  );
}