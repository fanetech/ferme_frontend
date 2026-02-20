"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Edit, Trash2, Code, Eye } from "lucide-react";
import { PricingRuleCardData } from "@/lib/utils/internalServiceTypes";
import { getPricingTypeLabel, formatRuleValue, parseConditions, formatConditions } from "@/lib/utils/pricingRuleUtils";

interface PricingRuleCardProps {
  rule: PricingRuleCardData;
  onEdit: (rule: PricingRuleCardData) => void;
  onDelete: (ruleId: string, ruleName: string) => void;
}

export function PricingRuleCard({ rule, onEdit, onDelete }: PricingRuleCardProps) {
  const parsedConditions = parseConditions(rule.conditions || "");
  const formattedConditions = formatConditions(parsedConditions);

  return (
    <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* En-tête de la règle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <Badge variant="outline" className="text-xs">
                {getPricingTypeLabel(rule.pricingType)}
              </Badge>
              <Badge variant="secondary" className="text-xs font-medium">
                {formatRuleValue(rule)}
              </Badge>
            </div>
            <div>
              <span className="font-semibold">{rule.ruleName}</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  Priorité {rule.priority}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Ordre {rule.applyOrder}
                </Badge>
                {!rule.isActive && (
                  <Badge variant="destructive" className="text-xs">Inactive</Badge>
                )}
                {rule.currentlyValid && (
                  <Badge variant="default" className="text-xs bg-green-500/20 text-green-700 border-green-500/30">
                    Valide
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-accent"
              onClick={() => onEdit(rule)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-destructive/10"
              onClick={() => onDelete(rule.id, rule.ruleName)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Description */}
        {rule.description && (
          <div className="mb-3">
            <p className="text-sm">{rule.description}</p>
          </div>
        )}
        
        {/* Formule - pour type FORMULA */}
        {rule.pricingType === "FORMULA" && rule.customFormula && (
          <div className="mb-3">
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Formule SpEL</span>
              </div>
              <div className="text-sm bg-white dark:bg-gray-900 p-2 rounded border border-blue-200 dark:border-blue-700 font-mono">
                {rule.customFormula}
              </div>
              {rule.formulaVariables && (
                <details className="text-xs mt-2">
                  <summary className="text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-200 select-none">
                    Voir les variables
                  </summary>
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/50 rounded border border-blue-200 dark:border-blue-700 font-mono text-xs overflow-x-auto">
                    {rule.formulaVariables}
                  </div>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Conditions - pour les autres types */}
        {rule.pricingType !== "FORMULA" && rule.conditions && (
          <div className="mb-3">
            <div className="bg-muted/30 rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Conditions d'application</span>
              </div>
              {formattedConditions ? (
                <div className="space-y-2">
                  <div className="text-sm bg-background p-2 rounded border border-border">
                    {formattedConditions}
                  </div>
                  <details className="text-xs">
                    <summary className="text-muted-foreground cursor-pointer hover:text-foreground select-none">
                      Voir JSON brut
                    </summary>
                    <div className="mt-2 p-2 bg-muted/50 rounded border border-border font-mono text-xs text-muted-foreground overflow-x-auto">
                      {JSON.stringify(parsedConditions, null, 2)}
                    </div>
                  </details>
                </div>
              ) : (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                  ❌ Conditions JSON invalides
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Statistiques et métadonnées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-border">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Applications</div>
            <div className="text-sm font-medium">{rule.applicationCount || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Créé le</div>
            <div className="text-sm font-medium">
              {new Date(rule.createdAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Modifié le</div>
            <div className="text-sm font-medium">
              {new Date(rule.updatedAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}