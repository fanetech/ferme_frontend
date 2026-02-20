"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Eye, TestTube, ChevronLeft, ChevronRight, Info, DollarSign, Settings, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";

// Components pour chaque section
import { BasicInfoSection } from "../../create/components/basic-info-section";
import { PricingSection } from "../../create/components/pricing-section";
import { ProductConfigSection } from "../../create/components/product-config-section";
import { InternalServiceConfigSection } from "../../create/components/internal-service-config-section";
import { ExternalServiceConfigSection } from "../../create/components/external-service-config-section";
import { PreviewSection } from "../../create/components/preview-section";

// Hooks et types
import { useServiceProduct, useUpdateServiceProduct } from "@/data/catalog";
import { useSuperStructuresForFilter, useStructuresForFilter, useCategoriesForFilter } from "@/data/organization";
import { ServiceType, ServiceNature, UpdateServiceProductRequest } from "@/types/catalog";
import { serviceProductFormSchema, type ServiceProductFormData } from "../../create/components/form-schema";

interface EditServiceProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditServiceProductPage({ params }: EditServiceProductPageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  // États pour la navigation
  const [currentTab, setCurrentTab] = useState("basic");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Hook pour récupérer les données du service
  const { data: serviceProduct, isLoading, error } = useServiceProduct(id);
  
  // Hook pour la mise à jour
  const { mutate: updateServiceProduct, isPending } = useUpdateServiceProduct();

  // Données pour les sélecteurs
  const { data: superStructuresData } = useSuperStructuresForFilter();
  const { data: structuresData } = useStructuresForFilter();
  const { data: categoriesData } = useCategoriesForFilter();

  // Form setup
  const form = useForm<ServiceProductFormData>({
    resolver: zodResolver(serviceProductFormSchema),
    defaultValues: {
      serviceNature: ServiceNature.PRODUCT,
      name: "",
      description: "",
      amount: 0,
      currency: "XOF",
      isTaxable: false,
      taxRate: 18,
      requiresValidation: false,
      allowPartialPayment: false,
      displayOrder: 1,
      minStock: 0,
      stockAlertThreshold: 0,
      metadata: {}
    },
    mode: "onChange"
  });

  // Watch pour adapter l'interface
  const watchedServiceNature = form.watch("serviceNature");
  const watchedType = form.watch("type");

  // Effet pour pré-remplir le formulaire avec les données existantes
  useEffect(() => {
    if (serviceProduct) {
      // Trouver la superStructure à partir de la structure
      const structure = structuresData?.content?.find(s => s.id === serviceProduct.structureId);
      const superStructureId = structure?.superStructureId;

      form.reset({
        superStructureId: superStructureId || "",
        structureId: serviceProduct.structureId,
        categoryId: serviceProduct.categoryId,
        serviceNature: serviceProduct.serviceNature,
        type: serviceProduct.type,
        name: serviceProduct.name,
        description: serviceProduct.description || "",
        code: serviceProduct.code,
        amount: serviceProduct.amount,
        currency: serviceProduct.currency,
        isTaxable: serviceProduct.isTaxable,
        taxRate: serviceProduct.taxRate || 18,
        requiresValidation: serviceProduct.requiresValidation,
        allowPartialPayment: serviceProduct.allowPartialPayment,
        displayOrder: serviceProduct.displayOrder || 1,
        // Produit
        barcode: serviceProduct.barcode,
        initialStock: serviceProduct.currentStock || 0,
        minStock: serviceProduct.minStock || 0,
        stockAlertThreshold: serviceProduct.stockAlertThreshold || 0,
        // Metadata
        metadata: serviceProduct.metadata ? (typeof serviceProduct.metadata === 'string' ? JSON.parse(serviceProduct.metadata) : serviceProduct.metadata) : {}
      });
    }
  }, [serviceProduct, structuresData, form]);

  // Fonction pour obtenir l'icône d'un onglet
  const getTabIcon = (tabId: string) => {
    switch (tabId) {
      case "basic":
        return <Info className="h-4 w-4" />;
      case "pricing":
        return <DollarSign className="h-4 w-4" />;
      case "config":
        return <Settings className="h-4 w-4" />;
      case "preview":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // Navigation entre onglets (simplifiée)
  const tabs = [
    {
      id: "basic",
      label: "Informations de base",
      shortLabel: "Infos",
      description: "Type, nom, structure, catégorie",
      required: true,
      icon: getTabIcon("basic")
    },
    {
      id: "pricing",
      label: "Tarification",
      shortLabel: "Prix",
      description: "Prix, taxes, validation",
      required: true,
      icon: getTabIcon("pricing")
    },
    {
      id: "preview",
      label: "Aperçu & Mise à jour",
      shortLabel: "Aperçu",
      description: "Vérification avant mise à jour",
      required: false,
      icon: getTabIcon("preview")
    }
  ];

  function getConfigDescription() {
    switch (watchedServiceNature) {
      case ServiceNature.PRODUCT:
        return "Stock, code-barres, inventaire";
      case ServiceNature.INTERNAL_SERVICE:
        return "Calculs, formules, règles";
      case ServiceNature.EXTERNAL_SERVICE:
        return "API, endpoints, mappings";
      default:
        return "Configuration spécialisée";
    }
  }

  // Validation par section
  const validateSection = async (sectionId: string): Promise<boolean> => {
    const fieldsToValidate = getSectionFields(sectionId);
    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  function getSectionFields(sectionId: string): (keyof ServiceProductFormData)[] {
    switch (sectionId) {
      case "basic":
        return ["serviceNature", "type", "name", "structureId", "categoryId"];
      case "pricing":
        return ["amount", "currency", "isTaxable", "taxRate"];
      case "config":
        if (watchedServiceNature === ServiceNature.PRODUCT) {
          return ["minStock", "stockAlertThreshold"];
        }
        return [];
      default:
        return [];
    }
  }

  // Navigation avec validation
  const handleTabChange = async (tabId: string) => {
    if (tabId === currentTab) return;
    
    // Valider la section actuelle avant de naviguer
    const isValid = await validateSection(currentTab);
    if (!isValid) {
      toast.error("Veuillez corriger les erreurs avant de continuer");
      return;
    }
    
    setCurrentTab(tabId);
  };

  // Soumission du formulaire
  const onSubmit = async (data: ServiceProductFormData) => {
    try {
      // Validation finale
      const isFormValid = await form.trigger();
      if (!isFormValid) {
        toast.error("Veuillez corriger toutes les erreurs du formulaire");
        return;
      }

      // Préparation des données pour la mise à jour
      const updateData: UpdateServiceProductRequest = {
        structureId: data.structureId!,
        categoryId: data.categoryId!,
        serviceNature: data.serviceNature,
        name: data.name,
        description: data.description,
        code: data.code,
        amount: data.amount,
        currency: data.currency,
        isTaxable: data.isTaxable,
        taxRate: data.isTaxable ? data.taxRate : undefined,
        requiresValidation: data.requiresValidation,
        allowPartialPayment: data.allowPartialPayment,
        displayOrder: data.displayOrder,
        metadata: Object.keys(data.metadata || {}).length > 0 ? data.metadata : undefined
      };

      // Ajout des champs spécifiques aux produits
      if (data.serviceNature === ServiceNature.PRODUCT) {
        updateData.minStock = data.minStock;
        updateData.stockAlertThreshold = data.stockAlertThreshold;
        updateData.barcode = data.barcode;
      }

      // Mise à jour
      updateServiceProduct({
        id: id,
        data: updateData
      }, {
        onSuccess: () => {
          toast.success("Service/Produit mis à jour avec succès !");
          router.push(`/dashboard/catalog/services-products`);
        },
        onError: (error) => {
          console.error("Erreur lors de la mise à jour du service/produit", error);
          toast.error(`Erreur lors de la mise à jour : ${error.message}`);
        }
      });

    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // Test de la configuration
  const handleTest = () => {
    toast.info("Fonctionnalité de test en cours de développement");
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Modifier {serviceProduct.name}
            </h1>
            <p className="text-muted-foreground">
              Mettre à jour les informations du service/produit
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            disabled={currentTab !== "preview"}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? "Mode édition" : "Aperçu"}
          </Button>
          {watchedServiceNature !== ServiceNature.PRODUCT && (
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={currentTab !== "preview"}
            >
              <TestTube className="h-4 w-4 mr-2" />
              Tester
            </Button>
          )}
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {isPending ? "Mise à jour..." : "Mettre à jour"}
          </Button>
        </div>
      </div>

      {/* Aperçu du type sélectionné */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Type sélectionné :</span>
              <Badge variant="outline" className="gap-1">
                {watchedServiceNature === ServiceNature.PRODUCT && "📦"}
                {watchedServiceNature === ServiceNature.INTERNAL_SERVICE && "⚙️"}
                {watchedServiceNature === ServiceNature.EXTERNAL_SERVICE && "🌐"}
                {watchedServiceNature === ServiceNature.PRODUCT && "Produit"}
                {watchedServiceNature === ServiceNature.INTERNAL_SERVICE && "Service interne"}
                {watchedServiceNature === ServiceNature.EXTERNAL_SERVICE && "Service externe"}
              </Badge>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="text-sm text-muted-foreground">
              {getConfigDescription()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barre de progression compacte */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between relative">
            {tabs.map((tab, index) => {
              const isActive = currentTab === tab.id;
              const tabIndex = tabs.findIndex(t => t.id === currentTab);
              const isPast = index < tabIndex;
              
              return (
                <div key={tab.id} className="flex items-center flex-1">
                  <div className="flex items-center">
                    {/* Indicateur d'étape */}
                    <div 
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors cursor-pointer ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : isPast
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-muted-foreground/30 bg-background text-muted-foreground"
                      }`}
                      onClick={() => handleTabChange(tab.id)}
                    >
                      {isPast ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Label */}
                    <div className="ml-2 hidden sm:block">
                      <div className={`text-sm font-medium ${
                        isActive ? "text-primary" : isPast ? "text-green-600" : "text-muted-foreground"
                      }`}>
                        {tab.shortLabel}
                      </div>
                    </div>
                  </div>
                  
                  {/* Ligne de connexion */}
                  {index < tabs.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 transition-colors ${
                      isPast ? "bg-green-500" : "bg-muted-foreground/20"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Titre de l'étape actuelle */}
          <div className="text-center mt-3">
            <h3 className="font-medium text-muted-foreground">
              {tabs.find(t => t.id === currentTab)?.label}
            </h3>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire avec onglets */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={currentTab} onValueChange={handleTabChange}>
            {/* Navigation cachée (pour la logique) */}
            <TabsList className="hidden">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Contenu des onglets */}
            <div className="mt-6">
              <TabsContent value="basic" className="space-y-6">
                <BasicInfoSection
                  form={form}
                  superStructures={superStructuresData?.content || []}
                  structures={structuresData?.content || []}
                  categories={categoriesData?.content || []}
                />
                {/* Boutons de navigation */}
                <div className="flex justify-between">
                  <Button type="button" variant="outline" disabled>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Précédent
                  </Button>
                  <Button type="button" onClick={() => handleTabChange("pricing")}>
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                <PricingSection form={form} />
                {/* Boutons de navigation */}
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => handleTabChange("basic")}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Précédent
                  </Button>
                  <Button type="button" onClick={() => handleTabChange("preview")}>
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </TabsContent>


              <TabsContent value="preview" className="space-y-6">
                <PreviewSection
                  form={form}
                  isPreviewMode={isPreviewMode}
                  onTest={handleTest}
                  structures={structuresData?.content || []}
                  categories={categoriesData?.content || []}
                />
                {/* Boutons de navigation */}
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => handleTabChange("pricing")}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Précédent
                  </Button>
                  <Button 
                    type="button"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isPending || !form.formState.isValid}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isPending ? "Mise à jour..." : "Mettre à jour le service/produit"}
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}