"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormModal } from '@/components/ui/modal/FormModal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Building, Mail, MapPin, Palette, Upload, Trash2, AlertCircle } from 'lucide-react';
import { useCreateStructure, useUpdateStructure, useStructure } from '@/data/organization';
import type { Structure } from '@/types/organization';
import { defaultStructureValues, structureFormSchema, StructureFormValues, transformServerDataToFormValues } from './structure-form-schema';
import { FormSection } from '@/components/ui/modal/FormSection';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FCFA_COUNTRIES, getCitiesByCountryCode } from '@/lib/constants/countries-cities';
import { SuperStructureSelect } from './super-structure-select';
import { useFileUpload } from '@/hooks/use-file-upload';

interface StructureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  structure?: Structure | null;
  mode: 'create' | 'edit';
}

// Status configuration with colors and labels
const statusConfig = {
  ACTIVE: { 
    label: "Actif", 
    color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" 
  },
  INACTIVE: { 
    label: "Inactif", 
    color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/20 dark:text-gray-400 dark:border-gray-700" 
  },
};

// Component helper - moved outside component
const FormFieldWrapper: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("space-y-2", className)}>
    {children}
  </div>
);

export function StructureFormModal({
  isOpen,
  onClose,
  structure,
  mode,
}: StructureFormModalProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState("BF");
  const [logoAction, setLogoAction] = useState<"keep" | "modify" | "remove">("keep");

  // Queries and mutations
  const createMutation = useCreateStructure();
  const updateMutation = useUpdateStructure();

  // File upload hook
  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps
    }
  ] = useFileUpload({
    accept: "image/png,image/jpeg,image/jpg,image/svg+xml",
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: false,
    maxFiles: 1
  });

  // Initialize form
  const form = useForm<StructureFormValues>({
    resolver: zodResolver(structureFormSchema),
    defaultValues: defaultStructureValues,
  });

  const {
    handleSubmit,
    formState: { errors: formErrors, isDirty, isSubmitting },
    reset,
    setValue,
    watch,
    control
  } = form;

  // Watch country changes
  const watchedCountry = watch("country");
  useEffect(() => {
    if (watchedCountry) {
      setSelectedCountry(watchedCountry);
    }
  }, [watchedCountry]);

  // Reset form when structure changes or modal opens
  useEffect(() => {
    if (structure && mode === 'edit') {
      const formValues = transformServerDataToFormValues(structure);
      reset(formValues);

      if (formValues.country) {
        setSelectedCountry(formValues.country);
      }

      if (structure.logoUrl) {
        setLogoPreview(structure.logoUrl);
      } else {
        setLogoPreview(null);
      }

      setLogoAction("keep");
    } else if (mode === 'create') {
      reset(defaultStructureValues);
      setLogoPreview(null);
      setLogoAction("keep");
      setSelectedCountry("BF");
    }
  }, [structure, mode, reset]);

  // Update form when file is added
  useEffect(() => {
    if (files.length > 0 && files[0].file instanceof File) {
      setValue("logo", files[0].file);
    } else {
      setValue("logo", undefined);
    }
  }, [files, setValue]);

  const onSubmit = async (values: StructureFormValues) => {
    try {
      // Create FormData
      const formData = new FormData();

      // Add all fields except logo
      Object.entries(values).forEach(([key, value]) => {
        if (key !== "logo") {
          // For required fields, always send them
          if (key === "superStructureId" || key === "code" || key === "name") {
            formData.append(key, String(value || ""));
          }
          // For other fields, only send if they have a value
          else if (value !== undefined && value !== null && value !== "") {
            // Clean GPS coordinates by removing spaces
            if (key === "gpsCoordinates") {
              const cleanedCoords = String(value).replace(/\s/g, "");
              formData.append(key, cleanedCoords);
            } else {
              formData.append(key, String(value));
            }
          }
        }
      });

      // Handle logo based on action
      if (mode === "create") {
        // Create mode: add logo if present
        if (values.logo) {
          formData.append("logo", values.logo);
        }
      } else {
        // Edit mode: handle 3 possible actions
        if (logoAction === "modify" && values.logo) {
          // Modify: send new file
          formData.append("logo", values.logo);
        } else if (logoAction === "remove") {
          // Remove: use logoDelete parameter
          formData.append("logoDelete", "true");
        } else {
          if (values.logo) {
            formData.append("logo", values.logo);
          }
        }
      }

      // Create or update
      if (mode === "create") {
        await createMutation.mutateAsync(formData);
        toast.success("Structure créée avec succès");
      } else {
        await updateMutation.mutateAsync({
          id: structure?.id!,
          data: formData
        });
        toast.success("Structure mise à jour avec succès");
      }

      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Une erreur est survenue");
    }
  };

  const resetForm = () => {
    reset();
    setLogoPreview(null);
    setLogoAction("keep");
    files.forEach(file => removeFile(file.id));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <Building className="h-5 w-5 text-primary" />
    </div>
  );
  
  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Nouvelle structure" : "Modifier la structure"}
      titleIcon={titleIcon}
      subtitle={
        mode === "create" 
          ? "Créez une nouvelle structure organisationnelle" 
          : `Modification de la structure ${structure?.name || ""}`
      }
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={mode === "create" ? "Créer" : "Enregistrer"}
      isSubmitting={isLoading}
      isDirty={isDirty}
      footerNote={
        mode === "create" 
          ? "Tous les champs marqués (*) sont obligatoires"
          : "Les modifications seront appliquées immédiatement"
      }
    >
      <Form {...form}>
        <div className="space-y-8">
          {/* General Information Section */}
          <FormSection
            title="Informations générales" 
            description="Identifiez et configurez la structure"
            icon={Building}
          >
            <div className="space-y-5">
              {/* Super Structure field - full width */}
              <FormField
                control={control}
                name="superStructureId"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Super Structure *
                      </FormLabel>
                      <FormControl>
                        <SuperStructureSelect
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          placeholder="Sélectionner une super structure"
                          className="w-full h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />

              {/* Code, Name, Status row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                <FormField
                  control={control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Code *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="STRUCT-01"
                            className="h-10 w-full font-mono uppercase"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
                          Identifiant unique
                        </FormDescription>
                        <FormMessage />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Nom *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Nom de la structure"
                            className="h-10 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Statut
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="Sélectionner un statut" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([value, config]) => (
                              <SelectItem key={value} value={value}>
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "px-2.5 py-1 rounded-full text-xs font-medium border",
                                    config.color
                                  )}>
                                    {config.label}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />
              </div>

              {/* Description - full width */}
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Description de la structure"
                          className="min-h-[100px] w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          <Separator />

          {/* Contact Information Section */}
          <FormSection 
            title="Informations de contact" 
            description="Coordonnées de la personne responsable"
            icon={Mail}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
              <FormField
                control={control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Nom du contact
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Nom et prénom du contact"
                          className="h-10 w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="contact@example.com"
                          className="h-10 w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Téléphone
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="+226 70 00 00 00"
                          className="h-10 w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          <Separator />

          {/* Location Section */}
          <FormSection 
            title="Localisation" 
            description="Adresse et coordonnées géographiques"
            icon={MapPin}
          >
            <div className="space-y-5">
              {/* Country, City, Address, Postal Code row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-5">
                <FormField
                  control={control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Pays
                        </FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedCountry(value);
                            // Reset city when country changes
                            setValue("city", "");
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="Sélectionner un pays">
                                {field.value && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">
                                      {FCFA_COUNTRIES.find(c => c.code === field.value)?.flag}
                                    </span>
                                    <span>{FCFA_COUNTRIES.find(c => c.code === field.value)?.name}</span>
                                  </div>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FCFA_COUNTRIES.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{country.flag}</span>
                                  <span>{country.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Ville
                        </FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value} 
                          disabled={!selectedCountry}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="Sélectionner une ville" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getCitiesByCountryCode(selectedCountry).map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Adresse
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Entrez l'adresse complète"
                            className="h-10 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Code postal
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="01 BP 1234"
                            className="h-10 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />
              </div>

              {/* GPS Coordinates - full width */}
              <FormField
                control={control}
                name="gpsCoordinates"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Coordonnées GPS
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="12.3686,-1.5275 (latitude,longitude)"
                          className="h-10 w-full font-mono"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Format: latitude,longitude (ex: 12.3686,-1.5275 pour Ouagadougou)
                      </FormDescription>
                      <FormMessage />
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          <Separator />

          {/* Branding Section */}
          <FormSection 
            title="Branding" 
            description="Personnalisation visuelle de la structure"
            icon={Palette}
          >
            <div className="space-y-5">
              {/* Colors grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <FormField
                  control={control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Couleur primaire
                        </FormLabel>
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
                            className="flex-1 h-10 font-mono"
                          />
                        </div>
                        <FormMessage />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="secondaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Couleur secondaire
                        </FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              {...field}
                              type="color"
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                          </FormControl>
                          <Input
                            value={field.value || "#6c757d"}
                            onChange={(e) => field.onChange(e.target.value)}
                            placeholder="#6c757d"
                            className="flex-1 h-10 font-mono"
                          />
                        </div>
                        <FormMessage />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="headerColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Couleur en-tête
                        </FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              {...field}
                              type="color"
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                          </FormControl>
                          <Input
                            value={field.value || "#ffffff"}
                            onChange={(e) => field.onChange(e.target.value)}
                            placeholder="#ffffff"
                            className="flex-1 h-10 font-mono"
                          />
                        </div>
                        <FormMessage />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="footerColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Couleur pied de page
                        </FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              {...field}
                              type="color"
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                          </FormControl>
                          <Input
                            value={field.value || "#f8f9fa"}
                            onChange={(e) => field.onChange(e.target.value)}
                            placeholder="#f8f9fa"
                            className="flex-1 h-10 font-mono"
                          />
                        </div>
                        <FormMessage />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />
              </div>

              {/* Logo upload */}
              <FormField
                name="logo"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Logo (optionnel)
                      </FormLabel>

                      {/* Edit mode: Show existing logo */}
                      {mode === "edit" && logoPreview && logoAction === "keep" && (
                        <div className="border rounded-xl p-4 bg-muted/20">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="relative aspect-square w-32 rounded-md border bg-background">
                                <img
                                  src={logoPreview}
                                  alt="Logo actuel"
                                  className="size-full rounded-[inherit] object-contain p-2"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                                  }}
                                />
                                <div className="hidden size-full rounded-[inherit] flex items-center justify-center bg-muted">
                                  <Building className="h-8 w-8 text-muted-foreground" />
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 space-y-3">
                              <div>
                                <h4 className="font-medium">Logo actuel</h4>
                                <p className="text-sm text-muted-foreground">
                                  Le logo sera conservé si vous ne faites aucune modification
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setLogoAction("modify")}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Modifier
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setLogoAction("remove");
                                    setValue("logo", undefined);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Edit mode: Remove action */}
                      {mode === "edit" && logoAction === "remove" && (
                        <div className="border border-destructive/50 rounded-xl p-4 bg-destructive/5">
                          <div className="flex items-center gap-3">
                            <Trash2 className="h-5 w-5 text-destructive flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-medium text-destructive">Logo marqué pour suppression</h4>
                              <p className="text-sm text-muted-foreground">
                                Le logo sera supprimé lors de la sauvegarde
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setLogoAction("keep");
                                setValue("logo", undefined);
                              }}
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Upload zone: Create mode OR edit mode with modify action OR edit mode without logo */}
                      {(mode === "create" || (mode === "edit" && logoAction === "modify") || (mode === "edit" && !logoPreview && logoAction === "keep")) && (
                        <div>
                          {mode === "edit" && logoAction === "modify" && (
                            <div className="mb-4 flex items-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setLogoAction("keep");
                                  files.forEach(file => removeFile(file.id));
                                  setValue("logo", undefined);
                                }}
                              >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Annuler la modification
                              </Button>
                            </div>
                          )}

                          <div
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            data-dragging={isDragging || undefined}
                            data-files={files.length > 0 || undefined}
                            className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
                          >
                            <input
                              {...getInputProps()}
                              className="sr-only"
                              aria-label="Upload logo file"
                            />
                            {files.length > 0 ? (
                              <div className="flex w-full flex-col gap-3">
                                <div className="flex items-center justify-between gap-2">
                                  <h3 className="truncate text-sm font-medium">
                                    {mode === "edit" ? "Nouveau logo" : "Logo chargé"}
                                  </h3>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      removeFile(files[0].id);
                                      setValue("logo", undefined);
                                    }}
                                  >
                                    <Trash2 className="-ms-0.5 size-3.5" aria-hidden="true" />
                                    Supprimer
                                  </Button>
                                </div>

                                <div className="flex justify-center">
                                  <div className="relative aspect-square w-48 rounded-md border">
                                    <img
                                      src={files[0].preview}
                                      alt={files[0].file.name}
                                      className="size-full rounded-[inherit] object-contain p-2"
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                                <div
                                  className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                                  aria-hidden="true"
                                >
                                  <Upload className="size-4 opacity-60" />
                                </div>
                                <p className="mb-1.5 text-sm font-medium">
                                  {mode === "edit" ? "Déposez le nouveau logo ici" : "Déposez votre logo ici"}
                                </p>
                                <p className="text-muted-foreground text-xs">PNG, JPG ou SVG (max. 2MB)</p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="mt-4"
                                  onClick={openFileDialog}
                                >
                                  <Upload className="-ms-1 opacity-60" aria-hidden="true" />
                                  {mode === "edit" ? "Sélectionner un nouveau logo" : "Sélectionner un logo"}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {errors.length > 0 && (
                        <div className="text-destructive flex items-center gap-1 text-xs" role="alert">
                          <AlertCircle className="size-3 shrink-0" />
                          <span>{errors[0]}</span>
                        </div>
                      )}
                      <FormMessage />
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />
            </div>
          </FormSection>
        </div>
      </Form>
    </FormModal>
  );
}