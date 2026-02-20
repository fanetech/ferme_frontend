"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  createSuperStructureColumns,
  SuperStructureDetailsModal,
  SuperStructureFormModal,
  SuperStructureDeleteDialog
} from "./components";
import { useSuperStructures } from "@/data/organization";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import type { SuperStructureSearchParams, FilterConfig, SuperStructure } from "@/types/organization";
import { ORGANIZATION_TYPES } from "@/lib/constants/organization-types";
import { PERMISSIONS } from "@/lib/constants";
import PermissionGate from "@/components/auth/permission-gate";

export default function SuperStructuresPage() {
  const router = useRouter();

  // États pour les filtres et la pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("ALL");
  const [organizationType, setOrganizationType] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"ASC" | "DESC">("DESC");

  // États pour les modales
  const [selectedSuperStructure, setSelectedSuperStructure] = useState<SuperStructure | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [superStructureToDelete, setSuperStructureToDelete] = useState<SuperStructure | null>(null);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Paramètres de recherche
  const searchParams: SuperStructureSearchParams = {
    page: currentPage - 1, // L'API commence à 0
    size: pageSize,
    searchTerm: debouncedSearchTerm || undefined,
    status: status === "ALL" ? undefined : status,
    organizationType: organizationType === "ALL" ? undefined : organizationType,
    sortBy,
    sortDir
  };

  // Requête des données
  const { data: response, isLoading, error } = useSuperStructures(searchParams);

  // Configuration des filtres
  const filters: FilterConfig[] = [
    {
      key: "status",
      label: "Statut",
      type: "select",
      options: [
        { value: "ACTIVE", label: "Actif" },
        { value: "INACTIVE", label: "Inactif" },
        { value: "PENDING", label: "En attente" },
        { value: "SUSPENDED", label: "Suspendu" }
      ],
      value: status,
      onChange: (value) => setStatus(value as string)
    },
    {
      key: "organizationType",
      label: "Type d'organisation",
      type: "select",
      options: ORGANIZATION_TYPES?.map((org) => ({
        value: org.code,
        label: `${org.icon} ${org.displayName}`
      })),
      value: organizationType,
      onChange: (value) => setOrganizationType(value as string)
    }
  ];

  // Actions sur les lignes
  const handleView = (superStructure: SuperStructure) => {
    setSelectedSuperStructure(superStructure);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (superStructure: SuperStructure) => {
    setSelectedSuperStructure(superStructure);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };

  const handleDelete = (superStructure: SuperStructure) => {
    if (superStructure) {
      setSuperStructureToDelete(superStructure);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleCreate = () => {
    setSelectedSuperStructure(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  // Colonnes du tableau
  const columns = createSuperStructureColumns({
    sortBy,
    sortDir,
    onSort: (field: string, direction: "ASC" | "DESC") => {
      setSortBy(field);
      setSortDir(direction);
    },
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete
  });

  return (
    <div className="space-y-4">
      {/* Header avec bouton Create */}
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Super Structures</h1>
        <PermissionGate
          permissions={[PERMISSIONS.ORGANIZATION.SUPERSTRUCTURE_CREATE]}
        >
          <Button onClick={handleCreate}>
            <PlusCircle /> Nouvelle Super Structure
          </Button>
        </PermissionGate>

      </div>

      {/* Tableau des données */}
      <div className="pt-4">
        <DataTable
          data={response?.content || []}
          columns={columns}
          totalElements={response?.totalElements || 0}
          totalPages={response?.totalPages || 0}
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
          searchPlaceholder="Rechercher par nom, code, email..."
          filters={filters}
          isLoading={isLoading}
          emptyMessage="Aucune super structure trouvée."
          defaultColumnVisibility={{
            contact: false,
            address: false,
            organizationType: false,
          }}
        />
      </div>

      {/* Modal de détails */}
      <SuperStructureDetailsModal
        superStructure={selectedSuperStructure}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedSuperStructure(null);
        }}
      />

      {/* Modal de formulaire */}
      <SuperStructureFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedSuperStructure(null);
        }}
        superStructure={selectedSuperStructure}
        mode={formMode}
      />

      {/* Dialog de suppression */}
      <SuperStructureDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSuperStructureToDelete(null);
        }}
        superStructure={superStructureToDelete}
      />
    </div>
  );
}