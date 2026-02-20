"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Hooks
import { useServiceProduct } from "@/data/catalog";
import { ServiceNature } from "@/types/catalog";
import AvePayLoader from "@/components/avepay-loader";

interface ServiceProductConfigPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ServiceProductConfigPage({ params }: ServiceProductConfigPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: serviceProduct, isLoading, error } = useServiceProduct(id);

  // Redirection automatique vers la page appropriée
  useEffect(() => {
    if (serviceProduct && !isLoading && !error) {
      if (serviceProduct.serviceNature === ServiceNature.EXTERNAL_SERVICE) {
        router.replace(`/dashboard/catalog/services-products/${id}/config/external`);
      } else if (serviceProduct.serviceNature === ServiceNature.INTERNAL_SERVICE) {
        router.replace(`/dashboard/catalog/services-products/${id}/config/internal`);
      }
    }
  }, [serviceProduct, isLoading, error, router, id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <AvePayLoader />
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

  // Vérifier que c'est un service (externe ou interne) et non un produit
  if (serviceProduct.serviceNature === ServiceNature.PRODUCT) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        <Alert>
          <AlertDescription>
            La configuration avancée n'est disponible que pour les services externes et internes.
            Les produits utilisent la gestion des stocks.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Page de chargement pendant la redirection
  return (
    <div className="flex items-center justify-center h-screen">
      <AvePayLoader />
    </div>
  );
}