"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Trash2, 
  Variable, 
  Code2,
  Copy,
  Check
} from "lucide-react";
import { CalculationFieldCardData } from "@/lib/utils/internalServiceTypes";

interface VariableEditorProps {
  value: string;
  onChange: (value: string) => void;
  calculationFields: CalculationFieldCardData[];
  formulaTextareaRef?: React.RefObject<HTMLTextAreaElement>;
}

interface SystemVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'BigDecimal';
  category: string;
  example: string;
}

interface Variable {
  name: string;
  value: string | number;
  type: 'string' | 'number';
}

export function VariableEditor({ value, onChange, calculationFields, formulaTextareaRef }: VariableEditorProps) {
  const [variables, setVariables] = useState<Variable[]>([]);
  const [newVarName, setNewVarName] = useState("");
  const [newVarValue, setNewVarValue] = useState("");
  const [newVarType, setNewVarType] = useState<'string' | 'number'>('number');
  const [copied, setCopied] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [systemVariables, setSystemVariables] = useState<SystemVariable[]>([
    // === VARIABLES TEMPORELLES ===
    { name: "current_hour", type: "number", category: "Temps", description: "Heure actuelle (0-23)", example: "14 (pour 14h)" },
    { name: "current_minute", type: "number", category: "Temps", description: "Minute actuelle (0-59)", example: "30" },
    { name: "current_day", type: "number", category: "Temps", description: "Jour du mois actuel (1-31)", example: "18" },
    { name: "current_month", type: "number", category: "Temps", description: "Mois actuel (1-12)", example: "7 (pour juillet)" },
    { name: "current_year", type: "number", category: "Temps", description: "Année actuelle", example: "2025" },
    { name: "day_of_week", type: "number", category: "Temps", description: "Jour de la semaine (1=lundi, 7=dimanche)", example: "5 (pour vendredi)" },

    // === CONDITIONS TEMPORELLES ===
    { name: "is_morning", type: "boolean", category: "Conditions temporelles", description: "Vrai si entre 6h et 12h", example: "true" },
    { name: "is_afternoon", type: "boolean", category: "Conditions temporelles", description: "Vrai si entre 12h et 18h", example: "false" },
    { name: "is_evening", type: "boolean", category: "Conditions temporelles", description: "Vrai si entre 18h et 22h", example: "false" },
    { name: "is_night", type: "boolean", category: "Conditions temporelles", description: "Vrai si entre 22h et 6h", example: "false" },
    { name: "is_weekend", type: "boolean", category: "Conditions temporelles", description: "Vrai si samedi ou dimanche", example: "false" },
    { name: "is_weekday", type: "boolean", category: "Conditions temporelles", description: "Vrai si lundi à vendredi", example: "true" },

    // === VARIABLES DE CALCUL ===
    { name: "current_amount", type: "BigDecimal", category: "Calcul", description: "Montant en cours de calcul", example: "15000" },
    { name: "base_amount", type: "BigDecimal", category: "Calcul", description: "Montant de base initial", example: "10000" },
    { name: "rule_value", type: "BigDecimal", category: "Calcul", description: "Valeur de la règle de tarification actuelle", example: "75" }
  ]);

  // Initialiser une seule fois depuis la valeur JSON
  useEffect(() => {
    if (!initialized && value && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        const vars: Variable[] = Object.entries(parsed).map(([name, val]) => ({
          name,
          value: val as string | number,
          type: typeof val === 'number' ? 'number' : 'string'
        }));
        setVariables(vars);
      } catch (e) {
        // Si le JSON est invalide, initialiser avec un tableau vide
        setVariables([]);
      }
      setInitialized(true);
    } else if (!initialized) {
      // Si pas de valeur initiale, initialiser avec un tableau vide
      setVariables([]);
      setInitialized(true);
    }
  }, [value, initialized]);

  // Fonction pour mettre à jour le JSON
  const updateJSONValue = (newVariables: Variable[]) => {
    const variablesObject = newVariables.reduce((acc, variable) => {
      acc[variable.name] = variable.value;
      return acc;
    }, {} as Record<string, string | number>);
    
    const newValue = JSON.stringify(variablesObject, null, 2);
    onChange(newValue);
  };

  const addVariable = () => {
    if (!newVarName.trim()) return;
    
    // Vérifier que la variable n'existe pas déjà
    if (variables.some(v => v.name === newVarName)) return;

    const newVar: Variable = {
      name: newVarName,
      value: newVarType === 'number' ? Number(newVarValue) || 0 : newVarValue,
      type: newVarType
    };

    const newVariables = [...variables, newVar];
    setVariables(newVariables);
    updateJSONValue(newVariables);
    setNewVarName("");
    setNewVarValue("");
  };

  const removeVariable = (index: number) => {
    const newVariables = variables.filter((_, i) => i !== index);
    setVariables(newVariables);
    updateJSONValue(newVariables);
  };

  const updateVariable = (index: number, field: keyof Variable, value: any) => {
    const updated = [...variables];
    if (field === 'value' && updated[index].type === 'number') {
      updated[index][field] = Number(value) || 0;
    } else {
      updated[index][field] = value;
    }
    setVariables(updated);
    updateJSONValue(updated);
  };

  const copyToClipboard = async () => {
    try {
      const jsonValue = variables.length > 0 ? JSON.stringify(
        variables.reduce((acc, variable) => {
          acc[variable.name] = variable.value;
          return acc;
        }, {} as Record<string, string | number>), 
        null, 
        2
      ) : '{}';
      await navigator.clipboard.writeText(jsonValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur copie:', error);
    }
  };

  const getFieldSuggestions = () => {
    return calculationFields
      .filter(field => field.calculationRole === 'INPUT')
      .map(field => field.fieldKey);
  };

  const addFieldAsVariable = (fieldKey: string) => {
    if (variables.some(v => v.name === fieldKey)) return;

    const field = calculationFields.find(f => f.fieldKey === fieldKey);
    const newVar: Variable = {
      name: fieldKey,
      value: field?.dataType === 'INTEGER' || field?.dataType === 'DECIMAL' ? 0 : '',
      type: field?.dataType === 'INTEGER' || field?.dataType === 'DECIMAL' ? 'number' : 'string'
    };

    const newVariables = [...variables, newVar];
    setVariables(newVariables);
    updateJSONValue(newVariables);
  };

  // Function to update system variables from external source
  const updateSystemVariables = (newSystemVars: SystemVariable[]) => {
    setSystemVariables(newSystemVars);
  };

  // Fonction pour insérer une variable système dans la formule au curseur
  const insertSystemVariable = (variableName: string) => {
    if (!formulaTextareaRef?.current) return;
    
    const textarea = formulaTextareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;
    
    const variableToInsert = `#{${variableName}}`;
    const newValue = currentValue.substring(0, start) + variableToInsert + currentValue.substring(end);
    
    // Déclencher le changement dans le parent
    const event = new Event('input', { bubbles: true });
    textarea.value = newValue;
    textarea.dispatchEvent(event);
    
    // Repositionner le curseur après la variable insérée
    setTimeout(() => {
      const newPosition = start + variableToInsert.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Variable className="h-5 w-5" />
          Variables de formule
        </CardTitle>
        <CardDescription>
          Définissez les variables pour votre formule SpEL. Syntaxe flexible : avec ou sans délimiteurs.
          <br />
          Exemples: #{'{'} superficie_m2 * tarif_zone {'}'} ou superficie_m2 * tarif_zone
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Suggestions de champs */}
        {getFieldSuggestions().length > 0 && (
          <div>
            <Label className="text-sm font-medium">Champs disponibles</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {getFieldSuggestions().map((fieldKey) => (
                <Badge
                  key={fieldKey}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => addFieldAsVariable(fieldKey)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {fieldKey}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cliquez sur un champ pour l'ajouter comme variable
            </p>
          </div>
        )}

        {/* Variables système */}
        <div>
          <Label className="text-sm font-medium">Variables système disponibles</Label>
          <p className="text-xs text-muted-foreground mb-3">
            Cliquez sur une variable pour l'insérer dans la formule
          </p>
          
          {/* Grouper par catégorie */}
          {Object.entries(systemVariables.reduce((acc, sysVar) => {
            if (!acc[sysVar.category]) acc[sysVar.category] = [];
            acc[sysVar.category].push(sysVar);
            return acc;
          }, {} as Record<string, SystemVariable[]>)).map(([category, vars]) => (
            <div key={category} className="mb-4">
              <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                {category}
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {vars.map((sysVar) => (
                  <div
                    key={sysVar.name}
                    onClick={() => insertSystemVariable(sysVar.name)}
                    className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                          #{'{'}{ sysVar.name }{'}'}
                        </code>
                        <Badge variant="outline" className="text-xs">
                          {sysVar.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {sysVar.description} • Ex: {sysVar.example}
                      </p>
                    </div>
                    <Plus className="h-4 w-4 text-blue-600 opacity-60" />
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <p className="text-xs text-muted-foreground">
            Ces variables sont automatiquement disponibles côté backend
          </p>
        </div>

        <Separator />

        {/* Ajouter une nouvelle variable */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Ajouter une variable</Label>
          <div className="flex gap-2">
            <Input
              placeholder="nom_variable"
              value={newVarName}
              onChange={(e) => setNewVarName(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="valeur"
              value={newVarValue}
              onChange={(e) => setNewVarValue(e.target.value)}
              className="flex-1"
              type={newVarType === 'number' ? 'number' : 'text'}
            />
            <select
              value={newVarType}
              onChange={(e) => setNewVarType(e.target.value as 'string' | 'number')}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="number">Nombre</option>
              <option value="string">Texte</option>
            </select>
            <Button 
              onClick={addVariable}
              disabled={!newVarName.trim()}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Liste des variables */}
        {variables.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Variables définies</Label>
            <div className="space-y-2">
              {variables.map((variable, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Input
                    value={variable.name}
                    onChange={(e) => updateVariable(index, 'name', e.target.value)}
                    className="w-32"
                    placeholder="nom"
                  />
                  <span className="text-muted-foreground">=</span>
                  <Input
                    value={variable.value}
                    onChange={(e) => updateVariable(index, 'value', e.target.value)}
                    className="flex-1"
                    type={variable.type === 'number' ? 'number' : 'text'}
                    placeholder="valeur"
                  />
                  <Badge variant="secondary" className="text-xs">
                    {variable.type}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariable(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aperçu JSON */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              Aperçu JSON
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-8 px-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <ScrollArea className="h-32 w-full">
            <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
              {variables.length > 0 ? JSON.stringify(
                variables.reduce((acc, variable) => {
                  acc[variable.name] = variable.value;
                  return acc;
                }, {} as Record<string, string | number>), 
                null, 
                2
              ) : '{}'}
            </pre>
          </ScrollArea>
          
          {variables.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Utilisation dans la formule:</p>
              <p>
                Utilisez vos variables dans la formule : #{'{'} expression {'}'} ou expression
                <br />
                Exemples: #{'{'} superficie_m2 * tarif_zone {'}'} ou superficie_m2 * tarif_zone
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}