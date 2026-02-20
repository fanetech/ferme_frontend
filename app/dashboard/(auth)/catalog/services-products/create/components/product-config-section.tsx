import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Package, BarChart3, AlertTriangle, Scan } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ServiceProductFormData } from "./form-schema";

interface ProductConfigSectionProps {
  form: UseFormReturn<ServiceProductFormData>;
}

export function ProductConfigSection({ form }: ProductConfigSectionProps) {
  const watchedInitialStock = form.watch("initialStock");
  const watchedMinStock = form.watch("minStock");
  const watchedStockAlertThreshold = form.watch("stockAlertThreshold");
  const watchedBarcode = form.watch("barcode");

  // Validation des seuils de stock
  const isThresholdValid = !watchedMinStock || !watchedStockAlertThreshold || 
    watchedStockAlertThreshold >= watchedMinStock;

  return (
    <div className="space-y-6">
      {/* Informations produit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Informations produit
          </CardTitle>
          <CardDescription>
            Configuration spécifique aux produits physiques
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Code-barres */}
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Scan className="h-4 w-4" />
                  Code-barres (optionnel)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: 3760123456789"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Code-barres EAN, UPC ou autre identifiant produit
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Aperçu code-barres */}
          {watchedBarcode && (
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Scan className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Code-barres :</span>
                <Badge variant="outline" className="font-mono">
                  {watchedBarcode}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gestion des stocks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gestion des stocks
          </CardTitle>
          <CardDescription>
            Configuration des seuils et alertes de stock
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stock initial */}
          <FormField
            control={form.control}
            name="initialStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock initial</FormLabel>
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
                  Quantité disponible lors de la création du produit
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Stock minimum */}
          <FormField
            control={form.control}
            name="minStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock minimum</FormLabel>
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
                  Quantité minimum à maintenir en stock
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Seuil d'alerte */}
          <FormField
            control={form.control}
            name="stockAlertThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seuil d'alerte stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className={!isThresholdValid ? "border-red-500" : ""}
                  />
                </FormControl>
                <FormDescription>
                  Quantité qui déclenche une alerte de réapprovisionnement
                </FormDescription>
                {!isThresholdValid && (
                  <FormMessage>
                    Le seuil d'alerte doit être supérieur ou égal au stock minimum
                  </FormMessage>
                )}
              </FormItem>
            )}
          />

          {/* Aperçu des seuils */}
          {(watchedMinStock || watchedStockAlertThreshold) && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Aperçu de la gestion des stocks
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Stock initial :</span>
                  <Badge variant="outline">{watchedInitialStock || 0} unités</Badge>
                </div>
                {watchedMinStock && (
                  <div className="flex justify-between">
                    <span>Stock minimum :</span>
                    <Badge variant="secondary">{watchedMinStock} unités</Badge>
                  </div>
                )}
                {watchedStockAlertThreshold && (
                  <div className="flex justify-between">
                    <span>Seuil d'alerte :</span>
                    <Badge 
                      variant={isThresholdValid ? "default" : "destructive"}
                    >
                      {watchedStockAlertThreshold} unités
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Logique d'alerte */}
              <div className="mt-3 pt-3 border-t space-y-1 text-xs text-muted-foreground">
                <p>• Alerte déclenchée si stock ≤ {watchedStockAlertThreshold || 0}</p>
                <p>• Réapprovisionnement recommandé si stock ≤ {watchedMinStock || 0}</p>
                <p>• Stock bloqué si stock = 0</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertes et avertissements */}
      {!isThresholdValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Configuration incorrecte :</strong> Le seuil d'alerte doit être supérieur ou égal au stock minimum pour éviter les alertes constantes.
          </AlertDescription>
        </Alert>
      )}

      {watchedInitialStock === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Stock initial à zéro :</strong> Le produit sera créé en rupture de stock. Assurez-vous de le réapprovisionner avant de le proposer aux clients.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}