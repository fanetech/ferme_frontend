"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, User, Building2, Settings, Info } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  roleFormSchema,
  type RoleFormValues,
  transformRoleFormToUpdateRequest,
  ORGANIZATION_TYPE_OPTIONS
} from "./role-form-schema";
import { useRole, useUpdateRole } from "@/data/roles";
import { useStructures, useSuperStructures } from "@/data/organization";

interface EditRoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleId: string | null;
  onSuccess?: () => void;
  onConfigure?: (roleId: string) => void;
}

export function EditRoleFormModal({
  isOpen,
  onClose,
  roleId,
  onSuccess,
  onConfigure
}: EditRoleFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ownerType, setOwnerType] = useState<"STRUCTURE" | "SUPER_STRUCTURE">("STRUCTURE");

  // Queries
  const { data: role, isLoading: roleLoading } = useRole(roleId || "", !!roleId);
  const { data: structures } = useStructures({ page: 0, size: 1000 });
  const { data: superStructures } = useSuperStructures({ page: 0, size: 1000 });

  // Mutations
  const updateMutation = useUpdateRole();

  // Form
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      displayName: "",
      description: "",
      level: 1,
      isActive: true,
      ownerType: "STRUCTURE",
      ownerId: "",
      isInheritable: false,
      permissionIds: []
    }
  });


  // Charger les données du rôle
  useEffect(() => {
    if (role && isOpen) {
      const formData: RoleFormValues = {
        displayName: role.displayName,
        description: role.description || "",
        level: role.level,
        isActive: role.isActive,
        ownerType: role.ownerType as "STRUCTURE" | "SUPER_STRUCTURE",
        ownerId: role.ownerId || "",
        isInheritable: role.isInheritable || false,
        permissionIds: [] // Les permissions ne sont pas modifiées ici
      };
      form.reset(formData);
      setOwnerType(role.ownerType as "STRUCTURE" | "SUPER_STRUCTURE");
    }
  }, [role, isOpen, form]);

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
    if (!roleId) return;
    
    setIsSubmitting(true);

    try {
      const requestData = transformRoleFormToUpdateRequest(values);
      await updateMutation.mutateAsync({ id: roleId, data: requestData });
      
      toast.success("Rôle modifié avec succès");
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Erreur lors de la modification:", error);
      const errorMessage = error?.response?.data?.message || "Une erreur est survenue";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDirty = form.formState.isDirty;

  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <Shield className="h-5 w-5 text-primary" />
    </div>
  );

  if (roleLoading) {
    return (
      <FormModal
        isOpen={isOpen}
        onClose={onClose}
        title="Modification du rôle"
        titleIcon={titleIcon}
        subtitle="Chargement..."
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

  if (!role) {
    return null;
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Modifier ${role.displayName}`}
      titleIcon={titleIcon}
      subtitle="Modifiez les informations du rôle"
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel="Enregistrer les modifications"
      size="xl"
      footerActions={
        <Button
          type="button"
          variant="outline"
          onClick={() => onConfigure?.(roleId!)}
          className="mr-auto"
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurer les permissions
        </Button>
      }
    >
      <Form {...form}>
        <form className="space-y-8">
          {/* Section 1: Informations du rôle */}
          <FormSection
            title="Informations du rôle"
            description="Modifiez les caractéristiques du rôle"
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
                          disabled={role.type === "SYSTEM"}
                        />
                      </FormControl>
                      <FormDescription>
                        {role.type === "SYSTEM" 
                          ? "Le niveau des rôles système est fixe"
                          : "De 1 (plus bas) à 1000 (plus haut)"
                        }
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
                            Désactiver empêche l'attribution aux nouveaux utilisateurs
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
            description="Définissez l'organisation qui possède ce rôle"
            icon={Building2}
          >
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="ownerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'organisation *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                      {form.watch("ownerType") === "STRUCTURE" ? "Structure" : "Super Structure"} *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner l'organisation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizationOptions.length === 0 ? (
                          <SelectItem value="none" disabled>
                            Aucune {form.watch("ownerType") === "STRUCTURE" ? "structure" : "super structure"} disponible
                          </SelectItem>
                        ) : (
                          organizationOptions.map((org: any) => (
                            <SelectItem key={org.id} value={org.id}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{org.code}</span>
                                <span className="text-muted-foreground">-</span>
                                <span>{org.name}</span>
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

              {form.watch("ownerType") === "SUPER_STRUCTURE" && (
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
                        <FormLabel>Rôle héritable *</FormLabel>
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

          <Separator />

          {/* Section 3: Informations système */}
          <FormSection
            title="Informations système"
            description="Détails techniques du rôle"
            icon={Info}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de rôle</label>
                <div className="p-3 bg-muted rounded-lg">
                  <Badge variant={role.type === "SYSTEM" ? "secondary" : "outline"}>
                    {role.type === "SYSTEM" ? "Système" : "Personnalisé"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Utilisateurs assignés</label>
                <div className="p-3 bg-muted rounded-lg">
                  <span className="font-medium">{role.userCount}</span> utilisateur(s)
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Permissions configurées</label>
                <div className="p-3 bg-muted rounded-lg">
                  <span className="font-medium">{role.permissionCount}</span> permission(s)
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Peut être supprimé</label>
                <div className="p-3 bg-muted rounded-lg">
                  <Badge variant={role.canBeDeleted ? "default" : "destructive"}>
                    {role.canBeDeleted ? "Oui" : "Non"}
                  </Badge>
                </div>
              </div>
            </div>
          </FormSection>
        </form>
      </Form>
    </FormModal>
  );
}