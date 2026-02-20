"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { 
  Edit3, 
  Save, 
  X, 
  Building, 
  Calendar as CalendarIcon,
  Shield,
  Clock,
  Globe,
  Lock
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import type { User } from "@/types/users";
import { 
  useUpdateUser, 
  useAvailableRoles,
  useUser,
  useUserRolesPermissions
} from "@/data/users";
import { useStructures, useSuperStructures } from "@/data/organization";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RoleSelector } from "../../components/RoleSelector";
import { formatPhoneInput, GENDER_OPTIONS } from "../../components/simple-user-form-schema";
import { UserBadge } from "../../components/user-badge";
import { UserInfoTabSkeleton } from "./UserInfoTabSkeleton";
import { AccountActionConfirmModal } from "./AccountActionConfirmModal";
import { getAvailableActions, getAvailableActionsByFlags } from "../../components/user-status-mapper";
import { 
  useActivateUser, 
  useDeactivateUser, 
  useSuspendUser, 
  useLockUser, 
  useUnlockUser 
} from "@/data/users";

interface UserInfoTabProps {
  user: User | null;
  isLoading?: boolean;
}

export function UserInfoTab({ user , isLoading }: UserInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>({});
  const updateUserMutation = useUpdateUser();
  
  // États pour les actions de compte
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");
  
  // Hooks pour les actions de compte
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const suspendUser = useSuspendUser();
  const lockUser = useLockUser();
  const unlockUser = useUnlockUser();

  // Hooks pour les données des selects
  const { data: structuresData } = useStructures();
  const { data: superStructuresData } = useSuperStructures();
  const { data: rolesData } = useAvailableRoles({
    targetOrganizationType: editedUser.organizationType || user?.organizationType || "STRUCTURE",
    targetOrganizationId: editedUser.organizationId || user?.organizationId || ""
  });
  
  // Hook pour les permissions détaillées
  const { data: userRolesPermissions, isLoading: isLoadingPermissions } = useUserRolesPermissions(
    user?.id || "",
    !!user && !isEditing
  );

  // Initialiser editedUser quand user est chargé
  useEffect(() => {
    if (user) {
      setEditedUser({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        title: user.title || "",
        bio: user.bio || "",
        birthDate: user.birthDate || "",
        gender: user.gender || "",
        language: user.language || "fr",
        timezone: user.timezone || "Africa/Ouagadougou",
        theme: user.theme || "light",
        organizationType: user.organizationType,
        organizationId: user.organizationId,
        roleIds: user.roles?.map(r => r.id) || [],
        status: user.accountStatus
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateUserMutation.mutateAsync({
        id: user!.id,
        data: {
          firstName: editedUser.firstName,
          lastName: editedUser.lastName,
          phone: editedUser.phone,
          title: editedUser.title || undefined,
          bio: editedUser.bio || undefined,
          birthDate: editedUser.birthDate || undefined,
          gender: editedUser.gender || undefined,
          language: editedUser.language,
          timezone: editedUser.timezone,
          theme: editedUser.theme,
          organizationType: editedUser.organizationType,
          organizationId: editedUser.organizationId,
          roleIds: editedUser.roleIds
        }
      });
      setIsEditing(false);
      toast.success("Informations utilisateur mises à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditedUser({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        title: user.title || "",
        bio: user.bio || "",
        birthDate: user.birthDate || "",
        gender: user.gender || "",
        language: user.language || "fr",
        timezone: user.timezone || "Africa/Ouagadougou",
        theme: user.theme || "light",
        organizationType: user.organizationType,
        organizationId: user.organizationId,
        roleIds: user.roles?.map(r => r.id) || [],
        status: user.accountStatus
      });
    }
    setIsEditing(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Gestionnaire pour les actions de compte
  const handleAccountAction = (action: string) => {
    setSelectedAction(action);
    setIsActionModalOpen(true);
  };

  const handleConfirmAccountAction = async () => {
    if (!user || !selectedAction) return;

    try {
      switch (selectedAction) {
        case 'activate':
          await activateUser.mutateAsync(user.id);
          toast.success("Compte activé avec succès");
          break;
        case 'deactivate':
          await deactivateUser.mutateAsync(user.id);
          toast.success("Compte désactivé avec succès");
          break;
        case 'suspend':
          await suspendUser.mutateAsync({ id: user.id });
          toast.success("Compte suspendu avec succès");
          break;
        case 'lock':
          await lockUser.mutateAsync({ id: user.id });
          toast.success("Compte verrouillé avec succès");
          break;
        case 'unlock':
          await unlockUser.mutateAsync(user.id);
          toast.success("Compte déverrouillé avec succès");
          break;
        default:
          break;
      }
      
      setIsActionModalOpen(false);
      setSelectedAction("");
      
    } catch (error) {
      toast.error("Erreur lors de l'action sur le compte");
    }
  };


  if (isLoading || !user) {
    return <UserInfoTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Profil principal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Informations de base de l'utilisateur</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave} disabled={updateUserMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                <Edit3 className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar et statut */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{user.fullName}</h3>
              <p className="text-muted-foreground text-sm">
                {user.displayName || `${user.firstName} ${user.lastName}`}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{user.code}</Badge>
                <UserBadge status={user.status} />
                {user.locked && (
                  <Badge variant="destructive" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Verrouillé
                  </Badge>
                )}
                {!user.active && !user.locked && (
                  <Badge variant="secondary">
                    Inactif
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Boutons de gestion de compte */}
          {!isEditing && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2 w-full">
                Actions de gestion du compte :
              </p>
              {getAvailableActionsByFlags(user).map((action) => {
                const getActionConfig = (action: string) => {
                  switch (action) {
                    case 'activate':
                      return { 
                        label: 'Activer', 
                        variant: 'default' as const, 
                        icon: '✓' 
                      };
                    case 'deactivate':
                      return { 
                        label: 'Désactiver', 
                        variant: 'secondary' as const, 
                        icon: '⏸' 
                      };
                    case 'suspend':
                      return { 
                        label: 'Suspendre', 
                        variant: 'destructive' as const, 
                        icon: '⛔' 
                      };
                    case 'lock':
                      return { 
                        label: 'Verrouiller', 
                        variant: 'destructive' as const, 
                        icon: '🔒' 
                      };
                    case 'unlock':
                      return { 
                        label: 'Déverrouiller', 
                        variant: 'default' as const, 
                        icon: '🔓' 
                      };
                    case 'reject':
                      return { 
                        label: 'Rejeter', 
                        variant: 'destructive' as const, 
                        icon: '❌' 
                      };
                    default:
                      return { 
                        label: action, 
                        variant: 'outline' as const, 
                        icon: '?' 
                      };
                  }
                };

                const config = getActionConfig(action);
                return (
                  <Button
                    key={action}
                    size="sm"
                    variant={config.variant}
                    onClick={() => handleAccountAction(action)}
                  >
                    <span className="mr-1">{config.icon}</span>
                    {config.label}
                  </Button>
                );
              })}
            </div>
          )}

          <Separator />

          {/* Informations */}
          {isEditing ? (
            /* Mode édition - Formulaire */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={editedUser.firstName}
                    onChange={(e) => setEditedUser({ ...editedUser, firstName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={editedUser.lastName}
                    onChange={(e) => setEditedUser({ ...editedUser, lastName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email principal</Label>
                  <Input id="email" value={user.email} disabled />
                  <p className="text-muted-foreground text-xs">L'email ne peut pas être modifié</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    value={editedUser.phone}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, phone: formatPhoneInput(e.target.value) })
                    }
                    placeholder="+226 70 12 34 56"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre/Fonction</Label>
                  <Input
                    id="title"
                    value={editedUser.title}
                    onChange={(e) => setEditedUser({ ...editedUser, title: e.target.value })}
                    placeholder="Ex: Directeur Commercial"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Genre</Label>
                  <Select
                    value={editedUser.gender}
                    onValueChange={(value) => setEditedUser({ ...editedUser, gender: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Date de naissance</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editedUser.birthDate && "text-muted-foreground"
                        )}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedUser.birthDate ? (
                          format(new Date(editedUser.birthDate), "dd MMMM yyyy", { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editedUser.birthDate ? new Date(editedUser.birthDate) : undefined}
                        onSelect={(date) => {
                          setEditedUser({
                            ...editedUser,
                            birthDate: date ? format(date, "yyyy-MM-dd") : ""
                          });
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    value={editedUser.bio}
                    onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                    placeholder="Quelques mots sur l'utilisateur..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Mode lecture - Vue détail */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Prénom</Label>
                  <p className="mt-1 text-sm">{user.firstName}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nom</Label>
                  <p className="mt-1 text-sm">{user.lastName}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email principal</Label>
                  <p className="mt-1 text-sm">{user.email}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Téléphone</Label>
                  <p className="mt-1 text-sm">{user.phone || "Non renseigné"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Titre/Fonction</Label>
                  <p className="mt-1 text-sm">{user.title || "Non renseigné"}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Genre</Label>
                  <p className="mt-1 text-sm">
                    {user.gender ? GENDER_OPTIONS.find(opt => opt.value === user.gender)?.label : "Non renseigné"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date de naissance</Label>
                  <p className="mt-1 text-sm">
                    {user.birthDate ? format(new Date(user.birthDate), "dd MMMM yyyy", { locale: fr }) : "Non renseignée"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Biographie</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{user.bio || "Aucune biographie"}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations organisationnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Informations organisationnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            /* Mode édition */
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="organizationType">Type d'organisation *</Label>
                  <Select
                    value={editedUser.organizationType}
                    onValueChange={(value) => {
                      setEditedUser({
                        ...editedUser,
                        organizationType: value,
                        organizationId: "", // Reset organization when type changes
                        roleIds: [] // Reset roles when organization changes
                      });
                    }}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STRUCTURE">Structure</SelectItem>
                      <SelectItem value="SUPER_STRUCTURE">Super Structure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationId">
                    {editedUser.organizationType === "SUPER_STRUCTURE"
                      ? "Super Structure"
                      : "Structure"}{" "}
                    *
                  </Label>
                  <Select
                    value={editedUser.organizationId}
                    onValueChange={(value) => {
                      setEditedUser({
                        ...editedUser,
                        organizationId: value,
                        roleIds: [] // Reset roles when organization changes
                      });
                    }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner une organisation" />
                    </SelectTrigger>
                    <SelectContent>
                      {editedUser.organizationType === "SUPER_STRUCTURE"
                        ? superStructuresData?.content?.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.code} - {org.name}
                            </SelectItem>
                          ))
                        : structuresData?.content?.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.code} - {org.name}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roles">Rôles assignés *</Label>
                <RoleSelector
                  value={editedUser.roleIds}
                  onChange={(roleIds) => setEditedUser({ ...editedUser, roleIds })}
                  organizationType={editedUser.organizationType}
                  organizationId={editedUser.organizationId}
                />
              </div>
            </>
          ) : (
            /* Mode lecture */
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type d'organisation</Label>
                  <p className="mt-1 text-sm">
                    {user.organizationType === "SUPER_STRUCTURE" ? "Super Structure" : "Structure"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Organisation</Label>
                  <p className="mt-1 text-sm">
                    {user.organizationName || "Non renseignée"}
                    {user.organizationCode && (
                      <span className="text-muted-foreground ml-2">({user.organizationCode})</span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Rôles assignés</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <Badge key={role.id} variant="secondary">
                        <Shield className="mr-1 h-3 w-3" />
                        {role.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">Aucun rôle assigné</p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Préférences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Préférences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            /* Mode édition */
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="language">Langue</Label>
                <Select
                  value={editedUser.language}
                  onValueChange={(value) => setEditedUser({ ...editedUser, language: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Fuseau horaire</Label>
                <Select
                  value={editedUser.timezone}
                  onValueChange={(value) => setEditedUser({ ...editedUser, timezone: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Ouagadougou">Africa/Ouagadougou</SelectItem>
                    <SelectItem value="Africa/Abidjan">Africa/Abidjan</SelectItem>
                    <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Thème</Label>
                <Select
                  value={editedUser.theme}
                  onValueChange={(value) => setEditedUser({ ...editedUser, theme: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            /* Mode lecture */
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Langue</Label>
                <p className="mt-1 text-sm">
                  {editedUser.language === "fr" ? "Français" : 
                   editedUser.language === "en" ? "English" : 
                   editedUser.language === "es" ? "Español" : 
                   editedUser.language || "Non définie"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Fuseau horaire</Label>
                <p className="mt-1 text-sm">{editedUser.timezone || "Non défini"}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Thème</Label>
                <p className="mt-1 text-sm">
                  {editedUser.theme === "light" ? "Clair" : 
                   editedUser.theme === "dark" ? "Sombre" : 
                   editedUser.theme === "system" ? "Système" : 
                   editedUser.theme || "Non défini"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations de sécurité (lecture seule) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité et authentification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Authentification à deux facteurs</Label>
              <p className="text-muted-foreground mt-1 text-sm">
                {user.otpEnabled ? "Activée" : "Désactivée"}
                {user.preferredOtpChannel && ` (${user.preferredOtpChannel})`}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Tentatives de connexion échouées</Label>
              <p className="text-muted-foreground mt-1 text-sm">{user.failedLoginAttempts || 0}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Compte verrouillé</Label>
              <p className="text-muted-foreground mt-1 text-sm">{user.locked ? "Oui" : "Non"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Compte actif</Label>
              <p className="text-muted-foreground mt-1 text-sm">{user.active ? "Oui" : "Non"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Dernière modification du mot de passe</Label>
              <p className="text-muted-foreground mt-1 text-sm">
                {user.passwordChangedAt
                  ? format(new Date(user.passwordChangedAt), "dd/MM/yyyy HH:mm")
                  : "Jamais modifié"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métadonnées (lecture seule) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Métadonnées
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Créé le</Label>
              <p className="text-muted-foreground mt-1 text-sm">
                {format(new Date(user.createdAt), "dd/MM/yyyy HH:mm")}
              </p>
              {user.createdBy && (
                <p className="text-muted-foreground text-xs">Par: {user.createdBy}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">Dernière modification</Label>
              <p className="text-muted-foreground mt-1 text-sm">
                {format(new Date(user.updatedAt), "dd/MM/yyyy HH:mm")}
              </p>
              {user.lastModifiedBy && (
                <p className="text-muted-foreground text-xs">Par: {user.lastModifiedBy}</p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">ID utilisateur</Label>
              <p className="text-muted-foreground mt-1 font-mono text-sm">{user.id}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Version</Label>
              <p className="text-muted-foreground mt-1 text-sm">v{user.version || 1}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de confirmation des actions de compte */}
      <AccountActionConfirmModal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setSelectedAction("");
        }}
        onConfirm={handleConfirmAccountAction}
        user={user}
        action={selectedAction}
        isLoading={
          activateUser.isPending ||
          deactivateUser.isPending ||
          suspendUser.isPending ||
          lockUser.isPending ||
          unlockUser.isPending
        }
      />
    </div>
  );
}