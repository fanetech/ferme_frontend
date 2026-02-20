"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { FieldSelector } from "../ui/FieldSelector";
import { OperatorSelector } from "../ui/OperatorSelector";
import { 
  conditionOperators, 
  conditionTemplates, 
  addFieldToConditions, 
  addOperatorToConditions, 
  formatJSON 
} from "@/lib/utils/pricingRuleUtils";
import { CalculationFieldCardData, ValidationResult } from "@/lib/utils/internalServiceTypes";

interface ConditionEditorProps {
  value: string;
  onChange: (value: string) => void;
  validation: ValidationResult;
  onValidate: (value: string) => void;
  calculationFields: CalculationFieldCardData[];
}

export function ConditionEditor({
  value,
  onChange,
  validation,
  onValidate,
  calculationFields
}: ConditionEditorProps) {
  const handleFieldSelect = (field: CalculationFieldCardData) => {
    const newConditions = addFieldToConditions(value, field.fieldKey);
    onChange(newConditions);
    onValidate(newConditions);
  };

  const handleOperatorSelect = (operator: any) => {
    const newConditions = addOperatorToConditions(value, operator);
    onChange(newConditions);
    onValidate(newConditions);
  };

  const handleTemplateSelect = (template: string) => {
    onChange(template);
    onValidate(template);
  };

  const handleFormat = () => {
    const formatted = formatJSON(value);
    onChange(formatted);
    onValidate(formatted);
  };

  const handleClear = () => {
    onChange("");
    onValidate("");
  };

  return (
    <div className="bg-muted/50 p-6 rounded-lg border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Code className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Conditions d'application</h3>
          <p className="text-sm text-muted-foreground">Définissez quand cette règle doit s'appliquer</p>
        </div>
      </div>

      {/* Champs disponibles */}
      <FieldSelector
        fields={calculationFields}
        onFieldSelect={handleFieldSelect}
        variant="conditions"
        className="mb-4"
      />

      {/* Opérateurs de condition */}
      <OperatorSelector
        operators={conditionOperators}
        onOperatorSelect={handleOperatorSelect}
        title="⚡ Opérateurs de condition"
        variant="conditions"
        className="mb-4"
      />

      {/* Templates de conditions */}
      <div className="bg-background rounded-lg p-4 border border-border mb-4">
        <h4 className="text-sm font-medium mb-3">📋 Templates de conditions</h4>
        <div className="space-y-2">
          {conditionTemplates.map((template) => (
            <div key={template.label} className="flex items-center gap-2 p-2 hover:bg-accent rounded">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-shrink-0"
                onClick={() => handleTemplateSelect(template.template)}
              >
                Utiliser
              </Button>
              <div className="flex-1">
                <div className="font-medium text-sm">{template.label}</div>
                <div className="text-xs text-muted-foreground">{template.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Éditeur de conditions */}
      <FormItem>
        <FormLabel className="text-base font-medium flex items-center gap-2">
          🔍 Conditions d'application (JSON)
        </FormLabel>
        <FormControl>
          <div className="relative">
            <Textarea 
              placeholder='{"superficie": {"$gte": 100}, "zone": {"$eq": "centre"}}'
              rows={6}
              className="font-mono text-sm bg-muted/30 border-2 focus:bg-background resize-none"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                onValidate(e.target.value);
              }}
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleFormat}
                className="h-6 w-6 p-0 hover:bg-primary/10 text-primary"
                title="Formatter le JSON"
              >
                <span className="text-xs">{ }</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0 hover:bg-destructive/10 text-destructive"
                title="Effacer tout"
              >
                <span className="text-xs font-bold">×</span>
              </Button>
            </div>
          </div>
        </FormControl>
        
        {/* Validation en temps réel */}
        {value && (
          <div className="mt-2">
            {validation.isValid ? (
              <Alert className="border-green-500/20 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  ✅ Conditions JSON valides
                  {validation.parsed && (
                    <div className="mt-2 p-2 bg-green-500/20 rounded text-xs font-mono">
                      <Eye className="h-3 w-3 inline mr-1" />
                      Aperçu: {JSON.stringify(validation.parsed, null, 2)}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-destructive/20 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription>
                  ❌ {validation.error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        <FormDescription className="bg-muted/50 p-4 rounded-lg text-sm border border-border">
          <div className="font-semibold mb-2">💡 Explication des opérateurs :</div>
          <div className="space-y-1">
            <div>• <code className="bg-background px-2 py-1 rounded font-mono text-xs border border-border">$eq</code> - Égal à une valeur</div>
            <div>• <code className="bg-background px-2 py-1 rounded font-mono text-xs border border-border">$gte</code> - Supérieur ou égal à une valeur numérique</div>
            <div>• <code className="bg-background px-2 py-1 rounded font-mono text-xs border border-border">$in</code> - Contenu dans une liste de valeurs</div>
            <div>• <code className="bg-background px-2 py-1 rounded font-mono text-xs border border-border">$and</code> - Toutes les conditions doivent être vraies</div>
            <div>• <code className="bg-background px-2 py-1 rounded font-mono text-xs border border-border">$or</code> - Au moins une condition doit être vraie</div>
          </div>
        </FormDescription>
        <FormMessage />
      </FormItem>
    </div>
  );
}