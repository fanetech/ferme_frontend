import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowUpDown, Plus, Trash2, Save, X, Eye, Code } from "lucide-react";
import { toast } from "sonner";

// Hooks
import { useCreateResponseMapping, useUpdateResponseMapping } from "@/data/catalog";
import { ResponseMapping } from "@/types/catalog";

const responseMappingSchema = z.object({
  sourceField: z.string().min(1, "Le champ source est requis"),
  targetField: z.string().min(1, "Le champ cible est requis"),
  fieldType: z.enum(["string", "number", "boolean", "date", "array", "object"]),
  isRequired: z.boolean(),
  defaultValue: z.string().optional(),
  transformation: z.enum(["NONE", "TO_UPPER", "TO_LOWER", "TRIM", "FORMAT_DATE", "PARSE_NUMBER", "CUSTOM"]).optional(),
  transformationRule: z.string().optional(),
  validationRule: z.string().optional(),
  description: z.string().optional()
});

type ResponseMappingFormData = z.infer<typeof responseMappingSchema>;

interface ResponseMappingFormProps {
  endpointId: string;
  responseMapping?: ResponseMapping;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ResponseMappingForm({ 
  endpointId, 
  responseMapping, 
  onSuccess, 
  onCancel 
}: ResponseMappingFormProps) {
  const [testData, setTestData] = useState('{\n  "status": "success",\n  "data": {\n    "amount": "1000.50",\n    "currency": "XOF",\n    "reference": "TXN123456"\n  }\n}');
  
  const { mutate: createMapping, isPending: isCreating } = useCreateResponseMapping();
  const { mutate: updateMapping, isPending: isUpdating } = useUpdateResponseMapping();
  
  const isEditing = !!responseMapping;
  const isPending = isCreating || isUpdating;

  const form = useForm<ResponseMappingFormData>({
    resolver: zodResolver(responseMappingSchema),
    defaultValues: {
      sourceField: responseMapping?.sourceField || "",
      targetField: responseMapping?.targetField || "",
      fieldType: responseMapping?.fieldType || "string",
      isRequired: responseMapping?.isRequired ?? false,
      defaultValue: responseMapping?.defaultValue || "",
      transformation: responseMapping?.transformation || "NONE",
      transformationRule: responseMapping?.transformationRule || "",
      validationRule: responseMapping?.validationRule || "",
      description: responseMapping?.description || ""
    }
  });

  const watchedTransformation = form.watch("transformation");
  const watchedSourceField = form.watch("sourceField");
  const watchedFieldType = form.watch("fieldType");

  const fieldTypes = [
    { value: "string", label: "Texte", description: "Chaîne de caractères" },
    { value: "number", label: "Nombre", description: "Nombre entier ou décimal" },
    { value: "boolean", label: "Booléen", description: "Vrai/Faux" },
    { value: "date", label: "Date", description: "Date/Heure" },
    { value: "array", label: "Tableau", description: "Liste de valeurs" },
    { value: "object", label: "Objet", description: "Objet JSON" }
  ];

  const transformations = [
    { value: "NONE", label: "Aucune", description: "Pas de transformation" },
    { value: "TO_UPPER", label: "Majuscules", description: "Convertir en majuscules" },
    { value: "TO_LOWER", label: "Minuscules", description: "Convertir en minuscules" },
    { value: "TRIM", label: "Nettoyer", description: "Supprimer les espaces" },
    { value: "FORMAT_DATE", label: "Formater date", description: "Formatage de date" },
    { value: "PARSE_NUMBER", label: "Convertir nombre", description: "Convertir en nombre" },
    { value: "CUSTOM", label: "Personnalisé", description: "Règle personnalisée" }
  ];

  const commonMappings = [
    { source: "data.amount", target: "amount", type: "number", desc: "Montant de la transaction" },
    { source: "data.reference", target: "reference", type: "string", desc: "Référence de transaction" },
    { source: "data.status", target: "status", type: "string", desc: "Statut de la réponse" },
    { source: "data.currency", target: "currency", type: "string", desc: "Devise" },
    { source: "data.timestamp", target: "createdAt", type: "date", desc: "Date de création" },
    { source: "errors", target: "errorMessages", type: "array", desc: "Messages d'erreur" }
  ];

  const handlePresetSelect = (preset: typeof commonMappings[0]) => {
    form.setValue("sourceField", preset.source);
    form.setValue("targetField", preset.target);
    form.setValue("fieldType", preset.type as any);
    form.setValue("description", preset.desc);
    toast.info(`Mapping "${preset.target}" appliqué`);
  };

  const testMapping = () => {
    try {
      const responseData = JSON.parse(testData);
      const sourceField = form.getValues("sourceField");
      
      // Simulation d'extraction de valeur
      const value = getNestedValue(responseData, sourceField);
      
      if (value !== undefined) {
        toast.success(`Valeur extraite : ${JSON.stringify(value)}`);
      } else {
        toast.warning(`Aucune valeur trouvée pour le champ "${sourceField}"`);
      }
    } catch (error) {
      toast.error("JSON de test invalide");
    }
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  };

  const onSubmit = async (data: ResponseMappingFormData) => {
    try {
      const mappingData = {
        ...data,
        endpointConfigId: endpointId
      };

      if (isEditing && responseMapping) {
        await updateMapping({ 
          id: responseMapping.id, 
          data: mappingData 
        }, {
          onSuccess: () => {
            toast.success("Mapping mis à jour avec succès");
            onSuccess?.();
          }
        });
      } else {
        await createMapping(mappingData, {
          onSuccess: () => {
            toast.success("Mapping créé avec succès");
            onSuccess?.();
          }
        });
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const renderPreview = () => {
    const formData = form.getValues();
    
    return (
      <div className="space-y-4">
        <div className="bg-muted/50 rounded p-3">
          <h4 className="text-sm font-medium mb-2">Mapping configuré :</h4>
          <div className="space-y-1 text-xs font-mono">
            <div>Source: <span className="text-blue-600">{formData.sourceField || "non défini"}</span></div>
            <div>Cible: <span className="text-green-600">{formData.targetField || "non défini"}</span></div>
            <div>Type: <span className="text-purple-600">{formData.fieldType}</span></div>
            {formData.transformation && formData.transformation !== "NONE" && (
              <div>Transformation: <span className="text-orange-600">{formData.transformation}</span></div>
            )}
          </div>
        </div>
        
        {formData.sourceField && (
          <div>
            <h4 className="text-sm font-medium mb-2">Test du mapping :</h4>
            <div className="space-y-2">
              <Textarea
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                placeholder="JSON de test..."
                className="min-h-[100px] font-mono text-xs"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={testMapping}
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                Tester l'extraction
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">
            {isEditing ? "Modifier le mapping" : "Créer un mapping"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Configuration du mapping de réponse pour l'endpoint
          </p>
        </div>
        
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Mappings prédéfinis */}
          {!isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mappings courants</CardTitle>
                <CardDescription>
                  Configurations prêtes à l'emploi pour les champs communs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {commonMappings.map((preset, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      className="h-auto p-4 justify-start"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      <div className="text-left w-full">
                        <div className="font-medium text-sm">{preset.target}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {preset.source} → {preset.target}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {preset.desc}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration du mapping */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpDown className="h-5 w-5" />
                    Configuration du mapping
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sourceField"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <span className="text-red-500">*</span>
                            Champ source
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="data.amount" {...field} />
                          </FormControl>
                          <FormDescription>
                            Chemin dans la réponse JSON (ex: data.amount)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="targetField"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <span className="text-red-500">*</span>
                            Champ cible
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="amount" {...field} />
                          </FormControl>
                          <FormDescription>
                            Nom du champ dans notre système
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="fieldType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <span className="text-red-500">*</span>
                          Type de données
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fieldTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div>
                                  <div className="font-medium">{type.label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {type.description}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Description du mapping..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Documentation du mapping
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="isRequired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Champ requis</FormLabel>
                            <FormDescription>
                              Ce champ doit être présent dans la réponse
                            </FormDescription>
                          </div>
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
                            <Input placeholder="Valeur si absent..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Valeur utilisée si le champ est absent
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Transformations */}
              <Card>
                <CardHeader>
                  <CardTitle>Transformations</CardTitle>
                  <CardDescription>
                    Règles de transformation des données
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="transformation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de transformation</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {transformations.map((transform) => (
                              <SelectItem key={transform.value} value={transform.value}>
                                <div>
                                  <div className="font-medium">{transform.label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {transform.description}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchedTransformation === "CUSTOM" && (
                    <FormField
                      control={form.control}
                      name="transformationRule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Règle de transformation</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="JavaScript: return value.toUpperCase();"
                              className="min-h-[80px] font-mono"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Code JavaScript pour transformer la valeur
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="validationRule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Règle de validation</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="^[0-9]+$"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Expression régulière pour valider la valeur
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Aperçu et test */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Aperçu du mapping
                  </CardTitle>
                  <CardDescription>
                    Test et prévisualisation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderPreview()}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4 mr-2" />
              {isPending ? "Sauvegarde..." : isEditing ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}