import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, DollarSign, Building, Tag, Calendar, User, BarChart3 } from "lucide-react";
import { ServiceProduct, ServiceNature, ServiceStatus } from "@/types/catalog";

interface ServiceProductDetailsInfoProps {
  serviceProduct: ServiceProduct;
}

export function ServiceProductDetailsInfo({ serviceProduct }: ServiceProductDetailsInfoProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'XOF' ? 'XOF' : 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Informations principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nom</label>
              <p className="text-base font-medium">{serviceProduct.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Code</label>
              <p className="text-base font-mono">{serviceProduct.code}</p>
            </div>
            
            {serviceProduct.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm text-muted-foreground">{serviceProduct.description}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <div className="mt-1">
                {serviceProduct.serviceNature === ServiceNature.PRODUCT && (
                  <Badge variant="outline" className="gap-1">📦 Produit</Badge>
                )}
                {serviceProduct.serviceNature === ServiceNature.INTERNAL_SERVICE && (
                  <Badge variant="outline" className="gap-1">⚙️ Service interne</Badge>
                )}
                {serviceProduct.serviceNature === ServiceNature.EXTERNAL_SERVICE && (
                  <Badge variant="outline" className="gap-1">🌐 Service externe</Badge>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Statut</label>
              <div className="mt-1">
                {serviceProduct.status === ServiceStatus.ACTIVE && (
                  <Badge className="bg-green-100 text-green-800">Actif</Badge>
                )}
                {serviceProduct.status === ServiceStatus.INACTIVE && (
                  <Badge variant="secondary">Inactif</Badge>
                )}
                {serviceProduct.status === ServiceStatus.SUSPENDED && (
                  <Badge variant="destructive">Suspendu</Badge>
                )}
                {serviceProduct.status === ServiceStatus.OUT_OF_STOCK && (
                  <Badge className="bg-orange-100 text-orange-800">Rupture de stock</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tarification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Prix de base</label>
              <p className="text-xl font-bold">
                {formatCurrency(serviceProduct.amount, serviceProduct.currency)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Devise</label>
                <p className="text-base">{serviceProduct.currency}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Taxable</label>
                <p className="text-base">
                  {serviceProduct.isTaxable ? (
                    <Badge variant="outline">Oui ({serviceProduct.taxRate}%)</Badge>
                  ) : (
                    <Badge variant="secondary">Non</Badge>
                  )}
                </p>
              </div>
            </div>

            {serviceProduct.isTaxable && serviceProduct.taxRate && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Prix TTC</label>
                <p className="text-lg font-semibold">
                  {formatCurrency(
                    serviceProduct.amount * (1 + serviceProduct.taxRate / 100),
                    serviceProduct.currency
                  )}
                </p>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              {serviceProduct.requiresValidation && (
                <Badge variant="outline">Validation requise</Badge>
              )}
              {serviceProduct.allowPartialPayment && (
                <Badge variant="outline">Paiement partiel autorisé</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Structure</label>
              <p className="text-base">{serviceProduct.structureId}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Catégorie</label>
              <p className="text-base">{serviceProduct.categoryId}</p>
            </div>
          </div>

          {serviceProduct.displayOrder && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ordre d'affichage</label>
              <p className="text-base">{serviceProduct.displayOrder}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration spécifique */}
      {serviceProduct.serviceNature === ServiceNature.PRODUCT && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Gestion de stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Stock actuel</label>
                <p className="text-xl font-bold">{serviceProduct.stockQuantity || 0}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Stock minimum</label>
                <p className="text-base">{serviceProduct.minStock || 0}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Seuil d'alerte</label>
                <p className="text-base">{serviceProduct.stockAlertThreshold || 0}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Statut stock</label>
                <div>
                  {(serviceProduct.stockQuantity || 0) === 0 ? (
                    <Badge variant="destructive">Rupture</Badge>
                  ) : (serviceProduct.stockQuantity || 0) <= (serviceProduct.stockAlertThreshold || 0) ? (
                    <Badge className="bg-orange-100 text-orange-800">Faible</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800">Disponible</Badge>
                  )}
                </div>
              </div>
            </div>

            {serviceProduct.barcode && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Code-barres</label>
                <p className="text-base font-mono">{serviceProduct.barcode}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Métadonnées et dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informations système
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Créé le</label>
              <p className="text-sm">{formatDate(serviceProduct.createdAt)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Modifié le</label>
              <p className="text-sm">{formatDate(serviceProduct.updatedAt)}</p>
            </div>
          </div>

          {serviceProduct.metadata && Object.keys(serviceProduct.metadata).length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Métadonnées</label>
              <div className="bg-muted/50 rounded p-3 mt-1">
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(serviceProduct.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}