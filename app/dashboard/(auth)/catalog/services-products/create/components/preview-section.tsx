import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Eye, 
  TestTube, 
  CheckCircle, 
  AlertTriangle, 
  Package, 
  Zap, 
  Globe,
  Calculator,
  Settings,
  Info
} from "lucide-react";
import { ServiceNature, ServiceType } from "@/types/catalog";
import type { ServiceProductFormData } from "./form-schema";
import type { SuperStructure, Structure, Category } from "@/types/organization";

interface PreviewSectionProps {
  form: UseFormReturn<ServiceProductFormData>;
  isPreviewMode: boolean;
  onTest: () => void;
  structures?: Structure[];
  categories?: Category[];
}

export function PreviewSection({ form, isPreviewMode, onTest, structures = [], categories = [] }: PreviewSectionProps) {
  const formData = form.getValues();
  const formErrors = form.formState.errors;
  
  const hasErrors = Object.keys(formErrors).length > 0;
  const isFormValid = form.formState.isValid;

  // Récupérer les noms à partir des IDs
  const getStructureName = (structureId: string) => {
    const structure = structures.find(s => s.id === structureId);
    return structure ? structure.name : structureId;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getServiceNatureIcon = (nature: ServiceNature) => {
    switch (nature) {
      case ServiceNature.PRODUCT:
        return <Package className="h-4 w-4" />;
      case ServiceNature.INTERNAL_SERVICE:
        return <Zap className="h-4 w-4" />;
      case ServiceNature.EXTERNAL_SERVICE:
        return <Globe className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getServiceNatureLabel = (nature: ServiceNature) => {
    switch (nature) {
      case ServiceNature.PRODUCT:
        return "Produit";
      case ServiceNature.INTERNAL_SERVICE:
        return "Service interne";
      case ServiceNature.EXTERNAL_SERVICE:
        return "Service externe";
      default:
        return "Non défini";
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'XOF' ? 'XOF' : 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Statut de validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isFormValid ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            )}
            Statut de validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isFormValid ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Formulaire valide :</strong> Toutes les informations requises ont été saisies correctement. 
                Vous pouvez procéder à la création du service/produit.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Validation incomplète :</strong> Certains champs requis sont manquants ou incorrects. 
                Veuillez corriger les erreurs avant de continuer.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Aperçu des informations principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Aperçu du service/produit
          </CardTitle>
          <CardDescription>
            Vérifiez les informations avant la création
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* En-tête avec type */}
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              {getServiceNatureIcon(formData.serviceNature)}
              <Badge variant="outline" className="gap-1">
                {getServiceNatureLabel(formData.serviceNature)}
              </Badge>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {formData.name || "Nom non défini"}
              </h3>
              {formData.code && (
                <p className="text-sm text-muted-foreground">
                  Code: {formData.code}
                </p>
              )}
            </div>
          </div>

          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Informations de base</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Structure :</span>
                  <span className="font-medium">{formData.structureId ? getStructureName(formData.structureId) : "Non définie"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Catégorie :</span>
                  <span className="font-medium">{formData.categoryId ? getCategoryName(formData.categoryId) : "Non définie"}</span>
                </div>
                {formData.serviceNature !== ServiceNature.PRODUCT && (
                  <div className="flex justify-between">
                    <span>Type :</span>
                    <span className="font-medium">{formData.type || ServiceType.SERVICE}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Tarification</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Montant :</span>
                  <span className="font-medium">
                    {formatCurrency(formData.amount || 0, formData.currency || "XOF")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxable :</span>
                  <Badge variant={formData.isTaxable ? "default" : "secondary"}>
                    {formData.isTaxable ? `Oui (${formData.taxRate || 0}%)` : "Non"}
                  </Badge>
                </div>
                {formData.isTaxable && formData.taxRate && (
                  <div className="flex justify-between">
                    <span>Total TTC :</span>
                    <span className="font-medium">
                      {formatCurrency(
                        (formData.amount || 0) * (1 + (formData.taxRate || 0) / 100),
                        formData.currency || "XOF"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {formData.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground p-3 border rounded bg-muted/30">
                {formData.description}
              </p>
            </div>
          )}

          {/* Configuration spécifique */}
          <div>
            <h4 className="font-medium mb-2">Configuration spécialisée</h4>
            <div className="p-3 border rounded bg-muted/30 space-y-2">
              {formData.serviceNature === ServiceNature.PRODUCT && (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">Gestion de stock</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    <div>Stock initial: {formData.initialStock || 0} unités</div>
                    <div>Stock minimum: {formData.minStock || 0} unités</div>
                    <div>Seuil d'alerte: {formData.stockAlertThreshold || 0} unités</div>
                    {formData.barcode && <div>Code-barres: {formData.barcode}</div>}
                  </div>
                </div>
              )}

              {formData.serviceNature === ServiceNature.INTERNAL_SERVICE && (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    <span className="font-medium">Calculs automatiques</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    <div>Méthode: {formData.calculationMethod || "Non définie"}</div>
                    <div>Champs configurés: {formData.calculationFields?.length || 0}</div>
                  </div>
                </div>
              )}

              {formData.serviceNature === ServiceNature.EXTERNAL_SERVICE && (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">API externe</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    <div>URL: {formData.apiConfig?.baseUrl || "Non définie"}</div>
                    <div>Authentification: {formData.apiConfig?.authType || "Aucune"}</div>
                    <div>Timeout: {formData.apiConfig?.timeout || 30000}ms</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Options supplémentaires */}
          <div>
            <h4 className="font-medium mb-2">Options</h4>
            <div className="flex flex-wrap gap-2">
              {formData.requiresValidation && (
                <Badge variant="outline">Validation requise</Badge>
              )}
              {formData.allowPartialPayment && (
                <Badge variant="outline">Paiement partiel autorisé</Badge>
              )}
              {formData.displayOrder && (
                <Badge variant="outline">Ordre d'affichage: {formData.displayOrder}</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tests et validation */}
      {formData.serviceNature !== ServiceNature.PRODUCT && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Tests et validation
            </CardTitle>
            <CardDescription>
              Testez la configuration avant la mise en production
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={onTest}
                disabled={!isFormValid}
                className="h-auto p-4 justify-start"
              >
                <div className="flex items-center gap-3">
                  <TestTube className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Tester la configuration</div>
                    <div className="text-sm text-muted-foreground">
                      {formData.serviceNature === ServiceNature.INTERNAL_SERVICE
                        ? "Vérifier les calculs et formules"
                        : "Tester la connexion API"}
                    </div>
                  </div>
                </div>
              </Button>

              <div className="flex flex-col gap-2">
                <Badge variant={isFormValid ? "default" : "secondary"} className="w-fit">
                  {isFormValid ? "✓ Prêt pour la création" : "⚠ Validation incomplète"}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {isFormValid
                    ? "Toutes les validations sont passées avec succès"
                    : "Veuillez corriger les erreurs dans les sections précédentes"}
                </p>
              </div>
            </div>

            {/* Conseils */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Conseil :</strong> Une fois le service/produit créé, vous pourrez accéder à des options de configuration avancées 
                pour affiner les paramètres et ajouter des fonctionnalités supplémentaires.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Erreurs de validation */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erreurs de validation détectées :</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {Object.entries(formErrors).map(([field, error]) => (
                <li key={field} className="text-sm">
                  {field}: {error?.message || "Erreur de validation"}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}