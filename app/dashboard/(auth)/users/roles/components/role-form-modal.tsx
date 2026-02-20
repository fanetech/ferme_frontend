"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, User, Building2, Info } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  roleFormSchema,
  type RoleFormValues,
  defaultRoleValues,
  transformRoleFormToCreateRequest,
  transformRoleFormToUpdateRequest,
  ORGANIZATION_TYPE_OPTIONS
} from "./role-form-schema";
import { useCreateRole, useUpdateRole, useRole } from "@/data/roles";
import { useStructures, useSuperStructures } from "@/data/organization";

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (roleId?: string) => void;
  // Props pour le mode édition
  mode?: 'create' | 'edit';
  roleId?: string;
}

export function RoleFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode = 'create',
  roleId
}: RoleFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ownerType, setOwnerType] = useState<"STRUCTURE" | "SUPER_STRUCTURE">("STRUCTURE");

  // Queries
  const { data: structures } = useStructures({ page: 0, size: 1000 });
  const { data: superStructures } = useSuperStructures({ page: 0, size: 1000 });
  const { data: role, isLoading: roleLoading } = useRole(roleId || "", mode === 'edit' && !!roleId);

  // Mutations
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  // Form
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: defaultRoleValues
  });

  // Charger les données du rôle en mode édition
  useEffect(() => {
    if (mode === 'edit' && role && isOpen) {
      const formData: RoleFormValues = {
        displayName: role.displayName,
        description: role.description || "",
        level: role.level,
        isActive: role.isActive,
        ownerType: role.ownerType as "STRUCTURE" | "SUPER_STRUCTURE",
        ownerId: role.ownerId || "",
        isInheritable: role.isInheritable || false,
        permissionIds: []
      };
      form.reset(formData);
      setOwnerType(role.ownerType as "STRUCTURE" | "SUPER_STRUCTURE");
    } else if (mode === 'create' && isOpen) {
      form.reset(defaultRoleValues);
      setOwnerType("STRUCTURE");
    }
  }, [mode, role, isOpen, form]);


  // Surveiller le changement de type d'organisation
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "ownerType") {
        setOwnerType(value.ownerType as "STRUCTURE" | "SUPER_STRUCTURE");
        // Réinitialiser l'organisation sélectionnée
        form.setValue("ownerId", "");
        form.setValue("isInheritable", false);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);


  // Obtenir les options d'organisation selon le type
  const organizationOptions = ownerType === "STRUCTURE"
    ? structures?.content || []
    : superStructures?.content || [];


  // Soumission du formulaire
  const onSubmit = async (values: RoleFormValues) => {
    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        const requestData = transformRoleFormToCreateRequest(values);
        const result = await createMutation.mutateAsync(requestData);
        toast.success("Rôle créé avec succès");
        onSuccess?.(result.id);
      } else if (mode === 'edit' && roleId) {
        const requestData = transformRoleFormToUpdateRequest(values);
        await updateMutation.mutateAsync({ id: roleId, data: requestData });
        toast.success("Rôle modifié avec succès");
        onSuccess?.();
      }
      
      form.reset();
      onClose();
    } catch (error: any) {
      console.error(`Erreur lors de la ${mode === 'create' ? 'création' : 'modification'}:`, error);
      const errorMessage = error?.response?.data?.message || "Une erreur est survenue";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDirty = form.formState.isDirty;
  const isLoading = mode === 'edit' && roleLoading;

  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <Shield className="h-5 w-5 text-primary" />
    </div>
  );

  if (isLoading) {
    return (
      <FormModal
        isOpen={isOpen}
        onClose={onClose}
        title="Chargement..."
        titleIcon={titleIcon}
        subtitle=""
        isSubmitting={false}
        isDirty={false}
        onSubmit={() => {}}
        submitLabel="Charger..."
        size="xl"
      >
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </FormModal>
    );
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? "Créer un nouveau rôle" : `Modifier ${role?.displayName || 'le rôle'}`}
      titleIcon={titleIcon}
      subtitle={mode === 'create' ? "Configurez un nouveau rôle avec ses permissions et son organisation" : "Modifiez les informations du rôle"}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={mode === 'create' ? "Créer le rôle" : "Enregistrer les modifications"}
      size="xl"
      footerNote={mode === 'create' ? "Vous pourrez configurer les permissions détaillées après la création" : undefined}
    >
      <Form {...form}>
        <form className="space-y-8">
          {/* Section 1: Informations du rôle */}
          <FormSection
            title="Informations du rôle"
            description={mode === 'create' ? "Définissez les caractéristiques principales du rôle" : "Modifiez les caractéristiques du rôle"}
            icon={User}
          >
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'affichage *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="ex: Gestionnaire des ventes"
                      />
                    </FormControl>
                    <FormDescription>
                      Nom affiché dans l'interface utilisateur
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Décrivez les responsabilités et le périmètre de ce rôle..."
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Description du rôle et de ses responsabilités (optionnel)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Niveau hiérarchique *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={1000}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        De 1 (plus bas) à 1000 (plus haut)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-center">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <FormLabel>Statut du rôle</FormLabel>
                          <FormDescription className="text-xs">
                            Activer le rôle immédiatement
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </FormSection>

          <Separator />

          {/* Section 2: Organisation propriétaire */}
          <FormSection
            title="Organisation propriétaire"
            description={mode === 'create' ? "Définissez l'organisation qui possède ce rôle" : "Modifiez l'organisation propriétaire"}
            icon={Building2}
          >
            <div className="grid grid-cols-2 gap-x-6">
              <FormField
                control={form.control}
                name="ownerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'organisation *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={"w-full"}>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ORGANIZATION_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {ownerType === "STRUCTURE" ? "Structure" : "Super Structure"} *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={"w-full"}>
                          <SelectValue placeholder="Sélectionner l'organisation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizationOptions.length === 0 ? (
                          <SelectItem value="none" disabled>
                            Aucune {ownerType === "STRUCTURE" ? "structure" : "super structure"} disponible
                          </SelectItem>
                        ) : (
                          organizationOptions.map((org: any) => (
                            <SelectItem key={org.id} value={org.id}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{org.code}</span>
                                <span className="text-muted-foreground">-</span>
                                <span>{org.name?.length > 50 ? `${org.name.substring(0, 50)}...` : org.name}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {ownerType === "SUPER_STRUCTURE" && (
                <FormField
                  control={form.control}
                  name="isInheritable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Rôle héritable</FormLabel>
                        <FormDescription>
                          Permet aux structures enfants d'hériter de ce rôle automatiquement
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </FormSection>

        </form>
      </Form>
    </FormModal>
  );
}