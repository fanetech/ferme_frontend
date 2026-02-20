"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, CheckCircle, AlertCircle } from "lucide-react";
import { FieldSelector } from "../ui/FieldSelector";
import { OperatorSelector } from "../ui/OperatorSelector";
import { mathOperators } from "@/lib/utils/pricingRuleUtils";
import { CalculationFieldCardData, FormulaValidationResult } from "@/lib/utils/internalServiceTypes";
import { toast } from "sonner";

interface FormulaEditorProps {
  value: string;
  onChange: (value: string) => void;
  validation: FormulaValidationResult;
  onValidate: (value: string) => void;
  calculationFields: CalculationFieldCardData[];
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

export function FormulaEditor({
  value,
  onChange,
  validation,
  onValidate,
  calculationFields,
  textareaRef
}: FormulaEditorProps) {
  const handleFieldSelect = (field: CalculationFieldCardData) => {
    const newFormula = value + (value ? " + " : "") + field.fieldKey;
    onChange(newFormula);
    onValidate(newFormula);
  };

  const handleOperatorSelect = (operator: any) => {
    const newFormula = value + operator.symbol;
    onChange(newFormula);
    onValidate(newFormula);
  };

  const handleClear = () => {
    onChange("");
    onValidate("");
  };

  // Fonction pour corriger les virgules décimales
  const normalizeDecimalSeparators = (formula: string) => {
    // Remplace les virgules par des points pour les nombres décimaux
    // Regex pour détecter les nombres avec virgules (ex: 1,5 -> 1.5)
    return formula.replace(/(\d+),(\d+)/g, '$1.$2');
  };

  // Fonction pour valider et corriger la formule
  const handleFormulaChange = (newValue: string) => {
    // Normaliser les séparateurs décimaux
    const normalizedValue = normalizeDecimalSeparators(newValue);
    
    // Si la formule a été modifiée, l'indiquer visuellement
    if (normalizedValue !== newValue) {
      toast.info("🔧 Virgules décimales corrigées automatiquement en points", {
        duration: 2000,
      });
      // Utiliser un délai pour permettre la mise à jour de l'affichage
      setTimeout(() => {
        onChange(normalizedValue);
        onValidate(normalizedValue);
      }, 100);
    } else {
      onChange(normalizedValue);
      onValidate(normalizedValue);
    }
  };

  return (
    <div className="bg-accent/20 p-6 rounded-lg border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
          <Zap className="h-4 w-4 text-accent-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Formule personnalisée (optionnel)</h3>
          <p className="text-sm text-muted-foreground">Créez des calculs complexes en utilisant les champs disponibles</p>
        </div>
      </div>

      {/* Champs disponibles pour formule */}
      <FieldSelector
        fields={calculationFields}
        onFieldSelect={handleFieldSelect}
        variant="formula"
        className="mb-4"
      />

      {/* Opérateurs mathématiques */}
      <OperatorSelector
        operators={mathOperators}
        onOperatorSelect={handleOperatorSelect}
        title="⚙️ Opérateurs et fonctions"
        variant="formula"
        className="mb-4"
      />

      {/* Éditeur de formule */}
      <FormItem>
        <FormLabel className="text-base font-medium flex items-center gap-2">
          📝 Formule de calcul personnalisée
        </FormLabel>
        <FormControl>
          <div className="relative">
            <Textarea 
              ref={textareaRef}
              placeholder="Exemple: #{superficie_local * value + (superficie_local > 100 ? frais_majoration : 0)} ou superficie_local * value + (superficie_local > 100 ? frais_majoration : 0)"
              rows={3}
              className="font-mono text-sm bg-muted/30 border-2 focus:bg-background resize-none"
              value={value}
              onChange={(e) => {
                handleFormulaChange(e.target.value);
              }}
            />
            <div className="absolute top-2 right-2 flex gap-1">
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
                  ✅ Formule valide
                  {validation.suggestions && validation.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {validation.suggestions.map((suggestion, index) => (
                        <div key={index} className="text-xs">{suggestion}</div>
                      ))}
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
        
        <FormDescription className="bg-accent/10 p-4 rounded-lg text-sm border border-border">
          <div className="font-semibold mb-2">💡 Exemples de formules :</div>
          <div className="space-y-1">
            <div>• <code className="bg-background px-2 py-1 rounded font-mono text-xs border border-border">{"#{superficie * 50}"}</code> - Avec délimiteurs</div>
            <div>• <code className="bg-background px-2 py-1 rounded font-mono text-xs border border-border">superficie * 50</code> - Sans délimiteurs</div>
            <div>• <code className="bg-background px-2 py-1 rounded font-mono text-xs border border-border">is_weekend ? 100 : 50</code> - Condition simple</div>
            <div>• <code className="bg-background px-2 py-1 rounded font-mono text-xs border border-border">superficie * 1.5</code> - Avec décimales</div>
            <div>• <code className="bg-background px-2 py-1 rounded font-mono text-xs border border-border">superficie + current_hour * 10</code> - Avec variable système</div>
          </div>
          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
            <div className="font-semibold text-blue-700 mb-1">ℹ️ Syntaxe SpEL :</div>
            <div className="text-xs text-blue-600 space-y-1">
              <div>• Syntaxe flexible : avec ou sans #{"{"}...{"}"}</div>
              <div>• Utilisez vos variables et les variables système</div>
              <div>• Opérateurs : +, -, *, /, %, ==, !=, {">"}, {"<"}, {">="}, {"<="}</div>
              <div>• Conditions : condition ? valeur_si_vrai : valeur_si_faux</div>
              <div>• <strong>Décimales</strong> : utilisez le point (ex: 1.5 au lieu de 1,5)</div>
            </div>
          </div>
        </FormDescription>
        <FormMessage />
      </FormItem>
    </div>
  );
}