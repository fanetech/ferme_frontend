"use client";

import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface InputAmountProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  currency?: string;
  disabled?: boolean;
}

export function InputAmount({
  value,
  onChange,
  placeholder = "0",
  min,
  max,
  currency = "XOF",
  disabled = false
}: InputAmountProps) {
  const [displayValue, setDisplayValue] = useState("");

  // Formater le nombre avec des espaces comme séparateurs de milliers
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Parser la valeur affichée pour enlever les espaces
  const parseValue = (val: string): string => {
    return val.replace(/\s/g, "");
  };

  useEffect(() => {
    if (value !== undefined && value !== null && value !== "") {
      const numValue = typeof value === "string" ? parseFloat(parseValue(value)) : value;
      if (!isNaN(numValue)) {
        setDisplayValue(formatNumber(numValue));
      }
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Permettre seulement les chiffres et les espaces
    const cleanedValue = inputValue.replace(/[^\d\s]/g, "");
    
    // Parser pour enlever les espaces et obtenir le nombre
    const parsedValue = parseValue(cleanedValue);
    
    if (parsedValue === "") {
      setDisplayValue("");
      onChange("");
      return;
    }

    const numValue = parseFloat(parsedValue);
    
    // Vérifier les limites
    if (min !== undefined && numValue < min) {
      return;
    }
    if (max !== undefined && numValue > max) {
      return;
    }

    // Formater et afficher
    setDisplayValue(formatNumber(numValue));
    onChange(parsedValue);
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="pr-12"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
        {currency}
      </div>
    </div>
  );
}