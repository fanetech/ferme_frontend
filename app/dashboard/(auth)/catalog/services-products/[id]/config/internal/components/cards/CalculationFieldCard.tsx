"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Edit, Trash2, Settings, Eye, EyeOff, Calculator, Hash } from "lucide-react";
import { CalculationFieldCardData } from "@/lib/utils/internalServiceTypes";

interface CalculationFieldCardProps {
  field: CalculationFieldCardData;
  onEdit: (field: CalculationFieldCardData) => void;
  onDelete: (fieldId: string, fieldName: string) => void;
}

export function CalculationFieldCard({ field, onEdit, onDelete }: CalculationFieldCardProps) {
  // Parser les options si elles existent
  const parseOptions = (optionsString?: string) => {
    if (!optionsString) return null;
    try {
      return JSON.parse(optionsString);
    } catch (e) {
      return null;
    }
  };

  // Parser les règles de validation
  const parseValidationRules = (rulesString?: string) => {
    if (!rulesString) return null;
    try {
      return JSON.parse(rulesString);
    } catch (e) {
      return null;
    }
  };

  const options = parseOptions(field.options);
  const validationRules = parseValidationRules(field.validationRules);

  // Formatage du type de données
  const getFieldTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'STRING': 'Texte',
      'INTEGER': 'Nombre entier',
      'DECIMAL': 'Nombre décimal',
      'BOOLEAN': 'Booléen',
      'DATE': 'Date'
    };
    return labels[type] || type;
  };

  // Formatage du rôle
  const getFieldRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'INPUT': 'Entrée',
      'OUTPUT': 'Sortie',
      'INTERMEDIATE': 'Intermédiaire'
    };
    return labels[role] || role;
  };

  return (
    <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                {field.fieldRole === 'INPUT' ? (
                  <Hash className="h-4 w-4 text-primary" />
                ) : field.fieldRole === 'OUTPUT' ? (
                  <Calculator className="h-4 w-4 text-secondary-foreground" />
                ) : (
                  <Settings className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={field.fieldRole === 'INPUT' ? 'default' : field.fieldRole === 'OUTPUT' ? 'secondary' : 'outline'}>
                    {getFieldRoleLabel(field.fieldRole)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getFieldTypeLabel(field.fieldType)}
                  </Badge>
                </div>
                <h3 className="font-semibold text-base mt-1">{field.label}</h3>
                <p className="text-xs text-muted-foreground font-mono">{field.fieldKey}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-accent"
              onClick={() => onEdit(field)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-destructive/10"
              onClick={() => onDelete(field.id, field.label)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {field.description && (
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm">{field.description}</p>
          </div>
        )}

        {/* Statuts et propriétés */}
        <div className="flex flex-wrap gap-2">
          {field.isRequired && (
            <Badge variant="destructive" className="text-xs">
              <span className="mr-1">⚠️</span> Requis
            </Badge>
          )}
          {field.isReadonly && (
            <Badge variant="outline" className="text-xs">
              <span className="mr-1">🔒</span> Lecture seule
            </Badge>
          )}
          {field.isVisible ? (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              <Eye className="h-3 w-3 mr-1" /> Visible
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
              <EyeOff className="h-3 w-3 mr-1" /> Masqué
            </Badge>
          )}
          {field.calculated && (
            <Badge variant="secondary" className="text-xs">
              <Calculator className="h-3 w-3 mr-1" /> Calculé
            </Badge>
          )}
          {field.isAmountField && (
            <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
              💰 Montant
            </Badge>
          )}
        </div>

        {/* Options de sélection */}
        {options && options.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Options disponibles:</span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {options.map((option: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-xs p-2 bg-background rounded border">
                  <code className="font-mono text-primary">{option.value}</code>
                  <span className="text-muted-foreground">→</span>
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
            {/* Vue JSON des options */}
            <details className="mt-2">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                Voir le JSON des options
              </summary>
              <div className="mt-2 p-2 bg-muted/30 rounded border text-xs">
                <pre className="font-mono whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(options, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}

        {/* Règles de validation */}
        {validationRules && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Validation:</span>
            </div>
            <div className="p-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded text-xs">
              {validationRules.min && (
                <div>• Minimum: <code className="font-mono">{validationRules.min}</code></div>
              )}
              {validationRules.max && (
                <div>• Maximum: <code className="font-mono">{validationRules.max}</code></div>
              )}
              {validationRules.pattern && (
                <div>• Pattern: <code className="font-mono">{validationRules.pattern}</code></div>
              )}
              {validationRules.options && (
                <div>• Options définies</div>
              )}
            </div>
            {/* Vue JSON des règles de validation */}
            <details className="mt-2">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                Voir le JSON des règles de validation
              </summary>
              <div className="mt-2 p-2 bg-muted/30 rounded border text-xs">
                <pre className="font-mono whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(validationRules, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}

        {/* Formule (si calculé) */}
        {field.formula && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Formule de calcul:</span>
            </div>
            <div className="p-2 bg-primary/5 border border-primary/20 rounded">
              <code className="text-sm font-mono">{field.formula}</code>
            </div>
          </div>
        )}

        {/* Informations techniques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-border text-xs">
          <div className="text-center">
            <div className="text-muted-foreground">Ordre d'affichage</div>
            <div className="font-medium">{field.displayOrder}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Utilisations</div>
            <div className="font-medium">{field.usageCount}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Créé le</div>
            <div className="font-medium">
              {new Date(field.createdAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Service associé */}
        <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
          <div>
            <span className="text-muted-foreground">Service:</span>
            <span className="ml-1 font-medium">{field.serviceName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Code:</span>
            <code className="ml-1 font-mono text-primary">{field.serviceCode}</code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}