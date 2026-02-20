"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, Globe, Database, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { use } from "react";

// Components
import { ExternalServiceConfiguration } from "./components/external-service-configuration";

// Hooks
import { useServiceProduct } from "@/data/catalog";
import { ServiceNature } from "@/types/catalog";
import AvePayLoader from "@/components/avepay-loader";

interface ExternalServiceConfigPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ExternalServiceConfigPage({ params }: ExternalServiceConfigPageProps) {
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

  // Vérifier que c'est bien un service externe
  if (serviceProduct.serviceNature !== ServiceNature.EXTERNAL_SERVICE) {
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
            Cette page est réservée aux services externes uniquement.
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
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Configuration Service Externe - {serviceProduct.name}
            </h1>
            <p className="text-muted-foreground">
              Configuration des endpoints, mappings API et authentification
            </p>
          </div>
        </div>
        <div className="ml-auto">
          <Badge variant="outline" className="text-xs">
            Service externe
          </Badge>
        </div>
      </div>

      {/* Configuration principale */}
      <div className="mt-6">
        <ExternalServiceConfiguration serviceProduct={serviceProduct} />
      </div>
    </div>
  );
}