import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Database, Plus, Trash2, Save, X, Eye } from "lucide-react";
import { toast } from "sonner";

// Hooks
import { useCreateDataField, useUpdateDataField } from "@/data/catalog";
import { ServiceDataField } from "@/types/catalog";

const dataFieldSchema = z.object({
  name: z.string().min(1, "Le nom est requis").regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Nom invalide (lettres, chiffres, _ seulement)"),
  label: z.string().min(1, "Le libellé est requis"),
  type: z.enum(["text", "number", "boolean", "select", "date", "email", "phone", "textarea"]),
  required: z.boolean(),
  defaultValue: z.string().optional(),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  validationRules: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    options: z.array(z.string()).optional()
  }).optional(),
  displayOrder: z.number().min(0),
  metadata: z.record(z.any()).optional()
});

type DataFieldFormData = z.infer<typeof dataFieldSchema>;

interface DataFieldFormProps {
  endpointId: string;
  dataField?: ServiceDataField;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DataFieldForm({ 
  endpointId, 
  dataField, 
  onSuccess, 
  onCancel 
}: DataFieldFormProps) {
  const [previewValue, setPreviewValue] = useState("");
  
  const { mutate: createField, isPending: isCreating } = useCreateDataField();
  const { mutate: updateField, isPending: isUpdating } = useUpdateDataField();
  
  const isEditing = !!dataField;
  const isPending = isCreating || isUpdating;

  const form = useForm<DataFieldFormData>({
    resolver: zodResolver(dataFieldSchema),
    defaultValues: {
      name: dataField?.key || "",
      label: dataField?.label || "",
      type: (dataField?.dataType as "text" | "number" | "boolean" | "select" | "date" | "email" | "phone" | "textarea") || "text",
      required: dataField?.isRequired ?? false,
      defaultValue: dataField?.defaultValue || "",
      placeholder: dataField?.placeholder || "",
      description: dataField?.description || "",
      validationRules: (dataField as any)?.validationRules || {},
      displayOrder: dataField?.displayOrder || 0,
      metadata: (dataField as any)?.metadata || {}
    }
  });

  const watchedType = form.watch("type");
  const watchedValidationRules = form.watch("validationRules");

  const fieldTypes = [
    { value: "text", label: "Texte", description: "Champ de texte simple" },
    { value: "textarea", label: "Texte long", description: "Zone de texte multiligne" },
    { value: "number", label: "Nombre", description: "Nombre entier ou décimal" },
    { value: "boolean", label: "Booléen", description: "Vrai/Faux ou Oui/Non" },
    { value: "select", label: "Liste déroulante", description: "Sélection dans une liste" },
    { value: "date", label: "Date", description: "Sélecteur de date" },
    { value: "email", label: "Email", description: "Adresse email" },
    { value: "phone", label: "Téléphone", description: "Numéro de téléphone" }
  ];

  const updateValidationRule = (key: string, value: any) => {
    const currentRules = form.getValues("validationRules") || {};
    if (value === "" || value === undefined) {
      const { [key]: removed, ...rest } = currentRules as Record<string, any>;
      form.setValue("validationRules", rest);
    } else {
      form.setValue("validationRules", {
        ...currentRules,
        [key]: value
      });
    }
  };

  const addSelectOption = () => {
    const currentRules = form.getValues("validationRules") || {};
    const options = currentRules.options || [];
    form.setValue("validationRules", {
      ...currentRules,
      options: [...options, ""]
    });
  };

  const updateSelectOption = (index: number, value: string) => {
    const currentRules = form.getValues("validationRules") || {};
    const options = [...(currentRules.options || [])];
    if (value.trim() === "") {
      options.splice(index, 1);
    } else {
      options[index] = value;
    }
    form.setValue("validationRules", {
      ...currentRules,
      options
    });
  };

  const removeSelectOption = (index: number) => {
    const currentRules = form.getValues("validationRules") || {};
    const options = [...(currentRules.options || [])];
    options.splice(index, 1);
    form.setValue("validationRules", {
      ...currentRules,
      options
    });
  };

  const onSubmit = async (data: DataFieldFormData) => {
    try {
      const fieldData = {
        ...data,
        endpointConfigId: endpointId
      };

      if (isEditing && dataField) {
        await updateField({ 
          id: dataField.id, 
          data: fieldData 
        }, {
          onSuccess: () => {
            toast.success("Champ mis à jour avec succès");
            onSuccess?.();
          }
        });
      } else {
        await createField(fieldData, {
          onSuccess: () => {
            toast.success("Champ créé avec succès");
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
    
    switch (watchedType) {
      case "text":
      case "email":
      case "phone":
        return (
          <Input
            placeholder={formData.placeholder || formData.label}
            value={previewValue}
            onChange={(e) => setPreviewValue(e.target.value)}
            disabled
          />
        );
      case "textarea":
        return (
          <Textarea
            placeholder={formData.placeholder || formData.label}
            value={previewValue}
            onChange={(e) => setPreviewValue(e.target.value)}
            disabled
          />
        );
      case "number":
        return (
          <Input
            type="number"
            placeholder={formData.placeholder || formData.label}
            min={formData.validationRules?.min}
            max={formData.validationRules?.max}
            value={previewValue}
            onChange={(e) => setPreviewValue(e.target.value)}
            disabled
          />
        );
      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Switch disabled />
            <span className="text-sm">{formData.label}</span>
          </div>
        );
      case "select":
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder={formData.placeholder || `Sélectionnez ${formData.label}`} />
            </SelectTrigger>
            <SelectContent>
              {(formData.validationRules?.options || []).map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "date":
        return (
          <Input
            type="date"
            value={previewValue}
            onChange={(e) => setPreviewValue(e.target.value)}
            disabled
          />
        );
      default:
        return <div className="text-muted-foreground">Aperçu non disponible</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">
            {isEditing ? "Modifier le champ" : "Créer un champ"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Configuration d'un champ de données pour l'endpoint
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration du champ */}
            <div className="space-y-6">
              {/* Informations de base */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Informations de base
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <span className="text-red-500">*</span>
                            Nom technique
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="nomChamp" {...field} />
                          </FormControl>
                          <FormDescription>
                            Nom utilisé dans l'API (lettres, chiffres, _)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <span className="text-red-500">*</span>
                            Libellé
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Nom du champ" {...field} />
                          </FormControl>
                          <FormDescription>
                            Texte affiché à l'utilisateur
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <span className="text-red-500">*</span>
                          Type de champ
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
                            placeholder="Description du champ..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Aide contextuelle pour l'utilisateur
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="placeholder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Placeholder</FormLabel>
                          <FormControl>
                            <Input placeholder="Texte d'exemple..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Texte d'aide dans le champ
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
                            <Input placeholder="Valeur par défaut..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Valeur pré-remplie
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="required"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Champ requis</FormLabel>
                          <FormDescription>
                            Ce champ doit être rempli obligatoirement
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
                </CardContent>
              </Card>

              {/* Règles de validation */}
              <Card>
                <CardHeader>
                  <CardTitle>Règles de validation</CardTitle>
                  <CardDescription>
                    Contraintes et validations spécifiques au type de champ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(watchedType === "text" || watchedType === "textarea") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Longueur minimum</label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={watchedValidationRules?.min || ""}
                          onChange={(e) => updateValidationRule("min", parseInt(e.target.value) || undefined)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Longueur maximum</label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="255"
                          value={watchedValidationRules?.max || ""}
                          onChange={(e) => updateValidationRule("max", parseInt(e.target.value) || undefined)}
                        />
                      </div>
                    </div>
                  )}

                  {watchedType === "number" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Valeur minimum</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={watchedValidationRules?.min || ""}
                          onChange={(e) => updateValidationRule("min", parseFloat(e.target.value) || undefined)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Valeur maximum</label>
                        <Input
                          type="number"
                          placeholder="100"
                          value={watchedValidationRules?.max || ""}
                          onChange={(e) => updateValidationRule("max", parseFloat(e.target.value) || undefined)}
                        />
                      </div>
                    </div>
                  )}

                  {(watchedType === "text" || watchedType === "email" || watchedType === "phone") && (
                    <div>
                      <label className="text-sm font-medium">Pattern (regex)</label>
                      <Input
                        placeholder="^[A-Za-z]+$"
                        value={watchedValidationRules?.pattern || ""}
                        onChange={(e) => updateValidationRule("pattern", e.target.value || undefined)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Expression régulière pour valider le format
                      </p>
                    </div>
                  )}

                  {watchedType === "select" && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Options</label>
                      <div className="space-y-2">
                        {(watchedValidationRules?.options || []).map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={option}
                              placeholder={`Option ${index + 1}`}
                              onChange={(e) => updateSelectOption(index, e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeSelectOption(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addSelectOption}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter une option
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Aperçu */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Aperçu du champ
                  </CardTitle>
                  <CardDescription>
                    Prévisualisation du rendu du champ
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 flex items-center gap-1">
                      {form.watch("required") && <span className="text-red-500">*</span>}
                      {form.watch("label") || "Libellé du champ"}
                    </label>
                    {renderPreview()}
                    {form.watch("description") && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {form.watch("description")}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Propriétés</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Nom technique :</span>
                        <code>{form.watch("name") || "nomChamp"}</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Type :</span>
                        <Badge variant="outline" className="text-xs">
                          {form.watch("type")}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Requis :</span>
                        <Badge variant={form.watch("required") ? "destructive" : "secondary"} className="text-xs">
                          {form.watch("required") ? "Oui" : "Non"}
                        </Badge>
                      </div>
                    </div>
                  </div>
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