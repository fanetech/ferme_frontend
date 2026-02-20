"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CalculationFieldCardData } from "@/lib/utils/internalServiceTypes";

interface FieldSelectorProps {
  fields: CalculationFieldCardData[];
  onFieldSelect: (field: CalculationFieldCardData) => void;
  className?: string;
  variant?: "conditions" | "formula";
}

export function FieldSelector({ 
  fields, 
  onFieldSelect, 
  className = "",
  variant = "conditions"
}: FieldSelectorProps) {
  const hoverClass = variant === "conditions" 
    ? "hover:bg-accent hover:border-accent-foreground" 
    : "hover:bg-accent/10 hover:border-accent";
    
  const keyColor = variant === "conditions" 
    ? "font-semibold" 
    : "text-accent font-semibold";

  return (
    <div className={`bg-background rounded-lg p-4 border border-border ${className}`}>
      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
        <Plus className="h-4 w-4" /> Champs disponibles
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {fields?.map((field) => (
          <Button
            key={field.id}
            type="button"
            variant="outline"
            size="sm"
            className={`justify-start h-auto p-3 text-left ${hoverClass} transition-all`}
            onClick={() => onFieldSelect(field)}
          >
            <div>
              <div className={`font-mono text-xs ${keyColor}`}>{field.fieldKey}</div>
              <div className="text-xs text-muted-foreground truncate max-w-24">{field.label}</div>
            </div>
          </Button>
        ))}
        {(!fields || fields.length === 0) && (
          <div className="col-span-full text-center py-6 text-sm text-muted-foreground bg-muted/30 rounded border-2 border-dashed border-border">
            📈 Aucun champ de calcul configuré<br/>
            <span className="text-xs">Ajoutez d'abord des champs dans l'onglet "Champs de calcul"</span>
          </div>
        )}
      </div>
    </div>
  );
}