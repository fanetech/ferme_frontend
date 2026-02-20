"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Shield, 
  Users, 
  Key, 
  Plus, 
  Trash2,
  Edit,
  Eye,
  Lock,
  Unlock,
  AlertTriangle,
  ChevronDown,
  Search
} from "lucide-react";

import { User, PermissionType, ResourceType } from "@/types/users";
import { useUserRolesPermissions } from "@/data/users";
import AvePayLoader from "@/components/avepay-loader";
import { DirectPermissionsManager } from "./DirectPermissionsManager";
import { PermissionDetails } from "@/types/user-permissions";
import { RevokePermissionModal } from "./RevokePermissionModal";

interface UserPermissionsTabProps {
  user: User;
}

export function UserPermissionsTab({ user }: UserPermissionsTabProps) {
  const { data: userRolesPermissions, isLoading, error, refetch } = useUserRolesPermissions(user.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [permissionToRevoke, setPermissionToRevoke] = useState<PermissionDetails | undefined>(undefined);
  
  // Filtrage des données basé sur le terme de recherche
  const filteredData = useMemo(() => {
    if (!userRolesPermissions || !searchTerm.trim()) {
      return userRolesPermissions;
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    const filteredRoles = userRolesPermissions.roles.map(role => {
      const filteredModules = role.modules.map(module => {
        const filteredPermissions = module.permissions.filter(permission => 
          permission.permissionName?.toLowerCase().includes(searchLower) ||
          permission.permissionCode?.toLowerCase().includes(searchLower) ||
          permission.permissionDescription?.toLowerCase().includes(searchLower) ||
          permission.action?.toLowerCase().includes(searchLower)
        );
        
        return filteredPermissions.length > 0 ? { ...module, permissions: filteredPermissions } : null;
      }).filter(Boolean);
      
      return filteredModules.length > 0 ? { ...role, modules: filteredModules } : null;
    }).filter(Boolean);
    
    const filteredDirectPermissions = {
      modules: userRolesPermissions.directPermissions.modules.map(module => {
        const filteredPermissions = module.permissions.filter(permission => 
          permission.permissionName?.toLowerCase().includes(searchLower) ||
          permission.permissionCode?.toLowerCase().includes(searchLower) ||
          permission.permissionDescription?.toLowerCase().includes(searchLower) ||
          permission.action?.toLowerCase().includes(searchLower)
        );
        
        return filteredPermissions.length > 0 ? { ...module, permissions: filteredPermissions } : null;
      }).filter(Boolean)
    };
    
    return {
      ...userRolesPermissions,
      roles: filteredRoles,
      directPermissions: filteredDirectPermissions
    };
  }, [userRolesPermissions, searchTerm]);

  const getPermissionIcon = (type: PermissionType) => {
    switch (type) {
      case PermissionType.READ:
        return <Eye className="h-3 w-3" />;
      case PermissionType.WRITE:
        return <Edit className="h-3 w-3" />;
      case PermissionType.DELETE:
        return <Trash2 className="h-3 w-3" />;
      case PermissionType.EXECUTE:
        return <Key className="h-3 w-3" />;
      case PermissionType.ADMIN:
        return <Shield className="h-3 w-3" />;
      default:
        return <Key className="h-3 w-3" />;
    }
  };

  const getPermissionColor = (type: PermissionType) => {
    switch (type) {
      case PermissionType.READ:
        return "default";
      case PermissionType.WRITE:
        return "secondary";
      case PermissionType.DELETE:
        return "destructive";
      case PermissionType.EXECUTE:
        return "outline";
      case PermissionType.ADMIN:
        return "default";
      default:
        return "secondary";
    }
  };

  const getResourceTypeLabel = (type: ResourceType) => {
    switch (type) {
      case ResourceType.USER:
        return "Utilisateurs";
      case ResourceType.ROLE:
        return "Rôles";
      case ResourceType.STRUCTURE:
        return "Structures";
      case ResourceType.SERVICE:
        return "Services";
      case ResourceType.CATEGORY:
        return "Catégories";
      case ResourceType.TRANSACTION:
        return "Transactions";
      case ResourceType.REPORT:
        return "Rapports";
      case ResourceType.SYSTEM:
        return "Système";
      default:
        return type;
    }
  };

  // Ouvrir la modal de révocation pour une permission spécifique
  const handleRevokePermission = (permission: PermissionDetails) => {
    setPermissionToRevoke(permission);
    setIsRevokeModalOpen(true);
  };

  // Ouvrir la modal de révocation pour toutes les permissions
  const handleRevokeAllDirectPermissions = () => {
    setPermissionToRevoke(undefined); // undefined = révoquer toutes
    setIsRevokeModalOpen(true);
  };

  // Fermer la modal de révocation
  const handleCloseRevokeModal = () => {
    setIsRevokeModalOpen(false);
    setPermissionToRevoke(undefined);
  };

  // Succès de révocation
  const handleRevokeSuccess = () => {
    refetch();
    handleCloseRevokeModal();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <AvePayLoader />
      </div>
    );
  }

  if (error || !userRolesPermissions) {
    return (
      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>Erreur lors du chargement des permissions</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Champ de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une permission, un code ou une description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12"
        />
      </div>
      
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-3xl font-bold text-primary">{userRolesPermissions.summary.totalRoles}</p>
          <p className="text-sm text-muted-foreground mt-1">Rôles assignés</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-3xl font-bold text-primary">{userRolesPermissions.summary.totalRolePermissions}</p>
          <p className="text-sm text-muted-foreground mt-1">Via rôles</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-3xl font-bold text-green-600">{userRolesPermissions.summary.totalPermanentDirectPermissions || 0}</p>
          <p className="text-sm text-muted-foreground mt-1">Directes</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-3xl font-bold text-orange-600">{userRolesPermissions.summary.totalTemporaryPermissions || 0}</p>
          <p className="text-sm text-muted-foreground mt-1">Temporaires</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-3xl font-bold text-primary">{userRolesPermissions.summary.totalPermissions}</p>
          <p className="text-sm text-muted-foreground mt-1">Total</p>
        </div>
      </div>

      {/* Tabs pour séparer les permissions */}
      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permissions via rôles
          </TabsTrigger>
          <TabsTrigger value="direct" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permissions directes & temporaires
          </TabsTrigger>
        </TabsList>

        {/* Tab Permissions via rôles */}
        <TabsContent value="roles" className="space-y-6 mt-6">
          {filteredData && filteredData.roles.length > 0 ? (
            filteredData.roles.length > 1 ? (
              // Plusieurs rôles : utiliser des accordions pour les rôles
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Accordion type="multiple" className="w-full">
                  {filteredData.roles.map((role) => (
                    <AccordionItem key={role.roleId} value={role.roleId} className="border-0 border-b last:border-b-0">
                      <AccordionTrigger className="hover:no-underline px-6 py-4 bg-gray-50/30 hover:bg-gray-100/50 transition-colors duration-200 cursor-pointer [&>svg]:cursor-pointer [&>svg]:hover:text-primary [&>svg]:transition-colors">
                        <div className="flex items-center justify-between w-full mr-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-left">
                              <h3 className="text-lg font-semibold">{role.roleName}</h3>
                              <p className="text-sm text-muted-foreground">{role.roleDescription}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {role.roleCode}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {role.roleStatus}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{role.modules.length} modules</p>
                            <p className="text-xs text-muted-foreground">
                              {role.modules.reduce((acc, module) => acc + module.permissions.length, 0)} permissions
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        {role.modules.length > 0 ? (
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <Accordion type="multiple" className="w-full">
                              {role.modules.map((module) => (
                                <AccordionItem key={module.moduleId} value={module.moduleId} className="border-0 border-b last:border-b-0">
                                  <AccordionTrigger className="hover:no-underline px-4 py-3 bg-gray-50/20 hover:bg-gray-100/40 transition-colors duration-200 cursor-pointer [&>svg]:cursor-pointer [&>svg]:hover:text-primary [&>svg]:transition-colors">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                                      <h4 className="font-semibold text-base">{module.moduleName}</h4>
                                      <span className="text-sm text-muted-foreground">({module.moduleCode})</span>
                                      <Badge variant="outline" className="text-xs ml-auto mr-4">
                                        {module.permissions.length} permissions
                                      </Badge>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="px-4 pb-4">
                                    {module.moduleDescription && (
                                      <p className="text-sm text-muted-foreground mb-4">{module.moduleDescription}</p>
                                    )}
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {module.permissions.map((permission) => (
                                        <div key={permission.permissionId} className="border rounded-lg p-3 bg-muted/20">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Eye className="h-4 w-4 text-primary" />
                                            <span className="font-medium text-sm">{permission.permissionName || permission.action}</span>
                                          </div>
                                          <p className="text-xs text-muted-foreground mb-1">
                                            Code: <span className="font-mono">{permission.permissionCode}</span>
                                          </p>
                                          {permission.permissionDescription && (
                                            <p className="text-xs text-muted-foreground">
                                              {permission.permissionDescription}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm">Aucun module associé à ce rôle</p>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : (
              // Un seul rôle : affichage direct sans accordion pour le rôle
              <div className="space-y-4">
                {filteredData.roles.map((role) => (
                  <div key={role.roleId} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{role.roleName}</h3>
                          <p className="text-sm text-muted-foreground">{role.roleDescription}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {role.roleCode}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {role.roleStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{role.modules.length} modules</p>
                        <p className="text-sm text-muted-foreground">
                          {role.modules.reduce((acc, module) => acc + module.permissions.length, 0)} permissions
                        </p>
                      </div>
                    </div>
                    
                    {role.modules.length > 0 ? (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <Accordion type="multiple" className="w-full">
                          {role.modules.map((module) => (
                            <AccordionItem key={module.moduleId} value={module.moduleId} className="border-0 border-b last:border-b-0">
                              <AccordionTrigger className="hover:no-underline px-4 py-3 bg-gray-50/20 hover:bg-gray-100/40 transition-colors duration-200 cursor-pointer [&>svg]:cursor-pointer [&>svg]:hover:text-primary [&>svg]:transition-colors">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                                  <h4 className="font-semibold text-base">{module.moduleName}</h4>
                                  <span className="text-sm text-muted-foreground">({module.moduleCode})</span>
                                  <Badge variant="outline" className="text-xs ml-auto mr-4">
                                    {module.permissions.length} permissions
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                {module.moduleDescription && (
                                  <p className="text-sm text-muted-foreground mb-4">{module.moduleDescription}</p>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {module.permissions.map((permission) => (
                                    <div key={permission.permissionId} className="border rounded-lg p-3 bg-muted/20">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Eye className="h-4 w-4 text-primary" />
                                        <span className="font-medium text-sm">{permission.permissionName || permission.action}</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground mb-1">
                                        Code: <span className="font-mono">{permission.permissionCode}</span>
                                      </p>
                                      {permission.permissionDescription && (
                                        <p className="text-xs text-muted-foreground">
                                          {permission.permissionDescription}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">Aucun module associé à ce rôle</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="border rounded-lg p-12 text-center">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? "Aucun résultat trouvé" : "Aucun rôle assigné"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm 
                  ? `Aucune permission de rôle ne correspond à "${searchTerm}"`
                  : "Cet utilisateur n'a aucun rôle assigné dans l'organisation"
                }
              </p>
            </div>
          )}
        </TabsContent>

        {/* Tab Permissions directes & temporaires */}
        <TabsContent value="direct" className="space-y-6 mt-6">
          {filteredData && filteredData.directPermissions.modules.length > 0 ? (
            <div className="space-y-4">
              {/* Header avec bouton révoquer toutes */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Permissions accordées</h3>
                  <p className="text-sm text-muted-foreground">
                    Permissions directes et temporaires actuellement assignées
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleRevokeAllDirectPermissions}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Révoquer toutes
                </Button>
              </div>
              
              {/* Affichage des permissions directes existantes */}
              <div className="border rounded-lg p-6 bg-orange-50/30">
                <div className="border border-orange-200 rounded-lg overflow-hidden">
                  <Accordion type="multiple" className="w-full">
                    {filteredData.directPermissions.modules.map((module) => (
                      <AccordionItem key={module.moduleId} value={module.moduleId} className="border-0 border-b border-orange-200 last:border-b-0">
                        <AccordionTrigger className="hover:no-underline px-4 py-3 bg-orange-50/30 hover:bg-orange-100/50 transition-colors duration-200 cursor-pointer [&>svg]:cursor-pointer [&>svg]:hover:text-orange-600 [&>svg]:transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <h4 className="font-semibold text-base">{module.moduleName}</h4>
                            <span className="text-sm text-muted-foreground">({module.moduleCode})</span>
                            <Badge variant="secondary" className="text-xs ml-auto mr-4 bg-orange-100 text-orange-800">
                              {module.permissions.length} permissions directes
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          {module.moduleDescription && (
                            <p className="text-sm text-muted-foreground mb-4">{module.moduleDescription}</p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {module.permissions.map((permission) => (
                              <div key={permission.permissionId} className="border border-orange-200 rounded-lg p-3 bg-orange-50/50">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Key className="h-4 w-4 text-orange-600" />
                                    <span className="font-medium text-sm">{permission.permissionName || permission.action}</span>
                                    {permission.permissionType && (
                                      <Badge 
                                        variant={permission.permissionType === 'TEMPORARY' ? 'secondary' : 'default'} 
                                        className="text-xs"
                                      >
                                        {permission.permissionType === 'TEMPORARY' ? 'Temporaire' : 'Direct'}
                                      </Badge>
                                    )}
                                    {permission.isExpired && (
                                      <Badge variant="destructive" className="text-xs">
                                        Expiré
                                      </Badge>
                                    )}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRevokePermission(permission)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Révoquer
                                  </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  Code: <span className="font-mono">{permission.permissionCode}</span>
                                </p>
                                {permission.permissionDescription && (
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {permission.permissionDescription}
                                  </p>
                                )}
                                
                                {/* Informations temporelles */}
                                {(permission.validFrom || permission.expiresAt || permission.grantedAt) && (
                                  <div className="pt-2 border-t border-orange-200 space-y-1">
                                    {permission.grantedAt && (
                                      <p className="text-xs text-muted-foreground">
                                        <span className="font-medium">Accordé le :</span> {new Date(permission.grantedAt).toLocaleDateString('fr-FR')} à {new Date(permission.grantedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        {permission.grantedByName && <span> par {permission.grantedByName}</span>}
                                      </p>
                                    )}
                                    {permission.validFrom && (
                                      <p className="text-xs text-muted-foreground">
                                        <span className="font-medium">Valide depuis :</span> {new Date(permission.validFrom).toLocaleDateString('fr-FR')} à {new Date(permission.validFrom).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    )}
                                    {permission.expiresAt && (
                                      <p className="text-xs text-muted-foreground">
                                        <span className="font-medium">Expire le :</span> {new Date(permission.expiresAt).toLocaleDateString('fr-FR')} à {new Date(permission.expiresAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    )}
                                  </div>
                                )}
                                
                                {permission.reason && (
                                  <div className="pt-2 border-t border-orange-200">
                                    <p className="text-xs font-medium text-orange-600 mb-1">Raison :</p>
                                    <p className="text-xs text-orange-700">{permission.reason}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>

              {/* Gestionnaire de permissions directes */}
              <DirectPermissionsManager
                user={user}
                onPermissionChange={() => refetch()}
                searchTerm={searchTerm}
                userDirectPermissions={
                  filteredData.directPermissions.modules.flatMap(module =>
                    module.permissions.map(permission => permission.permissionId)
                  )
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Gestionnaire de permissions directes */}
              <DirectPermissionsManager
                user={user}
                onPermissionChange={() => refetch()}
                searchTerm={searchTerm}
                userDirectPermissions={[]}
              />
              <div className="border rounded-lg p-12 text-center">
                <Key className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? "Aucun résultat trouvé" : "Aucune permission directe ou temporaire"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm 
                    ? `Aucune permission ne correspond à "${searchTerm}"`
                    : "Cet utilisateur n'a aucune permission accordée directement ou temporairement"
                  }
                </p>
              </div>


            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Message global si aucune permission */}
      {(!filteredData || (filteredData.roles.length === 0 && filteredData.directPermissions.modules.length === 0)) && (
        <div className="border rounded-lg p-12 text-center mt-6">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? "Aucun résultat trouvé" : "Aucune permission trouvée"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm 
              ? `Aucune permission ne correspond à "${searchTerm}"`
              : "Cet utilisateur n'a aucun rôle assigné ni permission directe dans le système"
            }
          </p>
        </div>
      )}

      {/* Modal de révocation */}
      <RevokePermissionModal
        isOpen={isRevokeModalOpen}
        onClose={handleCloseRevokeModal}
        user={user}
        permission={permissionToRevoke}
        onSuccess={handleRevokeSuccess}
      />
    </div>
  );
}