"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { 
  createServiceProductColumns, 
  ServiceProductDetailsModal,
  ServiceProductDeleteDialog
} from "./components";
import { useServicesProducts } from "@/data/catalog";
import { useStructuresForFilter, useCategoriesForFilter } from "@/data/organization";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import type { ServiceProductSearchParams } from "@/types/catalog";
import type { FilterConfig } from "@/types/data-table";
import { ServiceNature } from "@/types/catalog";

export default function ServicesProductsPage() {
  const router = useRouter();
  
  // États pour les filtres et la pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("ALL");
  const [structureId, setStructureId] = useState("ALL");
  const [categoryId, setCategoryId] = useState("ALL");
  const [serviceNature, setServiceNature] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("displayOrder");
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('ASC');
  
  const [selectedServiceProductId, setSelectedServiceProductId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceProductToDelete, setServiceProductToDelete] = useState<any>(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Paramètres de recherche
  const searchParams: ServiceProductSearchParams = {
    page: currentPage - 1, // L'API commence à 0
    size: pageSize,
    searchTerm: debouncedSearchTerm || undefined,
    status: status === "ALL" ? undefined : status,
    structureId: structureId === "ALL" ? undefined : structureId,
    categoryId: categoryId === "ALL" ? undefined : categoryId,
    serviceNatures: serviceNature === "ALL" ? undefined : [serviceNature as ServiceNature],
    sortBy,
    sortDir
  };
  
  // Requête des données
  const { data: response, isLoading, error } = useServicesProducts(searchParams);
  
  // Récupération des données pour les filtres
  const { data: structuresData } = useStructuresForFilter();
  const { data: categoriesData } = useCategoriesForFilter();
  
  // Configuration des filtres
  const filters: FilterConfig[] = [
    {
      key: "status",
      label: "Statut",
      type: "select",
      options: [
        { value: "ACTIVE", label: "Actif" },
        { value: "INACTIVE", label: "Inactif" },
        { value: "SUSPENDED", label: "Suspendu" },
        { value: "OUT_OF_STOCK", label: "Rupture de stock" }
      ],
      value: status,
      onChange: (value) => setStatus(value as string)
    },
    {
      key: "serviceNature",
      label: "Type",
      type: "select",
      options: [
        { value: ServiceNature.PRODUCT, label: "Produit" },
        { value: ServiceNature.INTERNAL_SERVICE, label: "Service interne" },
        { value: ServiceNature.EXTERNAL_SERVICE, label: "Service externe" }
      ],
      value: serviceNature,
      onChange: (value) => setServiceNature(value as string)
    },
    {
      key: "structureId",
      label: "Structure",
      type: "select",
      options: structuresData?.content?.map(structure => ({
        value: structure.id,
        label: `${structure.code} - ${structure.name}`
      })) || [],
      value: structureId,
      onChange: (value) => setStructureId(value as string)
    },
    {
      key: "categoryId",
      label: "Catégorie",
      type: "select",
      options: categoriesData?.content?.map(category => ({
        value: category.id,
        label: `${category.code} - ${category.name}`
      })) || [],
      value: categoryId,
      onChange: (value) => setCategoryId(value as string)
    }
  ];
  
  // Actions sur les lignes
  const handleView = (id: string) => {
    setSelectedServiceProductId(id);
    setIsDetailsModalOpen(true);
  };
  
  const handleEdit = (id: string) => {
    router.push(`/dashboard/catalog/services-products/${id}/edit`);
  };
  
  const handleDelete = (id: string) => {
    const serviceProduct = response?.content?.find(sp => sp.id === id);
    if (serviceProduct) {
      setServiceProductToDelete(serviceProduct);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleCreate = () => {
    router.push('/dashboard/catalog/services-products/create');
  };

  const handleConfig = (id: string) => {
    router.push(`/dashboard/catalog/services-products/${id}/config`);
  };

  const handleDuplicate = (id: string) => {
    router.push(`/dashboard/catalog/services-products/create?duplicateFrom=${id}`);
  };
  
  // Colonnes du tableau
  const columns = createServiceProductColumns({
    sortBy,
    sortDir,
    onSort: (field: string, direction: 'ASC' | 'DESC') => {
      setSortBy(field);
      setSortDir(direction);
    },
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onConfig: handleConfig,
    onDuplicate: handleDuplicate
  });
  
  return (
    <div className="space-y-4">
      {/* Header avec bouton Create */}
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Services & Produits</h1>
        <Button onClick={handleCreate}>
          <PlusCircle /> Nouveau Service/Produit
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
          searchPlaceholder="Rechercher par nom, code, description..."
          filters={filters}
          isLoading={isLoading}
          emptyMessage="Aucun service ou produit trouvé."
          defaultColumnVisibility={{
            description: false,
            stockQuantity: false,
            taxRate: false,
            currency: false
          }}
        />
      </div>
      
      {/* Modal de détails */}
      <ServiceProductDetailsModal
        serviceProductId={selectedServiceProductId}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedServiceProductId(null);
        }}
      />


      {/* Dialog de suppression */}
      <ServiceProductDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setServiceProductToDelete(null);
        }}
        serviceProduct={serviceProductToDelete}
      />
    </div>
  );
}