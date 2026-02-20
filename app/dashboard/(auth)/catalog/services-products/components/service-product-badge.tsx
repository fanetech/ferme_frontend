import { Badge } from "@/components/ui/badge";
import { ServiceNature } from "@/types/catalog";

interface ServiceProductBadgeProps {
  nature: ServiceNature;
  status?: string;
}

export function ServiceProductBadge({ nature, status }: ServiceProductBadgeProps) {
  const getServiceNatureBadge = () => {
    switch (nature) {
      case ServiceNature.PRODUCT:
        return <Badge variant="default" className="bg-blue-100 text-blue-800">📦 Produit</Badge>;
      case ServiceNature.INTERNAL_SERVICE:
        return <Badge variant="default" className="bg-green-100 text-green-800">⚙️ Service interne</Badge>;
      case ServiceNature.EXTERNAL_SERVICE:
        return <Badge variant="default" className="bg-purple-100 text-purple-800">🌐 Service externe</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default" className="bg-green-100 text-green-800">✅ Actif</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">⏸️ Inactif</Badge>;
      case "SUSPENDED":
        return <Badge variant="destructive">🚫 Suspendu</Badge>;
      case "OUT_OF_STOCK":
        return <Badge variant="destructive" className="bg-red-100 text-red-800">📦 Rupture</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getServiceNatureBadge()}
      {status && getStatusBadge()}
    </div>
  );
}