"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { 
  useUsers,
  useActivateUser,
  useDeactivateUser,
  useSuspendUser,
  useLockUser,
  useUnlockUser,
} from "@/data/users";
import { useRoles } from "@/data/roles";
import { useStructuresForFilter, useStructures, useSuperStructures } from "@/data/organization";
import type { User, UserSearchParams, UserStatus } from "@/types/users";
import type { FilterConfig } from "@/types/data-table";
import {
  SimpleUserFormModal,
  UserDetailsModal,
  UserDeleteDialog,
  createUserColumns
} from "./components";
import { UserActionConfirmDialog } from "./components/user-action-confirm-dialog";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import PermissionGate from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/constants";

export default function UsersPage() {
  const router = useRouter();
  
  // États pour les filtres et la pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // États pour les modales
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // États pour les actions de statut
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Paramètres de recherche
  const [searchParams, setSearchParams] = useState<UserSearchParams>({
    page: currentPage - 1, // L'API commence à 0
    size: pageSize,
    searchTerm: debouncedSearchTerm || undefined,
    userStatus: undefined,
    structureId: undefined,
    superStructureId: undefined,
    roleId: undefined,
    gender: undefined,
    sortBy: "createdAt",
    sortDir: "DESC"
  });
  
  // Synchroniser searchTerm avec searchParams
  useEffect(() => {
    setSearchParams(prev => ({
      ...prev,
      searchTerm: debouncedSearchTerm || undefined
    }));
  }, [debouncedSearchTerm]);

  // Requête des données
  const { data: usersData, isLoading, error } = useUsers(searchParams);
  
  // Récupération des structures pour le filtre
  const { data: structuresData } = useStructuresForFilter();
  
  // Requêtes pour les organisations et rôles
  const { data: structures } = useStructures(
    { 
      page: 0, 
      size: 1000,
      superStructureId: searchParams.superStructureId || undefined
    }
  );
  
  const { data: superStructures } = useSuperStructures(
    { page: 0, size: 1000 }
  );
  
  // Requête pour les rôles disponibles
  const { data: rolesData } = useRoles({ 
    page: 0, 
    size: 1000, 
    active: true 
  });
  
  // Hooks des mutations pour les actions de statut
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const suspendUser = useSuspendUser();
  const lockUser = useLockUser();
  const unlockUser = useUnlockUser();
  
  // Options pour SuperStructures
  const getSuperStructureOptions = () => {
    if (!superStructures?.content) return [];
    return superStructures.content.map((sup: any) => ({
      value: sup.id,
      label: `${sup.code} - ${sup.name}`
    }));
  };

  // Options pour Structures (dépendant de la SuperStructure sélectionnée)
  const getStructureOptions = () => {
    if (!structures?.content) return [];
    return structures.content.map((str: any) => ({
      value: str.id,
      label: `${str.code} - ${str.name}`
    }));
  };
  
  // Options pour les rôles
  const getRoleOptions = () => {
    console.log("🎭 Roles data:", rolesData);
    
    if (!rolesData) return [];
    
    try {
      // La structure de données pourrait être différente
      const roles = (rolesData as any)?.roles || rolesData || [];
      
      if (Array.isArray(roles)) {
        return roles.map((role: any) => ({
          value: role.id,
          label: role.displayName || role.name
        }));
      }
      
      return [];
    } catch (error) {
      console.error("Error mapping roles:", error);
      return [];
    }
  };
  
  // Gérer le changement de SuperStructure
  const handleSuperStructureChange = (value: string) => {
    setSearchParams({
      ...searchParams,
      superStructureId: value === "ALL" ? undefined : value,
      structureId: undefined, // Reset structure quand super structure change
      page: 0
    });
  };

  // Gérer le changement de Structure
  const handleStructureChange = (value: string) => {
    setSearchParams({
      ...searchParams,
      structureId: value === "ALL" ? undefined : value,
      page: 0
    });
  };

  //handleRoleChange
  const handleRoleChange = (value: string) => {
    setSearchParams({
      ...searchParams,
      roleId: value === "ALL" ? undefined : value,
      page: 0
    });
  };

  const handleUserStatusChange = (value: string) => {
    setSearchParams({
      ...searchParams,
      userStatus: value === "ALL" ? undefined : [value as UserStatus],
      page: 0 // Reset de la pagination
    });
  };


  // Configuration des filtres pour le DataTable
  const filters: FilterConfig[] = [
    {
      key: "userStatus",
      label: "Statut",
      type: "select",
      options: [
        { value: "ACTIVE", label: "Actif" },
        { value: "INACTIVE", label: "Inactif" },
        { value: "SUSPENDED", label: "Suspendu" },
        { value: "PENDING", label: "En attente" },
        { value: "LOCKED", label: "Bloqué" }
      ],
      value: searchParams.userStatus?.[0] || "ALL",
      onChange: handleUserStatusChange
    },
    {
      key: "superStructureId",
      label: "Super Structure",
      type: "select",
      options: getSuperStructureOptions(),
      value: searchParams.superStructureId || "ALL",
      onChange: handleSuperStructureChange
    },
    {
      key: "structureId", 
      label: "Structure",
      type: "select",
      options: getStructureOptions(),
      value: searchParams.structureId || "ALL", 
      onChange: handleStructureChange,
      disabled: !searchParams.superStructureId
    },
    {
      key: "roleId",
      label: "Rôle", 
      type: "select",
      options: getRoleOptions(),
      value: searchParams.roleId || "ALL",
      onChange: handleRoleChange
    }
  ];
  
  // Actions sur les lignes
  const handleView = (id: string) => {
    setSelectedUserId(id);
    setIsDetailsModalOpen(true);
  };
  
  const handleEdit = (id: string) => {
    setSelectedUserId(id);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };
  
  const handleDelete = (id: string) => {
    const user = usersData?.content?.find(u => u.id === id);
    if (user) {
      setUserToDelete(user);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleCreate = () => {
    setSelectedUserId(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  // Gestionnaires des actions de statut
  const handleStatusChange = (id: string, action: string) => {
    const user = usersData?.content?.find(u => u.id === id);
    if (user) {
      setSelectedUser(user);
      setSelectedAction(action);
      setIsActionDialogOpen(true);
    }
  };

  const handleAdvancedView = (id: string) => {
    router.push(`/dashboard/users/${id}`);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser || !selectedAction) return;

    try {
      switch (selectedAction) {
        case 'activate':
          await activateUser.mutateAsync(selectedUser.id);
          break;
        case 'deactivate':
          await deactivateUser.mutateAsync(selectedUser.id);
          break;
        case 'suspend':
          await suspendUser.mutateAsync({ id: selectedUser.id });
          break;
        case 'lock':
          await lockUser.mutateAsync({ id: selectedUser.id });
          break;
        case 'unlock':
          await unlockUser.mutateAsync(selectedUser.id);
          break;
        default:
          break;
      }
      
      // Fermer la modal de confirmation
      setIsActionDialogOpen(false);
      setSelectedUser(null);
      setSelectedAction("");
      
    } catch (error) {
      // L'erreur est gérée par les hooks, pas besoin de traitement supplémentaire
      console.error('Action failed:', error);
    }
  };
  
  // Colonnes du tableau
  const columns = createUserColumns({
    sortBy: searchParams.sortBy!,
    sortDir: searchParams.sortDir!,
    onSort: (field: string, direction: 'ASC' | 'DESC') => {
      setSearchParams({
        ...searchParams,
        sortBy: field,
        sortDir: direction
      });
    },
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onStatusChange: handleStatusChange,
    onAdvancedView: handleAdvancedView
  });

  return (
    <div className="space-y-4">
      {/* Header avec bouton Create */}
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6" />
          Utilisateurs
        </h1>
        <PermissionGate
          permissions={[PERMISSIONS.USER.USER_CREATE]}
        >
          <Button onClick={handleCreate}>
            <PlusCircle /> Nouvel Utilisateur
          </Button>
        </PermissionGate>
      </div>
      
      {/* Tableau des données */}
      <div className="pt-4">
        <DataTable
          data={usersData?.content || []}
          columns={columns}
          totalElements={usersData?.totalElements || 0}
          totalPages={usersData?.totalPages || 0}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(newPage) => {
            setCurrentPage(newPage);
            setSearchParams({
              ...searchParams,
              page: newPage - 1
            });
          }}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
            setSearchParams({
              ...searchParams,
              size: newSize,
              page: 0
            });
          }}
          sortBy={searchParams.sortBy}
          sortDir={searchParams.sortDir}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher par nom, email, téléphone..."
          filters={filters}
          isLoading={isLoading}
          emptyMessage="Aucun utilisateur trouvé."
          defaultColumnVisibility={{
            phoneNumber: false,
            structureName: false
          }}
        />
      </div>
      
      {/* Modal de détails */}
      <UserDetailsModal
        userId={selectedUserId}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedUserId(null);
        }}
        onStatusChange={handleStatusChange}
        onAdvancedView={handleAdvancedView}
      />

      {/* Modal de formulaire simplifié */}
      <SimpleUserFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId!}
        mode={formMode}
      />

      {/* Dialog de suppression */}
      <UserDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        user={userToDelete}
      />

      {/* Dialog de confirmation d'action */}
      <UserActionConfirmDialog
        isOpen={isActionDialogOpen}
        onClose={() => {
          setIsActionDialogOpen(false);
          setSelectedUser(null);
          setSelectedAction("");
        }}
        onConfirm={handleConfirmAction}
        user={selectedUser}
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