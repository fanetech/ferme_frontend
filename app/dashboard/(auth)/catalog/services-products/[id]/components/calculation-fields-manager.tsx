"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calculator, 
  MoveUp, 
  MoveDown,
  Save,
  X
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Types
import { 
  DataType
} from "@/types/catalog";

// Type temporaire pour CreateServiceCalculationFieldRequest
type CreateServiceCalculationFieldRequest = any;

interface CalculationFieldsManagerProps {
  initialFields?: CreateServiceCalculationFieldRequest[];
  onChange: (fields: CreateServiceCalculationFieldRequest[]) => void;
  readOnly?: boolean;
}

// Schema de validation pour un champ de calcul
const calculationFieldSchema = z.object({
  key: z.string().min(1, "La clé est obligatoire").regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Clé invalide"),
  label: z.string().min(1, "Le label est obligatoire"),
  description: z.string().optional(),
  dataType: z.nativeEnum(DataType),
  defaultValue: z.string().optional(),
  isRequired: z.boolean().default(false),
  isReadonly: z.boolean().default(false),
  isHidden: z.boolean().default(false),
  validationRegex: z.string().optional(),
  errorMessage: z.string().optional(),
  minLength: z.number().min(0).optional(),
  maxLength: z.number().min(0).optional(),
  minValue: z.string().optional(),
  maxValue: z.string().optional(),
  displayOrder: z.number().min(0).default(0),
  placeholder: z.string().optional(),
  hintText: z.string().optional(),
  inputType: z.string().optional(),
  options: z.string().optional(),
  allowMultiple: z.boolean().default(false),
  displayFormat: z.string().optional(),
  inputMask: z.string().optional(),
  unitLabel: z.string().optional(),
  dependsOn: z.string().optional(),
  dependencyCondition: z.string().optional(),
  calculationRole: z.string().default("INPUT"),
  formula: z.string().optional(),
  metadata: z.string().optional(),
});

type CalculationFieldForm = z.infer<typeof calculationFieldSchema>;

export function CalculationFieldsManager({ 
  initialFields = [], 
  onChange, 
  readOnly = false 
}: CalculationFieldsManagerProps) {
  const [fields, setFields] = useState<CreateServiceCalculationFieldRequest[]>(initialFields);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<CalculationFieldForm>({
    resolver: zodResolver(calculationFieldSchema),
    defaultValues: {
      dataType: DataType.STRING,
      isRequired: false,
      isReadonly: false,
      isHidden: false,
      displayOrder: fields.length,
      allowMultiple: false,
      calculationRole: "INPUT",
    },
  });

  const handleAddField = () => {
    setIsCreating(true);
    form.reset({
      dataType: DataType.STRING,
      isRequired: false,
      isReadonly: false,
      isHidden: false,
      displayOrder: fields.length,
      allowMultiple: false,
      calculationRole: "INPUT",
    });
  };

  const handleEditField = (index: number) => {
    const field = fields[index];
    setEditingIndex(index);
    form.reset({
      ...field,
      minLength: field.minLength || undefined,
      maxLength: field.maxLength || undefined,
      displayOrder: field.displayOrder || 0,
    });
  };

  const handleSaveField = (data: CalculationFieldForm) => {
    const newField: CreateServiceCalculationFieldRequest = {
      ...data,
      displayOrder: data.displayOrder || fields.length,
    };

    let updatedFields: CreateServiceCalculationFieldRequest[];

    if (isCreating) {
      updatedFields = [...fields, newField];
      setIsCreating(false);
    } else if (editingIndex !== null) {
      updatedFields = [...fields];
      updatedFields[editingIndex] = newField;
      setEditingIndex(null);
    } else {
      return;
    }

    setFields(updatedFields);
    onChange(updatedFields);
    form.reset();
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingIndex(null);
    form.reset();
  };

  const handleDeleteField = (index: number) => {
    const updatedFields = fields.filter((_, i) => i !== index);
    setFields(updatedFields);
    onChange(updatedFields);
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const updatedFields = [...fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < fields.length) {
      [updatedFields[index], updatedFields[newIndex]] = [updatedFields[newIndex], updatedFields[index]];
      
      // Mettre à jour les ordres d'affichage
      updatedFields.forEach((field, i) => {
        field.displayOrder = i;
      });
      
      setFields(updatedFields);
      onChange(updatedFields);
    }
  };

  const getDataTypeLabel = (dataType: DataType) => {
    const labels = {
      [DataType.STRING]: "Texte",
      [DataType.INTEGER]: "Nombre entier",
      [DataType.DECIMAL]: "Nombre décimal",
      [DataType.BOOLEAN]: "Oui/Non",
      [DataType.DATE]: "Date",
      [DataType.DATETIME]: "Date et heure",
      [DataType.EMAIL]: "Email",
      [DataType.PHONE]: "Téléphone",
      [DataType.URL]: "URL",
      [DataType.JSON]: "JSON"
    };
    return labels[dataType] || dataType;
  };

  const getInputTypeForDataType = (dataType: DataType) => {
    const types = {
      [DataType.STRING]: "text",
      [DataType.INTEGER]: "number",
      [DataType.DECIMAL]: "number",
      [DataType.BOOLEAN]: "checkbox",
      [DataType.DATE]: "date",
      [DataType.DATETIME]: "datetime-local",
      [DataType.EMAIL]: "email",
      [DataType.PHONE]: "tel",
      [DataType.URL]: "url",
      [DataType.JSON]: "textarea"
    };
    return types[dataType] || "text";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Champs de calcul ({fields.length})
          </CardTitle>
          <CardDescription>
            Définissez les paramètres nécessaires pour le calcul du prix du service
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!readOnly && (
            <div className="flex justify-end mb-4">
              <Button 
                onClick={handleAddField} 
                variant="outline" 
                size="sm"
                disabled={isCreating || editingIndex !== null}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un champ
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{getDataTypeLabel(field.dataType)}</Badge>
                    <div>
                      <span className="font-medium">{field.label}</span>
                      <span className="text-sm text-muted-foreground ml-2">({field.key})</span>
                    </div>
                    {field.isRequired && (
                      <Badge variant="destructive" className="text-xs">Requis</Badge>
                    )}
                    {field.calculationRole === "OUTPUT" && (
                      <Badge className="bg-green-100 text-green-800 text-xs">Calculé</Badge>
                    )}
                  </div>
                  
                  {!readOnly && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveField(index, 'up')}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveField(index, 'down')}
                        disabled={index === fields.length - 1}
                      >
                        <MoveDown className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditField(index)}
                        disabled={isCreating || editingIndex !== null}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteField(index)}
                        disabled={isCreating || editingIndex !== null}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  {field.description && <p>{field.description}</p>}
                  {field.placeholder && <p>Placeholder: {field.placeholder}</p>}
                  {field.unitLabel && <p>Unité: {field.unitLabel}</p>}
                  {field.formula && <p>Formule: <code className="bg-muted px-1 rounded">{field.formula}</code></p>}
                </div>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucun champ de calcul configuré</p>
                <p className="text-sm">Les champs de calcul permettent de définir les paramètres nécessaires au calcul du prix</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formulaire d'édition/création */}
      {(isCreating || editingIndex !== null) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? "Nouveau champ de calcul" : "Modifier le champ"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSaveField)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clé du champ *</FormLabel>
                        <FormControl>
                          <Input placeholder="surface_m2" {...field} />
                        </FormControl>
                        <FormDescription>
                          Utilisée dans les formules (lettres, chiffres, underscore)
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
                        <FormLabel>Label affiché *</FormLabel>
                        <FormControl>
                          <Input placeholder="Surface en m²" {...field} />
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
                          placeholder="Description ou aide pour l'utilisateur" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="dataType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de données</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={DataType.STRING}>Texte</SelectItem>
                            <SelectItem value={DataType.INTEGER}>Nombre entier</SelectItem>
                            <SelectItem value={DataType.DECIMAL}>Nombre décimal</SelectItem>
                            <SelectItem value={DataType.BOOLEAN}>Oui/Non</SelectItem>
                            <SelectItem value={DataType.DATE}>Date</SelectItem>
                            <SelectItem value={DataType.EMAIL}>Email</SelectItem>
                            <SelectItem value={DataType.PHONE}>Téléphone</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="calculationRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rôle dans le calcul</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="INPUT">Paramètre d'entrée</SelectItem>
                            <SelectItem value="OUTPUT">Résultat calculé</SelectItem>
                            <SelectItem value="INTERMEDIATE">Calcul intermédiaire</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="unitLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unité</FormLabel>
                        <FormControl>
                          <Input placeholder="m², jours, FCFA..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="placeholder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placeholder</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 150" {...field} />
                        </FormControl>
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch("calculationRole") === "OUTPUT" && (
                  <FormField
                    control={form.control}
                    name="formula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formule de calcul</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ex: surface_m2 * 2000" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Utilisez les clés des autres champs dans la formule
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="isRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Obligatoire</FormLabel>
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
                    name="isHidden"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Masqué</FormLabel>
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

                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {isCreating ? "Ajouter" : "Modifier"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}