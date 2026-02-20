import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  Calculator, 
  Save, 
  X,
  DollarSign,
  Percent,
  TrendingUp,
  Target,
  Calendar
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Hooks
import { 
  useCreatePricingRule,
  useUpdatePricingRule
} from "@/data/catalog";
import { ServiceConfig, PricingRule } from "@/types/catalog";

const pricingRuleSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  type: z.enum(["FIXED", "PERCENTAGE", "TIERED", "QUANTITY_BASED", "TIME_BASED"]),
  value: z.number().min(0, "La valeur doit être positive"),
  basePrice: z.number().optional(),
  minQuantity: z.number().optional(),
  maxQuantity: z.number().optional(),
  isActive: z.boolean().default(true),
  priority: z.number().default(0),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(["EQUALS", "GREATER_THAN", "LESS_THAN", "CONTAINS", "BETWEEN"]),
    value: z.string(),
    secondValue: z.string().optional()
  })).optional(),
  tiers: z.array(z.object({
    minQuantity: z.number(),
    maxQuantity: z.number().optional(),
    value: z.number(),
    description: z.string().optional()
  })).optional()
});

type PricingRuleFormData = z.infer<typeof pricingRuleSchema>;

interface PricingRuleFormProps {
  serviceConfig: ServiceConfig;
  pricingRule?: PricingRule;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PricingRuleForm({ serviceConfig, pricingRule, onSuccess, onCancel }: PricingRuleFormProps) {
  const [conditions, setConditions] = useState(pricingRule?.conditions || []);
  const [tiers, setTiers] = useState(pricingRule?.tiers || []);

  const { mutate: createRule, isPending: isCreating } = useCreatePricingRule();
  const { mutate: updateRule, isPending: isUpdating } = useUpdatePricingRule();

  const form = useForm<PricingRuleFormData>({
    resolver: zodResolver(pricingRuleSchema),
    defaultValues: {
      name: pricingRule?.name || "",
      description: pricingRule?.description || "",
      type: pricingRule?.type || "FIXED",
      value: pricingRule?.value || 0,
      basePrice: pricingRule?.basePrice || undefined,
      minQuantity: pricingRule?.minQuantity || undefined,
      maxQuantity: pricingRule?.maxQuantity || undefined,
      isActive: pricingRule?.isActive ?? true,
      priority: pricingRule?.priority || 0,
      conditions: pricingRule?.conditions || [],
      tiers: pricingRule?.tiers || []
    }
  });

  const watchedType = form.watch("type");
  const isSubmitting = isCreating || isUpdating;

  const onSubmit = (data: PricingRuleFormData) => {
    const payload = {
      ...data,
      serviceConfigId: serviceConfig.id,
      conditions: conditions.length > 0 ? conditions : undefined,
      tiers: tiers.length > 0 ? tiers : undefined
    };

    if (pricingRule) {
      updateRule({
        id: pricingRule.id,
        ...payload
      }, {
        onSuccess: () => {
          onSuccess?.();
        }
      });
    } else {
      createRule(payload, {
        onSuccess: () => {
          onSuccess?.();
        }
      });
    }
  };

  const addCondition = () => {
    setConditions([...conditions, {
      field: "",
      operator: "EQUALS",
      value: "",
      secondValue: ""
    }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: string, value: any) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
  };

  const addTier = () => {
    setTiers([...tiers, {
      minQuantity: 1,
      maxQuantity: undefined,
      value: 0,
      description: ""
    }]);
  };

  const removeTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: string, value: any) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FIXED': return <DollarSign className="h-4 w-4" />;
      case 'PERCENTAGE': return <Percent className="h-4 w-4" />;
      case 'TIERED': return <TrendingUp className="h-4 w-4" />;
      case 'QUANTITY_BASED': return <Target className="h-4 w-4" />;
      case 'TIME_BASED': return <Calendar className="h-4 w-4" />;
      default: return <Calculator className="h-4 w-4" />;
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'FIXED': return "Prix fixe indépendant de la quantité";
      case 'PERCENTAGE': return "Pourcentage appliqué au prix de base";
      case 'TIERED': return "Prix différents selon les paliers de quantité";
      case 'QUANTITY_BASED': return "Prix basé sur la quantité commandée";
      case 'TIME_BASED': return "Prix variant selon la période";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">
            {pricingRule ? "Modifier la règle de pricing" : "Nouvelle règle de pricing"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Service : {serviceConfig.name}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Informations de base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la règle *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Ex: Tarif dégressif entreprise"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priorité</Label>
                <Input
                  id="priority"
                  type="number"
                  {...form.register("priority", { valueAsNumber: true })}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Les règles avec priorité élevée sont appliquées en premier
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Description de la règle de pricing..."
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={form.watch("isActive")}
                onCheckedChange={(checked) => form.setValue("isActive", checked)}
              />
              <Label htmlFor="isActive">Règle active</Label>
            </div>
          </CardContent>
        </Card>

        {/* Type de pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Type de pricing</CardTitle>
            <CardDescription>
              Choisissez le type de calcul de prix
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Type de règle</Label>
              <Select 
                value={watchedType} 
                onValueChange={(value) => form.setValue("type", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIXED">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Prix fixe</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PERCENTAGE">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      <span>Pourcentage</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="TIERED">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Échelonné</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="QUANTITY_BASED">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>Basé quantité</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="TIME_BASED">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Basé temps</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {watchedType && (
                <Alert>
                  <AlertDescription>
                    {getTypeDescription(watchedType)}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Configuration selon le type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {watchedType !== "TIERED" && (
                <div className="space-y-2">
                  <Label htmlFor="value">
                    Valeur {watchedType === "PERCENTAGE" ? "(%)" : "(€)"}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    {...form.register("value", { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {form.formState.errors.value && (
                    <p className="text-sm text-red-600">{form.formState.errors.value.message}</p>
                  )}
                </div>
              )}
              
              {watchedType === "PERCENTAGE" && (
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Prix de base (€)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    {...form.register("basePrice", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              )}
              
              {(watchedType === "QUANTITY_BASED" || watchedType === "TIME_BASED") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="minQuantity">Quantité minimum</Label>
                    <Input
                      id="minQuantity"
                      type="number"
                      {...form.register("minQuantity", { valueAsNumber: true })}
                      placeholder="1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxQuantity">Quantité maximum</Label>
                    <Input
                      id="maxQuantity"
                      type="number"
                      {...form.register("maxQuantity", { valueAsNumber: true })}
                      placeholder="Illimité"
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration des paliers pour type TIERED */}
        {watchedType === "TIERED" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Paliers de prix</span>
                <Button type="button" variant="outline" size="sm" onClick={addTier}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un palier
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tiers.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aucun palier configuré. Ajoutez des paliers pour définir les prix selon les quantités.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tiers.map((tier, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Quantité min</Label>
                          <Input
                            type="number"
                            value={tier.minQuantity}
                            onChange={(e) => updateTier(index, "minQuantity", parseInt(e.target.value))}
                            placeholder="1"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Quantité max</Label>
                          <Input
                            type="number"
                            value={tier.maxQuantity || ""}
                            onChange={(e) => updateTier(index, "maxQuantity", 
                              e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="Illimité"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Prix (€)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={tier.value}
                            onChange={(e) => updateTier(index, "value", parseFloat(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={tier.description || ""}
                            onChange={(e) => updateTier(index, "description", e.target.value)}
                            placeholder="Optionnel"
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeTier(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Conditions d'application */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Conditions d'application</span>
              <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une condition
              </Button>
            </CardTitle>
            <CardDescription>
              Définissez les conditions pour appliquer cette règle de pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conditions.length === 0 ? (
              <div className="text-center py-8">
                <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucune condition définie. Cette règle s'appliquera à tous les cas.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {conditions.map((condition, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Champ</Label>
                        <Input
                          value={condition.field}
                          onChange={(e) => updateCondition(index, "field", e.target.value)}
                          placeholder="Ex: customer_type"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Opérateur</Label>
                        <Select 
                          value={condition.operator} 
                          onValueChange={(value) => updateCondition(index, "operator", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EQUALS">Égal à</SelectItem>
                            <SelectItem value="GREATER_THAN">Supérieur à</SelectItem>
                            <SelectItem value="LESS_THAN">Inférieur à</SelectItem>
                            <SelectItem value="CONTAINS">Contient</SelectItem>
                            <SelectItem value="BETWEEN">Entre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Valeur</Label>
                        <Input
                          value={condition.value}
                          onChange={(e) => updateCondition(index, "value", e.target.value)}
                          placeholder="Valeur à comparer"
                        />
                      </div>
                      
                      {condition.operator === "BETWEEN" && (
                        <div className="space-y-2">
                          <Label>Valeur 2</Label>
                          <Input
                            value={condition.secondValue || ""}
                            onChange={(e) => updateCondition(index, "secondValue", e.target.value)}
                            placeholder="Valeur max"
                          />
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeCondition(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}