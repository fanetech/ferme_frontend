"use client";

import { useState, useEffect } from "react";
import { Control, UseFormSetValue, UseFormGetValues, UseFormWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DataType } from "@/types/catalog";
import { CalculationFieldFormData, CalculationFieldRole } from "@/lib/utils/formValidators";
import { Plus, Trash2, Hash, Type, Calculator, CheckCircle, Settings } from "lucide-react";

interface CalculationFieldFormProps {
  control: Control<CalculationFieldFormData>;
  setValue: UseFormSetValue<CalculationFieldFormData>;
  getValues: UseFormGetValues<CalculationFieldFormData>;
  watch: UseFormWatch<CalculationFieldFormData>;
  initialData?: Partial<CalculationFieldFormData>;
  options: Array<{ value: string; label: string }>;
  setOptions: (options: Array<{ value: string; label: string }>) => void;
  fieldMode: "text" | "select" | "checkbox";
  setFieldMode: (mode: "text" | "select" | "checkbox") => void;
}

export function CalculationFieldForm({
  control,
  setValue,
  getValues,
  watch,
  initialData,
  options,
  setOptions,
  fieldMode,
  setFieldMode
}: CalculationFieldFormProps) {
  const fieldType = watch("fieldType");
  const fieldRole = watch("fieldRole");

  // Initialiser les options et les règles de validation si les données initiales existent
  useEffect(() => {
    if (initialData?.validationRules) {
      try {
        const rules = JSON.parse(initialData.validationRules);

        // Charger les options
        if (rules.options && Array.isArray(rules.options)) {
          setOptions(rules.options);
          setFieldMode("select");
        }

        // Charger les règles de validation
        if (rules.min !== undefined) {
          setValue("minValue", rules.min.toString());
        }
        if (rules.max !== undefined) {
          setValue("maxValue", rules.max.toString());
        }
        if (rules.minLength !== undefined) {
          setValue("minLength", rules.minLength.toString());
        }
        if (rules.maxLength !== undefined) {
          setValue("maxLength", rules.maxLength.toString());
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, [initialData?.validationRules, setValue, setOptions, setFieldMode]);

  // Auto-génération de la clé à partir du nom
  const generateFieldKey = (fieldName: string) => {
    return fieldName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  };

  // Gestion du mode de champ
  const handleFieldTypeChange = (type: string) => {
    setValue("fieldType", type);
    if (type === DataType.BOOLEAN) {
      setFieldMode("checkbox");
    } else if (type === DataType.STRING && fieldMode === "checkbox") {
      setFieldMode("text");
    }
  };

  const addOption = () => {
    setOptions([...options, { value: "", label: "" }]);
  };

  const updateOption = (index: number, field: "value" | "label", value: string) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  // Helper pour le type de valeur d'une option selon le type de champ
  const getValueInputType = () => {
    if (fieldType === DataType.INTEGER) return "number";
    if (fieldType === DataType.DECIMAL) return "number";
    return "text";
  };

  const getValuePlaceholder = () => {
    if (fieldType === DataType.INTEGER) return "Valeur (ex: 100)";
    if (fieldType === DataType.DECIMAL) return "Valeur (ex: 99.50)";
    return "Valeur (ex: boutique)";
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const getFieldTypeIcon = (type: string) => {
    const icons = {
      [DataType.STRING]: <Type className="h-4 w-4" />,
      [DataType.INTEGER]: <Hash className="h-4 w-4" />,
      [DataType.DECIMAL]: <Calculator className="h-4 w-4" />,
      [DataType.BOOLEAN]: <CheckCircle className="h-4 w-4" />,
      [DataType.DATE]: <Settings className="h-4 w-4" />
    };
    return icons[type] || <Settings className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-muted-foreground text-sm font-medium">Informations de base</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="fieldName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom technique *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="superficie_local"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      // Auto-génération de la clé
                      if (
                        !getValues("fieldKey") ||
                        getValues("fieldKey") === generateFieldKey(getValues("fieldName"))
                      ) {
                        setValue("fieldKey", generateFieldKey(e.target.value));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="fieldKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clé unique *</FormLabel>
                <FormControl>
                  <Input placeholder="superficie_local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Libellé affiché *</FormLabel>
              <FormControl>
                <Input placeholder="Superficie du local (m²)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Description détaillée du champ" rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="placeholder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placeholder</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Entrez la superficie en m²" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Type et configuration */}
      <div className="space-y-4">
        <h3 className="text-muted-foreground text-sm font-medium">Type et configuration</h3>
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={control}
            name="fieldType"
            render={({ field }) => (
              <FormItem  className={"cols-span-1"}>
                <FormLabel>Type de données *</FormLabel>
                <Select onValueChange={handleFieldTypeChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={"w-full"}>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={DataType.STRING}>
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Texte (STRING)
                      </div>
                    </SelectItem>
                    <SelectItem value={DataType.INTEGER}>
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Nombre entier (INTEGER)
                      </div>
                    </SelectItem>
                    <SelectItem value={DataType.DECIMAL}>
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Nombre décimal (DECIMAL)
                      </div>
                    </SelectItem>
                    <SelectItem value={DataType.BOOLEAN}>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Booléen (BOOLEAN)
                      </div>
                    </SelectItem>
                    <SelectItem value={DataType.DATE}>
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Date (DATE)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Switch pour champ montant */}
        {(fieldType === DataType.INTEGER || fieldType === DataType.DECIMAL) && (
          <FormField
            control={control}
            name="isAmountField"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="flex items-center gap-2">💰 Champ montant</FormLabel>
                  <FormDescription>
                    Affichage spécialisé pour les montants avec formatage monétaire
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {/* Switch pour montant de base */}
        {(fieldType === DataType.INTEGER || fieldType === DataType.DECIMAL) && (
          <FormField
            control={control}
            name="isBaseAmount"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="flex items-center gap-2">🎯 Montant de base</FormLabel>
                  <FormDescription>
                    Ce champ sera utilisé comme montant de base pour les calculs de tarification
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {/* Mode de champ pour STRING, INTEGER, DECIMAL */}
        {(fieldType === DataType.STRING ||
          fieldType === DataType.INTEGER ||
          fieldType === DataType.DECIMAL) && (
          <div className="space-y-4">
            <div>
              <FormLabel>Mode de saisie</FormLabel>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  variant={fieldMode === "text" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFieldMode("text")}
                >
                  {fieldType === DataType.STRING ? "Texte libre" : "Saisie libre"}
                </Button>
                <Button
                  type="button"
                  variant={fieldMode === "select" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFieldMode("select")}
                >
                  Liste de choix
                </Button>
              </div>
              {(fieldType === DataType.INTEGER || fieldType === DataType.DECIMAL) && (
                <p className="text-muted-foreground mt-1 text-xs">
                  Les listes de choix permettent de proposer des valeurs prédéfinies pour les
                  nombres
                </p>
              )}
            </div>

            {/* Options pour le mode SELECT */}
            {fieldMode === "select" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>Options de sélection</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="mr-1 h-4 w-4" />
                    Ajouter
                  </Button>
                </div>

                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type={getValueInputType()}
                      step={fieldType === DataType.DECIMAL ? "0.01" : undefined}
                      placeholder={getValuePlaceholder()}
                      value={option.value}
                      onChange={(e) => updateOption(index, "value", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Libellé (ex: Boutique)"
                      value={option.label}
                      onChange={(e) => updateOption(index, "label", e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {options.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    {fieldType === DataType.STRING
                      ? "Ajoutez des options pour créer une liste déroulante"
                      : "Ajoutez des valeurs numériques prédéfinies"}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Validation pour nombres */}
        {(fieldType === DataType.INTEGER || fieldType === DataType.DECIMAL) &&
          fieldMode === "text" && (
            <div className="space-y-4">
              <h4 className="font-medium">Validation des valeurs</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="minValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valeur minimale</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={fieldType === DataType.DECIMAL ? "0.01" : "1"}
                          placeholder={fieldType === DataType.INTEGER ? "100" : "99.50"}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Valeur minimum acceptée</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="maxValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valeur maximale</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step={fieldType === DataType.DECIMAL ? "0.01" : "1"}
                          placeholder={fieldType === DataType.INTEGER ? "10000" : "9999.99"}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Valeur maximum acceptée</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

        {/* Validation pour texte */}
        {fieldType === DataType.STRING && fieldMode === "text" && (
          <div className="space-y-4">
            <h4 className="font-medium">Validation du texte</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="minLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longueur minimale</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="3" {...field} />
                    </FormControl>
                    <FormDescription>Nombre minimum de caractères</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="maxLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longueur maximale</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="255" {...field} />
                    </FormControl>
                    <FormDescription>Nombre maximum de caractères</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Aperçu pour BOOLEAN */}
        {fieldType === DataType.BOOLEAN && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Champ booléen (case à cocher)</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Ce champ sera affiché comme une case à cocher.
            </p>
          </div>
        )}
      </div>

      {/* Paramètres avancés */}
      <div className="space-y-4">
        <h3 className="text-muted-foreground text-sm font-medium">Paramètres avancés</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={control}
            name="displayOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ordre d'affichage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>Position dans le formulaire</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="defaultValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valeur par défaut</FormLabel>
                <FormControl>
                  <Input placeholder="Valeur automatique" {...field} />
                </FormControl>
                <FormDescription>Valeur pré-remplie</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={control}
            name="isRequired"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Champ obligatoire</FormLabel>
                  <FormDescription>L'utilisateur doit remplir ce champ</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="isVisible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Champ visible</FormLabel>
                  <FormDescription>Affiché dans l'interface utilisateur</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Formule pour OUTPUT et INTERMEDIATE */}
        {fieldRole !== CalculationFieldRole.INPUT && (
          <FormField
            control={control}
            name="formula"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Formule de calcul</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="superficie_local * tarif_m2"
                    rows={3}
                    className="font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Formule JavaScript pour calculer la valeur automatiquement
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}
