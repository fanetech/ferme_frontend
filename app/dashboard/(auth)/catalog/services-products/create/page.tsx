"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, ChevronLeft, ChevronRight, Info, DollarSign, CheckCircle } from "lucide-react";
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
import { BasicInfoSection } from "./components/basic-info-section";
import { PricingSection } from "./components/pricing-section";
import { PreviewSection } from "./components/preview-section";

// Hooks et types
import { useCreateServiceProduct, useServiceProduct } from "@/data/catalog";
import { useSuperStructuresForFilter, useStructuresForFilter, useCategoriesForFilter } from "@/data/organization";
import { ServiceType, ServiceNature, CreateServiceProductRequest } from "@/types/catalog";
import { serviceProductFormSchema, type ServiceProductFormData } from "./components/form-schema";

export default function CreateServiceProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicateFromId = searchParams.get('duplicateFrom');
  
  // États pour la navigation
  const [currentTab, setCurrentTab] = useState("basic");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Hook pour la création (désactiver le toast automatique)
  const { mutate: createServiceProduct, isPending } = useCreateServiceProduct({ showToast: false });
  
  // Hook pour la duplication (si applicable)
  const { data: originalServiceProduct } = useServiceProduct(
    duplicateFromId || "", 
    !!duplicateFromId
  );

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
      // Produit
      minStock: 0,
      stockAlertThreshold: 0,
      // Metadata
      metadata: {}
    },
    mode: "onChange"
  });

  // Watch pour adapter l'interface
  const watchedServiceNature = form.watch("serviceNature");
  const watchedType = form.watch("type");

  // Effet pour la duplication
  useEffect(() => {
    if (originalServiceProduct && duplicateFromId) {
      // Pré-remplir le formulaire avec les données de l'original
      form.reset({
        structureId: originalServiceProduct.structureId,
        categoryId: originalServiceProduct.categoryId,
        serviceNature: originalServiceProduct.serviceNature,
        type: originalServiceProduct.type,
        name: `${originalServiceProduct.name} (Copie)`,
        description: originalServiceProduct.description,
        amount: originalServiceProduct.amount,
        currency: originalServiceProduct.currency,
        isTaxable: originalServiceProduct.isTaxable,
        taxRate: originalServiceProduct.taxRate,
        requiresValidation: originalServiceProduct.requiresValidation,
        allowPartialPayment: originalServiceProduct.allowPartialPayment,
        displayOrder: (originalServiceProduct.displayOrder || 0) + 1,
        minStock: originalServiceProduct.minStock,
        stockAlertThreshold: originalServiceProduct.stockAlertThreshold,
        metadata: originalServiceProduct.metadata ? JSON.parse(originalServiceProduct.metadata) : {}
      });
      
      toast.info("Données copiées depuis le service/produit original");
    }
  }, [originalServiceProduct, duplicateFromId, form]);

  // Fonction pour obtenir l'icône d'un onglet
  const getTabIcon = (tabId: string) => {
    switch (tabId) {
      case "basic":
        return <Info className="h-4 w-4" />;
      case "pricing":
        return <DollarSign className="h-4 w-4" />;
      case "preview":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // Fonction pour vérifier si un onglet est complété
  const isTabCompleted = async (tabId: string) => {
    const fieldsToValidate = getSectionFields(tabId);
    if (fieldsToValidate.length === 0) return true;
    return await form.trigger(fieldsToValidate);
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
      label: "Aperçu & Création",
      shortLabel: "Aperçu",
      description: "Vérification avant création",
      required: false,
      icon: getTabIcon("preview")
    }
  ];


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
      case "preview":
        // Validation finale de tous les champs requis
        return ["serviceNature", "type", "name", "structureId", "categoryId", "amount", "currency"];
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

      // Préparation des données
      const createData: CreateServiceProductRequest = {
        structureId: data.structureId!,
        categoryId: data.categoryId!,
        serviceNature: data.serviceNature,
        name: data.name,
        description: data.description,
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
        createData.initialStock = data.initialStock || 0;
        createData.minStock = data.minStock;
        createData.stockAlertThreshold = data.stockAlertThreshold;
        createData.barcode = data.barcode;
      }

      // Création
      console.log("Données à créer :", createData);
      await createServiceProduct(createData, {
        onSuccess: (createdService) => {
          // Redirection selon le type de service
          const serviceId = createdService.id;
          
          switch (data.serviceNature) {
            case ServiceNature.INTERNAL_SERVICE:
              toast.success("Service interne créé ! Redirection vers la configuration...");
              router.push(`/dashboard/catalog/services-products/${serviceId}/config/internal`);
              break;
            case ServiceNature.EXTERNAL_SERVICE:
              toast.success("Service externe créé ! Redirection vers la configuration...");
              router.push(`/dashboard/catalog/services-products/${serviceId}/config/external`);
              break;
            case ServiceNature.PRODUCT:
            default:
              toast.success("Produit créé ! Retour à la liste...");
              router.push("/dashboard/catalog/services-products");
              break;
          }
        }
      });

    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire", error);
      toast.error("Erreur lors de la création");
    }
  };


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
              {duplicateFromId ? "Dupliquer" : "Créer"} un Service/Produit
            </h1>
            <p className="text-muted-foreground">
              {duplicateFromId 
                ? "Créer une copie avec modifications"
                : "Ajouter un nouveau service ou produit au catalogue"
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {isPending ? "Création..." : "Créer"}
          </Button>
        </div>
      </div>

      {/* Indicateur de duplication */}
      {duplicateFromId && originalServiceProduct && (
        <Alert>
          <AlertDescription>
            📋 Duplication depuis : <strong>{originalServiceProduct.name}</strong> ({originalServiceProduct.code})
          </AlertDescription>
        </Alert>
      )}

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
              {watchedServiceNature === ServiceNature.PRODUCT && "Gestion des stocks et inventaire"}
              {watchedServiceNature === ServiceNature.INTERNAL_SERVICE && "Configuration automatique après création"}
              {watchedServiceNature === ServiceNature.EXTERNAL_SERVICE && "Configuration des API après création"}
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
                  isPreviewMode={false}
                  onTest={() => {}}
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
                    {isPending ? "Création..." : "Créer le service/produit"}
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