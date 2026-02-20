import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calculator, Plus, Trash2, Zap, Formula, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ServiceProductFormData } from "./form-schema";

interface InternalServiceConfigSectionProps {
  form: UseFormReturn<ServiceProductFormData>;
}

interface CalculationField {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "select";
  required: boolean;
  defaultValue?: string;
  options?: string[];
}

export function InternalServiceConfigSection({ form }: InternalServiceConfigSectionProps) {
  const watchedCalculationMethod = form.watch("calculationMethod");
  const watchedCalculationFields = form.watch("calculationFields") || [];
  
  const [newField, setNewField] = useState<Partial<CalculationField>>({
    key: "",
    label: "",
    type: "text",
    required: false
  });

  const calculationMethods = [
    {
      value: "FIXED",
      label: "Montant fixe",
      description: "Le montant ne change jamais"
    },
    {
      value: "FORMULA",
      label: "Calcul par formule",
      description: "Utilise une formule mathématique"
    },
    {
      value: "TIERED",
      label: "Tarification échelonnée",
      description: "Différents tarifs selon les tranches"
    }
  ];

  const fieldTypes = [
    { value: "text", label: "Texte" },
    { value: "number", label: "Nombre" },
    { value: "boolean", label: "Oui/Non" },
    { value: "select", label: "Liste de choix" }
  ];

  const addCalculationField = () => {
    if (!newField.key || !newField.label) return;
    
    const field: CalculationField = {
      key: newField.key,
      label: newField.label,
      type: newField.type || "text",
      required: newField.required || false,
      defaultValue: newField.defaultValue,
      options: newField.type === "select" ? newField.options : undefined
    };

    const currentFields = form.getValues("calculationFields") || [];
    form.setValue("calculationFields", [...currentFields, field]);
    
    setNewField({
      key: "",
      label: "",
      type: "text",
      required: false
    });
  };

  const removeCalculationField = (index: number) => {
    const currentFields = form.getValues("calculationFields") || [];
    form.setValue("calculationFields", currentFields.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Méthode de calcul */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Méthode de calcul
          </CardTitle>
          <CardDescription>
            Définissez comment le montant final sera calculé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="calculationMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de calcul</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une méthode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {calculationMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex flex-col">
                          <span>{method.label}</span>
                          <span className="text-sm text-muted-foreground">
                            {method.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Aperçu de la méthode sélectionnée */}
          {watchedCalculationMethod && (
            <div className="mt-4 p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Formula className="h-4 w-4" />
                <span className="font-medium">
                  {calculationMethods.find(m => m.value === watchedCalculationMethod)?.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {calculationMethods.find(m => m.value === watchedCalculationMethod)?.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration spécifique selon la méthode */}
      {watchedCalculationMethod && watchedCalculationMethod !== "FIXED" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Champs de saisie nécessaires
            </CardTitle>
            <CardDescription>
              Définissez les informations que l'utilisateur devra fournir pour le calcul
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Liste des champs existants */}
            {watchedCalculationFields.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Champs configurés :</h4>
                {watchedCalculationFields.map((field, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{field.type}</Badge>
                      <div>
                        <span className="font-medium">{field.label}</span>
                        <div className="text-sm text-muted-foreground">
                          Clé: {field.key}
                          {field.required && " • Obligatoire"}
                          {field.defaultValue && ` • Défaut: ${field.defaultValue}`}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCalculationField(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Ajout d'un nouveau champ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ajouter un champ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nom technique (clé)</label>
                    <Input
                      placeholder="ex: surface_m2"
                      value={newField.key}
                      onChange={(e) => setNewField(prev => ({ ...prev, key: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Libellé affiché</label>
                    <Input
                      placeholder="ex: Surface en m²"
                      value={newField.label}
                      onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type de champ</label>
                    <Select
                      value={newField.type}
                      onValueChange={(value) => setNewField(prev => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Valeur par défaut</label>
                    <Input
                      placeholder="Optionnel"
                      value={newField.defaultValue}
                      onChange={(e) => setNewField(prev => ({ ...prev, defaultValue: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newField.required}
                    onCheckedChange={(checked) => setNewField(prev => ({ ...prev, required: checked }))}
                  />
                  <label className="text-sm font-medium">Champ obligatoire</label>
                </div>

                {newField.type === "select" && (
                  <div>
                    <label className="text-sm font-medium">Options (une par ligne)</label>
                    <Textarea
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      onChange={(e) => setNewField(prev => ({ 
                        ...prev, 
                        options: e.target.value.split('\n').filter(o => o.trim()) 
                      }))}
                    />
                  </div>
                )}

                <Button
                  onClick={addCalculationField}
                  disabled={!newField.key || !newField.label}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter le champ
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      {/* Exemples selon la méthode */}
      {watchedCalculationMethod === "FORMULA" && (
        <Alert>
          <Formula className="h-4 w-4" />
          <AlertDescription>
            <strong>Calcul par formule :</strong> Les champs saisis par l'utilisateur pourront être utilisés dans une formule mathématique. 
            Par exemple : montant_base × surface_m2 × coefficient_zone.
          </AlertDescription>
        </Alert>
      )}

      {watchedCalculationMethod === "TIERED" && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <strong>Tarification échelonnée :</strong> Différents tarifs selon les tranches de valeurs. 
            Par exemple : 0-100m² = 5€/m², 101-500m² = 4€/m², +500m² = 3€/m².
          </AlertDescription>
        </Alert>
      )}

      {watchedCalculationMethod === "FIXED" && (
        <Alert>
          <Calculator className="h-4 w-4" />
          <AlertDescription>
            <strong>Montant fixe :</strong> Le prix sera toujours celui défini dans la section tarification, 
            sans aucun calcul supplémentaire.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}