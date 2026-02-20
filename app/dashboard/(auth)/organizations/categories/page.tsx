"use client";

import { useState } from "react";
import { PlusCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { 
  useCategories, 
  useSuperStructuresForFilter,
} from "@/data/organization";
import type { Category, CategorySearchParams, FilterConfig } from "@/types/organization";
import {
  createCategoryColumns,
  CategoryModalsManager,
} from "./components";
import { useDebounce } from "@/hooks/useDebounce";
import PermissionGate from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/constants";
import { useCategoryModals } from "./hooks/useCategoryModals";

export default function CategoriesPage() {
  // États pour les filtres et la pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("ALL");
  const [superStructureId, setSuperStructureId] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');
  
  // Modal management
  const {
    modals,
    closeModal,
    openDetailsModal,
    openFormModal,
    openDeleteModal,
  } = useCategoryModals();
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Paramètres de recherche
  const searchParams: CategorySearchParams = {
    page: currentPage - 1, // L'API commence à 0
    size: pageSize,
    searchTerm: debouncedSearchTerm || undefined,
    status: status === "ALL" ? undefined : status,
    superStructureId: superStructureId === "ALL" ? undefined : superStructureId,
    sortBy,
    sortDir
  };
  
  // Requête des données
  const { data: categoriesData, isLoading, error } = useCategories(searchParams);
  
  // Récupération des super structures pour le filtre
  const { data: superStructuresData } = useSuperStructuresForFilter();
  
  // Configuration des filtres
  const filters: FilterConfig[] = [
    {
      key: "status",
      label: "Statut",
      type: "select",
      options: [
        { value: "ACTIVE", label: "Actif" },
        { value: "INACTIVE", label: "Inactif" }
      ],
      value: status,
      onChange: (value) => setStatus(value as string)
    },
    {
      key: "superStructureId",
      label: "Super Structure",
      type: "select",
      options: superStructuresData?.content?.map(ss => ({
        value: ss.id,
        label: `${ss.code} - ${ss.name}`
      })) || [],
      value: superStructureId,
      onChange: (value) => setSuperStructureId(value as string)
    }
  ];
  
  // Actions sur les lignes
  const handleView = (category: Category) => {
    if (category) {
      openDetailsModal(category);
    }
  };
  
  const handleEdit = (category: Category) => {
    if (category) {
      openFormModal("edit", category);
    }
  };
  
  const handleDelete = (category: Category) => {
    if (category) {
      openDeleteModal(category);
    }
  };

  const handleCreate = () => {
    openFormModal("create");
  };
  
  // Colonnes du tableau
  const columns = createCategoryColumns({
    sortBy,
    sortDir,
    onSort: (field: string, direction: 'ASC' | 'DESC') => {
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
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Tag className="h-6 w-6" />
          Catégories
        </h1>
        <PermissionGate permissions={[PERMISSIONS.ORGANIZATION.CATEGORY_CREATE]}>
          <Button onClick={handleCreate}>
            <PlusCircle /> Nouvelle Catégorie
          </Button>
        </PermissionGate>
      </div>
      
      {/* Tableau des données */}
      <div className="pt-4">
        <DataTable
          data={categoriesData?.content || []}
          columns={columns}
          totalElements={categoriesData?.totalElements || 0}
          totalPages={categoriesData?.totalPages || 0}
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
          searchPlaceholder="Rechercher par nom, code, description..."
          filters={filters}
          isLoading={isLoading}
          emptyMessage="Aucune catégorie trouvée."
          defaultColumnVisibility={{
            description: false,
            displayOrder: false
          }}
        />
      </div>
      
      {/* Modals Manager */}
      <CategoryModalsManager
        modals={modals}
        closeModal={closeModal}
      />
    </div>
  );
}