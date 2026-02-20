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
  DollarSign, 
  MoveUp, 
  MoveDown,
  Save,
  X,
  Calculator,
  Percent,
  Hash
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Types
import { 
  PricingType,
  ServiceProduct
} from "@/types/catalog";

// Interface basée sur le DTO Java PricingRuleRequest
interface PricingRuleRequest {
  serviceId: string;
  ruleName: string;
  description?: string;
  pricingType: PricingType;
  value: number;
  priority: number;
  applyOrder: number;
  conditions?: string;
  validFrom?: string;
  validTo?: string;
  maxApplications?: number;
  isActive: boolean;
}

interface PricingRulesManagerProps {
  serviceProduct: ServiceProduct;
  initialRules?: PricingRuleRequest[];
  onChange?: (rules: PricingRuleRequest[]) => void;
  readOnly?: boolean;
}

// Schema basé sur le DTO Java PricingRuleRequest
const pricingRuleSchema = z.object({
  serviceId: z.string().min(1, "L'ID du service est requis"),
  ruleName: z.string()
    .min(1, "Le nom de la règle est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  description: z.string()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .optional(),
  pricingType: z.nativeEnum(PricingType, {
    errorMap: () => ({ message: "Le type de tarification est requis" })
  }),
  value: z.number()
    .positive("La valeur doit être positive")
    .min(0.01, "La valeur doit être positive"),
  priority: z.number()
    .int("La priorité doit être un nombre entier")
    .min(1, "La priorité doit être au moins 1"),
  applyOrder: z.number()
    .int("L'ordre d'application doit être un nombre entier")
    .min(1, "L'ordre d'application doit être au moins 1"),
  conditions: z.string().optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  maxApplications: z.number()
    .int("Le nombre maximum d'applications doit être un entier")
    .positive("Le nombre maximum d'applications doit être positif")
    .optional(),
  isActive: z.boolean().default(true),
});

type PricingRuleForm = z.infer<typeof pricingRuleSchema>;

export function PricingRulesManager({ 
  serviceProduct,
  initialRules = [], 
  onChange, 
  readOnly = false 
}: PricingRulesManagerProps) {
  const [rules, setRules] = useState<PricingRuleRequest[]>(initialRules);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<PricingRuleForm>({
    resolver: zodResolver(pricingRuleSchema),
    defaultValues: {
      pricingType: PricingType.FIXED_AMOUNT,
      value: 0,
      priority: 1,
      applyOrder: 1,
      isActive: true,
    },
  });

  const handleAddRule = () => {
    setIsCreating(true);
    form.reset({
      pricingType: PricingType.FIXED_AMOUNT,
      value: 0,
      priority: 1,
      applyOrder: 1,
      isActive: true,
    });
  };

  const handleEditRule = (index: number) => {
    const rule = rules[index];
    setEditingIndex(index);
    form.reset({
      ...rule,
      priority: rule.priority || 10,
      applyOrder: rule.applyOrder || 1,
    });
  };

  const handleSaveRule = (data: PricingRuleForm) => {
    const newRule: PricingRuleRequest = {
      ...data,
      serviceId: serviceProduct.id,
    };

    let updatedRules: PricingRuleRequest[];

    if (isCreating) {
      updatedRules = [...rules, newRule];
      setIsCreating(false);
    } else if (editingIndex !== null) {
      updatedRules = [...rules];
      updatedRules[editingIndex] = newRule;
      setEditingIndex(null);
    } else {
      return;
    }

    setRules(updatedRules);
    onChange?.(updatedRules);
    form.reset();
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingIndex(null);
    form.reset();
  };

  const handleDeleteRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
    onChange?.(updatedRules);
  };

  const handleMoveRule = (index: number, direction: 'up' | 'down') => {
    const updatedRules = [...rules];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < rules.length) {
      [updatedRules[index], updatedRules[newIndex]] = [updatedRules[newIndex], updatedRules[index]];
      
      // Mettre à jour les ordres d'application
      updatedRules.forEach((rule, i) => {
        rule.applyOrder = i + 1;
      });
      
      setRules(updatedRules);
      onChange?.(updatedRules);
    }
  };

  const getPricingTypeLabel = (type: PricingType) => {
    const labels = {
      [PricingType.FIXED_AMOUNT]: "Montant fixe",
      [PricingType.PER_UNIT]: "Prix par unité",
      [PricingType.MULTIPLIER]: "Multiplicateur",
      [PricingType.PERCENTAGE]: "Pourcentage",
      [PricingType.ADDITION]: "Addition",
      [PricingType.REDUCTION]: "Réduction"
    };
    return labels[type] || type;
  };

  const getPricingTypeIcon = (type: PricingType) => {
    const icons = {
      [PricingType.FIXED_AMOUNT]: DollarSign,
      [PricingType.PER_UNIT]: Hash,
      [PricingType.MULTIPLIER]: X,
      [PricingType.PERCENTAGE]: Percent,
      [PricingType.ADDITION]: Plus,
      [PricingType.REDUCTION]: Trash2
    };
    return icons[type] || DollarSign;
  };

  const formatRuleValue = (rule: PricingRuleRequest) => {
    switch (rule.pricingType) {
      case PricingType.FIXED_AMOUNT:
        return `${rule.value.toLocaleString()} FCFA`;
      case PricingType.PER_UNIT:
        return `${rule.value.toLocaleString()} FCFA/unité`;
      case PricingType.MULTIPLIER:
        return `×${rule.value}`;
      case PricingType.PERCENTAGE:
        return `${rule.value > 0 ? '+' : ''}${rule.value}%`;
      case PricingType.ADDITION:
        return `+${rule.value.toLocaleString()} FCFA`;
      case PricingType.REDUCTION:
        return `-${rule.value.toLocaleString()} FCFA`;
      default:
        return rule.value.toString();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Règles de tarification ({rules.length})
          </CardTitle>
          <CardDescription>
            Définissez les règles de calcul du prix selon différentes conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!readOnly && (
            <div className="flex justify-end mb-4">
              <Button 
                onClick={handleAddRule} 
                variant="outline" 
                size="sm"
                disabled={isCreating || editingIndex !== null}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une règle
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {rules.map((rule, index) => {
              const IconComponent = getPricingTypeIcon(rule.pricingType);
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <Badge variant="outline">{getPricingTypeLabel(rule.pricingType)}</Badge>
                      </div>
                      <div>
                        <span className="font-medium">{rule.ruleName}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{formatRuleValue(rule)}</Badge>
                          <Badge variant="outline" className="text-xs">
                            Priorité {rule.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Ordre {rule.applyOrder}
                          </Badge>
                          {!rule.isActive && (
                            <Badge variant="destructive" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!readOnly && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveRule(index, 'up')}
                          disabled={index === 0}
                        >
                          <MoveUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveRule(index, 'down')}
                          disabled={index === rules.length - 1}
                        >
                          <MoveDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRule(index)}
                          disabled={isCreating || editingIndex !== null}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRule(index)}
                          disabled={isCreating || editingIndex !== null}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    {rule.description && <p>{rule.description}</p>}
                    {rule.conditions && (
                      <p>Condition: <code className="bg-muted px-1 rounded">{rule.conditions}</code></p>
                    )}
                    {rule.maxApplications && (
                      <p>Applications max: {rule.maxApplications.toLocaleString()}</p>
                    )}
                    {(rule.validFrom || rule.validTo) && (
                      <p>
                        Validité:
                        {rule.validFrom && ` Du ${new Date(rule.validFrom).toLocaleDateString()}`}
                        {rule.validTo && ` Au ${new Date(rule.validTo).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {rules.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucune règle de tarification configurée</p>
                <p className="text-sm">Les règles de tarification permettent de calculer automatiquement le prix selon des conditions</p>
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
              {isCreating ? "Nouvelle règle de tarification" : "Modifier la règle"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSaveRule)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ruleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de la règle *</FormLabel>
                        <FormControl>
                          <Input placeholder="Tarif de base panneau publicitaire" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pricingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de tarification *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={PricingType.FIXED_AMOUNT}>Montant fixe</SelectItem>
                            <SelectItem value={PricingType.PER_UNIT}>Prix par unité</SelectItem>
                            <SelectItem value={PricingType.MULTIPLIER}>Multiplicateur</SelectItem>
                            <SelectItem value={PricingType.PERCENTAGE}>Pourcentage</SelectItem>
                            <SelectItem value={PricingType.ADDITION}>Addition</SelectItem>
                            <SelectItem value={PricingType.REDUCTION}>Réduction</SelectItem>
                          </SelectContent>
                        </Select>
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
                          placeholder="Description de la règle et de son application" 
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
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valeur *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.01"
                            placeholder="2000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          {form.watch("pricingType") === PricingType.PERCENTAGE && "Pourcentage (ex: 15 pour 15%)"}
                          {form.watch("pricingType") === PricingType.MULTIPLIER && "Coefficient (ex: 1.5 pour ×1.5)"}
                          {(form.watch("pricingType") === PricingType.FIXED_AMOUNT || form.watch("pricingType") === PricingType.PER_UNIT) && "Montant en FCFA"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priorité</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="1"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          1 = plus haute priorité
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="applyOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordre d'application</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Ordre d'application des règles
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conditions d'application (JSON)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='Ex: {"surface_m2": {"$gte": 100}, "type_commerce": {"$eq": "DETAIL"}}'
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Format JSON avec opérateurs MongoDB ($gte, $eq, $in, etc.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customFormula"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formule personnalisée (optionnel)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ex: surface_m2 * value + (surface_m2 > 100 ? 50000 : 0)"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Formule JavaScript personnalisée pour des calculs complexes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxApplications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre maximum d'applications</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          placeholder="Illimité si vide"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Limite le nombre de fois que cette règle peut être appliquée
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="validFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valide du</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="validTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valide jusqu'au</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Règle active</FormLabel>
                        <FormDescription>
                          La règle est utilisée dans les calculs
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