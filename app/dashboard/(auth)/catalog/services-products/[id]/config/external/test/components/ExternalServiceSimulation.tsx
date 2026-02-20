"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChevronDown, 
  Clock,
  Zap,
  RefreshCw,
  FileText,
  Code,
  Monitor,
  Globe,
  MapPin,
  Activity,
  Database
} from "lucide-react";
import { useSimulateExternalService } from "@/data/catalog";
import type { ExternalServiceSimulationResultDto } from "@/data/catalog";

interface ExternalServiceSimulationProps {
  endpointId: string;
  requestData: Record<string, any>;
  disabled?: boolean;
}

export function ExternalServiceSimulation({ endpointId, requestData, disabled }: ExternalServiceSimulationProps) {
  const [result, setResult] = useState<ExternalServiceSimulationResultDto | null>(null);
  const [displayMode, setDisplayMode] = useState<"ui" | "json">("ui");
  
  const simulateMutation = useSimulateExternalService();

  const handleSimulate = async () => {
    try {
      const response = await simulateMutation.mutateAsync({
        endpointId,
        fieldData: requestData,
        simulationMode: true,
      });
      
      setResult(response);
    } catch (error) {
      console.error("Erreur simulation:", error);
    }
  };

  const reset = () => {
    setResult(null);
  };

  const hasRequiredData = () => {
    return Object.values(requestData).some(value => value !== "" && value !== null && value !== undefined);
  };

  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-100 text-green-800">✅ {statusCode}</Badge>;
    } else if (statusCode >= 400) {
      return <Badge className="bg-red-100 text-red-800">❌ {statusCode}</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">⚠️ {statusCode}</Badge>;
    }
  };

  const getMappingStatusIcon = (success: boolean) => {
    return success ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getEndpointTypeIcon = (type: string) => {
    const icons = {
      'CONSULTATION': '🔍',
      'VALIDATION': '✅', 
      'TRANSACTION': '💳',
      'NOTIFICATION': '📢',
      'CALLBACK': '🔄',
      'WEBHOOK': '🪝'
    };
    return icons[type as keyof typeof icons] || '🌐';
  };

  return (
    <div className="space-y-4 min-w-0 w-full overflow-hidden">
      <Separator />
      
      {/* Bouton de simulation */}
      <div className="space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Simulation du service externe
        </h4>
        
        <Button
          onClick={handleSimulate}
          disabled={disabled || !hasRequiredData() || simulateMutation.isPending}
          className="w-full gap-2"
          size="lg"
        >
          {simulateMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Simulation en cours...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              🚀 Simuler l'appel externe
            </>
          )}
        </Button>
        
        {/* Switch d'affichage */}
        {result && (
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="text-sm font-medium">Mode d'affichage</span>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <Switch
                checked={displayMode === "json"}
                onCheckedChange={(checked) => setDisplayMode(checked ? "json" : "ui")}
              />
              <Code className="h-4 w-4" />
            </div>
          </div>
        )}
        
        {!hasRequiredData() && (
          <p className="text-xs text-muted-foreground text-center">
            Remplissez au moins un champ pour simuler
          </p>
        )}
      </div>

      {/* Erreur de simulation */}
      {simulateMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors de la simulation. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      )}

      {/* Résultats */}
      {result && (
        <Card className="border-2 min-w-0 w-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <CardTitle className="text-lg flex items-center gap-2 min-w-0 truncate">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                Résultat de la simulation
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={reset} className="flex-shrink-0">
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="flex items-center gap-2 min-w-0">
              <span className="flex-shrink-0">{getEndpointTypeIcon(result.endpointConfig?.endpointType || 'UNKNOWN')}</span>
              <span className="truncate">{result.endpointConfig?.endpointType || 'Service'} • ID: {result.debugMetadata?.requestId || 'N/A'}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 min-w-0">
            {/* Affichage JSON */}
            {displayMode === "json" && (
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-4 w-4" />
                  <span className="text-sm font-medium">Réponse JSON complète</span>
                </div>
                <ScrollArea className="h-96">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-words overflow-hidden max-w-full">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            )}

            {/* Affichage UI */}
            {displayMode === "ui" && (
              <>
                {/* Réponse HTTP */}
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Réponse HTTP
                    </h5>
                    {getStatusBadge(result.responseDebug?.httpStatus || 500)}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Temps:</span>
                      <span className="font-mono flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {result.metrics?.totalNetworkTimeMs || 0}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taille:</span>
                      <span className="font-mono">{result.responseDebug?.responseSizeBytes || 0} bytes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-mono">{result.responseDebug?.contentType || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Statistiques de validation */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded">
                    <div className="text-lg font-semibold text-green-700">{result.validation?.validFieldsCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Champs valides</div>
                  </div>
                  <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded">
                    <div className="text-lg font-semibold text-red-700">{result.validation?.invalidFieldsCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Champs invalides</div>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <div className="text-lg font-semibold">{result.validation?.totalFieldsValidated || 0}</div>
                    <div className="text-xs text-muted-foreground">Total champs</div>
                  </div>
                </div>

                {/* Message d'erreur principal */}
                {result.message && !result.success && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Erreur de simulation:</strong> {result.message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Message de succès */}
                {result.success && result.message && (
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      <strong>Simulation réussie:</strong> {result.message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Données extraites (en cas de succès) */}
                {result.success && result.data && result.data.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      <Database className="h-4 w-4 text-green-600" />
                      Données extraites ({result.data.length})
                    </h5>
                    <div className="space-y-2">
                      {result.data.map((item, index) => (
                        <div key={`${item.key}-${index}`} className="flex justify-between items-center p-3 bg-white dark:bg-gray-900 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{item.displayName}</span>
                            <Badge variant="outline" className="text-xs">
                              {item.dataType}
                            </Badge>
                            {item.isAmount && (
                              <Badge className="bg-green-100 text-green-800 text-xs">💰</Badge>
                            )}
                            {item.isReference && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">🔗</Badge>
                            )}
                          </div>
                          <div className="text-right min-w-0">
                            <span className="font-mono text-sm break-words">
                              {item.dataType === 'BOOLEAN' ? (item.value ? '✅' : '❌') : 
                               item.dataType === 'DECIMAL' && item.isAmount ? `${item.value}` :
                               JSON.stringify(item.value)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Données de requête */}
                {result.requestDebug && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Données de requête envoyées
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-2 min-w-0">
                        <span className="text-sm text-muted-foreground flex-shrink-0">URL:</span>
                        <code className="text-sm font-mono truncate min-w-0">{result.requestDebug.endpointUrl}</code>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Méthode:</span>
                        <Badge variant="outline">{result.requestDebug.httpMethod}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Timeout:</span>
                        <span className="text-sm">{result.requestDebug.timeoutMs}ms</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Données brutes envoyées */}
                {result.requestDebug?.rawFieldData && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
                      <h5 className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        Données brutes envoyées ({Object.keys(result.requestDebug.rawFieldData).length} champs)
                      </h5>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="pt-2">
                      <div className="bg-muted/30 rounded-lg p-4">
                        <pre className="text-xs font-mono whitespace-pre-wrap break-words overflow-hidden max-w-full">
                          {JSON.stringify(result.requestDebug.rawFieldData, null, 2)}
                        </pre>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Debug logs */}
                {result.debugLogs && result.debugLogs.length > 0 && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
                      <h5 className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Logs de debug ({result.debugLogs.length})
                      </h5>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="pt-2">
                      <div className="bg-muted/30 rounded-lg p-4 space-y-1">
                        {result.debugLogs.map((log, index) => (
                          <div key={index} className="text-xs font-mono text-muted-foreground">
                            {log}
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Métriques de performance */}
                {result.metrics && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
                      <h5 className="font-medium flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4" />
                        Métriques de performance
                      </h5>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="pt-2">
                      <div className="bg-muted/30 rounded p-3 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span>Temps d'exécution total:</span>
                          <span className="font-mono">{result.metrics.executionTimeMs}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Temps réseau:</span>
                          <span className="font-mono">{result.metrics.totalNetworkTimeMs}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Temps de validation:</span>
                          <span className="font-mono">{result.validation?.validationTimeMs || 0}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Temps de transformation:</span>
                          <span className="font-mono">{result.transformation?.transformationTimeMs || 0}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nombre de tentatives:</span>
                          <span className="font-mono">{result.metrics.attemptCount}</span>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Métadonnées */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h5 className="font-medium mb-2">Métadonnées</h5>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex justify-between">
                      <span>Exécuté le:</span>
                      <span className="font-mono">{result.metrics?.executionStartTime || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between gap-2 min-w-0">
                      <span className="flex-shrink-0">ID de requête:</span>
                      <code className="font-mono truncate min-w-0">{result.debugMetadata?.requestId || 'N/A'}</code>
                    </div>
                    <div className="flex justify-between gap-2 min-w-0">
                      <span className="flex-shrink-0">Config de service:</span>
                      <code className="font-mono truncate min-w-0">{result.debugMetadata?.serviceConfigId || 'N/A'}</code>
                    </div>
                    <div className="flex justify-between">
                      <span>Mode simulation:</span>
                      <Badge variant={result.debugMetadata?.simulationMode ? "secondary" : "default"}>
                        {result.debugMetadata?.simulationMode ? "Simulation" : "Production"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}