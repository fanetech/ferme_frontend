"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Type, Settings, Plus, Trash2, Hash, Calculator, CheckCircle, Key } from "lucide-react";
import { FormModal } from "@/components/ui/modal/FormModal";

// Hooks
import { useCreateDataField, useUpdateDataField } from "@/data/catalog";
import { ServiceConfig, ServiceDataField, DataType } from "@/types/catalog";
import { toast } from "sonner";
import { TOKEN_FIELD_SOURCE_TYPES, getTokenFieldSourceTypeConfig } from "@/lib/utils/tokenFieldSourceTypes";

interface DataFieldFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceConfig: ServiceConfig;
  endpointId: string;
  dataField?: ServiceDataField | null;
  onSuccess: () => void;
}

// Interface pour une option de champ
interface FieldOption {
  value: string;
  label: string;
  description?: string;
  isDefault?: boolean;
  isDisabled?: boolean;
}

const dataFieldSchema = z.object({
  code: z.string().min(1, "Le code est requis").max(50, "Le code ne doit pas dépasser 50 caractères"),
  key: z.string().min(1, "La clé est requise").max(50, "La clé ne doit pas dépasser 50 caractères"),
  label: z.string().min(1, "Le label est requis").max(100, "Le label ne doit pas dépasser 100 caractères"),
  description: z.string().optional(),
  dataType: z.nativeEnum(DataType),
  defaultValue: z.string().optional(),
  isRequired: z.boolean(),
  isReadonly: z.boolean(),
  isHidden: z.boolean(),
  isAmountField: z.boolean(),
  isAuthToken: z.boolean(),
  tokenFieldSource: z.string().optional(),
  validationRegex: z.string().optional(),
  errorMessage: z.string().optional(),
  minLength: z.string().optional(),
  maxLength: z.string().optional(),
  minValue: z.string().optional(),
  maxValue: z.string().optional(),
  displayOrder: z.number().min(0).optional(),
  placeholder: z.string().optional(),
  hintText: z.string().optional(),
  inputType: z.string().optional(),
  allowMultiple: z.boolean(),
  displayFormat: z.string().optional(),
  inputMask: z.string().optional(),
  dependsOn: z.string().optional(),
  options: z.string().optional(), // JSON string
});

type DataFieldFormData = z.infer<typeof dataFieldSchema>;

export function DataFieldFormModal({ 
  isOpen, 
  onClose, 
  serviceConfig, 
  endpointId, 
  dataField, 
  onSuccess 
}: DataFieldFormModalProps) {
  const { mutate: createField, isPending: isCreating } = useCreateDataField();
  const { mutate: updateField, isPending: isUpdating } = useUpdateDataField();
  const [fieldOptions, setFieldOptions] = useState<FieldOption[]>([]);
  const [fieldMode, setFieldMode] = useState<"text" | "select" | "checkbox">("text");

  const form = useForm<DataFieldFormData>({
    resolver: zodResolver(dataFieldSchema),
    defaultValues: {
      code: "",
      key: "",
      label: "",
      description: "",
      dataType: DataType.STRING,
      defaultValue: "",
      isRequired: false,
      isReadonly: false,
      isHidden: false,
      isAmountField: false,
      isAuthToken: false,
      tokenFieldSource: "",
      validationRegex: "",
      errorMessage: "",
      minLength: "",
      maxLength: "",
      minValue: "",
      maxValue: "",
      displayOrder: 0,
      placeholder: "",
      hintText: "",
      inputType: "",
      allowMultiple: false,
      displayFormat: "",
      inputMask: "",
      dependsOn: "",
      options: "",
    },
  });

  const fieldType = form.watch("dataType");
  const watchedKey = form.watch("key");
  const isAuthToken = form.watch("isAuthToken");

  // Réinitialiser le formulaire quand la modal s'ouvre/ferme
  useEffect(() => {
    if (isOpen) {
      if (dataField) {
        // Mode modification
        form.reset({
          code: dataField.code || "",
          key: dataField.key || "",
          label: dataField.label || "",
          description: dataField.description || "",
          dataType: dataField.dataType as DataType || DataType.STRING,
          defaultValue: dataField.defaultValue || "",
          isRequired: dataField.isRequired || false,
          isReadonly: dataField.isReadonly || false,
          isHidden: dataField.isHidden || false,
          isAmountField: dataField.isAmountField || false,
          isAuthToken: (dataField as any).isAuthToken || false,
          tokenFieldSource: (dataField as any).tokenFieldSource || "",
          validationRegex: dataField.validationRegex || "",
          errorMessage: dataField.errorMessage || "",
          minLength: dataField.minLength?.toString() || "",
          maxLength: dataField.maxLength?.toString() || "",
          minValue: dataField.minValue || "",
          maxValue: dataField.maxValue || "",
          displayOrder: dataField.displayOrder || 0,
          placeholder: dataField.placeholder || "",
          hintText: dataField.hintText || "",
          inputType: dataField.inputType || "",
          allowMultiple: dataField.allowMultiple || false,
          displayFormat: dataField.displayFormat || "",
          inputMask: dataField.inputMask || "",
          dependsOn: dataField.dependsOn || "",
          options: dataField.options || "",
        });

        // Charger les options si elles existent
        if (dataField.options) {
          try {
            const parsedOptions = JSON.parse(dataField.options);
            // Vérifier si c'est la structure imbriquée {options: [...]} ou directement [...]
            if (parsedOptions.options && Array.isArray(parsedOptions.options)) {
              setFieldOptions(parsedOptions.options);
              setFieldMode("select");
            } else if (Array.isArray(parsedOptions)) {
              setFieldOptions(parsedOptions);
              setFieldMode("select");
            } else {
              setFieldOptions([]);
            }
          } catch (error) {
            console.error("Erreur lors du parsing des options:", error);
            setFieldOptions([]);
          }
        } else {
          setFieldOptions([]);
        }
      } else {
        // Mode création
        form.reset({
          code: "",
          key: "",
          label: "",
          description: "",
          dataType: DataType.STRING,
          defaultValue: "",
          isRequired: false,
          isReadonly: false,
          isHidden: false,
          isAmountField: false,
          isAuthToken: false,
          tokenFieldSource: "",
          validationRegex: "",
          errorMessage: "",
          minLength: "",
          maxLength: "",
          minValue: "",
          maxValue: "",
          displayOrder: 0,
          placeholder: "",
          hintText: "",
          inputType: "",
          allowMultiple: false,
          displayFormat: "",
          inputMask: "",
          dependsOn: "",
          options: "",
        });
        setFieldOptions([]);
        setFieldMode("text");
      }
    }
  }, [isOpen, dataField, form]);

  // Auto-générer le code à partir du key
  useEffect(() => {
    if (watchedKey && !dataField) {
      const generatedCode = watchedKey.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      form.setValue("code", generatedCode);
    }
  }, [watchedKey, dataField, form]);

  // Auto-génération de la clé à partir du nom
  const generateFieldKey = (fieldName: string) => {
    return fieldName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  // Gestion du mode de champ
  const handleFieldTypeChange = (type: string) => {
    form.setValue("dataType", type as DataType);
    if (type === DataType.BOOLEAN) {
      setFieldMode("checkbox");
    } else if (type === DataType.STRING && fieldMode === "checkbox") {
      setFieldMode("text");
    }
  };

  const isPending = isCreating || isUpdating;

  const addOption = () => {
    setFieldOptions([...fieldOptions, { value: '', label: '' }]);
  };

  const updateOption = (index: number, field: 'value' | 'label', value: string) => {
    const newOptions = [...fieldOptions];
    newOptions[index][field] = value;
    setFieldOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setFieldOptions(fieldOptions.filter((_, i) => i !== index));
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

  const getFieldTypeIcon = (type: string) => {
    const icons = {
      [DataType.STRING]: <Type className="h-4 w-4" />,
      [DataType.INTEGER]: <Hash className="h-4 w-4" />,
      [DataType.DECIMAL]: <Calculator className="h-4 w-4" />,
      [DataType.BOOLEAN]: <CheckCircle className="h-4 w-4" />,
      [DataType.DATE]: <Settings className="h-4 w-4" />,
      [DataType.DATETIME]: <Settings className="h-4 w-4" />,
      [DataType.EMAIL]: <Type className="h-4 w-4" />,
      [DataType.PHONE]: <Type className="h-4 w-4" />,
      [DataType.URL]: <Type className="h-4 w-4" />,
      [DataType.JSON]: <Settings className="h-4 w-4" />
    };
    return icons[type] || <Settings className="h-4 w-4" />;
  };

  const handleSubmit = async (data: DataFieldFormData) => {
    // Construire les règles de validation
    const validationRules: any = {};
    
    // Ajouter les options si en mode select
    if (fieldMode === "select" && Array.isArray(fieldOptions) && fieldOptions.length > 0) {
      validationRules.options = fieldOptions;
    }
    
    // Ajouter les règles min/max pour les nombres
    if (fieldType === DataType.INTEGER || fieldType === DataType.DECIMAL) {
      const minValue = form.getValues("minValue");
      const maxValue = form.getValues("maxValue");
      if (minValue) validationRules.min = minValue;
      if (maxValue) validationRules.max = maxValue;
    }
    
    // Ajouter les règles min/max length pour les strings
    if (fieldType === DataType.STRING) {
      const minLength = form.getValues("minLength");
      const maxLength = form.getValues("maxLength");
      if (minLength) validationRules.minLength = parseInt(minLength);
      if (maxLength) validationRules.maxLength = parseInt(maxLength);
    }
    
    // Construire les données du champ
    const fieldData: any = {
      ...data,
      endpointConfigId: endpointId,
    };

    // Ajouter les options directement si elles existent
    if (fieldMode === "select" && Array.isArray(fieldOptions) && fieldOptions.length > 0) {
      fieldData.options = JSON.stringify(fieldOptions);
    } else {
      // Pour les autres validations (min/max), stocker dans un objet si nécessaire
      const otherValidations = { ...validationRules };
      delete otherValidations.options; // Supprimer les options si elles existent
      
      if (Object.keys(otherValidations).length > 0) {
        fieldData.validationRules = JSON.stringify(otherValidations);
      }
    }

    if (dataField) {
      // Modification
      updateField({
        id: dataField.id,
        data: fieldData,
      }, {
        onSuccess: () => {
          toast.success("Champ modifié avec succès !");
          onSuccess();
        },
        onError: (error) => {
          toast.error(`Erreur lors de la modification : ${error.message}`);
        },
      });
    } else {
      // Création
      createField(fieldData, {
        onSuccess: () => {
          toast.success("Champ créé avec succès !");
          onSuccess();
        },
        onError: (error) => {
          toast.error(`Erreur lors de la création : ${error.message}`);
        },
      });
    }
  };

  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <Database className="h-5 w-5 text-primary" />
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={dataField ? "Modifier le champ de données" : "Nouveau champ de données"}
      titleIcon={titleIcon}
      subtitle={dataField ? "Modifiez les paramètres du champ" : "Ajoutez un nouveau champ de données à l'endpoint"}
      onSubmit={form.handleSubmit(handleSubmit)}
      submitLabel={dataField ? "Modifier le champ" : "Créer le champ"}
      isSubmitting={isPending}
      isDirty={form.formState.isDirty}
      footerNote={dataField ? "Les modifications seront appliquées immédiatement" : "Le champ sera ajouté à la configuration de l'endpoint"}
    >
      <Form {...form}>
        <div className="space-y-6">
              {/* Informations de base */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Informations de base</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clé technique *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="user_email" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              // Auto-génération de la clé
                              if (!form.getValues('code') || form.getValues('code') === generateFieldKey(form.getValues('key'))) {
                                form.setValue('code', generateFieldKey(e.target.value));
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code unique *</FormLabel>
                        <FormControl>
                          <Input placeholder="USER_EMAIL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Libellé affiché *</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse e-mail" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="placeholder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placeholder</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Entrez votre adresse e-mail" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>



                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description détaillée du champ"
                          rows={2}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>

              {/* Type et configuration */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Type et configuration</h3>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="dataType"
                    render={({ field }) => (
                      <FormItem>
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
                            <SelectItem value={DataType.EMAIL}>
                              <div className="flex items-center gap-2">
                                <Type className="h-4 w-4" />
                                Email (EMAIL)
                              </div>
                            </SelectItem>
                            <SelectItem value={DataType.PHONE}>
                              <div className="flex items-center gap-2">
                                <Type className="h-4 w-4" />
                                Téléphone (PHONE)
                              </div>
                            </SelectItem>
                            <SelectItem value={DataType.URL}>
                              <div className="flex items-center gap-2">
                                <Type className="h-4 w-4" />
                                URL (URL)
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Configuration Token */}
                <FormField
                  control={form.control}
                  name="isAuthToken"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2">
                          <Key className="h-4 w-4" />
                          Champ token d'authentification
                        </FormLabel>
                        <FormDescription>
                          Ce champ contient un token d'authentification
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Source du token - visible seulement si isAuthToken = true */}
                {isAuthToken && (
                  <FormField
                    control={form.control}
                    name="tokenFieldSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source du token *</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-3 gap-3 mt-2">
                            {Object.values(TOKEN_FIELD_SOURCE_TYPES).map((sourceType) => (
                              <Card
                                key={sourceType.value}
                                className={`cursor-pointer transition-all ${
                                  field.value === sourceType.value
                                    ? 'border-primary bg-primary/5'
                                    : 'hover:bg-muted/50'
                                }`}
                                onClick={() => field.onChange(sourceType.value)}
                              >
                                <CardContent className="p-3">
                                  <div className="flex flex-col items-center text-center gap-2">
                                    <div className="text-lg">
                                      {sourceType.icon}
                                    </div>
                                    <div>
                                      <div className="flex items-center justify-center gap-1 mb-1">
                                        <span className="font-medium text-sm">{sourceType.label}</span>
                                        {field.value === sourceType.value && (
                                          <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground leading-tight">
                                        {sourceType.description}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Définit comment ce token sera obtenu et utilisé
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Switch pour champ montant - masqué si token */}
                {!isAuthToken && (fieldType === DataType.INTEGER || fieldType === DataType.DECIMAL) && (
                  <FormField
                    control={form.control}
                    name="isAmountField"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2">
                            💰 Champ montant
                          </FormLabel>
                          <FormDescription>
                            Affichage spécialisé pour les montants avec formatage monétaire
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {/* Mode de champ pour STRING, INTEGER, DECIMAL - masqué si token */}
                {!isAuthToken && (fieldType === DataType.STRING || fieldType === DataType.INTEGER || fieldType === DataType.DECIMAL) && (
                  <div className="space-y-4">
                    <div>
                      <FormLabel>Mode de saisie</FormLabel>
                      <div className="flex gap-2 mt-2">
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
                        <p className="text-xs text-muted-foreground mt-1">
                          Les listes de choix permettent de proposer des valeurs prédéfinies pour les nombres
                        </p>
                      )}
                    </div>

                    {/* Options pour le mode SELECT */}
                    {fieldMode === "select" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <FormLabel>Options de sélection</FormLabel>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addOption}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Ajouter
                          </Button>
                        </div>
                        
                        {Array.isArray(fieldOptions) && fieldOptions.map((option, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <Input
                              type={getValueInputType()}
                              step={fieldType === DataType.DECIMAL ? "0.01" : undefined}
                              placeholder={getValuePlaceholder()}
                              value={option.value}
                              onChange={(e) => updateOption(index, 'value', e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              placeholder="Libellé (ex: Boutique)"
                              value={option.label}
                              onChange={(e) => updateOption(index, 'label', e.target.value)}
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
                        
                        {(!Array.isArray(fieldOptions) || fieldOptions.length === 0) && (
                          <p className="text-sm text-muted-foreground">
                            {fieldType === DataType.STRING 
                              ? "Ajoutez des options pour créer une liste déroulante" 
                              : "Ajoutez des valeurs numériques prédéfinies"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Validation pour nombres - masqué si token */}
                {!isAuthToken && (fieldType === DataType.INTEGER || fieldType === DataType.DECIMAL) && fieldMode === "text" && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Validation des valeurs</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
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
                            <FormDescription>
                              Valeur minimum acceptée
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
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
                            <FormDescription>
                              Valeur maximum acceptée
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Validation pour texte - masqué si token */}
                {!isAuthToken && fieldType === DataType.STRING && fieldMode === "text" && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Validation du texte</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="minLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Longueur minimale</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="0"
                                placeholder="3"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Nombre minimum de caractères
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Longueur maximale</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="1"
                                placeholder="255"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Nombre maximum de caractères
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Aperçu pour BOOLEAN */}
                {fieldType === DataType.BOOLEAN && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Champ booléen (case à cocher)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ce champ sera affiché comme une case à cocher.
                    </p>
                  </div>
                )}
              </div>


              {/* Paramètres avancés */}
              {
                !isAuthToken && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Paramètres avancés</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
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
                            <FormDescription>
                              Position dans le formulaire
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="defaultValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valeur par défaut</FormLabel>
                            <FormControl>
                              <Input placeholder="Valeur automatique" {...field} />
                            </FormControl>
                            <FormDescription>
                              Valeur pré-remplie
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="isRequired"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Champ obligatoire</FormLabel>
                              <FormDescription>
                                L'utilisateur doit remplir ce champ
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isReadonly"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Lecture seule</FormLabel>
                              <FormDescription>
                                L'utilisateur ne peut pas modifier
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="isHidden"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Champ caché</FormLabel>
                            <FormDescription>
                              N'apparaît pas dans l'interface utilisateur
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )
              }

        </div>
      </Form>
    </FormModal>
  );
}