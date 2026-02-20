"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Database, 
  AlertCircle, 
  Settings, 
  ArrowRight,
  BookOpen
} from "lucide-react";

// Types et hooks
import { ServiceProduct } from "@/types/catalog";
import { useEndpointConfigs } from "@/data/catalog";
import { ResponseMappingsList } from "./cards/ResponseMappingsList";
import AvePayLoader from "@/components/avepay-loader";

interface ResponseMappingsTabProps {
  serviceProduct: ServiceProduct;
  serviceConfig?: any;
  isLoading?: boolean;
}

export function ResponseMappingsTab({ serviceProduct, serviceConfig, isLoading }: ResponseMappingsTabProps) {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>("");
  const { data: endpoints = [], isLoading: isLoadingEndpoints } = useEndpointConfigs(
    serviceConfig?.id || "", 
    !!serviceConfig?.id
  );

  const selectedEndpoint = endpoints.find(ep => ep.id === selectedEndpointId);

  // Configuration des types d'endpoints
  const ENDPOINT_TYPES = {
    CONSULTATION: {
      icon: '🔍',
      color: 'bg-blue-100 text-blue-800',
      label: 'Consultation'
    },
    VALIDATION: {
      icon: '✅',
      color: 'bg-purple-100 text-purple-800',
      label: 'Validation'
    },
    VERIFICATION: {
      icon: '🔍',
      color: 'bg-indigo-100 text-indigo-800',
      label: 'Vérification'
    },
    CANCELLATION: {
      icon: '❌',
      color: 'bg-red-100 text-red-800',
      label: 'Annulation'
    },
    WEBHOOK: {
      icon: '🔗',
      color: 'bg-cyan-100 text-cyan-800',
      label: 'Webhook'
    },
    REFUND: {
      icon: '💰',
      color: 'bg-orange-100 text-orange-800',
      label: 'Remboursement'
    },
    AUTHENTICATION: {
      icon: '🔑',
      color: 'bg-indigo-100 text-indigo-800',
      label: 'Authentification'
    },
    PING: {
      icon: '📡',
      color: 'bg-gray-100 text-gray-800',
      label: 'Ping'
    }
  };

  const getEndpointTypeIcon = (type: string) => {
    return ENDPOINT_TYPES[type as keyof typeof ENDPOINT_TYPES]?.icon || '⚡';
  };

  const getEndpointTypeBadge = (type: string) => {
    return ENDPOINT_TYPES[type as keyof typeof ENDPOINT_TYPES]?.color || 'bg-gray-100 text-gray-800';
  };

  // Sélectionner le premier endpoint par défaut
  const defaultEndpoint = endpoints.length > 0 ? endpoints[0] : null;
  const currentEndpointId = selectedEndpointId || defaultEndpoint?.id || "";

  if (isLoading || isLoadingEndpoints) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Mappings de réponse</h2>
        </div>
        <div className="flex justify-center items-center py-8">
          <AvePayLoader />
        </div>
      </div>
    );
  }

  // Vérification de sécurité pour serviceConfig
  if (!serviceConfig) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Mappings de réponse</h2>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Configuration de service non disponible. Veuillez vérifier que le service est correctement configuré.
          </AlertDescription>
        </Alert>
      </div>
    );
  }


  if (endpoints.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Mappings de réponse</h2>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Aucun endpoint configuré. Vous devez d'abord créer des endpoints dans l'onglet "Endpoints" 
            avant de pouvoir configurer les mappings de réponse.
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Database className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-medium">Aucun endpoint disponible</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Les mappings de réponse permettent d'extraire et de structurer les données retournées par vos services externes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête et sélecteur d'endpoint */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mappings de réponse
            </h2>
            <p className="text-sm text-muted-foreground">
              Configuration du mapping des données de réponse des services externes
            </p>
          </div>
        </div>

        {/* Sélecteur d'endpoint */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4" />
              Sélection de l'endpoint
            </CardTitle>
            <CardDescription>
              Choisissez l'endpoint pour lequel vous souhaitez configurer les mappings de réponse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Select value={currentEndpointId} onValueChange={setSelectedEndpointId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un endpoint..." />
                  </SelectTrigger>
                  <SelectContent>
                    {endpoints.map((endpoint) => (
                      <SelectItem key={endpoint.id} value={endpoint.id}>
                        <div className="flex items-center gap-2">
                          <span>{getEndpointTypeIcon(endpoint.endpointType)}</span>
                          <span>{endpoint.name}</span>
                          <Badge className={getEndpointTypeBadge(endpoint.endpointType)}>
                            {endpoint.endpointType}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {endpoints.find(ep => ep.id === currentEndpointId) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                  <span className="font-mono">{endpoints.find(ep => ep.id === currentEndpointId)?.path}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info sur les mappings */}
        {currentEndpointId && (
          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertDescription>
              <strong>À propos des mappings :</strong> Les mappings permettent d'extraire des valeurs spécifiques 
              de la réponse JSON du service externe en utilisant des expressions JSONPath (ex: $.data.amount). 
              Vous pouvez ensuite catégoriser ces données (montants, références, statuts) et appliquer des transformations.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Liste des mappings pour l'endpoint sélectionné */}
      {currentEndpointId ? (
        <ResponseMappingsList
          serviceConfig={serviceConfig}
          endpointId={currentEndpointId}
          endpointType={endpoints.find(ep => ep.id === currentEndpointId)?.endpointType as any}
          onUpdate={() => {}}
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-medium">Sélectionnez un endpoint</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Choisissez l'endpoint pour lequel vous souhaitez configurer les mappings de réponse.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}