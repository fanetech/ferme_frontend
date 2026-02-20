"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Shield, 
  ArrowLeft, 
  Edit, 
  Copy, 
  Trash2,
  Save,
  Settings,
  Key,
  Users,
  CheckCircle,
  XCircle,
  Search,
  AlertTriangle,
  Building2,
  Building
} from "lucide-react";

import { useRole, useRolePermissions, useAllModulesWithPermissions, useUpdateRolePermissions } from "@/data/roles";
import type { RolePermissionsResponse } from "@/types/role-permissions";
import type { ModulePermissionsResponse } from "@/types/module-permissions";
import AvePayLoader from "@/components/avepay-loader";
import { RoleFormModal } from "../components/role-form-modal";
import { DeleteRoleModal } from "../components/delete-role-modal";
import { useQueryClient } from "@tanstack/react-query";
import PermissionGate from "@/components/auth/permission-gate";
import { PERMISSIONS, ROLES } from "@/lib/constants";
import { toast } from "sonner";
import useAuth from "@/store/useAuth";

export default function RoleConfigurationPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params.id as string;
  
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [initialPermissions, setInitialPermissions] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // États pour les modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // React Query client pour invalider les données
  const queryClient = useQueryClient();
  
  // Get current user to check if they are SUPER_ADMIN and have permissions
  const { roles: userRoles, permissions: userPermissions } = useAuth();

  const { data: role, isLoading: roleLoading, error: roleError } = useRole(roleId);
  const { data: rolePermissionsData, isLoading: rolePermissionsLoading } = useRolePermissions(roleId);
  const { data: allModulesData, isLoading: modulesLoading } = useAllModulesWithPermissions(true);
  const updatePermissionsMutation = useUpdateRolePermissions();

  const canUpdateRole = (!role?.isSystemRole && !userRoles.includes(ROLES.SUPER_ADMIN)) || (role?.isSystemRole && userRoles.includes(ROLES.SUPER_ADMIN)) || (!role?.isSystemRole && userRoles.includes(ROLES.SUPER_ADMIN));

  // Initialiser les permissions sélectionnées avec celles du rôle
  useEffect(() => {
    if (rolePermissionsData?.modules) {
      const currentPermissions = new Set<string>();
      rolePermissionsData.modules.forEach(module => {
        module.permissions.forEach(permission => {
          currentPermissions.add(permission.permissionId);
        });
      });
      setSelectedPermissions(currentPermissions);
      setInitialPermissions(currentPermissions);
    }
  }, [rolePermissionsData]);

  // Détecter les changements
  useEffect(() => {
    const hasChanged = 
      selectedPermissions.size !== initialPermissions.size ||
      [...selectedPermissions].some(id => !initialPermissions.has(id)) ||
      [...initialPermissions].some(id => !selectedPermissions.has(id));
    setHasChanges(hasChanged);
  }, [selectedPermissions, initialPermissions]);

  // Filtrer les modules et permissions selon le terme de recherche
  const filteredModules = useMemo(() => {
    if (!allModulesData || !searchTerm.trim()) {
      return allModulesData || [];
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    return allModulesData.map(module => {
      const filteredPermissions = module.permissions.filter(permission => 
        permission.name?.toLowerCase().includes(searchLower) ||
        permission.code?.toLowerCase().includes(searchLower) ||
        permission.description?.toLowerCase().includes(searchLower)
      );
      
      return filteredPermissions.length > 0 ? { ...module, permissions: filteredPermissions } : null;
    }).filter(Boolean) as ModulePermissionsResponse[];
  }, [allModulesData, searchTerm]);

  const handlePermissionToggle = (permissionId: string) => {
    if (!canUpdateRole) return; // Prevent toggle if user doesn't have permission
    
    const newPermissions = new Set(selectedPermissions);
    if (newPermissions.has(permissionId)) {
      newPermissions.delete(permissionId);
    } else {
      newPermissions.add(permissionId);
    }
    setSelectedPermissions(newPermissions);
  };

  const handleModuleToggle = (module: ModulePermissionsResponse) => {
    if (!canUpdateRole) return; // Prevent toggle if user doesn't have permission
    
    const modulePermissionIds = module.permissions.map(p => p.id);
    const allSelected = modulePermissionIds.every(id => selectedPermissions.has(id));
    
    const newPermissions = new Set(selectedPermissions);
    if (allSelected) {
      // Désélectionner toutes les permissions du module
      modulePermissionIds.forEach(id => newPermissions.delete(id));
    } else {
      // Sélectionner toutes les permissions du module
      modulePermissionIds.forEach(id => newPermissions.add(id));
    }
    
    setSelectedPermissions(newPermissions);
  };

  const getModuleStatus = (module: ModulePermissionsResponse) => {
    const modulePermissionIds = module.permissions.map(p => p.id);
    const selectedCount = modulePermissionIds.filter(id => selectedPermissions.has(id)).length;
    
    if (selectedCount === 0) return "none";
    if (selectedCount === modulePermissionIds.length) return "all";
    return "partial";
  };

  const handleSave = async () => {
      const result = await updatePermissionsMutation.mutateAsync({
        roleId,
        permissionIds: Array.from(selectedPermissions)
      });

      // Mettre à jour les permissions initiales avec les nouvelles permissions
      setInitialPermissions(new Set(selectedPermissions));
      setHasChanges(false);
      toast.success(`Permissions mises à jour: ${result.added} ajoutées, ${result.removed} supprimées`);
  };

  const getRoleTypeBadge = (type: string) => {
    return type === "SYSTEM" 
      ? <Badge variant="secondary">Système</Badge>
      : <Badge variant="outline">Personnalisé</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === "ACTIVE" 
      ? <Badge className="bg-green-100 text-green-800">Actif</Badge>
      : <Badge variant="destructive">Inactif</Badge>;
  };

  const isLoading = roleLoading || rolePermissionsLoading || modulesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuration du rôle</h1>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <AvePayLoader />
        </div>
      </div>
    );
  }

  if (roleError || !role || !allModulesData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Erreur</h1>
            <p className="text-muted-foreground">Impossible de charger les données</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-purple-500" />
              {role.displayName}
            </h1>
            <p className="text-muted-foreground">
              Configuration des permissions • {role.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PermissionGate permissions={[PERMISSIONS.AUTH.ROLE_UPDATE]}>
            {hasChanges && canUpdateRole && (
              <Button
                onClick={handleSave}
                disabled={updatePermissionsMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updatePermissionsMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            )}
          </PermissionGate>
          {role.canBeDeleted && (
            <>
             <PermissionGate permissions={[PERMISSIONS.AUTH.ROLE_UPDATE]}>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => setEditModalOpen(true)}
               >
                 <Edit className="h-4 w-4 mr-2" />
                 Éditer
               </Button>
             </PermissionGate>
              <PermissionGate permissions={[PERMISSIONS.AUTH.ROLE_DELETE]}>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDeleteModalOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
              </PermissionGate>
            </>
          )}
        </div>
      </div>

      {/* Informations du rôle */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium">{role.displayName}</h3>
                  {getRoleTypeBadge(role.type!)}
                  {getStatusBadge(role.isActive ? "ACTIVE" : "INACTIVE")}
                  {role.isSystemRole && (
                    <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                      <Shield className="h-3 w-3 mr-1" />
                      Système
                    </Badge>
                  )}
                </div>
                {role.description && (
                  <p className="text-muted-foreground">{role.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {role.userCount} utilisateurs
                </span>
                <span className="flex items-center gap-1">
                  <Key className="h-4 w-4" />
                  {selectedPermissions.size} permissions sélectionnées
                </span>
                <span className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  Niveau {role.level}
                </span>
                {/* Rôles SYSTEM = toujours globaux */}
                {role.type === "SYSTEM" && (
                  <span className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    <Badge variant="secondary" className="text-xs">Système</Badge>
                    <span className="text-purple-600 font-medium">Global</span>
                  </span>
                )}
                
                {/* Rôles CUSTOM = doivent avoir un propriétaire */}
                {role.type === "CUSTOM" && role.ownerCode && role.ownerType && (
                  <span className="flex items-center gap-1">
                    {role.ownerType === "STRUCTURE" ? (
                      <Building className="h-4 w-4" />
                    ) : (
                      <Building2 className="h-4 w-4" />
                    )}
                    <Badge variant={role.ownerType === "STRUCTURE" ? "default" : "secondary"} className="text-xs">
                      {role.ownerType === "STRUCTURE" ? "Structure" : "Super Structure"}
                    </Badge>
                    {role.ownerCode}
                  </span>
                )}
                
                {/* Rôles CUSTOM sans propriétaire = erreur */}
                {role.type === "CUSTOM" && (!role.ownerCode || !role.ownerType) && (
                  <span className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-red-500" />
                    <Badge variant="destructive" className="text-xs">Erreur</Badge>
                    <span className="text-red-600 font-medium">Non défini</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques des permissions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{allModulesData.length}</div>
            <div className="text-sm text-muted-foreground">Modules disponibles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {allModulesData.reduce((sum, m) => sum + m.permissions.length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Permissions totales</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{selectedPermissions.size}</div>
            <div className="text-sm text-muted-foreground">Sélectionnées</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{initialPermissions.size}</div>
            <div className="text-sm text-muted-foreground">Actuelles du rôle</div>
          </CardContent>
        </Card>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une permission, un code ou une description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Info message for users without update permissions */}
      {!canUpdateRole && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-orange-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-orange-700 dark:text-orange-200">
                  Mode Lecture Seule
                </p>
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  Vous n'avez pas les permissions nécessaires pour modifier ce rôle. Vous pouvez uniquement consulter les permissions attribuées.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration des permissions par module */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Permissions par module
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {canUpdateRole 
              ? "Configurez les permissions de ce rôle en sélectionnant les actions autorisées pour chaque module"
              : "Visualisation des permissions de ce rôle (lecture seule - vous n'avez pas les droits de modification)"
            }
          </p>
        </CardHeader>
        <CardContent>
          {filteredModules.length > 0 ? (
            <Accordion type="multiple" className="space-y-4">
              {filteredModules.map((module) => {
                const status = getModuleStatus(module);
                return (
                  <AccordionItem 
                    key={module.moduleId} 
                    value={module.moduleId}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="hover:no-underline px-4 py-3 bg-muted/50 hover:bg-muted transition-colors duration-200 cursor-pointer [&>svg]:cursor-pointer [&>svg]:hover:text-primary [&>svg]:transition-colors">
                      <div className="flex items-center justify-between w-full mr-4">
                        <div className="flex items-center gap-3">
                        <Checkbox
                          checked={status === "all"}
                          disabled={!canUpdateRole}
                          ref={status === "partial" ? (el) => {
                            if (el && "indeterminate" in el) {
                              (el as HTMLInputElement).indeterminate = true;
                            }
                          } : undefined}
                          onCheckedChange={() => handleModuleToggle(module)}
                            onClick={(e) => e.stopPropagation()}
                        />
                            <div className="text-left">
                              <div className="font-medium flex items-center gap-2">
                                {module.moduleName}
                                <span className="text-xs text-muted-foreground">({module.moduleCode})</span>
                              </div>
                              {module.moduleDescription && (
                                <div className="text-sm text-muted-foreground">{module.moduleDescription}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {status === "all" && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {status === "partial" && <div className="h-4 w-4 rounded bg-orange-500" />}
                            {status === "none" && <XCircle className="h-4 w-4 text-gray-400" />}
                            <span className="text-sm text-muted-foreground">
                              {module.permissions.filter(p => selectedPermissions.has(p.id)).length}/{module.permissions.length}
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                    <AccordionContent className="px-4 py-4 border-t bg-background">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {module.permissions.map((permission) => (
                          <div 
                            key={permission.id} 
                            className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                              canUpdateRole 
                                ? 'hover:bg-muted/50 cursor-pointer' 
                                : 'cursor-not-allowed opacity-75'
                            }`}
                            onClick={() => canUpdateRole && handlePermissionToggle(permission.id)}
                          >
                            <Checkbox
                              checked={selectedPermissions.has(permission.id)}
                              disabled={!canUpdateRole}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm flex items-center gap-2">
                                {permission.name}
                                {permission.isSystem && (
                                  <Badge variant="secondary" className="text-xs">Système</Badge>
                                )}
                              </div>
                              {permission.description && (
                                <div className="text-xs text-muted-foreground">{permission.description}</div>
                              )}
                              <div className="text-xs text-muted-foreground font-mono mt-1">{permission.code}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? "Aucun résultat trouvé" : "Aucun module trouvé"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? `Aucune permission ne correspond à "${searchTerm}"`
                  : "Ce rôle n'a aucun module de permissions défini"
                }
              </p>
            </div>
          )}

          {hasChanges && canUpdateRole && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-orange-800">
                  Vous avez des modifications non sauvegardées
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    // Réinitialiser aux permissions originales
                    setSelectedPermissions(new Set(initialPermissions));
                  }}>
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={updatePermissionsMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updatePermissionsMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <RoleFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        mode="edit"
        roleId={roleId}
        onSuccess={() => {
          // Invalider les données pour recharger
          queryClient.invalidateQueries({ queryKey: ['role', roleId] });
          queryClient.invalidateQueries({ queryKey: ['roles'] });
        }}
      />
      
      <DeleteRoleModal
        roleId={roleId}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={() => {
          // Invalider les données et rediriger vers la liste des rôles après suppression
          queryClient.invalidateQueries({ queryKey: ['roles'] });
          router.push('/dashboard/users/roles');
        }}
      />
    </div>
  );
}