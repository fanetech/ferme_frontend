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
  Calculator, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChevronDown, 
  Clock,
  Coins,
  Zap,
  RefreshCw,
  FileText,
  Play,
  Code,
  Monitor
} from "lucide-react";
import { useSimulatePricing } from "@/data/catalog";
import { formatCurrency } from "@/lib/utils";

interface PricingSimulationProps {
  serviceId: string;
  fieldData: Record<string, any>;
  disabled?: boolean;
}

interface SimulationResult {
  serviceId: string;
  serviceName: string;
  inputData: Record<string, any>;
  baseAmount: number;
  finalAmount: number;
  currency: string;
  appliedRules: AppliedRule[];
  skippedRules: SkippedRule[];
  validationErrors: string[];
  totalCalculationTime: string;
  debugInfo: {
    totalRulesEvaluated: number;
    rulesMatched: number;
    rulesSkipped: number;
    performanceNotes: string[];
  };
}

interface AppliedRule {
  ruleId: string;
  ruleName: string;
  ruleCode: string;
  priority: number;
  applyOrder: number;
  conditionsMatched: Record<string, any>;
  calculationType: string;
  calculation: string;
  amountBefore: number;
  amountAfter: number;
  ruleValue: number;
  customFormula?: string;
  formulaVariables?: Record<string, any>;
  applied: boolean;
}

interface SkippedRule {
  ruleId: string;
  ruleName: string;
  reason: string;
  failedConditions: Record<string, any>;
}

// Interface pour le résultat de production
interface ProductionResult {
  serviceId: string;
  calculationId: string;
  finalAmount: number;
  currency: string;
  breakdown: PriceBreakdownItem[];
  summary: PricingSummary;
  calculatedAt: string;
  validUntil?: string;
}

interface PriceBreakdownItem {
  description: string;
  amount: number;
  type: string; // "CALCULATION", "DISCOUNT", "FEE", "ADJUSTMENT"
}

interface PricingSummary {
  subtotal: number;
  totalAdjustments: number;
  grandTotal: number;
  formattedAmount: string;
}

export function PricingSimulation({ serviceId, fieldData, disabled }: PricingSimulationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [productionResult, setProductionResult] = useState<ProductionResult | null>(null);
  const [calculationMode, setCalculationMode] = useState<"simulation" | "production">("simulation");
  const [displayMode, setDisplayMode] = useState<"ui" | "json">("ui");
  
  const simulateMutation = useSimulatePricing();

  const handleSimulate = async () => {
    try {
      const response = await simulateMutation.mutateAsync({
        serviceId,
        fieldData,
        simulationMode: true,
      });
      
      setResult(response);
      setProductionResult(null);
      setCalculationMode("simulation");
      setIsOpen(true);
    } catch (error) {
      console.error("Erreur simulation:", error);
    }
  };

  const handleProductionCalculation = async () => {
    try {
      const response = await simulateMutation.mutateAsync({
        serviceId,
        fieldData,
        simulationMode: false,
      });
      
      setProductionResult(response);
      setResult(null);
      setCalculationMode("production");
      setIsOpen(true);
    } catch (error) {
      console.error("Erreur calcul production:", error);
    }
  };

  const reset = () => {
    setResult(null);
    setProductionResult(null);
    setIsOpen(false);
  };

  const hasRequiredFields = () => {
    // Vérifier si au moins un champ est rempli
    return Object.values(fieldData).some(value => value !== "" && value !== null && value !== undefined);
  };

  const getPricingTypeIcon = (type: string) => {
    switch (type) {
      case "FIXED_AMOUNT":
        return <Coins className="h-4 w-4" />;
      case "PER_UNIT":
        return <Calculator className="h-4 w-4" />;
      case "PERCENTAGE":
        return "%";
      case "MULTIPLIER":
        return "×";
      case "FORMULA":
        return <FileText className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getPricingTypeColor = (type: string) => {
    switch (type) {
      case "FIXED_AMOUNT":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "PER_UNIT":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "PERCENTAGE":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "REDUCTION":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "FORMULA":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getBreakdownItemColor = (type: string) => {
    switch (type) {
      case "CALCULATION":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "DISCOUNT":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "FEE":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "ADJUSTMENT":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      <Separator />
      
      {/* Boutons de simulation */}
      <div className="space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Calcul de pricing
        </h4>
        
        {/* Boutons de calcul */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleSimulate}
            disabled={disabled || !hasRequiredFields() || simulateMutation.isPending}
            variant="outline"
          >
            {simulateMutation.isPending && calculationMode === "simulation" ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Simulation...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Simulation
              </>
            )}
          </Button>
          
          <Button
            onClick={handleProductionCalculation}
            disabled={disabled || !hasRequiredFields() || simulateMutation.isPending}
            variant="default"
          >
            {simulateMutation.isPending && calculationMode === "production" ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Calcul...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Calcul réel
              </>
            )}
          </Button>
        </div>
        
        {/* Switch d'affichage */}
        {(result || productionResult) && (
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
        
        {!hasRequiredFields() && (
          <p className="text-xs text-muted-foreground text-center">
            Remplissez au moins un champ pour calculer
          </p>
        )}
      </div>

      {/* Erreur de simulation */}
      {simulateMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors du calcul. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      )}

      {/* Résultats */}
      {(result || productionResult) && isOpen && (
        <Card className="border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                {calculationMode === "simulation" ? "Résultat de la simulation" : "Résultat du calcul"}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={reset}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              {result ? `Service: ${result.serviceName}` : `ID: ${productionResult?.calculationId || 'N/A'}`}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Affichage JSON */}
            {displayMode === "json" && (
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-4 w-4" />
                  <span className="text-sm font-medium">Réponse JSON</span>
                </div>
                <ScrollArea className="h-96">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {JSON.stringify(result || productionResult, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            )}

            {/* Affichage UI */}
            {displayMode === "ui" && (
              <>
                {/* Montant final */}
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Montant final calculé</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {result 
                          ? `${formatCurrency(result.finalAmount)} ${result.currency}`
                          : productionResult?.summary?.formattedAmount || `${formatCurrency(productionResult?.finalAmount || 0)} ${productionResult?.currency || 'XOF'}`
                        }
                      </div>
                      {result && result.baseAmount !== result.finalAmount && (
                        <div className="text-xs text-muted-foreground">
                          Base: {formatCurrency(result.baseAmount)} {result.currency}
                        </div>
                      )}
                      {productionResult && (
                        <div className="text-xs text-muted-foreground">
                          ID: {productionResult.calculationId || 'N/A'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Affichage pour mode simulation */}
                {result && calculationMode === "simulation" && (
                  <>
                    {/* Statistiques */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="text-lg font-semibold">{result.debugInfo.rulesMatched}</div>
                        <div className="text-xs text-muted-foreground">Règles appliquées</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="text-lg font-semibold">{result.debugInfo.rulesSkipped}</div>
                        <div className="text-xs text-muted-foreground">Règles ignorées</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="text-lg font-semibold flex items-center justify-center gap-1">
                          <Clock className="h-4 w-4" />
                          {result.totalCalculationTime}
                        </div>
                        <div className="text-xs text-muted-foreground">Temps</div>
                      </div>
                    </div>

                    {/* Règles appliquées */}
                    {result.appliedRules.length > 0 && (
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
                          <h5 className="font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Règles appliquées ({result.appliedRules.length})
                          </h5>
                          <ChevronDown className="h-4 w-4" />
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="pt-2">
                          <div className="space-y-2">
                            {result.appliedRules.map((rule, index) => (
                              <div key={rule.ruleId} className="p-3 bg-muted/30 rounded-lg space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">{rule.ruleName}</span>
                                  <Badge className={getPricingTypeColor(rule.calculationType)}>
                                    {getPricingTypeIcon(rule.calculationType)}
                                    <span className="ml-1">{rule.calculationType}</span>
                                  </Badge>
                                </div>
                                
                                <div className="text-xs space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Calcul:</span>
                                    <code className="font-mono bg-muted px-2 py-0.5 rounded">
                                      {rule.calculation}
                                    </code>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Impact:</span>
                                    <span className={rule.amountAfter > rule.amountBefore ? "text-green-600" : "text-red-600"}>
                                      {formatCurrency(rule.amountBefore)} → {formatCurrency(rule.amountAfter)}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Afficher la formule et les variables pour le type FORMULA */}
                                {rule.calculationType === "FORMULA" && rule.customFormula && (
                                  <div className="text-xs space-y-2">
                                    <div>
                                      <span className="text-muted-foreground">Formule:</span>
                                      <code className="block mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                        {rule.customFormula}
                                      </code>
                                    </div>
                                    {rule.formulaVariables && (
                                      <div>
                                        <span className="text-muted-foreground">Variables:</span>
                                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                          {JSON.stringify(rule.formulaVariables, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Afficher les conditions pour les autres types */}
                                {rule.calculationType !== "FORMULA" && rule.conditionsMatched && Object.keys(rule.conditionsMatched).length > 0 && (
                                  <div className="text-xs">
                                    <span className="text-muted-foreground">Conditions:</span>
                                    <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                                      {JSON.stringify(rule.conditionsMatched, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Règles ignorées */}
                    {result.skippedRules.length > 0 && (
                      <Collapsible>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
                          <h5 className="font-medium flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-orange-600" />
                            Règles ignorées ({result.skippedRules.length})
                          </h5>
                          <ChevronDown className="h-4 w-4" />
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="pt-2">
                          <div className="space-y-2">
                            {result.skippedRules.map((rule) => (
                              <div key={rule.ruleId} className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">{rule.ruleName}</span>
                                  <Badge variant="outline" className="text-xs">
                                    Ignorée
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Raison: {rule.reason}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Erreurs de validation */}
                    {result.validationErrors && result.validationErrors.length > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-medium mb-1">Erreurs de validation:</div>
                          <ul className="list-disc list-inside text-xs">
                            {result.validationErrors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Debug info */}
                    <Collapsible>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
                        <h5 className="font-medium flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4" />
                          Informations de debug
                        </h5>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="pt-2">
                        <div className="bg-muted/30 rounded p-3 text-xs space-y-2">
                          <div className="flex justify-between">
                            <span>Règles évaluées:</span>
                            <span className="font-mono">{result.debugInfo.totalRulesEvaluated}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Règles correspondantes:</span>
                            <span className="font-mono">{result.debugInfo.rulesMatched}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Règles ignorées:</span>
                            <span className="font-mono">{result.debugInfo.rulesSkipped}</span>
                          </div>
                          {result.debugInfo.performanceNotes.length > 0 && (
                            <div>
                              <span>Notes de performance:</span>
                              <ul className="mt-1 space-y-1">
                                {result.debugInfo.performanceNotes.map((note, index) => (
                                  <li key={index} className="text-xs text-muted-foreground">• {note}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </>
                )}

                {/* Affichage pour mode production */}
                {productionResult && calculationMode === "production" && (
                  <>
                    {/* Résumé du calcul */}
                    {productionResult.summary && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h5 className="font-medium mb-2">Résumé du calcul</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span>Sous-total:</span>
                            <span className="font-mono">{formatCurrency(productionResult.summary.subtotal || 0)} {productionResult.currency || 'XOF'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ajustements:</span>
                            <span className="font-mono">{formatCurrency(productionResult.summary.totalAdjustments || 0)} {productionResult.currency || 'XOF'}</span>
                          </div>
                          <div className="flex justify-between col-span-2 border-t pt-2">
                            <span className="font-medium">Total:</span>
                            <span className="font-mono font-bold">{formatCurrency(productionResult.summary.grandTotal || 0)} {productionResult.currency || 'XOF'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Détail des éléments de calcul */}
                    {productionResult.breakdown && productionResult.breakdown.length > 0 && (
                      <Collapsible defaultOpen>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
                          <h5 className="font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            Détail du calcul ({productionResult.breakdown.length} éléments)
                          </h5>
                          <ChevronDown className="h-4 w-4" />
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="pt-2">
                          <div className="space-y-2">
                            {productionResult.breakdown.map((item, index) => (
                              <div key={index} className="p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">{item.description}</span>
                                  <div className="flex items-center gap-2">
                                    <Badge className={getBreakdownItemColor(item.type)}>
                                      {item.type}
                                    </Badge>
                                    <span className="font-mono font-medium">
                                      {formatCurrency(item.amount || 0)} {productionResult.currency || 'XOF'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Informations du calcul */}
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h5 className="font-medium mb-2">Informations du calcul</h5>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="flex justify-between">
                          <span>ID de calcul:</span>
                          <code className="font-mono">{productionResult.calculationId || 'N/A'}</code>
                        </div>
                        <div className="flex justify-between">
                          <span>Calculé le:</span>
                          <span className="font-mono">{productionResult.calculatedAt ? new Date(productionResult.calculatedAt).toLocaleString() : 'N/A'}</span>
                        </div>
                        {productionResult.validUntil && (
                          <div className="flex justify-between col-span-2">
                            <span>Valide jusqu'au:</span>
                            <span className="font-mono">{new Date(productionResult.validUntil).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}