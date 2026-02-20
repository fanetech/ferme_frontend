"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings, 
  Plus, 
  AlertCircle, 
  ExternalLink, 
  Calculator,
  Package
} from "lucide-react";

// Components
import { ServiceConfigWizard } from "./service-config-wizard";

// Types
import { ServiceProduct, ServiceNature } from "@/types/catalog";

interface ConfigurationNotFoundProps {
  serviceProduct: ServiceProduct;
}

export function ConfigurationNotFound({ serviceProduct }: ConfigurationNotFoundProps) {
  const [showWizard, setShowWizard] = useState(false);

  const getConfigDescription = () => {
    switch (serviceProduct.serviceNature) {
      case ServiceNature.EXTERNAL_SERVICE:
        return {
          title: "Configuration API externe",
          description: "Ce service externe nécessite une configuration API pour fonctionner correctement.",
          details: [
            "Configuration des endpoints (consultation, validation, vérification)",
            "Paramètres d'authentification (API Key, OAuth, etc.)",
            "Mapping des champs de données et réponses",
            "Configuration des timeouts et retry policies"
          ],
          icon: ExternalLink,
          complexity: "Complexe",
          buttonText: "Configurer l'API"
        };
      case ServiceNature.INTERNAL_SERVICE:
        return {
          title: "Configuration service interne",
          description: "Ce service interne utilise des champs de calcul et règles de tarification.",
          details: [
            "Définition des champs de calcul dynamique",
            "Configuration des règles de tarification",
            "Formules de calcul personnalisées",
            "Conditions d'application des tarifs"
          ],
          icon: Calculator,
          complexity: "Moyenne",
          buttonText: "Configurer les calculs"
        };
      default:
        return {
          title: "Aucune configuration nécessaire",
          description: "Les produits physiques n'ont pas besoin de configuration avancée.",
          details: [
            "Gestion des stocks automatique",
            "Calculs de prix simples",
            "Pas de configuration API requise"
          ],
          icon: Package,
          complexity: "Simple",
          buttonText: null
        };
    }
  };

  const configInfo = getConfigDescription();
  const IconComponent = configInfo.icon;

  if (serviceProduct.serviceNature === ServiceNature.PRODUCT) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <IconComponent className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">{configInfo.title}</CardTitle>
            <CardDescription>{configInfo.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Les produits physiques utilisent une gestion simple basée sur les stocks. 
                Aucune configuration avancée n'est nécessaire.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showWizard) {
    return (
      <ServiceConfigWizard 
        serviceProduct={serviceProduct}
        onCancel={() => setShowWizard(false)}
        onComplete={() => {
          setShowWizard(false);
          // La page se rechargera automatiquement via les hooks React Query
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec icône */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <IconComponent className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{configInfo.title}</CardTitle>
          <CardDescription className="text-base max-w-2xl mx-auto">
            {configInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informations sur le service */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="font-medium text-muted-foreground">Service</p>
                <p className="font-semibold">{serviceProduct.name}</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-muted-foreground">Type</p>
                <p className="font-semibold">
                  {serviceProduct.serviceNature === ServiceNature.EXTERNAL_SERVICE 
                    ? "Service externe" 
                    : "Service interne"
                  }
                </p>
              </div>
              <div className="text-center">
                <p className="font-medium text-muted-foreground">Complexité</p>
                <p className="font-semibold">{configInfo.complexity}</p>
              </div>
            </div>
          </div>

          {/* Ce qui sera configuré */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration requise
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {configInfo.details.map((detail, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bouton d'action */}
          {configInfo.buttonText && (
            <div className="flex justify-center pt-4">
              <Button 
                onClick={() => setShowWizard(true)}
                size="lg"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {configInfo.buttonText}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aide supplémentaire */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Besoin d'aide ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {serviceProduct.serviceNature === ServiceNature.EXTERNAL_SERVICE ? (
            <>
              <p className="text-sm text-muted-foreground">
                Pour configurer un service externe, vous aurez besoin :
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• L'URL de base de l'API du fournisseur</li>
                <li>• Les clés d'authentification (API Key, tokens)</li>
                <li>• La documentation des endpoints disponibles</li>
                <li>• Les formats de données attendus</li>
              </ul>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Pour configurer un service interne, vous définirez :
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Les paramètres nécessaires au calcul (surface, durée, etc.)</li>
                <li>• Les règles de tarification selon les conditions</li>
                <li>• Les formules de calcul personnalisées</li>
                <li>• Les tranches et majorations applicables</li>
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}