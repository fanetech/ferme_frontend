"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, AlertCircle, Type, Hash, Calendar, CheckCircle, Loader2, DollarSign, Key } from "lucide-react";
import { useDataFields } from "@/data/catalog";
import { InputAmount } from "./InputAmount";
import { TOKEN_FIELD_SOURCE_TYPES } from "@/lib/utils/tokenFieldSourceTypes";

interface DataFieldsInputProps {
  endpointId: string;
  formData: Record<string, any>;
  onChange: (fieldKey: string, value: any) => void;
}

export function DataFieldsInput({ 
  endpointId, 
  formData, 
  onChange 
}: DataFieldsInputProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { data: dataFields = [], isLoading } = useDataFields(
    endpointId,
    !!endpointId
  );

  // Trier les champs par ordre
  const sortedFields = [...dataFields]
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const validateField = (field: any, value: any) => {
    const newErrors = { ...errors };
    
    if (field.isRequired && (!value || value === "")) {
      newErrors[field.key] = "Ce champ est obligatoire";
    } else {
      delete newErrors[field.key];
    }

    // Validation pour les nombres
    if (field.dataType === "INTEGER" || field.dataType === "DECIMAL") {
      const numVal = parseFloat(value);
      if (value !== "" && isNaN(numVal)) {
        newErrors[field.key] = "Veuillez entrer un nombre valide";
      }
    }

    // Validation regex
    if (field.validationRegex && value && value !== "") {
      const regex = new RegExp(field.validationRegex);
      if (!regex.test(value)) {
        newErrors[field.key] = field.errorMessage || "Format invalide";
      }
    }

    setErrors(newErrors);
  };

  const handleFieldChange = (field: any, value: any) => {
    validateField(field, value);
    onChange(field.key, value);
  };

  const getFieldIcon = (field: any) => {
    // Icône spéciale pour les champs token d'authentification
    if (field.isAuthToken) {
      return <Key className="h-4 w-4 text-blue-600" />;
    }
    
    // Icône spéciale pour les champs montant
    if (field.isAmountField && (field.dataType === "INTEGER" || field.dataType === "DECIMAL")) {
      return <DollarSign className="h-4 w-4 text-green-600" />;
    }
    
    switch (field.dataType) {
      case "STRING":
        return <Type className="h-4 w-4" />;
      case "INTEGER":
      case "DECIMAL":
        return <Hash className="h-4 w-4" />;
      case "DATE":
        return <Calendar className="h-4 w-4" />;
      case "BOOLEAN":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.key] || "";

    // Rendu spécial pour les champs token d'authentification
    if (field.isAuthToken) {
      const tokenSourceConfig = TOKEN_FIELD_SOURCE_TYPES[field.tokenFieldSource as keyof typeof TOKEN_FIELD_SOURCE_TYPES];
      
      return (
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {tokenSourceConfig?.icon || '🔑'}
            </div>
            <div>
              <div className="font-medium text-blue-900 dark:text-blue-100">
                {tokenSourceConfig?.label || 'Token d\'authentification'}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {tokenSourceConfig?.description || 'Token géré automatiquement'}
              </div>
            </div>
          </div>
          <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
            <Key className="h-3 w-3 mr-1" />
            AUTO
          </Badge>
        </div>
      );
    }

    // Si le champ a des options (pour les champs select)
    if (field.options) {
      try {
        const options = JSON.parse(field.options);
        if (Array.isArray(options) && options.length > 0) {
          return (
            <Select value={value} onValueChange={(val) => handleFieldChange(field, val)}>
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
      } catch (e) {
        // Si le parsing échoue, on affiche un input normal
      }
    }

    // Rendu selon le type de champ
    switch (field.dataType) {
      case "BOOLEAN":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.key}
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(field, checked)}
            />
            <Label htmlFor={field.key}>
              {field.description || "Cocher si applicable"}
            </Label>
          </div>
        );

      case "INTEGER":
        // Champ montant spécialisé
        if (field.isAmountField) {
          return (
            <InputAmount
              value={value}
              onChange={(val) => handleFieldChange(field, val)}
              placeholder={field.placeholder || field.description}
              currency="XOF"
            />
          );
        }
        
        return (
          <Input
            type="number"
            step="1"
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            placeholder={field.placeholder || field.description}
          />
        );

      case "DECIMAL":
        // Champ montant spécialisé
        if (field.isAmountField) {
          return (
            <InputAmount
              value={value}
              onChange={(val) => handleFieldChange(field, val)}
              placeholder={field.placeholder || field.description}
              currency="XOF"
            />
          );
        }
        
        return (
          <Input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            placeholder={field.placeholder || field.description}
          />
        );

      case "DATE":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case "STRING":
      default:
        if (field.description && field.description.length > 50) {
          return (
            <Textarea
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              placeholder={field.placeholder || field.description}
              rows={3}
            />
          );
        }
        
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            placeholder={field.placeholder || field.description}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sortedFields.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">Aucun champ configuré</h3>
        <p className="text-sm">
          Configurez d'abord les champs de données pour cet endpoint<br />
          dans l'onglet "Champs".
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4" />
        <h3 className="font-medium">Champs de données</h3>
        <Badge variant="outline" className="text-xs">
          {sortedFields.length} champ{sortedFields.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {sortedFields.map((field) => (
        <div key={field.id} className="space-y-3">
          {/* En-tête du champ */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {getFieldIcon(field)}
              <Label className="text-base font-medium">
                {field.label}
                {field.isRequired && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs">
                {field.dataType}
              </Badge>
              {field.isAuthToken && (
                <Badge variant="default" className="text-xs bg-blue-600 hover:bg-blue-700">
                  🔑 TOKEN
                </Badge>
              )}
              {field.isAmountField && (
                <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                  💰 MONTANT
                </Badge>
              )}
              {field.isHidden && (
                <Badge variant="secondary" className="text-xs">
                  👁️ Caché
                </Badge>
              )}
              {field.isReadonly && (
                <Badge variant="secondary" className="text-xs">
                  🔒 Lecture seule
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
            {renderField(field)}

            {/* Erreur de validation */}
            {errors[field.key] && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors[field.key]}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Informations techniques */}
          <div className="text-xs text-muted-foreground flex gap-4">
            <span>Clé: <code className="font-mono bg-muted px-1 rounded">{field.key}</code></span>
            {field.defaultValue && (
              <span>Défaut: <code className="font-mono bg-muted px-1 rounded">{field.defaultValue}</code></span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}