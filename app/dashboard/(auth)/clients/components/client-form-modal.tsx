"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormModal } from "@/components/ui/modal/FormModal";
import { FormSection } from "@/components/ui/modal/FormSection";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useCreateClient, useUpdateClient } from "@/data/clients";
import { useSuperStructures, useStructures } from "@/data/organization";
import { 
  User, 
  Building2, 
  Phone, 
  Settings2, 
  CreditCard,
  FileText,
  Globe
} from "lucide-react";
import type { CreateClientRequest, UpdateClientRequest, OrganizationType, Client } from "@/types/clients";
import { clientFormSchema, ClientFormValues, defaultValues } from "./client-form-schema";
import { cn } from "@/lib/utils";

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  mode: "create" | "edit";
}

// Helper component for form fields
const FormFieldWrapper: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("space-y-2", className)}>
    {children}
  </div>
);

export function ClientFormModal({
  isOpen,
  onClose,
  client,
  mode
}: ClientFormModalProps) {
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  
  // States for organization selection
  const [selectedOrgType, setSelectedOrgType] = useState<OrganizationType | undefined>();
  const [selectedSuperStructureId, setSelectedSuperStructureId] = useState<string | undefined>();
  
  // Load organizations
  const { data: superStructures, isLoading: loadingSuperStructures } = useSuperStructures({ 
    page: 0, 
    size: 1000 
  });
  
  const { data: structures, isLoading: loadingStructures } = useStructures({
    page: 0,
    size: 1000,
    superStructureId: selectedSuperStructureId
  });
  
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: defaultValues,
  });

  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting },
    reset,
    watch,
    setValue
  } = form;

  // Watch client type for conditional fields
  const clientType = watch("type");
  const organizationType = watch("organizationType");

  // Update selected org type when form value changes
  useEffect(() => {
    setSelectedOrgType(organizationType);
  }, [organizationType]);

  // Load client data in edit mode
  useEffect(() => {
    if (mode === "edit" && client) {
      // Parse metadata if it exists
      let parsedMetadata: any = {};
      if (client.metadata) {
        try {
          parsedMetadata = typeof client.metadata === 'string' 
            ? JSON.parse(client.metadata) 
            : client.metadata;
        } catch (e) {
          parsedMetadata = client.metadata;
        }
      }

      const formData = {
        type: client.type || "INDIVIDUAL",
        firstName: client.firstName || "",
        lastName: client.lastName || "",
        email: client.email || "",
        phone: client.phone || "",
        // Check if these fields exist in the client object or metadata
        alternatePhone: (client as any).alternatePhone || parsedMetadata.alternatePhone || "",
        dateOfBirth: (client as any).dateOfBirth || parsedMetadata.dateOfBirth || "",
        gender: (client as any).gender || parsedMetadata.gender || undefined,
        maritalStatus: (client as any).maritalStatus || parsedMetadata.maritalStatus || undefined,
        nationality: (client as any).nationality || parsedMetadata.nationality || "",
        idType: (client as any).idType || parsedMetadata.idType || undefined,
        idNumber: (client as any).idNumber || parsedMetadata.idNumber || "",
        idExpiryDate: (client as any).idExpiryDate || parsedMetadata.idExpiryDate || "",
        address: client.address || "",
        city: client.city || "",
        country: client.country || "Burkina Faso",
        postalCode: client.postalCode || "",
        taxId: client.taxId || "",
        organizationId: client.organizationId || "",
        organizationType: client.organizationType || undefined,
        preferredLanguage: (client as any).preferredLanguage || parsedMetadata.preferredLanguage || "fr",
        acceptMarketing: (client as any).acceptMarketing || parsedMetadata.acceptMarketing || false,
        acceptSms: (client as any).acceptSms || parsedMetadata.acceptSms || false,
        enrollInLoyalty: false,
        notes: (client as any).notes || parsedMetadata.notes || "",
        metadata: client.metadata ? 
          (typeof client.metadata === 'string' ? client.metadata : JSON.stringify(client.metadata, null, 2)) 
          : "",
      };

      reset(formData);

      console.log("parsedMetadata =>", parsedMetadata)
      
      // Set organization states for cascading dropdowns
      if (client.organizationType === "SUPER_STRUCTURE") {
        setSelectedOrgType("SUPER_STRUCTURE");
        setSelectedSuperStructureId(client.organizationId);
      } else if (client.organizationType === "STRUCTURE") {
        setSelectedOrgType("STRUCTURE");
        // For structure, we need to find its parent super structure
        // This might require an additional API call or the parent ID should be in the response
        if (parsedMetadata.superStructureId) {
          setSelectedSuperStructureId(parsedMetadata.superStructureId);
        }
      }
    } else if (mode === "create") {
      reset(defaultValues);
    }
  }, [client, mode, reset]);

  const onSubmit = async (values: ClientFormValues) => {
    try {
      // Parse metadata string to object if needed
      let metadataObj: any = {};
      if (values.metadata) {
        try {
          metadataObj = JSON.parse(values.metadata);
        } catch (e) {
          // If parsing fails, keep it as empty object
          console.error('Failed to parse metadata:', e);
        }
      }

      // Store additional fields in metadata that are not part of the API
      const extendedMetadata = {
        ...metadataObj,
        alternatePhone: values.alternatePhone || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: values.gender || undefined,
        maritalStatus: values.maritalStatus || undefined,
        nationality: values.nationality || undefined,
        idType: values.idType || undefined,
        idNumber: values.idNumber || undefined,
        idExpiryDate: values.idExpiryDate || undefined,
        preferredLanguage: values.preferredLanguage || undefined,
        acceptMarketing: values.acceptMarketing || undefined,
        acceptSms: values.acceptSms || undefined,
        notes: values.notes || undefined,
      };

      // Remove empty/undefined values from metadata
      Object.keys(extendedMetadata).forEach(key => {
        if (extendedMetadata[key] === undefined || extendedMetadata[key] === '' || extendedMetadata[key] === null) {
          delete extendedMetadata[key];
        }
      });

      const baseData = {
        type: values.type,
        firstName: values.firstName || undefined,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        address: values.address || undefined,
        city: values.city || undefined,
        country: values.country || undefined,
        postalCode: values.postalCode || undefined,
        taxId: values.taxId || undefined,
        organizationId: values.organizationId || undefined,
        organizationType: values.organizationType || undefined,
        metadata: Object.keys(extendedMetadata).length > 0 ? extendedMetadata : undefined,
      };

      console.log("baseData =>", baseData)

      // Remove undefined fields from the base data
      const cleanData = Object.fromEntries(
        Object.entries(baseData).filter(([_, value]) => value !== undefined && value !== '')
      );

      if (mode === "create") {
        await createMutation.mutateAsync(cleanData as CreateClientRequest);
        toast.success("Client créé avec succès");
      } else if (client?.id) {
        // For update, we don't need to send the type field
        const { type, ...updateData } = cleanData;
        await updateMutation.mutateAsync({ id: client.id, data: updateData as UpdateClientRequest });
        toast.success("Client modifié avec succès");
      }
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Une erreur est survenue");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <User className="h-5 w-5 text-primary" />
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Nouveau client" : "Modifier le client"}
      titleIcon={titleIcon}
      subtitle={
        mode === "create"
          ? "Créez un nouveau client dans le système"
          : `Modification du client ${client?.firstName || ""} ${client?.lastName || ""}`
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
            description="Identité et type de client"
            icon={User}
          >
            <div className="space-y-5">
              {/* Client Type */}
              <FormField
                control={control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Type de client *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INDIVIDUAL">Particulier</SelectItem>
                          <SelectItem value="COMPANY">Entreprise</SelectItem>
                          <SelectItem value="GOVERNMENT">Gouvernement</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <FormField
                  control={control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          {clientType === "COMPANY" ? "Raison sociale" : "Nom"} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={clientType === "COMPANY" ? "Entreprise SARL" : "OUEDRAOGO"}
                            className="h-10 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />

                {clientType === "INDIVIDUAL" && (
                  <FormField
                    control={control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldWrapper>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Prénom *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Jean"
                              className="h-10 w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormFieldWrapper>
                      </FormItem>
                    )}
                  />
                )}

                {clientType === "COMPANY" && (
                  <FormField
                    control={control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldWrapper>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Numéro fiscal (IFU) *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="00000000A"
                              className="h-10 w-full font-mono"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormFieldWrapper>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                <FormField
                  control={control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          {clientType === "COMPANY" ? "Date de création" : "Date de naissance"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            className="h-10 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />

                {clientType === "INDIVIDUAL" && (
                  <>
                    <FormField
                      control={control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormFieldWrapper>
                            <FormLabel className="text-sm font-medium text-foreground">
                              Genre
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10 w-full">
                                  <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MALE">Homme</SelectItem>
                                <SelectItem value="FEMALE">Femme</SelectItem>
                                <SelectItem value="OTHER">Autre</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormFieldWrapper>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormFieldWrapper>
                            <FormLabel className="text-sm font-medium text-foreground">
                              État civil
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10 w-full">
                                  <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="SINGLE">Célibataire</SelectItem>
                                <SelectItem value="MARRIED">Marié(e)</SelectItem>
                                <SelectItem value="DIVORCED">Divorcé(e)</SelectItem>
                                <SelectItem value="WIDOWED">Veuf/Veuve</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormFieldWrapper>
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Nationalité
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Burkinabè"
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

          {/* Identification Section (for individuals) */}
          {clientType === "INDIVIDUAL" && (
            <>
              <FormSection
                title="Pièce d'identité"
                description="Documents d'identification officiels"
                icon={CreditCard}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                  <FormField
                    control={control}
                    name="idType"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldWrapper>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Type de pièce
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Sélectionner" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CNIB">CNIB</SelectItem>
                              <SelectItem value="PASSPORT">Passeport</SelectItem>
                              <SelectItem value="DRIVER_LICENSE">Permis de conduire</SelectItem>
                              <SelectItem value="OTHER">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormFieldWrapper>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldWrapper>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Numéro de pièce
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="B1234567"
                              className="h-10 w-full font-mono"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormFieldWrapper>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="idExpiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldWrapper>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Date d'expiration
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
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
            </>
          )}

          {/* Contact Information Section */}
          <FormSection
            title="Coordonnées"
            description="Informations de contact et adresse"
            icon={Phone}
          >
            <div className="space-y-5">
              {/* Contact fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Email *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="client@example.com"
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
                          Téléphone principal *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="+226 70 12 34 56"
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
                  name="alternatePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Téléphone secondaire
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="+226 76 12 34 56"
                            className="h-10 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />
              </div>

              {/* Address fields */}
              <div className="space-y-5">
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
                            placeholder="Quartier, Secteur, Rue"
                            className="h-10 w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                  <FormField
                    control={control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldWrapper>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Ville
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ouagadougou"
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
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldWrapper>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Pays
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Burkina Faso"
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
                              placeholder="00000"
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
            </div>
          </FormSection>

          <Separator />

          {/* Organization Section */}
          <FormSection
            title="Organisation"
            description="Affiliation à une structure"
            icon={Building2}
          >
            <div className="space-y-5">
              <FormField
                control={control}
                name="organizationType"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Type d'organisation
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedOrgType(value as OrganizationType);
                          // Reset organization ID when type changes
                          setValue("organizationId", "");
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Sélectionner le type d'organisation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SUPER_STRUCTURE">Super Structure</SelectItem>
                          <SelectItem value="STRUCTURE">Structure</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs text-muted-foreground">
                        Associez ce client à une organisation
                      </FormDescription>
                      <FormMessage />
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />

              {selectedOrgType === "SUPER_STRUCTURE" && (
                <FormField
                  control={control}
                  name="organizationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Super Structure
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedSuperStructureId(value);
                          }}
                          value={field.value}
                          disabled={loadingSuperStructures}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="Sélectionner une super structure" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {superStructures?.content?.map((sup: any) => (
                              <SelectItem key={sup.id} value={sup.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{sup.code}</span>
                                  <span className="text-muted-foreground">-</span>
                                  <span>{sup.name}</span>
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
              )}

              {selectedOrgType === "STRUCTURE" && (
                <div className="space-y-5">
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Super Structure
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          setSelectedSuperStructureId(value);
                          // Reset the structure selection when super structure changes
                          setValue("organizationId", "");
                        }}
                        value={selectedSuperStructureId}
                        disabled={loadingSuperStructures}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Sélectionner d'abord une super structure" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {superStructures?.content?.map((sup: any) => (
                            <SelectItem key={sup.id} value={sup.id}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{sup.code}</span>
                                <span className="text-muted-foreground">-</span>
                                <span>{sup.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs text-muted-foreground">
                        Sélectionnez d'abord la super structure parente
                      </FormDescription>
                    </FormFieldWrapper>
                  </FormItem>

                  <FormField
                    control={control}
                    name="organizationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormFieldWrapper>
                          <FormLabel className="text-sm font-medium text-foreground">
                            Structure
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!selectedSuperStructureId || loadingStructures}
                          >
                            <FormControl>
                              <SelectTrigger className="h-10 w-full">
                                <SelectValue
                                  placeholder={
                                    !selectedSuperStructureId
                                      ? "Sélectionnez d'abord une super structure"
                                      : "Sélectionner une structure"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {structures?.content?.map((str: any) => (
                                <SelectItem key={str.id} value={str.id}>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{str.code}</span>
                                    <span className="text-muted-foreground">-</span>
                                    <span>{str.name}</span>
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
              )}
            </div>
          </FormSection>

          <Separator />

          {/* Preferences Section */}
          <FormSection
            title="Préférences"
            description="Options de communication et programme de fidélité"
            icon={Settings2}
          >
            <div className="space-y-5">
              <FormField
                control={control}
                name="preferredLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Langue préférée
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Sélectionner une langue" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fr">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>Français</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="en">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>Anglais</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="moore">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>Mooré</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="dioula">
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>Dioula</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={control}
                  name="acceptMarketing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30 dark:bg-muted/10">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          Accepter les communications marketing
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Le client recevra des offres et promotions par email
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="acceptSms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30 dark:bg-muted/10">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          Accepter les SMS
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Le client recevra des notifications par SMS
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {mode === "create" && (
                  <FormField
                    control={control}
                    name="enrollInLoyalty"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30 dark:bg-muted/10">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium">
                            Inscrire au programme de fidélité
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Le client sera automatiquement inscrit au programme de fidélité
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
          </FormSection>

          <Separator />

          {/* Notes Section */}
          <FormSection
            title="Notes et métadonnées"
            description="Informations supplémentaires"
            icon={FileText}
          >
            <div className="space-y-5">
              <FormField
                control={control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Notes
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Notes additionnelles sur le client..."
                          className="resize-none min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Informations supplémentaires ou remarques
                      </FormDescription>
                      <FormMessage />
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="metadata"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Métadonnées (JSON)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder='{"key": "value"}'
                          className="resize-none font-mono text-sm min-h-[80px]"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Données supplémentaires au format JSON
                      </FormDescription>
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
