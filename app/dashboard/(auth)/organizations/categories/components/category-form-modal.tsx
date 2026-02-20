"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Tag,
  Palette,
  Search,
  Grid3x3,
  Hash
} from "lucide-react";
import { FormModal } from "@/components/ui/modal/FormModal";
import { FormSection } from "@/components/ui/modal/FormSection";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  categoryFormSchema,
  type CategoryFormValues,
  defaultCategoryValues,
  transformServerDataToFormValues,
  transformFormValuesToServerData,
  CATEGORY_COLOR_PALETTE
} from "./category-form-schema";
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/data/organization";
import {
  CATEGORY_ICONS,
  getCategoryIcon,
  searchIcons,
  POPULAR_CATEGORY_ICONS
} from "@/lib/constants/category-icons";
import { SuperStructureSelect } from "../../structures/components/super-structure-select";
import type { Category } from "@/types/organization";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  mode: "create" | "edit";
}

export function CategoryFormModal({
  isOpen,
  onClose,
  category,
  mode
}: CategoryFormModalProps) {
  const [iconSearch, setIconSearch] = useState("");
  const [selectedIconCategory, setSelectedIconCategory] = useState<string>("all");

  // Mutations
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  // Form
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: defaultCategoryValues
  });

  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting },
    reset,
    watch
  } = form;

  // Charger les données en mode édition
  useEffect(() => {
    if (mode === "edit" && category) {
      const formValues = transformServerDataToFormValues(category);
      reset(formValues);
    } else if (mode === "create") {
      reset(defaultCategoryValues);
    }
  }, [mode, category, reset]);

  // Filtrage des icônes
  const filteredIcons = (() => {
    let icons = Object.keys(CATEGORY_ICONS);
    
    // Filtrer par catégorie
    if (selectedIconCategory !== "all") {
      icons = icons.filter(iconCode => 
        CATEGORY_ICONS[iconCode].category === selectedIconCategory
      );
    }
    
    // Filtrer par recherche
    if (iconSearch.trim() !== "") {
      const searchResults = searchIcons(iconSearch);
      icons = icons.filter(iconCode => searchResults.includes(iconCode));
    }
    
    return icons.filter(iconCode => iconCode !== "default");
  })();

  // Soumission du formulaire
  const onSubmit = async (values: CategoryFormValues) => {
    try {
      const serverData = transformFormValuesToServerData(values);

      if (mode === "create") {
        await createMutation.mutateAsync(serverData);
        toast.success("Catégorie créée avec succès");
      } else if (category) {
        await updateMutation.mutateAsync({
          id: category.id,
          data: serverData
        });
        toast.success("Catégorie mise à jour avec succès");
      }

      resetForm();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Une erreur est survenue";
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    reset();
    setIconSearch("");
    setSelectedIconCategory("all");
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <Tag className="h-5 w-5 text-primary" />
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Nouvelle catégorie" : "Modifier la catégorie"}
      titleIcon={titleIcon}
      subtitle={
        mode === "create" 
          ? "Créez une nouvelle catégorie pour organiser vos services" 
          : `Modification de la catégorie ${category?.name}`
      }
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={mode === "create" ? "Créer" : "Enregistrer"}
      isSubmitting={isLoading}
      isDirty={isDirty}
      size="xl"
      footerNote={
        mode === "create" 
          ? "Tous les champs marqués sont obligatoires"
          : "Les modifications seront appliquées immédiatement"
      }
    >
      <Form {...form}>
        <div className="space-y-8">
          {/* Section 1: Informations générales */}
          <FormSection
            title="Informations générales" 
            description="Identifiez et configurez la catégorie"
            icon={Tag}
          >
            <div className="space-y-5">
              {/* Super Structure */}
              <FormField
                control={control}
                name="superStructureId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Super Structure *</FormLabel>
                    <FormControl>
                      <SuperStructureSelect
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        placeholder="Sélectionner une super structure"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Code et Nom sur la même ligne */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="CATEGORY-01"
                          className="uppercase"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription>
                        Identifiant unique (lettres, chiffres, tirets)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nom de la catégorie" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Statut */}
              <FormField
                control={control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Actif</SelectItem>
                        <SelectItem value="INACTIVE">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Description de la catégorie"
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          <Separator />

          {/* Section 2: Apparence */}
          <FormSection
            title="Apparence" 
            description="Personnalisez l'apparence visuelle de la catégorie"
            icon={Palette}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sélection d'icône */}
              <div className="space-y-4">
                <FormField
                  control={control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icône</FormLabel>
                      <div className="space-y-4">
                        {/* Icône sélectionnée */}
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                          {(() => {
                            const selectedIcon = getCategoryIcon(field.value);
                            if (!selectedIcon || !selectedIcon.component) {
                              return (
                                <div className="text-muted-foreground">
                                  Aucune icône sélectionnée
                                </div>
                              );
                            }
                            const IconComponent = selectedIcon.component;
                            return (
                              <>
                                <div 
                                  className="p-2 rounded-md"
                                  style={{ backgroundColor: watch("color") || "#007bff" }}
                                >
                                  <IconComponent className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <div className="font-medium">{selectedIcon.label}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Code: {field.value || "building"}
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        {/* Recherche et filtres */}
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Rechercher une icône..."
                              value={iconSearch}
                              onChange={(e) => setIconSearch(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          
                          <Tabs value={selectedIconCategory} onValueChange={setSelectedIconCategory}>
                            <TabsList className="grid grid-cols-4 w-full">
                              <TabsTrigger value="all" className="text-xs">Tout</TabsTrigger>
                              <TabsTrigger value="business" className="text-xs">Business</TabsTrigger>
                              <TabsTrigger value="finance" className="text-xs">Finance</TabsTrigger>
                              <TabsTrigger value="technology" className="text-xs">Tech</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>

                        {/* Icônes populaires */}
                        {iconSearch === "" && selectedIconCategory === "all" && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Icônes populaires</Label>
                            <div className="grid grid-cols-6 gap-2">
                              {POPULAR_CATEGORY_ICONS.map((iconCode) => {
                                const icon = CATEGORY_ICONS[iconCode];
                                if (!icon || !icon.component) {
                                  return null;
                                }
                                const IconComponent = icon.component;
                                const isSelected = field.value === iconCode;
                                
                                return (
                                  <Button
                                    key={iconCode}
                                    type="button"
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    className="p-2 h-auto"
                                    onClick={() => field.onChange(iconCode)}
                                    title={icon.label}
                                  >
                                    <IconComponent className="h-4 w-4" />
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Grille d'icônes */}
                        <ScrollArea className="h-48 border rounded-md p-2">
                          <div className="grid grid-cols-8 gap-1">
                            {filteredIcons.map((iconCode) => {
                              const icon = CATEGORY_ICONS[iconCode];
                              if (!icon || !icon.component) {
                                return null;
                              }
                              const IconComponent = icon.component;
                              const isSelected = field.value === iconCode;
                              
                              return (
                                <Button
                                  key={iconCode}
                                  type="button"
                                  variant={isSelected ? "default" : "ghost"}
                                  size="sm"
                                  className="p-2 h-auto"
                                  onClick={() => field.onChange(iconCode)}
                                  title={icon.label}
                                >
                                  <IconComponent className="h-4 w-4" />
                                </Button>
                              );
                            })}
                          </div>
                          {filteredIcons.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                              Aucune icône trouvée pour "{iconSearch}"
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Couleur et ordre */}
              <div className="space-y-4">
                <FormField
                  control={control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Couleur</FormLabel>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              {...field}
                              type="color"
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                          </FormControl>
                          <Input
                            value={field.value || "#007bff"}
                            onChange={(e) => field.onChange(e.target.value)}
                            placeholder="#007bff"
                            className="flex-1"
                          />
                        </div>
                        
                        {/* Palette de couleurs prédéfinies */}
                        <div className="grid grid-cols-10 gap-2">
                          {CATEGORY_COLOR_PALETTE.map((color) => (
                            <Button
                              key={color}
                              type="button"
                              className="w-6 h-6 p-0 rounded-full border-2"
                              style={{ 
                                backgroundColor: color,
                                borderColor: field.value === color ? "#000" : "transparent"
                              }}
                              onClick={() => field.onChange(color)}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Grid3x3 className="h-4 w-4" />
                        Ordre d'affichage
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          max="999"
                          placeholder="1"
                          onChange={(e) => field.onChange(Number(e.target.value) || "")}
                        />
                      </FormControl>
                      <FormDescription>
                        Ordre d'affichage dans les listes (0-999)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </FormSection>

          <Separator />

          {/* Section 3: Métadonnées (optionnel) */}
          <FormSection
            title="Métadonnées" 
            description="Configuration avancée (optionnelle)"
            icon={Hash}
          >
            <FormField
              control={control}
              name="metadata"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Métadonnées JSON</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='{"key": "value", "configuration": "custom"}'
                      className="min-h-[80px] font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Données JSON optionnelles pour configuration avancée
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>
        </div>
      </Form>
    </FormModal>
  );
}