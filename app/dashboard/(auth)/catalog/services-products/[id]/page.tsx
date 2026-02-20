"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, ToggleLeft, ToggleRight, Settings, TestTube, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

// Components
import { ServiceProductDetailsInfo } from "./components/service-product-details-info";
import { ServiceProductConfiguration } from "./components/service-product-configuration";
import { ServiceProductStats } from "./components/service-product-stats";
import { ServiceProductHistory } from "./components/service-product-history";
import { StockManagement } from "./components/stock-management";

// Hooks
import {
  useServiceProduct,
  useDeleteServiceProduct,
  useActivateServiceProduct,
  useDeactivateServiceProduct,
  useSuspendServiceProduct
} from "@/data/catalog";
import { ServiceNature, ServiceStatus } from "@/types/catalog";

interface ServiceProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ServiceProductDetailPage({ params }: ServiceProductDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: serviceProduct, isLoading, error } = useServiceProduct(id);
  
  const { mutate: deleteServiceProduct, isPending: isDeleting } = useDeleteServiceProduct();
  const { mutate: activateServiceProduct, isPending: isActivating } = useActivateServiceProduct();
  const { mutate: deactivateServiceProduct, isPending: isDeactivating } = useDeactivateServiceProduct();
  const { mutate: suspendServiceProduct, isPending: isSuspending } = useSuspendServiceProduct();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !serviceProduct) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Service/Produit introuvable ou erreur lors du chargement.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleEdit = () => {
    router.push(`/dashboard/catalog/services-products/${id}/edit`);
  };

  const handleDuplicate = () => {
    router.push(`/dashboard/catalog/services-products/create?duplicateFrom=${id}`);
  };

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce service/produit ?")) {
      deleteServiceProduct(id, {
        onSuccess: () => {
          router.push("/dashboard/catalog/services-products");
        }
      });
    }
  };

  const handleStatusToggle = () => {
    if (serviceProduct.status === ServiceStatus.ACTIVE) {
      deactivateServiceProduct(id);
    } else {
      activateServiceProduct(id);
    }
  };

  const handleSuspend = () => {
    const reason = prompt("Raison de la suspension :");
    if (reason) {
      suspendServiceProduct({ id: id, reason });
    }
  };

  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case ServiceStatus.ACTIVE:
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case ServiceStatus.INACTIVE:
        return <Badge variant="secondary">Inactif</Badge>;
      case ServiceStatus.SUSPENDED:
        return <Badge variant="destructive">Suspendu</Badge>;
      case ServiceStatus.OUT_OF_STOCK:
        return <Badge className="bg-orange-100 text-orange-800">Rupture de stock</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getNatureBadge = (nature: ServiceNature) => {
    switch (nature) {
      case ServiceNature.PRODUCT:
        return <Badge variant="outline" className="gap-1">📦 Produit</Badge>;
      case ServiceNature.INTERNAL_SERVICE:
        return <Badge variant="outline" className="gap-1">⚙️ Service interne</Badge>;
      case ServiceNature.EXTERNAL_SERVICE:
        return <Badge variant="outline" className="gap-1">🌐 Service externe</Badge>;
      default:
        return <Badge variant="outline">Non défini</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{serviceProduct.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground">Code: {serviceProduct.code}</span>
              <Separator orientation="vertical" className="h-4" />
              {getNatureBadge(serviceProduct.serviceNature)}
              <Separator orientation="vertical" className="h-4" />
              {getStatusBadge(serviceProduct.status)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDuplicate}
          >
            <Copy className="h-4 w-4 mr-2" />
            Dupliquer
          </Button>
          
          <Button
            variant="outline"
            onClick={handleStatusToggle}
            disabled={isActivating || isDeactivating}
          >
            {serviceProduct.status === ServiceStatus.ACTIVE ? (
              <>
                <ToggleRight className="h-4 w-4 mr-2" />
                Désactiver
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4 mr-2" />
                Activer
              </>
            )}
          </Button>

          {(serviceProduct.serviceNature === ServiceNature.EXTERNAL_SERVICE ||
            serviceProduct.serviceNature === ServiceNature.INTERNAL_SERVICE) && (
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/catalog/services-products/${id}/config`)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </Button>
          )}

          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Détails</TabsTrigger>
          {serviceProduct.serviceNature === ServiceNature.PRODUCT && (
            <TabsTrigger value="stock">Stock</TabsTrigger>
          )}
          {(serviceProduct.serviceNature === ServiceNature.EXTERNAL_SERVICE || 
            serviceProduct.serviceNature === ServiceNature.INTERNAL_SERVICE) && (
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
          )}
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <ServiceProductDetailsInfo serviceProduct={serviceProduct} />
        </TabsContent>

        {serviceProduct.serviceNature === ServiceNature.PRODUCT && (
          <TabsContent value="stock">
            <StockManagement serviceProduct={serviceProduct} />
          </TabsContent>
        )}

        {(serviceProduct.serviceNature === ServiceNature.EXTERNAL_SERVICE || 
          serviceProduct.serviceNature === ServiceNature.INTERNAL_SERVICE) && (
          <TabsContent value="configuration">
            <ServiceProductConfiguration serviceProduct={serviceProduct} />
          </TabsContent>
        )}

        <TabsContent value="stats">
          <ServiceProductStats serviceProduct={serviceProduct} />
        </TabsContent>

        <TabsContent value="history">
          <ServiceProductHistory serviceProduct={serviceProduct} />
        </TabsContent>
      </Tabs>
    </div>
  );
}