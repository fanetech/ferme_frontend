"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Download, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { PricingSimulation } from "./PricingSimulation";

interface JsonPreviewProps {
  data: Record<string, any>;
  serviceId?: string;
}

export function JsonPreview({ data, serviceId }: JsonPreviewProps) {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);
  const dataCount = Object.keys(data).length;
  const hasData = dataCount > 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDataTypes = () => {
    const types: Record<string, number> = {};
    Object.values(data).forEach(value => {
      const type = typeof value;
      types[type] = (types[type] || 0) + 1;
    });
    return types;
  };

  const dataTypes = getDataTypes();

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Données JSON</h4>
          <p className="text-sm text-muted-foreground">
            {dataCount} champ{dataCount !== 1 ? 's' : ''} rempli{dataCount !== 1 ? 's' : ''}
          </p>
        </div>
        
        {hasData && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Télécharger
            </Button>
          </div>
        )}
      </div>

      {/* Types de données */}
      {hasData && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(dataTypes).map(([type, count]) => (
            <Badge key={type} variant="secondary" className="text-xs">
              {count} {type}{count > 1 ? 's' : ''}
            </Badge>
          ))}
        </div>
      )}

      {/* Contenu JSON */}
      <div className="space-y-2">
        {!hasData ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              Les données apparaîtront ici<br />
              lorsque vous remplirez les champs
            </p>
          </div>
        ) : (
          <>
            {/* Aperçu formaté */}
            <div className="bg-muted/30 rounded-lg p-4 border">
              <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                {jsonString}
              </pre>
            </div>

            {/* Validation JSON */}
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                ✅ JSON valide - {jsonString.length} caractères
              </AlertDescription>
            </Alert>

            {/* Résumé des données */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="font-medium">Résumé des données:</div>
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <code className="font-mono">{key}</code>
                  <span className="text-right">
                    {typeof value === 'string' && value.length > 20 
                      ? `"${value.substring(0, 20)}..."` 
                      : JSON.stringify(value)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Simulation de pricing */}
      {serviceId && hasData && (
        <PricingSimulation 
          serviceId={serviceId} 
          fieldData={data}
        />
      )}
    </div>
  );
}