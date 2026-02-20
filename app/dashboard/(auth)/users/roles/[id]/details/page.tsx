"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  ArrowLeft, 
  Edit, 
  Copy, 
  Trash2,
  Settings,
  Key,
  Users,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  Building
} from "lucide-react";

import { useRole, useRolePermissions, useRoleUsers } from "@/data/roles";
import AvePayLoader from "@/components/avepay-loader";
import { RoleFormModal } from "../../components/role-form-modal";
import { DeleteRoleModal } from "../../components/delete-role-modal";
import { useQueryClient } from "@tanstack/react-query";

export default function RoleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params.id as string;
  
  // États pour les modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // React Query client pour invalider les données
  const queryClient = useQueryClient();
  
  const { data: role, isLoading: roleLoading, error: roleError } = useRole(roleId);
  const { data: rolePermissionsData, isLoading: permissionsLoading } = useRolePermissions(roleId);
  const { data: roleUsersData, isLoading: usersLoading } = useRoleUsers(roleId, 0, 5);

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

  const isLoading = roleLoading || permissionsLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Détails du rôle</h1>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <AvePayLoader />
        </div>
      </div>
    );
  }

  if (roleError || !role) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
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
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-purple-500" />
              {role.displayName}
            </h1>
            <p className="text-muted-foreground">
              Détails du rôle • {role.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/users/roles/${roleId}`)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurer
          </Button>
          {role.canBeDeleted && (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Éditer
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Informations principales - Nouvelle disposition */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Informations générales - Prend plus d'espace */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium">{role.displayName}</h3>
                    {getRoleTypeBadge(role.type)}
                    {getStatusBadge(role.isActive ? "ACTIVE" : "INACTIVE")}
                  </div>
                  <p className="text-sm text-muted-foreground">{role.name}</p>
                </div>
              </div>
              
              {role.description && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Niveau hiérarchique:</span>
                    <span className="font-medium">{role.level}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Utilisateurs:</span>
                    <span className="font-medium">{role.userCount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Permissions:</span>
                    <span className="font-medium">{role.permissionCount}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Créé le:</span>
                    <span className="font-medium">
                      {role.createdAt ? new Date(role.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                    </span>
                  </div>
                  {/* Rôles SYSTEM = toujours globaux */}
                  {role.type === "SYSTEM" && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Portée:</span>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          Système
                        </Badge>
                        <span className="font-medium text-purple-600">Global</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Rôles CUSTOM = doivent avoir un propriétaire */}
                  {role.type === "CUSTOM" && role.ownerCode && role.ownerType && (
                    <div className="flex items-center gap-2 text-sm">
                      {role.ownerType === "STRUCTURE" ? (
                        <Building className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-muted-foreground">Organisation:</span>
                      <div className="flex items-center gap-1">
                        <Badge variant={role.ownerType === "STRUCTURE" ? "default" : "secondary"} className="text-xs">
                          {role.ownerType === "STRUCTURE" ? "Structure" : "Super Structure"}
                        </Badge>
                        <span className="font-medium">{role.ownerCode}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Rôles CUSTOM sans propriétaire = erreur */}
                  {role.type === "CUSTOM" && (!role.ownerCode || !role.ownerType) && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-red-500" />
                      <span className="text-muted-foreground">Organisation:</span>
                      <div className="flex items-center gap-1">
                        <Badge variant="destructive" className="text-xs">
                          Erreur
                        </Badge>
                        <span className="font-medium text-red-600">Non définie</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {role.ownerName && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-1">Organisation propriétaire</h4>
                    <p className="text-sm text-muted-foreground">{role.ownerName}</p>
                  </div>
                </>
              )}

              {(role.createdBy || role.lastModifiedAt) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                    {role.createdBy && (
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>Créé par: {role.createdBy}</span>
                      </div>
                    )}
                    {role.lastModifiedAt && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>Modifié le: {new Date(role.lastModifiedAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statut et actions rapides - Colonne latérale */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/dashboard/users/roles/${roleId}`)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurer permissions
                </Button>
                
                {role.canBeDeleted && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setEditModalOpen(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier le rôle
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteModalOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer le rôle
                    </Button>
                  </>
                )}
              </div>
              
              <Separator />
              
              {/* Informations de statut */}
              <div className="space-y-3">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Statut</span>
                  <div className="flex items-center gap-2">
                    {role.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    {getStatusBadge(role.isActive ? "ACTIVE" : "INACTIVE")}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Suppression</span>
                  <Badge variant={role.canBeDeleted ? "default" : "secondary"} className="w-fit">
                    {role.canBeDeleted ? "Autorisée" : "Interdite"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Permissions */}
      <div className="grid grid-cols-1 gap-6">
        {/* Aperçu des permissions */}
        {rolePermissionsData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Permissions ({rolePermissionsData.summary.totalPermissions})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Modules avec permissions</h4>
                <div className="space-y-1">
                  {rolePermissionsData.modules.slice(0, 5).map((module) => (
                    <div key={module.moduleId} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{module.moduleName}</span>
                      <span className="font-medium">{module.permissions.length}</span>
                    </div>
                  ))}
                  {rolePermissionsData.modules.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center pt-1">
                      ... et {rolePermissionsData.modules.length - 5} autres modules
                    </div>
                  )}
                </div>
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => router.push(`/dashboard/users/roles/${roleId}`)}
              >
                Voir toutes les permissions
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

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