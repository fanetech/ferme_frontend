import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useServiceProduct } from "@/data/catalog";
import { ServiceProductBadge } from "./service-product-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface ServiceProductDetailsModalProps {
  serviceProductId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceProductDetailsModal({
  serviceProductId,
  isOpen,
  onClose
}: ServiceProductDetailsModalProps) {
  const { data: serviceProduct, isLoading } = useServiceProduct(
    serviceProductId || "", 
    !!serviceProductId
  );

  if (!serviceProductId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails du Service/Produit</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="p-4 text-center">Chargement...</div>
        ) : serviceProduct ? (
          <div className="space-y-6">
            {/* Header avec badges */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{serviceProduct.name}</h2>
                <p className="text-sm text-muted-foreground">{serviceProduct.code}</p>
              </div>
              <ServiceProductBadge 
                nature={serviceProduct.serviceNature} 
                status={serviceProduct.status} 
              />
            </div>

            {/* Informations de base */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Structure</label>
                <p className="text-sm">{serviceProduct.structureName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <p className="text-sm">{serviceProduct.categoryName}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Montant</label>
                <p className="text-sm font-mono">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: serviceProduct.currency === 'XOF' ? 'XOF' : 'EUR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(serviceProduct.amount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Taxable</label>
                <p className="text-sm">
                  {serviceProduct.isTaxable ? `Oui (${serviceProduct.taxRate}%)` : 'Non'}
                </p>
              </div>
            </div>

            {/* Description */}
            {serviceProduct.description && (
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground mt-1">
                  {serviceProduct.description}
                </p>
              </div>
            )}

            {/* Stock (pour les produits) */}
            {serviceProduct.serviceNature === "PRODUCT" && (
              <div className="grid grid-cols-3 gap-4 p-4 border rounded">
                <div>
                  <label className="text-sm font-medium">Stock actuel</label>
                  <p className="text-lg font-semibold">
                    {serviceProduct.stockQuantity || 0}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Stock minimum</label>
                  <p className="text-sm">{serviceProduct.minStock || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Seuil d'alerte</label>
                  <p className="text-sm">{serviceProduct.stockAlertThreshold || 0}</p>
                </div>
              </div>
            )}

            {/* Configuration (pour les services) */}
            {serviceProduct.serviceNature !== "PRODUCT" && (
              <div className="p-4 border rounded">
                <label className="text-sm font-medium">Configuration</label>
                <div className="mt-2">
                  {serviceProduct.hasConfiguration ? (
                    <Badge className="bg-green-100 text-green-800">✅ Configuré</Badge>
                  ) : (
                    <Badge variant="destructive">⚠️ À configurer</Badge>
                  )}
                </div>
              </div>
            )}

            {/* Métadonnées */}
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <label className="font-medium">Créé le</label>
                <p>{formatDate(serviceProduct.createdAt)}</p>
              </div>
              <div>
                <label className="font-medium">Modifié le</label>
                <p>{formatDate(serviceProduct.updatedAt)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            Service/Produit non trouvé
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}