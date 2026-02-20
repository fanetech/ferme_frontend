"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { 
  createStructureColumns, 
  StructureDetailsModal,
  StructureFormModal,
  StructureDeleteDialog
} from "./components";
import { useStructures, useSuperStructuresForFilter } from "@/data/organization";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import type { StructureSearchParams, FilterConfig, Structure } from "@/types/organization";

export default function StructuresPage() {
  const router = useRouter();
  
  // États pour les filtres et la pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("ALL");
  const [superStructureId, setSuperStructureId] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');
  
  // États pour les modales
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [structureToDelete, setStructureToDelete] = useState<any>(null);
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Paramètres de recherche
  const searchParams: StructureSearchParams = {
    page: currentPage - 1, // L'API commence à 0
    size: pageSize,
    searchTerm: debouncedSearchTerm || undefined,
    status: status === "ALL" ? undefined : status,
    superStructureId: superStructureId === "ALL" ? undefined : superStructureId,
    sortBy,
    sortDir
  };
  
  // Requête des données
  const { data: response, isLoading, error } = useStructures(searchParams);
  
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
        { value: "INACTIVE", label: "Inactif" },
        { value: "PENDING", label: "En attente" },
        { value: "SUSPENDED", label: "Suspendu" }
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
  const handleView = (structure: Structure) => {
    setSelectedStructure(structure);
    setIsDetailsModalOpen(true);
  };
  
  const handleEdit = (structure: Structure) => {
    setSelectedStructure(structure);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };
  
  const handleDelete = (structure: Structure) => {
    if (structure) {
      setStructureToDelete(structure);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleCreate = () => {
    setSelectedStructure(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };
  
  // Colonnes du tableau
  const columns = createStructureColumns({
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
        <h1 className="text-2xl font-bold tracking-tight">Structures</h1>
        <Button onClick={handleCreate}>
          <PlusCircle /> Nouvelle Structure
        </Button>
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
          emptyMessage="Aucune structure trouvée."
          defaultColumnVisibility={{
            contact: false,
            address: false,
            totalCategories: false
          }}
        />
      </div>
      
      {/* Modal de détails */}
      <StructureDetailsModal
        structure={selectedStructure}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedStructure(null);
        }}
      />

      {/* Modal de formulaire */}
      <StructureFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedStructure(null);
        }}
        structure={selectedStructure}
        mode={formMode}
      />

      {/* Dialog de suppression */}
      <StructureDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setStructureToDelete(null);
        }}
        structure={structureToDelete}
      />
    </div>
  );
}