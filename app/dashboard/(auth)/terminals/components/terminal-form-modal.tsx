"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormModal } from '@/components/ui/modal/FormModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Smartphone, AlertCircle, Building2, Settings2, Info } from 'lucide-react';
import { useCreateTerminal, useUpdateTerminal } from '@/data/terminal';
import type { PaginatedResponse, Terminal } from '@/types';
import { defaultValues, terminalFormSchema, TerminalFormValues } from './terminal-form-schema';
import { FormSection } from '@/components/ui/modal/FormSection';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Structure, SuperStructure } from '@/types/organization';
import PermissionGate from '@/components/auth/permission-gate';
import { PERMISSIONS } from '@/lib/constants';

interface TerminalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  terminal?: Terminal | null;
  mode: 'create' | 'edit';
  structuresData?: PaginatedResponse<Structure>,
  superStructuresData?: PaginatedResponse<Structure>,
  isLoadingStructures: boolean
  isLoadingSuperStructures: boolean
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
  SUSPENDED: { 
    label: "Suspendu", 
    color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800" 
  },
  LOCKED: { 
    label: "Bloqué", 
    color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" 
  },
  PENDING: { 
    label: "En attente", 
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" 
  },
  EXPIRED: { 
    label: "Expiré", 
    color: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800" 
  },
};

// Component helpers - moved outside component
const FormFieldWrapper: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => (
  <div className={cn("space-y-2", className)}>
    {children}
  </div>
);

// Conditional wrapper for permission-based rendering
const ConditionalWrapper: React.FC<{
  condition: boolean;
  wrapper: (children: React.ReactElement) => React.ReactElement;
  children: React.ReactElement;
}> = ({ condition, wrapper, children }) => {
  return condition ? wrapper(children) : children;
};

export const TerminalFormModal: React.FC<TerminalFormModalProps> = ({
  isOpen,
  onClose,
  terminal,
  mode,
  structuresData,
  superStructuresData,
  isLoadingStructures,
  isLoadingSuperStructures
}) => {
  const createMutation = useCreateTerminal();
  const updateMutation = useUpdateTerminal();

  // Move useForm inside the component
  const form = useForm<TerminalFormValues>({
    resolver: zodResolver(terminalFormSchema),
    defaultValues: defaultValues,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
    setValue,
    watch,
    control
  } = form;

  // Watch form values for dependencies
  const selectedSuperStructureId = watch('superStructureId');
  const selectedStructureId = watch('structureId');

  // Reset form when terminal changes or modal opens
  useEffect(() => {
    if (terminal && mode === 'edit') {
      reset({
        structureId: terminal.structureId,
        superStructureId: terminal.superStructureId,
        serialNumber: terminal.serialNumber,
        activationCode: terminal.activationCode || '',
        model: terminal.model,
        manufacturer: terminal.manufacturer,
        osVersion: terminal.osVersion,
        appVersion: terminal.appVersion,
        status: terminal.status,
        expirationDate: terminal.expirationDate ? terminal.expirationDate.split('T')[0] : '',
        metadata: terminal.metadata || defaultValues.metadata,
      });
    } else if (mode === 'create') {
      reset(defaultValues);
    }
  }, [terminal, mode, reset]);

  // Filter structures based on selected super structure
  const filteredStructures = React.useMemo(() => {
    if (!structuresData?.content) return [];
    if (!selectedSuperStructureId || selectedSuperStructureId === 'none') {
      return structuresData.content;
    }
    return structuresData.content.filter((structure: Structure) => 
      structure.superStructureId === selectedSuperStructureId
    );
  }, [structuresData, selectedSuperStructureId]);

  // Auto-set super structure when a structure is selected
  useEffect(() => {
    if (selectedStructureId && selectedStructureId !== 'none' && structuresData?.content) {
      const selectedStructure = structuresData.content.find(
        (structure: Structure) => structure.id === selectedStructureId
      );
      if (selectedStructure?.superStructureId) {
        setValue('superStructureId', selectedStructure.superStructureId);
      }
    }
  }, [selectedStructureId, structuresData, setValue]);

  const onSubmit = async (values: TerminalFormValues) => {
    try {
      const newValues = {
        ...values,
        superStructureId: values.superStructureId === 'none' ? undefined : values.superStructureId,
        expirationDate: values.expirationDate ? `${values.expirationDate.split('T')[0]}T23:59:59` : undefined,
      }

      const finalValues = {
        ...newValues,
        structureId: newValues.structureId === 'none' ? undefined : newValues.structureId,
      };

      if (mode === "create") {
        await createMutation.mutateAsync(finalValues);
        toast.success("Terminal créé avec succès");
      } else if (terminal) {
        await updateMutation.mutateAsync({ id: terminal.id, data: finalValues });
        toast.success("Terminal modifié avec succès");
      }
      onClose();
      reset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Une erreur est survenue");
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <Smartphone className="h-5 w-5 text-primary" />
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Nouveau terminal" : "Modifier le terminal"}
      titleIcon={titleIcon}
      subtitle={
        mode === "create" 
          ? "Configurez un nouveau terminal de paiement" 
          : `Modification du terminal ${terminal?.serialNumber}`
      }
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={mode === "create" ? "Créer" : "Enregistrer"}
      isSubmitting={isLoading}
      isDirty={isDirty}
      footerNote={
        mode === "create" 
          ? "Tous les champs marqués sont obligatoires"
          : "Les modifications seront appliquées immédiatement"
      }
    >
      <Form {...form}>
        <div className="space-y-8">
          {/* General Information Section */}
          <FormSection
            title="Informations générales" 
            description="Identifiez et assignez le terminal"
            icon={Building2}
          >
          <div className="space-y-5">
            {/* First row: SuperStructure and Structure fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <FormField
                control={control}
                name="superStructureId"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Super structure
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || "none"}
                        disabled={isLoadingSuperStructures || !!(selectedStructureId && selectedStructureId !== 'none')}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Sélectionner une super structure" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Aucune super structure</SelectItem>
                          {superStructuresData?.content?.map((superStructure: SuperStructure) => (
                            <SelectItem key={superStructure.id} value={superStructure.id}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{superStructure.code}</span>
                                <span className="text-muted-foreground">-</span>
                                <span>{superStructure.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedStructureId && selectedStructureId !== 'none' && (
                        <FormDescription className="text-xs text-muted-foreground">
                          Super structure définie automatiquement par la structure sélectionnée
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="structureId"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Structure
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || "none"}
                        disabled={isLoadingStructures}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Sélectionner une structure" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Aucune structure</SelectItem>
                          {filteredStructures.map((structure: Structure) => (
                            <SelectItem key={structure.id} value={structure.id}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{structure.code}</span>
                                <span className="text-muted-foreground">-</span>
                                <span>{structure.name}</span>
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

            {/* Second row: 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
              <FormField
                control={control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Numéro de série
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="TPE-2025-001"
                          disabled={mode === "edit"}
                          className="h-10 w-full font-mono"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Format: TPE-YYYY-XXX
                      </FormDescription>
                      <FormMessage />
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="activationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormFieldWrapper>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Code d'activation
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="ACT-XXXXXX-XXXXXX"
                          className="h-10 w-full font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormFieldWrapper>
                  </FormItem>
                )}
              />
              <ConditionalWrapper
                condition={mode === 'edit'}
                wrapper={children => (
                  <PermissionGate permissions={[PERMISSIONS.TERMINAL.CHANGE_STATUS]}>
                    {children}
                  </PermissionGate>
                )}
              >
                <FormField
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Statut
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              </ConditionalWrapper>
            </div>
          </div>
          </FormSection>

          <Separator />

          {/* Technical Information Section */}
          <FormSection 
            title="Informations techniques" 
            description="Spécifications matérielles et logicielles"
            icon={Settings2}
          >
            <div className="space-y-5">
              {/* First row: Model field takes full width */}
              <div>
                <FormField
                  control={control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Modèle
                        </FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="Sélectionner un modèle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {['AvePay Pro', 'AvePay Pro 2000', 'AvePay Lite', 'AvePay Mini'].map((model: string) => (
                              <SelectItem key={model} value={model}>
                                {model}
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

              {/* Remaining fields: 2 columns, 2 rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <FormField
                  control={control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Fabricant
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="AvePlus Technologies"
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
                  name="osVersion"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Version du système
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Android 11"
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
                  name="appVersion"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Version de l'application
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="1.0.0"
                            className="h-10 w-full font-mono"
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
                          Format: X.Y.Z
                        </FormDescription>
                        <FormMessage />
                      </FormFieldWrapper>
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="expirationDate"
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
                            min={new Date().toISOString().split('T')[0]}
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

          {/* Additional Information Section */}
          <FormSection 
            title="Informations supplémentaires" 
            description="Détails de localisation et de contact"
            icon={Info}
          >
            <div className="space-y-5">
              {/* First row: Location field takes full width */}
              <div>
                <FormField
                  control={control}
                  name="metadata.location"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Localisation
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
              </div>

              {/* Remaining fields: 2 columns, 2 rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <FormField
                  control={control}
                  name="metadata.contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Contact
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

                <FormField
                  control={control}
                  name="metadata.reportedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Signalé par
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="John Doe"
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
                  name="metadata.incidentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Numéro d'incident
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="INC-2025-001"
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
                  name="metadata.policeReport"
                  render={({ field }) => (
                    <FormItem>
                      <FormFieldWrapper>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Rapport de police
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="PR-2025-123"
                            className="h-10 w-full font-mono"
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
        </div>
      </Form>
    </FormModal>
  );
};