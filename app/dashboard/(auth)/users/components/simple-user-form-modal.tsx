"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, UserPlus, Building2, Mail, Calendar, Key, FileText, UserCheck } from "lucide-react";
import { FormModal } from "@/components/ui/modal/FormModal";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  simpleUserFormSchema,
  type SimpleUserFormValues,
  defaultSimpleUserValues,
  transformSimpleFormToCreateRequest,
  ORGANIZATION_TYPE_OPTIONS,
  GENDER_OPTIONS
} from "./simple-user-form-schema";
import { PhoneInput } from "./PhoneInput";
import { RoleSelector } from "./RoleSelector";
import { useCreateUser, useUpdateUser, useUser } from "@/data/users";
import { useStructures, useSuperStructures } from "@/data/organization";

interface SimpleUserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  mode?: "create" | "edit";
}

export function SimpleUserFormModal({
                                      isOpen,
                                      onClose,
                                      userId,
                                      mode = "create"
                                    }: SimpleUserFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizationType, setOrganizationType] = useState<"STRUCTURE" | "SUPER_STRUCTURE">("STRUCTURE");

  // Queries
  const { data: structures } = useStructures({ page: 0, size: 1000 });
  const { data: superStructures } = useSuperStructures({ page: 0, size: 1000 });
  const { data: userData, isLoading: isLoadingUser } = useUser(userId || "", !!userId);

  // Mutations
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  // Form
  const form = useForm<SimpleUserFormValues>({
    resolver: zodResolver(simpleUserFormSchema),
    defaultValues: defaultSimpleUserValues
  });

  // Load user data for edit mode
  useEffect(() => {
    if (mode === "edit" && userData) {
      console.log('🔄 Loading user data for edit:', userData);
      
      const userFormData: SimpleUserFormValues = {
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        organizationType: userData.organizationType as "STRUCTURE" | "SUPER_STRUCTURE" || "STRUCTURE",
        organizationId: userData.organizationId || "",
        roleIds: userData.roles?.map(role => role.id) || [],
        title: userData.title || "",
        bio: userData.bio || "",
        birthDate: userData.birthDate || "",
        gender: userData.gender || ""
      };

      console.log('📝 Form data mapped:', userFormData);
      form.reset(userFormData);
      setOrganizationType(userFormData.organizationType);
    } else if (mode === "create") {
      form.reset(defaultSimpleUserValues);
      setOrganizationType("STRUCTURE");
    }
  }, [mode, userData, form]);

  // Surveiller le changement de type d'organisation
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "organizationType") {
        setOrganizationType(value.organizationType as "STRUCTURE" | "SUPER_STRUCTURE");
        // Réinitialiser l'organisation sélectionnée
        form.setValue("organizationId", "");
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Obtenir les options d'organisation selon le type
  const organizationOptions = organizationType === "STRUCTURE"
    ? structures?.content || []
    : superStructures?.content || [];

  // Soumission du formulaire
  const onSubmit = async (values: SimpleUserFormValues) => {
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const requestData = transformSimpleFormToCreateRequest(values);
        await createMutation.mutateAsync(requestData);
        toast.success("Utilisateur créé avec succès");
      } else if (mode === "edit" && userId) {
        const requestData = transformSimpleFormToCreateRequest(values);
        await updateMutation.mutateAsync({ id: userId, data: requestData });
        toast.success("Utilisateur modifié avec succès");
      }
      form.reset();
      onClose();
    } catch (error: any) {
      console.error(`Erreur lors de la ${mode === "create" ? "création" : "modification"}:`, error);
      const errorMessage = error?.response?.data?.message || "Une erreur est survenue";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDirty = form.formState.isDirty;

  return (
    // Dans SimpleUserFormModal.tsx, changez :
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {mode === "create" ? <UserPlus className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
          {mode === "create" ? "Créer un utilisateur" : "Modifier l'utilisateur"}
        </div>
      }
      subtitle={mode === "create" ? "Remplissez les informations pour créer un nouvel utilisateur" : "Modifiez les informations de l'utilisateur"}
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={mode === "create" ? "Créer l'utilisateur" : "Modifier l'utilisateur"}
      size="xl"
    >
      <Form {...form}>
        <form className="space-y-6">
          {/* Section 1: Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Informations personnelles
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Jean" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Dupont" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      Email *
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="jean.dupont@example.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone *</FormLabel>
                    <PhoneInput
                      value={field.value}
                      onChange={field.onChange}
                      error={form.formState.errors.phone?.message}
                    />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre/Fonction</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Directeur, Gestionnaire, etc."
                    />
                  </FormControl>
                  <FormDescription>
                    Fonction ou titre professionnel (optionnel)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Section 2: Organisation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Organisation
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="organizationType"
                render={({ field }) => (
                  <FormItem className={"w-full"}>
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
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {organizationType === "STRUCTURE" ? "Structure" : "Super Structure"} *
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
                            Aucune {organizationType === "STRUCTURE" ? "structure" : "super structure"} disponible
                          </SelectItem>
                        ) : (
                          organizationOptions.map((org: any) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.code} - {org.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="roleIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Key className="h-3 w-3" />
                    Rôles *
                  </FormLabel>
                  <RoleSelector
                    value={field.value}
                    onChange={field.onChange}
                    organizationType={organizationType}
                    organizationId={form.watch("organizationId")}
                    error={form.formState.errors.roleIds?.message}
                  />
                  <FormDescription>
                    Sélectionnez les rôles à assigner à l'utilisateur
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Section 3: Informations additionnelles (optionnel) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Informations additionnelles
              <span className="text-sm font-normal text-muted-foreground">(optionnel)</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Date de naissance
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENDER_OPTIONS.map((option) => (
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
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biographie</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Quelques mots sur l'utilisateur..."
                      className="min-h-[80px]"
                    />
                  </FormControl>
                  <FormDescription>
                    Description ou notes sur l'utilisateur
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}