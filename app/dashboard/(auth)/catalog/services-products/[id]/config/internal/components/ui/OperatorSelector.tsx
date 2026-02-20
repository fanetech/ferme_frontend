"use client";

import { Button } from "@/components/ui/button";
import { ConditionOperator, MathOperator } from "@/lib/utils/internalServiceTypes";

interface OperatorSelectorProps {
  operators: ConditionOperator[] | MathOperator[];
  onOperatorSelect: (operator: ConditionOperator | MathOperator) => void;
  title: string;
  variant?: "conditions" | "formula";
  className?: string;
}

export function OperatorSelector({ 
  operators, 
  onOperatorSelect, 
  title,
  variant = "conditions",
  className = ""
}: OperatorSelectorProps) {
  const hoverClass = variant === "conditions" 
    ? "hover:bg-accent border border-transparent hover:border-accent-foreground"
    : "hover:bg-accent/10 border border-transparent hover:border-accent";

  const gridCols = variant === "conditions" ? "grid-cols-3 md:grid-cols-6" : "grid-cols-4 md:grid-cols-8";

  return (
    <div className={`bg-background rounded-lg p-4 border border-border ${className}`}>
      <h4 className="text-sm font-medium mb-3">{title}</h4>
      <div className={`grid ${gridCols} gap-2`}>
        {operators.map((operator) => (
          <Button
            key={variant === "conditions" ? (operator as ConditionOperator).op : (operator as MathOperator).symbol}
            type="button"
            variant="ghost"
            size="sm"
            className={`h-auto p-2 ${hoverClass} transition-all`}
            title={variant === "conditions" 
              ? `${(operator as ConditionOperator).desc}\nExemple: ${(operator as ConditionOperator).example}`
              : (operator as MathOperator).desc
            }
            onClick={() => onOperatorSelect(operator)}
          >
            {variant === "conditions" ? (
              <div className="text-center">
                <div className="font-mono text-xs font-semibold">{(operator as ConditionOperator).op}</div>
                <div className="text-xs text-muted-foreground">{(operator as ConditionOperator).desc}</div>
              </div>
            ) : (
              <span className={`font-mono text-xs font-semibold ${(operator as MathOperator).color}`}>
                {(operator as MathOperator).symbol.trim()}
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}