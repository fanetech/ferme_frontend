"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { ArrowRight, MapPin, AlertCircle, CheckCircle, Copy } from "lucide-react";
import { useResponseMappings } from "@/data/catalog";
import { Button } from "@/components/ui/button";

interface ResponseMappingsPreviewProps {
  endpointId: string;
  response?: any;
  mode?: "compact" | "results" | "full";
}

export function ResponseMappingsPreview({ 
  endpointId, 
  response,
  mode = "full"
}: ResponseMappingsPreviewProps) {
  const [mappedValues, setMappedValues] = useState<Record<string, any>>({});
  const [copied, setCopied] = useState(false);

  const { data: mappings = [] } = useResponseMappings(
    endpointId,
    !!endpointId
  );

  // Appliquer les mappings quand on a une réponse
  useEffect(() => {
    if (response && response.data && mappings.length > 0) {
      const mapped: Record<string, any> = {};
      
      mappings.forEach(mapping => {
        try {
          // Extraire la valeur en utilisant le jsonPath
          const value = extractValueFromPath(response.data, mapping.jsonPath);
          
          // Appliquer les transformations si nécessaire
          const transformedValue = applyTransformation(value, mapping.transformation);
          
          mapped[mapping.fieldKey] = {
            value: transformedValue,
            originalValue: value,
            mappingType: mapping.mappingType,
            fieldName: mapping.fieldName,
            transformation: mapping.transformation
          };
        } catch (error) {
          console.error(`Erreur lors du mapping de ${mapping.fieldKey}:`, error);
          mapped[mapping.fieldKey] = {
            error: true,
            message: "Erreur lors de l'extraction"
          };
        }
      });
      
      setMappedValues(mapped);
    }
  }, [response, mappings]);

  // Fonction pour extraire une valeur depuis un chemin JSON
  const extractValueFromPath = (data: any, path: string): any => {
    // Enlever le $ initial si présent
    const cleanPath = path.startsWith('$.') ? path.substring(2) : path;
    
    // Diviser le chemin et naviguer dans l'objet
    const parts = cleanPath.split('.');
    let current = data;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  };

  // Fonction pour appliquer les transformations
  const applyTransformation = (value: any, transformation?: string): any => {
    if (!transformation || !value) return value;
    
    switch (transformation) {
      case "UPPERCASE":
        return typeof value === 'string' ? value.toUpperCase() : value;
      case "LOWERCASE":
        return typeof value === 'string' ? value.toLowerCase() : value;
      case "TRIM":
        return typeof value === 'string' ? value.trim() : value;
      case "TO_NUMBER":
        return parseFloat(value);
      case "TO_STRING":
        return String(value);
      case "TO_BOOLEAN":
        return Boolean(value);
      default:
        return value;
    }
  };

  const getMappingTypeBadge = (type: string) => {
    const config = {
      AMOUNT: { color: "bg-green-100 text-green-800", icon: "💰" },
      REFERENCE: { color: "bg-blue-100 text-blue-800", icon: "🔖" },
      STATUS: { color: "bg-purple-100 text-purple-800", icon: "📊" },
      TIMESTAMP: { color: "bg-orange-100 text-orange-800", icon: "⏰" },
      OTHER: { color: "bg-gray-100 text-gray-800", icon: "📌" }
    };
    
    const mappingConfig = config[type as keyof typeof config] || config.OTHER;
    return (
      <Badge className={mappingConfig.color}>
        {mappingConfig.icon} {type}
      </Badge>
    );
  };

  const handleCopyMappedData = async () => {
    try {
      const cleanData: Record<string, any> = {};
      Object.entries(mappedValues).forEach(([key, data]) => {
        if (!data.error) {
          cleanData[key] = data.value;
        }
      });
      
      await navigator.clipboard.writeText(JSON.stringify(cleanData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
    }
  };

  if (mappings.length === 0) {
    if (mode === "compact") {
      return (
        <div className="text-sm text-muted-foreground">
          Aucun mapping configuré pour cet endpoint
        </div>
      );
    }
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Aucun mapping configuré</h3>
        <p className="text-sm">
          Configurez d'abord les mappings de réponse<br />
          dans l'onglet "Mappings".
        </p>
      </div>
    );
  }

  // Mode compact : affichage simple des mappings attendus
  if (mode === "compact") {
    return (
      <div className="space-y-2">
        {mappings.slice(0, 5).map((mapping) => (
          <div key={mapping.id} className="flex items-center gap-2 text-sm">
            <span className="text-lg">
              {mapping.isAmount ? "💰" : mapping.isReference ? "🔗" : mapping.isStatus ? "✅" : "📝"}
            </span>
            <span className="font-medium">{mapping.displayName}</span>
            <code className="bg-muted px-1 rounded text-xs">{mapping.jsonPath}</code>
          </div>
        ))}
        {mappings.length > 5 && (
          <div className="text-xs text-muted-foreground">
            +{mappings.length - 5} autre{mappings.length > 6 ? 's' : ''} mapping{mappings.length > 6 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }

  // Mode results : affichage des valeurs extraites après simulation
  if (mode === "results" && response) {
    return (
      <div className="space-y-3">
        {mappings.map((mapping) => {
          const mappedData = mappedValues[mapping.customDataKey];
          
          return (
            <div key={mapping.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {mapping.isAmount ? "💰" : mapping.isReference ? "🔗" : mapping.isStatus ? "✅" : "📝"}
                </span>
                <span className="font-medium">{mapping.displayName}</span>
              </div>
              <div className="text-right">
                {mappedData && !mappedData.error ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-mono text-sm">
                      {JSON.stringify(mappedData.value)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-muted-foreground">Non trouvé</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        <div className="text-xs text-muted-foreground text-center pt-2">
          {Object.values(mappedValues).filter(v => !v.error).length} sur {mappings.length} valeur(s) extraite(s)
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Mappings configurés ({mappings.length})
        </h4>
        
        {mappings.map((mapping) => (
          <Card key={mapping.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{mapping.displayName}</span>
                  {getMappingTypeBadge(mapping.isAmount ? "AMOUNT" : mapping.isReference ? "REFERENCE" : mapping.isStatus ? "STATUS" : "OTHER")}
                </div>
                <div className="text-xs text-muted-foreground">
                  <code className="bg-muted px-1 rounded">{mapping.jsonPath}</code>
                  {mapping.transformExpression && (
                    <>
                      <ArrowRight className="h-3 w-3 inline mx-1" />
                      <Badge variant="outline" className="text-xs">
                        {mapping.transformExpression}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                En attente de réponse...
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Valeurs extraites
        </h4>
        {Object.keys(mappedValues).length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMappedData}
            className="gap-2"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                Copié
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copier
              </>
            )}
          </Button>
        )}
      </div>

      {mappings.map((mapping) => {
        const mappedData = mappedValues[mapping.fieldKey];
        
        return (
          <Card key={mapping.id} className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{mapping.fieldName}</span>
                  {getMappingTypeBadge(mapping.mappingType)}
                </div>
                {mappedData && !mappedData.error && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                <code className="bg-muted px-1 rounded">{mapping.jsonPath}</code>
                {mapping.transformation && (
                  <>
                    <ArrowRight className="h-3 w-3 inline mx-1" />
                    <Badge variant="outline" className="text-xs">
                      {mapping.transformation}
                    </Badge>
                  </>
                )}
              </div>

              {mappedData ? (
                mappedData.error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{mappedData.message}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="bg-muted/50 rounded p-3 font-mono text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Valeur:</span>
                      <span className="font-medium">
                        {JSON.stringify(mappedData.value)}
                      </span>
                    </div>
                    {mappedData.transformation && mappedData.originalValue !== mappedData.value && (
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-muted-foreground">Original:</span>
                        <span>{JSON.stringify(mappedData.originalValue)}</span>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="text-sm text-muted-foreground">
                  Valeur non trouvée dans la réponse
                </div>
              )}
            </div>
          </Card>
        );
      })}

      {/* Résumé des données extraites */}
      {Object.keys(mappedValues).length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {Object.values(mappedValues).filter(v => !v.error).length} valeur(s) extraite(s) avec succès
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}