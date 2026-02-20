"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Globe, ArrowRight } from "lucide-react";

interface EndpointSelectorProps {
  endpoints: any[];
  selectedEndpointId: string;
  onEndpointChange: (endpointId: string) => void;
}

export function EndpointSelector({ 
  endpoints, 
  selectedEndpointId, 
  onEndpointChange 
}: EndpointSelectorProps) {
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
    }
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: "bg-green-100 text-green-800",
      POST: "bg-blue-100 text-blue-800",
      PUT: "bg-yellow-100 text-yellow-800",
      DELETE: "bg-red-100 text-red-800",
      PATCH: "bg-purple-100 text-purple-800"
    };
    
    return colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const selectedEndpoint = endpoints.find(ep => ep.id === selectedEndpointId);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        <Label className="text-base font-medium">
          Endpoint à tester
          <span className="text-red-500 ml-1">*</span>
        </Label>
      </div>

      <Select value={selectedEndpointId} onValueChange={onEndpointChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionnez un endpoint..." />
        </SelectTrigger>
        <SelectContent>
          {endpoints.map((endpoint) => {
            const endpointType = ENDPOINT_TYPES[endpoint.endpointType as keyof typeof ENDPOINT_TYPES];
            return (
              <SelectItem key={endpoint.id} value={endpoint.id}>
                <div className="flex items-center gap-2">
                  <span>{endpointType?.icon || '⚡'}</span>
                  <span className="font-medium">{endpoint.name}</span>
                  <Badge className={endpointType?.color || "bg-gray-100 text-gray-800"}>
                    {endpointType?.label || endpoint.endpointType}
                  </Badge>
                  <Badge className={getMethodBadge(endpoint.method)}>
                    {endpoint.method}
                  </Badge>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {selectedEndpoint && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
          <span className="font-medium">URL:</span>
          <code className="font-mono bg-background px-2 py-1 rounded text-xs">
            {selectedEndpoint.method} {selectedEndpoint.path}
          </code>
        </div>
      )}

      {endpoints.length === 0 && (
        <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-md">
          <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            Aucun endpoint configuré.<br />
            Configurez d'abord des endpoints dans l'onglet "Endpoints".
          </p>
        </div>
      )}
    </div>
  );
}