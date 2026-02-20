"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

import { useRoles } from "@/data/roles";
import type { RoleSearchParams } from "@/types/roles";
import type { FilterConfig } from "@/types/data-table";
import { createRoleColumns } from "./components/role-columns";
import { useDebounce } from "@/hooks/useDebounce";
import { RoleFormModal } from "./components/role-form-modal";
import { DeleteRoleModal } from "./components/delete-role-modal";
import { useQueryClient } from "@tanstack/react-query";
import { useStructures, useSuperStructures } from "@/data/organization";
import PermissionGate from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/constants";

export default function RolesPage() {
  const router = useRouter();
  
  // États pour les filtres et la pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [roleType, setRoleType] = useState("ALL");
  const [roleStatus, setRoleStatus] = useState("ALL");
  const [ownerType, setOwnerType] = useState("ALL");
  const [ownerId, setOwnerId] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("displayName");
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');
  
  // États pour les modals
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleModalMode, setRoleModalMode] = useState<'create' | 'edit'>('create');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  
  // React Query client pour invalider les données
  const queryClient = useQueryClient();
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Requêtes pour les organisations (conditionnelles)
  const { data: structures } = useStructures(
    { page: 0, size: 1000 }, 
  );
  
  const { data: superStructures } = useSuperStructures(
    { page: 0, size: 1000 },
  );
  
  // Paramètres de recherche
  const searchParams: RoleSearchParams = {
    page: currentPage - 1, // L'API commence à 0
    size: pageSize,
    search: debouncedSearchTerm || undefined,
    type: roleType === "ALL" ? undefined : roleType as "SYSTEM" | "CUSTOM",
    active: roleStatus === "ALL" ? undefined : roleStatus === "ACTIVE",
    ownerType: ownerType === "ALL" ? undefined : ownerType as "STRUCTURE" | "SUPER_STRUCTURE",
    ownerId: ownerId === "ALL" ? undefined : ownerId,
    sortBy,
    sortDir
  };
  
  // Requête des données
  const { data: rolesData, isLoading, error } = useRoles(searchParams);
  
  // Options d'organisations dynamiques
  const getOrganizationOptions = () => {
    let options: { value: string; label: string }[] = [];
    
    if (ownerType === "STRUCTURE" && structures?.content) {
      options = structures.content.map((str: any) => ({
        value: str.id,
        label: `${str.code} - ${str.name}`
      }));
    } else if (ownerType === "SUPER_STRUCTURE" && superStructures?.content) {
      options = superStructures.content.map((sup: any) => ({
        value: sup.id,
        label: `${sup.code} - ${sup.name}`
      }));
    }
    
    return options;
  };
  
  // Réinitialiser ownerId quand ownerType change
  const handleOwnerTypeChange = (value: string) => {
    setOwnerType(value);
    setOwnerId("ALL"); // Reset de l'organisation sélectionnée
    setCurrentPage(1); // Reset de la pagination
  };
  
  // Configuration des filtres
  const filters: FilterConfig[] = [
    {
      key: "roleType",
      label: "Type de rôle",
      type: "select",
      options: [
        { value: "SYSTEM", label: "Système" },
        { value: "CUSTOM", label: "Personnalisé" }
      ],
      value: roleType,
      onChange: (value) => setRoleType(value as string)
    },
    {
      key: "roleStatus",
      label: "Statut",
      type: "select",
      options: [
        { value: "ACTIVE", label: "Actif" },
        { value: "INACTIVE", label: "Inactif" }
      ],
      value: roleStatus,
      onChange: (value) => setRoleStatus(value as string)
    },
    {
      key: "ownerType",
      label: "Type d'organisation",
      type: "select",
      options: [
        { value: "STRUCTURE", label: "Structure" },
        { value: "SUPER_STRUCTURE", label: "Super Structure" }
      ],
      value: ownerType,
      onChange: handleOwnerTypeChange
    },
    {
      key: "ownerId",
      label: "Organisation",
      type: "select",
      options: getOrganizationOptions(),
      value: ownerId,
      onChange: (value) => setOwnerId(value as string),
      disabled: ownerType === "ALL"
    }
  ];
  
  // Actions sur les lignes
  const handleView = (id: string) => {
    router.push(`/dashboard/users/roles/${id}/details`);
  };
  
  const handleEdit = (id: string) => {
    setSelectedRoleId(id);
    setRoleModalMode('edit');
    setRoleModalOpen(true);
  };
  
  const handleDelete = (id: string) => {
    setSelectedRoleId(id);
    setDeleteModalOpen(true);
  };

  const handleDuplicate = (id: string) => {
    // Fonction supprimée - duplication abandonnée
    console.log("Duplication supprimée");
  };

  const handleConfigure = (id: string) => {
    router.push(`/dashboard/users/roles/${id}`);
  };

  const handleCreate = () => {
    setSelectedRoleId(null);
    setRoleModalMode('create');
    setRoleModalOpen(true);
  };
  
  // Colonnes du tableau
  const columns = createRoleColumns({
    sortBy,
    sortDir,
    onSort: (field: string, direction: 'ASC' | 'DESC') => {
      setSortBy(field);
      setSortDir(direction);
    },
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onConfigure: handleConfigure
  });

  return (
    <div className="space-y-4">
      {/* Header avec bouton Create */}
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-500" />
          Rôles et permissions
        </h1>
        <PermissionGate permissions={[PERMISSIONS.AUTH.ROLE_CREATE]}>
          <Button onClick={handleCreate}>
            <PlusCircle /> Nouveau rôle
          </Button>
        </PermissionGate>
      </div>
      
      {/* Tableau des données */}
      <div className="pt-4">
        <DataTable
          data={rolesData?.roles || []}
          columns={columns}
          totalElements={rolesData?.totalElements || 0}
          totalPages={rolesData?.totalPages || 0}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1); // Reset to first page
          }}
          sortBy={sortBy}
          sortDir={sortDir}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher un rôle..."
          filters={filters}
          isLoading={isLoading}
          emptyMessage="Aucun rôle trouvé."
          defaultColumnVisibility={{
            // Toutes les colonnes visibles par défaut
          }}
        />
      </div>

      {/* Modals */}
      <RoleFormModal
        isOpen={roleModalOpen}
        onClose={() => {
          setRoleModalOpen(false);
          setSelectedRoleId(null);
        }}
        mode={roleModalMode}
        roleId={selectedRoleId || undefined}
        onSuccess={(roleId) => {
          // Invalider les données pour recharger la liste
          queryClient.invalidateQueries({ queryKey: ['roles'] });
          
          if (roleModalMode === 'create' && roleId) {
            // Rediriger vers la configuration du nouveau rôle
            router.push(`/dashboard/users/roles/${roleId}`);
          }
        }}
      />
      
      <DeleteRoleModal
        roleId={selectedRoleId}
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedRoleId(null);
        }}
        onSuccess={() => {
          // Invalider les données pour recharger la liste
          queryClient.invalidateQueries({ queryKey: ['roles'] });
        }}
      />
    </div>
  );
}