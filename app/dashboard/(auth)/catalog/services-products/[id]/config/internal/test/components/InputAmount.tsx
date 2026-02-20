"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Euro, Coins } from "lucide-react";

interface InputAmountProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  currency?: string;
  disabled?: boolean;
}

export function InputAmount({ 
  value, 
  onChange, 
  placeholder = "0.00", 
  min, 
  max,
  currency = "XOF",
  disabled = false 
}: InputAmountProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Formatter les nombres avec séparateurs de milliers
  const formatNumber = (num: string | number) => {
    if (!num || num === "") return "";
    const numStr = num.toString().replace(/[^\d.,]/g, "");
    const number = parseFloat(numStr.replace(",", "."));
    if (isNaN(number)) return "";
    return new Intl.NumberFormat("fr-FR").format(number);
  };

  // Parser le nombre depuis le format affiché
  const parseNumber = (formatted: string) => {
    return formatted.replace(/\s/g, "").replace(",", ".");
  };

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    setDisplayValue(parseNumber(value.toString()));
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseNumber(displayValue);
    onChange(parsed);
    setDisplayValue(formatNumber(parsed));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    
    if (isFocused) {
      // En mode focus, on permet la saisie libre
      const parsed = parseNumber(newValue);
      onChange(parsed);
    }
  };

  const getCurrencyIcon = () => {
    switch (currency) {
      case "EUR":
        return <Euro className="h-4 w-4 text-green-600" />;
      case "USD":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case "XOF":
      default:
        return <Coins className="h-4 w-4 text-green-600" />;
    }
  };

  const getCurrencySymbol = () => {
    switch (currency) {
      case "EUR":
        return "€";
      case "USD":
        return "$";
      case "XOF":
      default:
        return "FCFA";
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {getCurrencyIcon()}
        </div>
        
        <Input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          className="pl-10 pr-16 text-right font-mono"
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Badge variant="outline" className="text-xs font-mono">
            {getCurrencySymbol()}
          </Badge>
        </div>
      </div>
      
      {/* Aide visuelle pour les limites */}
      {(min || max) && (
        <div className="text-xs text-muted-foreground flex justify-between">
          {min && <span>Min: {formatNumber(min)} {getCurrencySymbol()}</span>}
          {max && <span>Max: {formatNumber(max)} {getCurrencySymbol()}</span>}
        </div>
      )}
      
      {/* Valeur en temps réel */}
      {value && !isFocused && (
        <div className="text-xs text-green-600 font-medium">
          💰 {formatNumber(value)} {getCurrencySymbol()}
        </div>
      )}
    </div>
  );
}