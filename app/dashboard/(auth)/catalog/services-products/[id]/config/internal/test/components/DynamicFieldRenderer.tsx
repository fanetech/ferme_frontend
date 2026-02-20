"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalculationFieldCardData } from "@/lib/utils/internalServiceTypes";
import { DataType } from "@/types/catalog";
import { AlertCircle, CheckCircle, Hash, Type, Calculator, Calendar, DollarSign } from "lucide-react";
import { InputAmount } from "./InputAmount";

interface DynamicFieldRendererProps {
  field: CalculationFieldCardData;
  value: any;
  onChange: (value: any) => void;
}

export function DynamicFieldRenderer({ field, value, onChange }: DynamicFieldRendererProps) {
  const [error, setError] = useState<string>("");

  // Parser les règles de validation
  const parseValidationRules = () => {
    try {
      return field.validationRules ? JSON.parse(field.validationRules) : {};
    } catch {
      return {};
    }
  };

  // Parser les options
  const parseOptions = () => {
    try {
      const rules = parseValidationRules();
      return rules.options || [];
    } catch {
      return [];
    }
  };

  const validationRules = parseValidationRules();
  const options = parseOptions();

  // Validation en temps réel
  const validateValue = (val: any) => {
    setError("");

    if (field.isRequired && (!val || val === "")) {
      setError("Ce champ est obligatoire");
      return false;
    }

    // Validation pour les nombres
    if (field.fieldType === DataType.INTEGER || field.fieldType === DataType.DECIMAL) {
      const numVal = parseFloat(val);
      if (val !== "" && isNaN(numVal)) {
        setError("Veuillez entrer un nombre valide");
        return false;
      }
      if (validationRules.min && numVal < parseFloat(validationRules.min)) {
        setError(`La valeur doit être supérieure ou égale à ${validationRules.min}`);
        return false;
      }
      if (validationRules.max && numVal > parseFloat(validationRules.max)) {
        setError(`La valeur doit être inférieure ou égale à ${validationRules.max}`);
        return false;
      }
    }

    // Validation pour les chaînes
    if (field.fieldType === DataType.STRING) {
      if (validationRules.minLength && val.length < validationRules.minLength) {
        setError(`Le texte doit contenir au moins ${validationRules.minLength} caractères`);
        return false;
      }
      if (validationRules.maxLength && val.length > validationRules.maxLength) {
        setError(`Le texte ne peut pas dépasser ${validationRules.maxLength} caractères`);
        return false;
      }
    }

    return true;
  };

  const handleChange = (newValue: any) => {
    validateValue(newValue);
    onChange(newValue);
  };

  const getFieldIcon = () => {
    // Icône spéciale pour les champs montant
    if (field.isAmountField && (field.fieldType === DataType.INTEGER || field.fieldType === DataType.DECIMAL)) {
      return <DollarSign className="h-4 w-4 text-green-600" />;
    }
    
    switch (field.fieldType) {
      case DataType.STRING:
        return <Type className="h-4 w-4" />;
      case DataType.INTEGER:
        return <Hash className="h-4 w-4" />;
      case DataType.DECIMAL:
        return <Calculator className="h-4 w-4" />;
      case DataType.DATE:
        return <Calendar className="h-4 w-4" />;
      case DataType.BOOLEAN:
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  const renderField = () => {
    // Champ avec options - toujours utiliser SELECT
    if (options.length > 0) {
      return (
        <Select value={value || ""} onValueChange={handleChange}>
          <SelectTrigger>
            <SelectValue placeholder={field.placeholder || "Sélectionner..."} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option: any, index: number) => (
              <SelectItem key={index} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Champs selon le type
    switch (field.fieldType) {
      case DataType.BOOLEAN:
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.fieldKey}
              checked={value || false}
              onCheckedChange={handleChange}
            />
            <Label htmlFor={field.fieldKey}>
              {field.placeholder || "Cocher si applicable"}
            </Label>
          </div>
        );

      case DataType.INTEGER:
        // Champ montant spécialisé
        if (field.isAmountField) {
          return (
            <InputAmount
              value={value || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              min={validationRules.min}
              max={validationRules.max}
              currency="XOF"
            />
          );
        }
        
        return (
          <Input
            type="number"
            step="1"
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            min={validationRules.min}
            max={validationRules.max}
          />
        );

      case DataType.DECIMAL:
        // Champ montant spécialisé
        if (field.isAmountField) {
          return (
            <InputAmount
              value={value || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              min={validationRules.min}
              max={validationRules.max}
              currency="XOF"
            />
          );
        }
        
        return (
          <Input
            type="number"
            step="0.01"
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            min={validationRules.min}
            max={validationRules.max}
          />
        );

      case DataType.DATE:
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
          />
        );

      case DataType.STRING:
      default:
        // Textarea pour les longs textes
        if (validationRules.maxLength && validationRules.maxLength > 100) {
          return (
            <Textarea
              value={value || ""}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              maxLength={validationRules.maxLength}
            />
          );
        }
        
        return (
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            maxLength={validationRules.maxLength}
          />
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* En-tête du champ */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          {getFieldIcon()}
          <Label className="text-base font-medium">
            {field.label}
            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
          </Label>
        </div>
        <div className="flex gap-1">
          <Badge variant="outline" className="text-xs">
            {field.fieldType}
          </Badge>
          {field.isAmountField && (
            <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
              💰 MONTANT
            </Badge>
          )}
          {field.isReadonly && (
            <Badge variant="secondary" className="text-xs">
              Lecture seule
            </Badge>
          )}
        </div>
      </div>

      {/* Description */}
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}

      {/* Champ de saisie */}
      <div className="space-y-2">
        {field.isReadonly ? (
          <div className="p-3 bg-muted/50 rounded border text-sm">
            {value || "Valeur en lecture seule"}
          </div>
        ) : (
          renderField()
        )}

        {/* Validation en temps réel */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Aide à la validation */}
        {!error && (validationRules.min || validationRules.max || validationRules.minLength || validationRules.maxLength) && (
          <div className="text-xs text-muted-foreground">
            {validationRules.min && validationRules.max && (
              <span>Valeur entre {validationRules.min} et {validationRules.max}</span>
            )}
            {validationRules.minLength && validationRules.maxLength && (
              <span>Longueur entre {validationRules.minLength} et {validationRules.maxLength} caractères</span>
            )}
          </div>
        )}
      </div>

      {/* Informations techniques */}
      <div className="text-xs text-muted-foreground flex gap-4">
        <span>Clé: <code className="font-mono bg-muted px-1 rounded">{field.fieldKey}</code></span>
        <span>Ordre: {field.displayOrder}</span>
      </div>
    </div>
  );
}