import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  TestTube, 
  Globe, 
  Key, 
  Database,
  ArrowUpDown,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Components
import { ServiceConfigForm } from "./service-config-form";
import { EndpointConfigList } from "./endpoint-config-list";
import { DataFieldsList } from "./data-fields-list";
import { ResponseMappingList } from "./response-mapping-list";
import { PricingRulesList } from "./pricing-rules-list";

// Hooks
import { 
  useServiceConfig,
  useTestServiceConfig,
  useCreateServiceConfig,
  useUpdateServiceConfig,
  useDeleteServiceConfig
} from "@/data/catalog";
import { ServiceProduct, ServiceNature } from "@/types/catalog";

interface ServiceProductConfigurationProps {
  serviceProduct: ServiceProduct;
}

export function ServiceProductConfiguration({ serviceProduct }: ServiceProductConfigurationProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreatingConfig, setIsCreatingConfig] = useState(false);
  
  const { data: serviceConfig, isLoading, refetch } = useServiceConfig(
    serviceProduct.id,
    serviceProduct.hasConfiguration
  );
  const { mutate: testConfig, isPending: isTesting } = useTestServiceConfig();
  const { mutate: createConfig, isPending: isCreating } = useCreateServiceConfig();
  const { mutate: updateConfig, isPending: isUpdating } = useUpdateServiceConfig();
  const { mutate: deleteConfig, isPending: isDeleting } = useDeleteServiceConfig();

  const isExternalService = serviceProduct.serviceNature === ServiceNature.EXTERNAL_SERVICE;
  const isInternalService = serviceProduct.serviceNature === ServiceNature.INTERNAL_SERVICE;
  const isProduct = serviceProduct.serviceNature === ServiceNature.PRODUCT;

  if (!isExternalService && !isInternalService) {
    return (
      <Alert>
        <AlertDescription>
          La configuration avancée est disponible pour les services externes et internes uniquement.
        </AlertDescription>
      </Alert>
    );
  }

  const handleTestConfig = () => {
    if (serviceConfig) {
      testConfig(serviceConfig.id);
    }
  };

  const handleCreateConfig = () => {
    setIsCreatingConfig(true);
  };

  const handleDeleteConfig = () => {
    if (serviceConfig && confirm("Êtes-vous sûr de vouloir supprimer cette configuration ?")) {
      deleteConfig(serviceConfig.id, {
        onSuccess: () => {
          refetch();
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!serviceConfig && !isCreatingConfig) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration du service externe
            </CardTitle>
            <CardDescription>
              Aucune configuration n'a été définie pour ce service externe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Configuration requise</h3>
              <p className="text-muted-foreground mb-4">
                Pour utiliser ce service externe, vous devez d'abord configurer les endpoints 
                et les paramètres de connexion.
              </p>
              <Button onClick={handleCreateConfig}>
                <Plus className="h-4 w-4 mr-2" />
                Créer la configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCreatingConfig) {
    return (
      <ServiceConfigForm
        serviceProduct={serviceProduct}
        onSuccess={() => {
          setIsCreatingConfig(false);
          refetch();
        }}
        onCancel={() => setIsCreatingConfig(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuration du service</h2>
          <p className="text-muted-foreground">
            Gestion des endpoints, mappings et paramètres API
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleTestConfig}
            disabled={isTesting}
          >
            {isTesting ? (
              <>
                <TestTube className="h-4 w-4 mr-2 animate-pulse" />
                Test en cours...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Tester la configuration
              </>
            )}
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleDeleteConfig}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Statut de la configuration */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Statut :</span>
                {serviceConfig?.isActive ? (
                  <Badge className="bg-green-100 text-green-800 gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Actif
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Inactif
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Endpoints :</span>
                <Badge variant="outline">
                  {serviceConfig?.endpointConfigs?.length || 0} configuré(s)
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">URL de base :</span>
                <code className="px-2 py-1 bg-muted rounded text-xs">
                  {serviceConfig?.baseUrl || "Non définie"}
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets de configuration */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${isExternalService ? 'grid-cols-6' : 'grid-cols-4'}`}>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          {isExternalService && (
            <>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="fields">Champs de données</TabsTrigger>
              <TabsTrigger value="mappings">Mappings</TabsTrigger>
            </>
          )}
          {isInternalService && (
            <TabsTrigger value="pricing">Règles de pricing</TabsTrigger>
          )}
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">URL de base</label>
                  <p className="text-sm font-mono bg-muted p-2 rounded">
                    {serviceConfig?.baseUrl || "Non définie"}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type d'authentification</label>
                  <p className="text-sm">{serviceConfig?.authType || "Aucune"}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Timeout</label>
                  <p className="text-sm">{serviceConfig?.timeout || 30000} ms</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tentatives</label>
                  <p className="text-sm">{serviceConfig?.retryCount || 3}</p>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Endpoints</label>
                    <p className="text-2xl font-bold">{serviceConfig?.endpointConfigs?.length || 0}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Champs de données</label>
                    <p className="text-2xl font-bold">
                      {serviceConfig?.endpointConfigs?.reduce((total, endpoint) => 
                        total + (endpoint.dataFields?.length || 0), 0) || 0}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dernière modification</label>
                  <p className="text-sm">
                    {serviceConfig?.updatedAt ? 
                      new Date(serviceConfig.updatedAt).toLocaleDateString('fr-FR') : 
                      "Non disponible"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="endpoints">
          <EndpointConfigList 
            serviceConfig={serviceConfig} 
            onUpdate={() => refetch()}
          />
        </TabsContent>

        <TabsContent value="fields">
          <DataFieldsList 
            serviceConfig={serviceConfig}
            onUpdate={() => refetch()}
          />
        </TabsContent>

        <TabsContent value="mappings">
          <ResponseMappingList 
            serviceConfig={serviceConfig}
            onUpdate={() => refetch()}
          />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingRulesList 
            serviceConfig={serviceConfig}
            onUpdate={() => refetch()}
          />
        </TabsContent>

        <TabsContent value="settings">
          <ServiceConfigForm
            serviceProduct={serviceProduct}
            serviceConfig={serviceConfig}
            onSuccess={() => refetch()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}