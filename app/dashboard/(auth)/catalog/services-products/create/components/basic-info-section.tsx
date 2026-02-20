import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Package, Zap, Globe, Building } from "lucide-react";
import { ServiceNature, ServiceType } from "@/types/catalog";
import type { SuperStructure, Structure, Category } from "@/types/organization";
import type { ServiceProductFormData } from "./form-schema";
import { CATEGORY_ICONS } from "@/lib/constants/category-icons";

interface BasicInfoSectionProps {
  form: UseFormReturn<ServiceProductFormData>;
  superStructures: SuperStructure[];
  structures: Structure[];
  categories: Category[];
}

export function BasicInfoSection({ form, superStructures, structures, categories }: BasicInfoSectionProps) {
  const watchedServiceNature = form.watch("serviceNature");
  const watchedSuperStructureId = form.watch("superStructureId");
  const watchedStructureId = form.watch("structureId");

  // Filtrer les structures selon la super structure sélectionnée
  const filteredStructures = structures.filter(structure => 
    !watchedSuperStructureId || structure.superStructureId === watchedSuperStructureId
  );

  // Filtrer les catégories selon la super structure sélectionnée
  const filteredCategories = categories.filter(category => 
    !watchedSuperStructureId || category.superStructureId === watchedSuperStructureId
  );

  // Reset des champs dépendants quand la super structure change
  const handleSuperStructureChange = (superStructureId: string) => {
    form.setValue("superStructureId", superStructureId);
    form.setValue("structureId", "");
    form.setValue("categoryId", "");
  };

  const handleStructureChange = (structureId: string) => {
    form.setValue("structureId", structureId);
  };

  const serviceNatureOptions = [
    {
      value: ServiceNature.PRODUCT,
      label: "Produit",
      description: "Article physique avec gestion de stock",
      icon: <Package className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-800"
    },
    {
      value: ServiceNature.INTERNAL_SERVICE,
      label: "Service interne",
      description: "Service avec calculs automatiques (taxes, patentes...)",
      icon: <Zap className="h-4 w-4" />,
      color: "bg-green-100 text-green-800"
    },
    {
      value: ServiceNature.EXTERNAL_SERVICE,
      label: "Service externe",
      description: "Service connecté à une API externe (SONABEL, ONEA...)",
      icon: <Globe className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-800"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Sélection du type de service */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-red-500">*</span>
            Type de Service/Produit
          </CardTitle>
          <CardDescription>
            Choisissez le type pour adapter l'interface de configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="serviceNature"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {serviceNatureOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:border-primary/50 ${
                          field.value === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                        onClick={() => field.onChange(option.value)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-full ${option.color}`}>
                            {option.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                          {field.value === option.value && (
                            <Badge variant="default" className="ml-auto">
                              Sélectionné
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Informations de base */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de base</CardTitle>
          <CardDescription>
            Définissez les informations principales du {watchedServiceNature === ServiceNature.PRODUCT ? "produit" : "service"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Super Structure, Structure et Catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-4  gap-4">
            {/* Super Structure */}
            <div className={"col-span-full"}>
              <label className="text-sm font-medium flex items-center gap-1 mb-2">
                <span className="text-red-500">*</span>
                Organisation
              </label>
              <Select onValueChange={handleSuperStructureChange} value={watchedSuperStructureId}>
                <SelectTrigger className="h-auto min-h-[44px] w-full">
                  <SelectValue placeholder="Sélectionnez une organisation" />
                </SelectTrigger>
                <SelectContent>
                  {superStructures.map((superStructure) => (
                    <SelectItem key={superStructure.id} value={superStructure.id}>
                      <div className="flex items-center gap-3 py-2 w-full">
                        <Avatar className="h-8 w-8">
                          {superStructure.logoUrl ? (
                            <img
                              src={superStructure.logoUrl}
                              alt={`Logo ${superStructure.name}`}
                              className="h-full w-full object-cover rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <AvatarFallback className={superStructure.logoUrl ? 'hidden' : ''}>
                            <Building className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-row items-center gap-2 w-full">
                          <span className="font-medium">{superStructure.name}</span>
                          <span className="text-sm text-muted-foreground">
                            ({superStructure.code})
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FormField
              control={form.control}
              name="structureId"
              render={({ field }) => (
                <FormItem className={"col-span-full md:col-span-2 w-full"}>
                  <FormLabel className="flex items-center gap-1">
                    <span className="text-red-500">*</span>
                    Structure
                  </FormLabel>
                  <Select
                    onValueChange={handleStructureChange}
                    value={field.value}
                    disabled={!watchedSuperStructureId}
                  >
                    <FormControl>
                      <SelectTrigger className="h-auto min-h-[44px] w-full">
                        <SelectValue placeholder={
                          !watchedSuperStructureId
                            ? "Sélectionnez d'abord une organisation"
                            : "Sélectionnez une structure"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredStructures.map((structure) => (
                        <SelectItem key={structure.id} value={structure.id}>
                          <div className="flex items-center gap-3 py-2">
                            <Avatar className="h-6 w-6">
                              {structure.logoUrl ? (
                                <img
                                  src={structure.logoUrl}
                                  alt={`Logo ${structure.name}`}
                                  className="h-full w-full object-cover rounded-full"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <AvatarFallback className={structure.logoUrl ? 'hidden' : ''}>
                                <Building className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-row items-center gap-2 w-full">
                              <span className="font-medium">{structure.name}</span>
                              <span className="text-sm text-muted-foreground">
                                  ({structure.code})
                                </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {filteredStructures.length === 0 && watchedSuperStructureId && (
                      "Aucune structure disponible pour cette organisation"
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className={"col-span-full md:col-span-2 w-full"}>
                  <FormLabel className="flex items-center gap-1">
                    <span className="text-red-500">*</span>
                    Catégorie
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!watchedSuperStructureId}
                  >
                    <FormControl>
                      <SelectTrigger className="h-auto min-h-[44px] w-full">
                        <SelectValue placeholder={
                          !watchedSuperStructureId
                            ? "Sélectionnez d'abord une organisation"
                            : "Sélectionnez une catégorie"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-3 py-2">
                            <div className="h-6 w-6 flex items-center justify-center">
                              {category.icon && CATEGORY_ICONS[category.icon] ? (
                                React.createElement(CATEGORY_ICONS[category.icon].component, {
                                  className: "h-4 w-4",
                                  style: { color: category.color || undefined }
                                })
                              ) : (
                                <div
                                  className="h-4 w-4 rounded-full border"
                                  style={{ backgroundColor: category.color || '#9CA3AF' }}
                                />
                              )}
                            </div>
                            <div className="flex flex-row items-center gap-2 w-full">
                              <span className="font-medium">{category.name}</span>
                              <span className="text-sm text-muted-foreground">
                                  ({category.code})
                                </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {filteredCategories.length === 0 && watchedSuperStructureId && (
                      "Aucune catégorie disponible pour cette organisation"
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Nom */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <span className="text-red-500">*</span>
                  Nom
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      watchedServiceNature === ServiceNature.PRODUCT
                        ? "Ex: Carte SIM Orange 1000"
                        : watchedServiceNature === ServiceNature.INTERNAL_SERVICE
                        ? "Ex: Patente Commerce"
                        : "Ex: Paiement Facture SONABEL"
                    }
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Nom qui sera affiché aux utilisateurs
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Code (optionnel) */}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code (optionnel)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Sera généré automatiquement si vide"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Code unique pour identifier le {watchedServiceNature === ServiceNature.PRODUCT ? "produit" : "service"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      watchedServiceNature === ServiceNature.PRODUCT
                        ? "Décrivez le produit, ses caractéristiques..."
                        : watchedServiceNature === ServiceNature.INTERNAL_SERVICE
                        ? "Décrivez le service, les conditions d'application..."
                        : "Décrivez le service, ce qu'il permet de faire..."
                    }
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Description détaillée pour informer les utilisateurs
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}