import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calculator, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ServiceNature } from "@/types/catalog";
import type { ServiceProductFormData } from "./form-schema";

interface PricingSectionProps {
  form: UseFormReturn<ServiceProductFormData>;
}

export function PricingSection({ form }: PricingSectionProps) {
  const watchedServiceNature = form.watch("serviceNature");
  const watchedAmount = form.watch("amount");
  const watchedIsTaxable = form.watch("isTaxable");
  const watchedTaxRate = form.watch("taxRate");
  const watchedCurrency = form.watch("currency");

  // Calcul du montant total avec taxe
  const taxAmount = watchedIsTaxable && watchedTaxRate ? (watchedAmount * watchedTaxRate) / 100 : 0;
  const totalAmount = watchedAmount + taxAmount;

  const currencies = [
    { value: "XOF", label: "FCFA (XOF)", symbol: "FCFA" },
  /*  { value: "EUR", label: "Euro (EUR)", symbol: "€" },
    { value: "USD", label: "Dollar US (USD)", symbol: "$" }*/
  ];

  return (
    <div className="space-y-6">
      {/* Tarification de base */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Tarification
          </CardTitle>
          <CardDescription>
            Définissez le prix et les options de taxation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Montant et devise */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <FormField
              control={form.control}
              name="amount"
              disabled={watchedServiceNature === ServiceNature.EXTERNAL_SERVICE}
              render={({ field }) => (
                <FormItem className={"md:col-span-2 " + (watchedServiceNature === ServiceNature.EXTERNAL_SERVICE ? "opacity-50 cursor-not-allowed" : "")}>
                  <FormLabel className="flex items-center gap-1">
                    <span className="text-red-500">*</span>
                    Montant
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    {watchedServiceNature === ServiceNature.EXTERNAL_SERVICE
                      ? "Montant fixe ou 0 si calculé dynamiquement par l'API"
                      : watchedServiceNature === ServiceNature.INTERNAL_SERVICE
                      ? "Montant de base (peut être modifié par les règles de calcul)"
                      : "Prix de vente du produit"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              disabled={watchedServiceNature === ServiceNature.EXTERNAL_SERVICE}
              name="currency"
              render={({ field }) => (
                <FormItem className={"md:col-span-1 " + (watchedServiceNature === ServiceNature.EXTERNAL_SERVICE ? "opacity-50 cursor-not-allowed" : "")}>
                  <FormLabel className="flex items-center gap-1">
                    <span className="text-red-500">*</span>
                    Devise
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={"w-full"}>
                        <SelectValue placeholder="Sélectionnez une devise" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Aperçu du montant */}
          {watchedAmount > 0 && (
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Montant de base :</span>
                <span className="font-mono">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: watchedCurrency === 'XOF' ? 'XOF' : 'EUR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  }).format(watchedAmount)}
                </span>
              </div>
              {watchedIsTaxable && taxAmount > 0 && (
                <>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Taxe ({watchedTaxRate}%) :</span>
                    <span className="font-mono">
                      +{new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: watchedCurrency === 'XOF' ? 'XOF' : 'EUR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }).format(taxAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-medium border-t pt-2 mt-2">
                    <span>Total TTC :</span>
                    <span className="font-mono text-lg">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: watchedCurrency === 'XOF' ? 'XOF' : 'EUR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }).format(totalAmount)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration de la taxe */}
      <Card>
        <CardHeader>
          <CardTitle>Taxation</CardTitle>
          <CardDescription>
            Configuration de la TVA ou autres taxes applicables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="isTaxable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Service/Produit taxable
                  </FormLabel>
                  <FormDescription>
                    Appliquer une taxe (TVA, etc.) sur ce {watchedServiceNature === ServiceNature.PRODUCT ? "produit" : "service"}
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

          {watchedIsTaxable && (
            <FormField
              control={form.control}
              name="taxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <span className="text-red-500">*</span>
                    Taux de taxe (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="18.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Taux de taxe à appliquer (ex: 18% pour la TVA au Burkina Faso)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Options de validation et paiement */}
      <Card>
        <CardHeader>
          <CardTitle>Options de transaction</CardTitle>
          <CardDescription>
            Configuration du processus de validation et de paiement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="requiresValidation"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Validation requise
                  </FormLabel>
                  <FormDescription>
                    Un superviseur doit valider la transaction avant le paiement
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

          <FormField
            control={form.control}
            name="allowPartialPayment"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Paiement partiel autorisé
                  </FormLabel>
                  <FormDescription>
                    Le client peut payer en plusieurs fois
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
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Position dans la liste (plus petit = affiché en premier)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Alertes spécifiques */}
      {watchedServiceNature === ServiceNature.EXTERNAL_SERVICE && watchedAmount === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Service externe avec montant dynamique :</strong> Le montant final sera calculé par l'API externe lors de la consultation.
          </AlertDescription>
        </Alert>
      )}

      {watchedServiceNature === ServiceNature.INTERNAL_SERVICE && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Service avec calcul :</strong> Le montant peut être modifié par les règles de tarification que vous définirez dans la section Configuration.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}