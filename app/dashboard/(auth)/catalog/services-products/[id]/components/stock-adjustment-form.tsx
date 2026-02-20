import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Minus, 
  Save, 
  X,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  FileText
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Hooks
// TODO: Implement this hook when stock movement API is ready
// import { 
//   useCreateStockMovement
// } from "@/data/catalog";
import { ServiceProduct, StockData } from "@/types/catalog";

const stockAdjustmentSchema = z.object({
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.number().min(1, "La quantité doit être supérieure à 0"),
  reason: z.enum([
    "PURCHASE", "SALE", "RETURN", "DAMAGE", "LOSS", "INVENTORY", 
    "TRANSFER", "PRODUCTION", "CONSUMPTION", "CORRECTION", "OTHER"
  ]),
  reference: z.string().optional(),
  notes: z.string().optional(),
  unitCost: z.number().optional()
});

type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

interface StockAdjustmentFormProps {
  serviceProduct: ServiceProduct;
  stockData: StockData;
  adjustmentType?: "increase" | "decrease" | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StockAdjustmentForm({ 
  serviceProduct, 
  stockData, 
  adjustmentType,
  onSuccess, 
  onCancel 
}: StockAdjustmentFormProps) {
  // Temporary mock data until hook is implemented
  const createMovement = (data: any, options: any) => {
    console.log('Stock movement would be created:', data);
    options?.onSuccess?.();
  };
  const isPending = false;

  const form = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      type: adjustmentType === "increase" ? "IN" : adjustmentType === "decrease" ? "OUT" : "ADJUSTMENT",
      quantity: 1,
      reason: adjustmentType === "increase" ? "PURCHASE" : adjustmentType === "decrease" ? "SALE" : "INVENTORY",
      reference: "",
      notes: "",
      unitCost: stockData.unitCost || 0
    }
  });

  const watchedType = form.watch("type");
  const watchedQuantity = form.watch("quantity");
  const watchedReason = form.watch("reason");

  const onSubmit = (data: StockAdjustmentFormData) => {
    createMovement({
      productId: serviceProduct.id,
      ...data
    }, {
      onSuccess: () => {
        onSuccess?.();
      }
    });
  };

  const getReasonLabel = (reason: string) => {
    const labels = {
      PURCHASE: "Achat",
      SALE: "Vente",
      RETURN: "Retour",
      DAMAGE: "Dommage",
      LOSS: "Perte",
      INVENTORY: "Inventaire",
      TRANSFER: "Transfert",
      PRODUCTION: "Production",
      CONSUMPTION: "Consommation",
      CORRECTION: "Correction",
      OTHER: "Autre"
    };
    return labels[reason as keyof typeof labels] || reason;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "IN":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "OUT":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "ADJUSTMENT":
        return <RotateCcw className="h-4 w-4 text-blue-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getNewStockLevel = () => {
    const currentStock = stockData.currentStock;
    const adjustment = watchedQuantity || 0;
    
    switch (watchedType) {
      case "IN":
        return currentStock + adjustment;
      case "OUT":
        return currentStock - adjustment;
      case "ADJUSTMENT":
        return adjustment; // Ajustement absolu
      default:
        return currentStock;
    }
  };

  const newStockLevel = getNewStockLevel();
  const isStockCritical = newStockLevel <= stockData.minStock;
  const isStockExcess = newStockLevel >= stockData.maxStock;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">
            {adjustmentType === "increase" ? "Ajouter du stock" : 
             adjustmentType === "decrease" ? "Retirer du stock" : 
             "Ajuster le stock"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Produit : {serviceProduct.name}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {isPending ? "Traitement..." : "Enregistrer"}
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Informations de base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type de mouvement</Label>
                <Select 
                  value={watchedType} 
                  onValueChange={(value) => form.setValue("type", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>Entrée de stock</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="OUT">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span>Sortie de stock</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ADJUSTMENT">
                      <div className="flex items-center gap-2">
                        <RotateCcw className="h-4 w-4 text-blue-500" />
                        <span>Ajustement</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantité {watchedType === "ADJUSTMENT" ? "(stock final)" : ""}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  {...form.register("quantity", { valueAsNumber: true })}
                  placeholder="Quantité"
                />
                {form.formState.errors.quantity && (
                  <p className="text-sm text-red-600">{form.formState.errors.quantity.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Motif</Label>
                <Select 
                  value={watchedReason} 
                  onValueChange={(value) => form.setValue("reason", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PURCHASE">Achat</SelectItem>
                    <SelectItem value="SALE">Vente</SelectItem>
                    <SelectItem value="RETURN">Retour</SelectItem>
                    <SelectItem value="DAMAGE">Dommage</SelectItem>
                    <SelectItem value="LOSS">Perte</SelectItem>
                    <SelectItem value="INVENTORY">Inventaire</SelectItem>
                    <SelectItem value="TRANSFER">Transfert</SelectItem>
                    <SelectItem value="PRODUCTION">Production</SelectItem>
                    <SelectItem value="CONSUMPTION">Consommation</SelectItem>
                    <SelectItem value="CORRECTION">Correction</SelectItem>
                    <SelectItem value="OTHER">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reference">Référence (optionnel)</Label>
                <Input
                  id="reference"
                  {...form.register("reference")}
                  placeholder="N° commande, facture..."
                />
              </div>
              
              {(watchedReason === "PURCHASE" || watchedType === "IN") && (
                <div className="space-y-2">
                  <Label htmlFor="unitCost">Coût unitaire (€)</Label>
                  <Input
                    id="unitCost"
                    type="number"
                    step="0.01"
                    {...form.register("unitCost", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Aperçu des changements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getTypeIcon(watchedType)}
                Aperçu des changements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Stock actuel</p>
                  <p className="text-2xl font-bold">{stockData.currentStock}</p>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Nouveau stock</p>
                  <p className="text-2xl font-bold">{newStockLevel}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Variation</span>
                  <Badge variant={watchedType === "IN" ? "default" : "destructive"}>
                    {watchedType === "IN" ? "+" : 
                     watchedType === "OUT" ? "-" : 
                     "="}{watchedQuantity || 0}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Motif</span>
                  <span className="text-sm">{getReasonLabel(watchedReason)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Unité</span>
                  <span className="text-sm">{stockData.unit || "Pièce"}</span>
                </div>
              </div>
              
              {/* Alertes */}
              {isStockCritical && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Attention : Le stock sera critique (≤ {stockData.minStock})
                  </AlertDescription>
                </Alert>
              )}
              
              {isStockExcess && (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Note : Le stock dépassera le seuil maximum (≥ {stockData.maxStock})
                  </AlertDescription>
                </Alert>
              )}
              
              {watchedType === "OUT" && newStockLevel < 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Erreur : Stock insuffisant pour cette opération
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes additionnelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Commentaires (optionnel)</Label>
              <Textarea
                id="notes"
                {...form.register("notes")}
                placeholder="Ajoutez des notes sur cette opération..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}