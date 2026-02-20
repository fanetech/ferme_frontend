"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormModal } from '@/components/ui/modal/FormModal';
import { FormSection } from '@/components/ui/modal/FormSection';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { OrganizationTypeSelect } from '@/components/ui/organization-type-select';
import { toast } from 'sonner';
import { 
  Building2, 
  Mail, 
  MapPin, 
  Palette, 
  Upload,
  X,
  Trash2,
  Info,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FCFA_COUNTRIES, getCitiesByCountryCode } from '@/lib/constants/countries-cities';
import { useFileUpload } from '@/hooks/use-file-upload';
import { 
  superStructureFormSchema, 
  type SuperStructureFormValues,
  defaultSuperStructureValues,
  transformServerDataToFormValues
} from './super-structure-form-schema';
import { 
  useCreateSuperStructure, 
  useUpdateSuperStructure,
  useSuperStructure 
} from '@/data/organization';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { SuperStructure } from '@/types/organization';

interface SuperStructureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  superStructure: SuperStructure | null;
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

export function SuperStructureFormModal({
  isOpen,
  onClose,
  superStructure,
  mode
}: SuperStructureFormModalProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState("BF");
  const [logoAction, setLogoAction] = useState<"keep" | "modify" | "remove">("keep");
  const createMutation = useCreateSuperStructure();
  const updateMutation = useUpdateSuperStructure();

  // Form
  const form = useForm<SuperStructureFormValues>({
    resolver: zodResolver(superStructureFormSchema),
    defaultValues: defaultSuperStructureValues,
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
    setValue,
    watch,
  } = form;

  // File upload hook
  const [
    { files, isDragging, errors: fileErrors },
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

  // Watch country changes
  const watchedCountry = watch("country");
  useEffect(() => {
    if (watchedCountry) {
      setSelectedCountry(watchedCountry);
    }
  }, [watchedCountry]);

  // Load data in edit mode
  useEffect(() => {
    if (mode === "edit" && superStructure) {
      const formValues = transformServerDataToFormValues(superStructure);
      reset(formValues);
      
      // If logo exists, create a preview with logoUrl
      if (superStructure.logoUrl) {
        setLogoPreview(superStructure.logoUrl);
      }
      
      // Reset logo action in edit mode
      setLogoAction("keep");
    } else if (mode === "create") {
      reset(defaultSuperStructureValues);
      setLogoPreview(null);
      setLogoAction("keep");
    }
  }, [mode, superStructure, reset]);

  // Update form when file is added
  useEffect(() => {
    if (files.length > 0 && files[0].file instanceof File) {
      setValue('logo', files[0].file);
    } else {
      setValue('logo', undefined);
    }
  }, [files, setValue]);

  const onSubmit = async (values: SuperStructureFormValues) => {
    try {
      // Create FormData
      const formData = new FormData();
      
      // Add all fields except logo
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'logo') {
          // For required fields (code, name), always send them
          if (key === 'code' || key === 'name') {
            formData.append(key, String(value || ''));
          }
          // For other fields, only send them if they have a value
          else if (value !== undefined && value !== null && value !== '') {
            formData.append(key, String(value));
          }
        }
      });

      // Handle logo based on action
      if (mode === "create") {
        // Create mode: add logo if present
        if (values.logo) {
          formData.append('logo', values.logo);
        }
      } else {
        // Edit mode: handle the 3 possible actions
        if (logoAction === "modify" && values.logo) {
          // Modify: send the new file
          formData.append('logo', values.logo);
        } else if (logoAction === "remove") {
          // Remove: use the logoDelete parameter
          formData.append('logoDelete', 'true');
        } else {
          if (values.logo) {
            formData.append('logo', values.logo);
          }
        }
      }

      // Create or update
      if (mode === "create") {
        await createMutation.mutateAsync(formData);
        toast.success("Super structure créée avec succès");
      } else {
        await updateMutation.mutateAsync({
          id: superStructure?.id!, 
          data: formData 
        });
        toast.success("Super structure mise à jour avec succès");
      }

      // Reset form after success
      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Erreur lors de la soumission:", error);
      const errorMessage = error?.response?.data?.message || "Une erreur est survenue";
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    reset();
    setLogoPreview(null);
    setLogoAction("keep");
    // Reset fileUpload files
    files.forEach(file => removeFile(file.id));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <Building2 className="h-5 w-5 text-primary" />
    </div>
  );

  // No loading state needed since we're using the superStructure prop directly

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Nouvelle super structure" : "Modifier la super structure"}
      titleIcon={titleIcon}
      subtitle={
        mode === "create" 
          ? "Configurez une nouvelle super structure pour votre organisation" 
          : `Modification de ${superStructure?.name || ""}`
      }
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={mode === "create" ? "Créer" : "Enregistrer"}
      isSubmitting={isLoading}
      isDirty={isDirty}
      footerNote={
        mode === "create" 
          ? "Les champs marqués d'un * sont obligatoires"
          : "Les modifications seront appliquées immédiatement"
      }
    >
      <Form {...form}>
        <div className="space-y-8">
          {/* General Information Section */}
          <FormSection
            title="Informations générales" 
            description="Identifiez et configurez la super structure"
            icon={Building2}
          >
            <div className="space-y-5">
              {/* Organization Type */}
              <FormField
                control={control}
                name="organizationType"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Type d'organisation *
                      </FormLabel>
                      <FormControl>
                        <OrganizationTypeSelect
                          value={field.value || ""}
                          onValueChange={(value) => {
                            field.onChange(value || "OTHER");
                          }}
                          placeholder="Sélectionner un type d'organisation"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />

              {/* Code, Name, Status */}
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
                            placeholder="SUPER-01"
                            className="h-10 w-full uppercase font-mono"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
                          Identifiant unique (majuscules, chiffres, tirets)
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
                            placeholder="Nom de la super structure"
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

              {/* Description */}
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
                          placeholder="Description de la super structure"
                          className="min-h-[100px] resize-none"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Maximum 1000 caractères
                      </FormDescription>
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
                          placeholder="Nom et prénom"
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
            description="Adresse et emplacement géographique"
            icon={MapPin}
          >
            <div className="space-y-5">
              {/* Country and City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
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
                            setValue('city', '');
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="Sélectionner un pays">
                                {field.value && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{FCFA_COUNTRIES.find(c => c.code === field.value)?.flag}</span>
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
              </div>

              {/* Address and Postal Code */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                <FormField
                  control={control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Adresse
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Rue, quartier, repères..."
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
            </div>
          </FormSection>

          <Separator />

          {/* Branding Section */}
          <FormSection
            title="Personnalisation visuelle" 
            description="Couleurs et thème de l'interface"
            icon={Palette}
          >
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
                          className="flex-1 h-10 font-mono uppercase"
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
                          className="flex-1 h-10 font-mono uppercase"
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
                        Couleur d'en-tête
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
                          className="flex-1 h-10 font-mono uppercase"
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
                        Couleur de pied de page
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
                          className="flex-1 h-10 font-mono uppercase"
                        />
                      </div>
                      <FormMessage />
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          <Separator />

          {/* Logo Section */}
          <FormSection
            title="Logo de l'organisation" 
            description="Image de marque de votre super structure"
            icon={Info}
          >
            <FormField
              name="logo"
              control={control}
              render={({ field }) => (
                <div className="space-y-4">
                  {/* Edit mode: Display existing logo */}
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
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden size-full rounded-[inherit] flex items-center justify-center bg-muted">
                              <Building2 className="h-8 w-8 text-muted-foreground" />
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
                                setValue('logo', undefined);
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
                            setValue('logo', undefined);
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
                              setValue('logo', undefined);
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
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
                                  setValue('logo', undefined);
                                }}
                              >
                                <X className="-ms-0.5 size-3.5" aria-hidden="true" />
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

                  {fileErrors.length > 0 && (
                    <div className="text-destructive flex items-center gap-1 text-xs" role="alert">
                      <AlertCircle className="size-3 shrink-0" />
                      <span>{fileErrors[0]}</span>
                    </div>
                  )}
                  <FormMessage />
                </div>
              )}
            />
          </FormSection>
        </div>
      </Form>
    </FormModal>
  );
}
