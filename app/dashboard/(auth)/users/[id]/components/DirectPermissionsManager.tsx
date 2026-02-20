"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Shield, 
  Key, 
  Search,
  Plus,
  Minus,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/types/users";
import type { ModulePermissionsResponse, PermissionSummary } from "@/types/module-permissions";
import { AssignPermissionModal } from "./AssignPermissionModal";
import { RevokePermissionModal } from "./RevokePermissionModal";
import client from "@/data/client";

interface DirectPermissionsManagerProps {
  user: User;
  onPermissionChange?: () => void;
  searchTerm: string;
  userDirectPermissions?: string[]; // Liste des IDs des permissions directes déjà assignées
}

export function DirectPermissionsManager({
  user,
  onPermissionChange,
  searchTerm,
  userDirectPermissions = []
}: DirectPermissionsManagerProps) {
  const [modules, setModules] = useState<ModulePermissionsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<PermissionSummary | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [permissionToRevoke, setPermissionToRevoke] = useState<PermissionSummary | null>(null);

  // Récupérer les modules avec permissions au chargement
  useEffect(() => {
    if (isVisible && modules.length === 0) {
      fetchModulesWithPermissions();
    }
  }, [isVisible]);

  const fetchModulesWithPermissions = async () => {
    try {
      setIsLoading(true);
      const response = await client.auth.modules.getWithPermissions(true);
      setModules(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des modules:', error);
      toast.error("Erreur lors du chargement des modules");
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si une permission est assignée à l'utilisateur
  const isPermissionAssigned = (permissionId: string): boolean => {
    return userDirectPermissions.includes(permissionId);
  };

  // Ouvrir la modal de révocation
  const handleUnassignPermission = (permission: PermissionSummary) => {
    setPermissionToRevoke(permission);
    setIsRevokeModalOpen(true);
  };

  // Ouvrir la modal d'assignation
  const handleAssignPermission = (permission: PermissionSummary) => {
    setSelectedPermission(permission);
    setIsAssignModalOpen(true);
  };

  // Fermer la modal d'assignation
  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedPermission(null);
  };

  // Fermer la modal de révocation
  const handleCloseRevokeModal = () => {
    setIsRevokeModalOpen(false);
    setPermissionToRevoke(null);
  };

  // Succès de la révocation
  const handleRevokeSuccess = () => {
    onPermissionChange?.();
    handleCloseRevokeModal();
  };

  // Succès de l'assignation
  const handleAssignSuccess = () => {
    onPermissionChange?.();
    handleCloseAssignModal();
  };

  // Filtrer les modules et permissions selon la recherche
  const filteredModules = modules.filter(module => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const moduleMatch = 
      module.moduleName.toLowerCase().includes(searchLower) ||
      module.moduleCode.toLowerCase().includes(searchLower) ||
      module.moduleDescription?.toLowerCase().includes(searchLower);
    
    const permissionMatch = module.permissions.some(permission =>
      permission.name.toLowerCase().includes(searchLower) ||
      permission.code.toLowerCase().includes(searchLower) ||
      permission.description?.toLowerCase().includes(searchLower)
    );
    
    return moduleMatch || permissionMatch;
  }).map(module => ({
    ...module,
    permissions: module.permissions.filter(permission => {
      if (!searchTerm.trim()) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        permission.name.toLowerCase().includes(searchLower) ||
        permission.code.toLowerCase().includes(searchLower) ||
        permission.description?.toLowerCase().includes(searchLower)
      );
    })
  })).filter(module => module.permissions.length > 0);

  if (!isVisible) {
    return (
      <div className="border rounded-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">Gestion des permissions</h3>
              <p className="text-sm text-muted-foreground">
                Assignez ou retirez des permissions directes ou temporaires à cet utilisateur
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsVisible(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Assigner une permission
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header avec bouton de masquage */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Gestion des permissions</h3>
        </div>
        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <EyeOff className="h-4 w-4" />
          Masquer
        </Button>
      </div>

      {/* Liste des modules avec permissions */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8 border rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredModules.length > 0 ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <Accordion type="multiple" className="w-full">
            {filteredModules.map((module) => (
              <AccordionItem key={module.moduleId} value={module.moduleId} className="border-0 border-b last:border-b-0">
                <AccordionTrigger className="hover:no-underline px-4 py-3 bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200 cursor-pointer [&>svg]:cursor-pointer [&>svg]:hover:text-primary [&>svg]:transition-colors">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{module.moduleName}</span>
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
                  
                  <div className="space-y-3">
                    {module.permissions.map((permission) => {
                      const isAssigned = isPermissionAssigned(permission.id);

                      return (
                        <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Key className="h-4 w-4 text-primary" />
                              <span className="font-medium text-sm">{permission.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {permission.action}
                              </Badge>
                              {permission.isSystem && (
                                <Badge variant="secondary" className="text-xs">
                                  Système
                                </Badge>
                              )}
                              {isAssigned && (
                                <Badge variant="default" className="text-xs bg-green-600">
                                  Assignée
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Code: <span className="font-mono">{permission.code}</span>
                            </p>
                            {permission.description && (
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="ml-4 flex items-center gap-2">
                            {isAssigned ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleUnassignPermission(permission)}
                                disabled={isLoading}
                                className="flex items-center gap-1"
                              >
                                <Minus className="h-3 w-3" />
                                Désassigner
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleAssignPermission(permission)}
                                disabled={isLoading}
                                className="flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" />
                                Assigner
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">
            {searchTerm ? `Aucun résultat pour "${searchTerm}"` : "Aucun module disponible"}
          </p>
        </div>
      )}

      {/* Modal d'assignation de permission */}
      {selectedPermission && (
        <AssignPermissionModal
          isOpen={isAssignModalOpen}
          onClose={handleCloseAssignModal}
          user={user}
          permission={selectedPermission}
          onSuccess={handleAssignSuccess}
        />
      )}

      {/* Modal de révocation de permission */}
      {permissionToRevoke && (
        <RevokePermissionModal
          isOpen={isRevokeModalOpen}
          onClose={handleCloseRevokeModal}
          user={user}
          permission={{
            permissionId: permissionToRevoke.id,
            permissionCode: permissionToRevoke.code,
            permissionName: permissionToRevoke.name,
            permissionDescription: permissionToRevoke.description,
            action: permissionToRevoke.action,
            displayOrder: permissionToRevoke.displayOrder,
            isSystem: permissionToRevoke.isSystem
          }}
          onSuccess={handleRevokeSuccess}
        />
      )}
    </div>
  );
}