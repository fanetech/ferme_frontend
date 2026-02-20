"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Components
import { InternalServiceConfiguration } from "./components/internal-service-configuration";

// Hooks
import { useServiceProduct } from "@/data/catalog";
import { ServiceNature } from "@/types/catalog";
import AvePayLoader from "@/components/avepay-loader";

interface InternalServiceConfigPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function InternalServiceConfigPage({ params }: InternalServiceConfigPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: serviceProduct, isLoading, error } = useServiceProduct(id);

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
            Service introuvable ou erreur lors du chargement.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Vérifier que c'est bien un service interne
  if (serviceProduct.serviceNature !== ServiceNature.INTERNAL_SERVICE) {
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
            Cette page est réservée aux services internes uniquement.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Configuration Service Interne
          </h1>
          <p className="text-muted-foreground">
            {serviceProduct.name} - Configuration des champs de calcul et règles de pricing
          </p>
        </div>
        <div className="ml-auto">
          <Badge variant="outline" className="text-xs">
            Service interne
          </Badge>
        </div>
      </div>

      {/* Navigation des sections */}


        {/* Configuration principale */}
        <div className="mt-6">
          <InternalServiceConfiguration serviceProduct={serviceProduct} />
        </div>
    </div>
  );
}