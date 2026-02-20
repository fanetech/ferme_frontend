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
import { Badge } from "@/components/ui/badge";
import { MapPin, Code2, Type, Hash, Calculator, CheckCircle, Settings, TestTube, ArrowRight } from "lucide-react";
import { FormModal } from "@/components/ui/modal/FormModal";

// Hooks
import { useCreateResponseMapping, useUpdateResponseMapping } from "@/data/catalog";
import { ServiceConfig, ResponseMapping, DataType, EndpointType } from "@/types/catalog";
import { toast } from "sonner";

interface ResponseMappingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceConfig: ServiceConfig | null | undefined;
  endpointId: string;
  endpointType: EndpointType;
  responseMapping?: ResponseMapping | null;
  onSuccess: () => void;
}

const responseMappingSchema = z.object({
  jsonPath: z.string().min(1, "Le chemin JSON est requis"),
  isToken: z.boolean(),
  customDataKey: z.string().min(1, "La clé de données est requise"),
  displayName: z.string().min(1, "Le nom d'affichage est requis"),
  dataType: z.nativeEnum(DataType),
  isAmount: z.boolean(),
  isReference: z.boolean(),
  isStatus: z.boolean(),
  isRequired: z.boolean(),
  isHidden: z.boolean(),
  transformExpression: z.string().optional(),
  defaultValue: z.string().optional(),
  validationRegex: z.string().optional(),
  minValue: z.string().optional(),
  maxValue: z.string().optional(),
  displayOrder: z.number().min(0).optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
});

type ResponseMappingFormData = z.infer<typeof responseMappingSchema>;

// Exemples de JSONPath prédéfinis
const JSON_PATH_EXAMPLES = {
  [DataType.STRING]: [
    { path: "$.data.customerName", label: "Nom du client" },
    { path: "$.message", label: "Message de réponse" },
    { path: "$.data.reference", label: "Référence" },
    { path: "$.status", label: "Statut (texte)" }
  ],
  [DataType.DECIMAL]: [
    { path: "$.data.amount", label: "Montant" },
    { path: "$.data.balance", label: "Solde" },
    { path: "$.data.fees", label: "Frais" },
    { path: "$.data.total", label: "Total" }
  ],
  [DataType.INTEGER]: [
    { path: "$.data.count", label: "Nombre" },
    { path: "$.data.quantity", label: "Quantité" },
    { path: "$.code", label: "Code de statut" }
  ],
  [DataType.BOOLEAN]: [
    { path: "$.success", label: "Succès" },
    { path: "$.data.isValid", label: "Valide" },
    { path: "$.data.isActive", label: "Actif" }
  ]
};

export function ResponseMappingFormModal({ 
  isOpen, 
  onClose, 
  serviceConfig, 
  endpointId, 
  endpointType,
  responseMapping, 
  onSuccess 
}: ResponseMappingFormModalProps) {
  const { mutate: createMapping, isPending: isCreating } = useCreateResponseMapping();
  const { mutate: updateMapping, isPending: isUpdating } = useUpdateResponseMapping();
  const [testJsonData, setTestJsonData] = useState("");
  const [testResult, setTestResult] = useState<any>(null);

  const form = useForm<ResponseMappingFormData>({
    resolver: zodResolver(responseMappingSchema),
    defaultValues: {
      jsonPath: "",
      isToken: false,
      customDataKey: "",
      displayName: "",
      dataType: DataType.STRING,
      isAmount: false,
      isReference: false,
      isStatus: false,
      isRequired: false,
      isHidden: false,
      transformExpression: "",
      defaultValue: "",
      validationRegex: "",
      minValue: "",
      maxValue: "",
      displayOrder: 0,
      prefix: "",
      suffix: "",
    },
  });

  const dataType = form.watch("dataType");
  const jsonPath = form.watch("jsonPath");

  // Réinitialiser le formulaire quand la modal s'ouvre/ferme
  useEffect(() => {
    if (isOpen) {
      if (responseMapping) {
        // Mode modification
        form.reset({
          jsonPath: responseMapping.jsonPath || "",
          isToken: responseMapping.customDataKey === 'auth_token' || false,
          customDataKey: responseMapping.customDataKey || "",
          displayName: responseMapping.displayName || "",
          dataType: responseMapping.dataType as DataType || DataType.STRING,
          isAmount: responseMapping.isAmount || false,
          isReference: responseMapping.isReference || false,
          isStatus: responseMapping.isStatus || false,
          isRequired: responseMapping.isRequired || false,
          isHidden: responseMapping.isHidden || false,
          transformExpression: responseMapping.transformExpression || "",
          defaultValue: responseMapping.defaultValue || "",
          validationRegex: responseMapping.validationRegex || "",
          minValue: responseMapping.minValue || "",
          maxValue: responseMapping.maxValue || "",
          displayOrder: responseMapping.displayOrder || 0,
          prefix: responseMapping.prefix || "",
          suffix: responseMapping.suffix || "",
        });
      } else {
        // Mode création
        form.reset({
          jsonPath: "",
          isToken: false,
          customDataKey: "",
          displayName: "",
          dataType: DataType.STRING,
          isAmount: false,
          isReference: false,
          isStatus: false,
          isRequired: false,
          isHidden: false,
          transformExpression: "",
          defaultValue: "",
          validationRegex: "",
          minValue: "",
          maxValue: "",
          displayOrder: 0,
          prefix: "",
          suffix: "",
        });
      }
      setTestJsonData("");
      setTestResult(null);
    }
  }, [isOpen, responseMapping, form]);

  // Auto-génération de la clé à partir du JSONPath
  useEffect(() => {
    if (jsonPath && !responseMapping) {
      const segments = jsonPath.split('.');
      const lastSegment = segments[segments.length - 1];
      if (lastSegment && lastSegment !== '$') {
        const generatedKey = lastSegment
          .replace(/[\[\]"']/g, '')
          .replace(/([A-Z])/g, '_$1')
          .toLowerCase()
          .replace(/^_/, '');
        
        if (!form.getValues('customDataKey')) {
          form.setValue('customDataKey', generatedKey);
        }
        
        if (!form.getValues('displayName')) {
          form.setValue('displayName', generatedKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
        }
      }
    }
  }, [jsonPath, responseMapping, form]);

  const isPending = isCreating || isUpdating;

  // Test du JSONPath
  const handleTestJsonPath = () => {
    if (!jsonPath || !testJsonData) {
      toast.error("Veuillez remplir le JSONPath et les données JSON de test");
      return;
    }

    try {
      const jsonData = JSON.parse(testJsonData);
      const result = evaluateJsonPath(jsonPath, jsonData);
      setTestResult(result);
      toast.success("Test JSONPath réussi !");
    } catch (error) {
      console.error("Erreur lors du test JSONPath:", error);
      toast.error("Erreur lors du test : JSON invalide ou JSONPath incorrect");
      setTestResult(null);
    }
  };

  // Évaluation simple de JSONPath (version basique)
  const evaluateJsonPath = (path: string, data: any): any => {
    if (path === "$") return data;
    
    const segments = path.replace(/^\$\.?/, '').split('.');
    let current = data;
    
    for (const segment of segments) {
      if (current === null || current === undefined) return null;
      if (typeof current === 'object' && segment in current) {
        current = current[segment];
      } else {
        return null;
      }
    }
    
    return current;
  };

  const getDataTypeIcon = (type: DataType) => {
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

  const getMappingTypeIcon = () => {
    if (form.watch("isAmount")) return "💰";
    if (form.watch("isReference")) return "🔗";
    if (form.watch("isStatus")) return "✅";
    return "📝";
  };

  const handleSubmit = async (data: ResponseMappingFormData) => {
    if (!serviceConfig) {
      toast.error("Configuration de service non disponible");
      return;
    }

    const mappingData = {
      ...data,
      endpointConfigId: endpointId,
      serviceConfigId: serviceConfig.id,
      endpointType: endpointType,
    };

    if (responseMapping) {
      // Modification
      updateMapping({
        id: responseMapping.id,
        data: mappingData,
      }, {
        onSuccess: () => {
          onSuccess();
        }
      });
    } else {
      // Création
      createMapping(mappingData, {
        onSuccess: () => {
          onSuccess();
        }
      });
    }
  };

  const insertJsonPathExample = (path: string, label: string) => {
    form.setValue("jsonPath", path);
    toast.info(`JSONPath "${label}" inséré`);
  };

  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <MapPin className="h-5 w-5 text-primary" />
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={responseMapping ? "Modifier le mapping de réponse" : "Nouveau mapping de réponse"}
      titleIcon={titleIcon}
      subtitle={`Configuration du mapping pour l'endpoint ${endpointType}`}
      onSubmit={form.handleSubmit(handleSubmit)}
      submitLabel={responseMapping ? "Modifier le mapping" : "Créer le mapping"}
      isSubmitting={isPending}
      isDirty={form.formState.isDirty}
      footerNote={responseMapping ? "Les modifications seront appliquées immédiatement" : "Le mapping sera ajouté à la configuration de l'endpoint"}
    >
      <Form {...form}>
        <div className="space-y-6">
              
              {/* Informations de base */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Configuration du mapping</h3>
                
                <div className="grid grid-cols-2 gap-4 items-start">
                  <FormField
                    control={form.control}
                    name="jsonPath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>JSONPath *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="$.data.amount" 
                            {...field}
                            className="font-mono"
                          />
                        </FormControl>
                        <FormDescription>
                          Chemin vers la valeur dans la réponse JSON
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dataType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de données *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Exemples de JSONPath selon le type */}
                <div className="space-y-2">
                  <FormLabel className="text-xs text-muted-foreground">Exemples pour {dataType}</FormLabel>
                  <div className="grid gap-1">
                    {JSON_PATH_EXAMPLES[dataType]?.map((example, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-8"
                        onClick={() => insertJsonPathExample(example.path, example.label)}
                      >
                        <Code2 className="h-3 w-3 mr-2" />
                        <span className="font-mono">{example.path}</span>
                        <ArrowRight className="h-3 w-3 mx-1" />
                        <span>{example.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Toggle Token */}
                <FormField
                  control={form.control}
                  name="isToken"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Token d'authentification</FormLabel>
                        <FormDescription>
                          Ce mapping extrait un token d'authentification qui sera utilisé pour les appels suivants
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              form.setValue('customDataKey', 'auth_token');
                              form.setValue('displayName', 'Token d\'authentification');
                              form.setValue('dataType', DataType.STRING);
                              form.setValue('isRequired', true);
                            } else {
                              form.setValue('customDataKey', '');
                              form.setValue('displayName', '');
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customDataKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clé de données *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="amount_due" 
                            {...field} 
                            readOnly={form.watch('isToken')}
                            className={form.watch('isToken') ? 'bg-muted' : ''}
                          />
                        </FormControl>
                        {form.watch('isToken') && (
                          <FormDescription>
                            🔐 Automatiquement défini sur "auth_token" pour les tokens
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d'affichage *</FormLabel>
                        <FormControl>
                          <Input placeholder="Montant dû" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="defaultValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valeur par défaut</FormLabel>
                      <FormControl>
                        <Input placeholder="Valeur si le mapping échoue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Catégorisation du mapping */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {getMappingTypeIcon()} Catégorisation
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="isAmount"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2 text-sm">
                            💰 Montant
                          </FormLabel>
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
                    name="isReference"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2 text-sm">
                            🔗 Référence
                          </FormLabel>
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
                    name="isStatus"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2 text-sm">
                            ✅ Statut
                          </FormLabel>
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
                    name="isRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-2 text-sm">
                            ⚠️ Obligatoire
                          </FormLabel>
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
              </div>


              {/* Validation pour nombres */}
              {(dataType === DataType.INTEGER || dataType === DataType.DECIMAL) && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Validation des valeurs</h3>
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
                              step={dataType === DataType.DECIMAL ? "0.01" : "1"}
                              placeholder="0"
                              {...field} 
                            />
                          </FormControl>
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
                              step={dataType === DataType.DECIMAL ? "0.01" : "1"}
                              placeholder="999999"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Paramètres avancés */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Paramètres avancés</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="prefix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Préfixe</FormLabel>
                        <FormControl>
                          <Input placeholder="€" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="suffix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suffixe</FormLabel>
                        <FormControl>
                          <Input placeholder="EUR" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="transformExpression"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expression de transformation</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="value * 100 // Convertir en centimes"
                            rows={2}
                            className="font-mono text-sm"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Expression JavaScript pour transformer la valeur (optionnel)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="validationRegex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regex de validation</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="^[A-Z]{3}-[0-9]{6}$"
                            className="font-mono"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Expression régulière pour valider la valeur (optionnel)
                        </FormDescription>
                        <FormMessage />
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

        </div>
      </Form>
    </FormModal>
  );
}