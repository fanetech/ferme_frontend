"use client";

import { useState, useEffect } from "react";
import { Edit, PlusCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { 
  useClients,
  useChangeClientStatus,
  useEnrollInLoyalty
} from "@/data/clients";
import { useStructuresForFilter, useStructures, useSuperStructures } from "@/data/organization";
import type { Client, ClientResponse, ClientSearchParams, ClientStatus, ClientType } from "@/types/clients";
import type { FilterConfig } from "@/types/data-table";
import {
  ClientFormModal,
  ClientDetailsModal,
  ClientDeleteDialog,
  createClientColumns,
  ClientActionConfirmDialog
} from "./components";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import PermissionGate from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/constants";

export default function ClientsPage() {
  const router = useRouter();
  
  // États pour les filtres et la pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // États pour les modales
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientResponse | null>(null);
  
  // États pour les actions de statut
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>("");
  const [selectedClientForStatus, setSelectedClientForStatus] = useState<ClientResponse | null>(null);
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  // Paramètres de recherche
  const [searchParams, setSearchParams] = useState<ClientSearchParams>({
    page: currentPage - 1, // L'API commence à 0
    size: pageSize,
    searchTerm: debouncedSearchTerm || undefined,
    status: undefined,
    type: undefined,
    city: undefined,
    country: undefined,
    organizationId: undefined,
    organizationType: undefined,
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
  const { data: clientsData, isLoading, error } = useClients(searchParams);
  
  // Récupération des structures pour le filtre
  const { data: structuresData } = useStructuresForFilter();
  
  // Requêtes pour les organisations
  const { data: structures } = useStructures(
    { 
      page: 0, 
      size: 1000,
      superStructureId: searchParams.organizationType === "SUPER_STRUCTURE" ? searchParams.organizationId : undefined
    }
  );
  
  const { data: superStructures } = useSuperStructures(
    { page: 0, size: 1000 }
  );
  
  // Hooks des mutations pour les actions
  const changeClientStatus = useChangeClientStatus();
  const enrollInLoyalty = useEnrollInLoyalty();
  
  // Options pour SuperStructures
  const getSuperStructureOptions = () => {
    if (!superStructures?.content) return [];
    return superStructures.content.map((sup: any) => ({
      value: sup.id,
      label: `${sup.code} - ${sup.name}`
    }));
  };

  // Options pour Structures
  const getStructureOptions = () => {
    if (!structures?.content) return [];
    return structures.content.map((str: any) => ({
      value: str.id,
      label: `${str.code} - ${str.name}`
    }));
  };

  // Gérer le changement de type de client
  const handleClientTypeChange = (value: string) => {
    setSearchParams({
      ...searchParams,
      type: value === "ALL" ? undefined : [value as ClientType],
      page: 0
    });
  };

  // Gérer le changement de statut
  const handleClientStatusChange = (value: string) => {
    setSearchParams({
      ...searchParams,
      status: value === "ALL" ? undefined : [value as ClientStatus],
      page: 0
    });
  };

  // Gérer le changement de super structure
  const handleSuperStructureChange = (value: string) => {
    setSearchParams({
      ...searchParams,
      organizationId: value === "ALL" ? undefined : value,
      organizationType: value === "ALL" ? undefined : "SUPER_STRUCTURE",
      page: 0
    });
  };

  // Gérer le changement de structure
  const handleStructureChange = (value: string) => {
    setSearchParams({
      ...searchParams,
      organizationId: value === "ALL" ? undefined : value,
      organizationType: value === "ALL" ? undefined : "STRUCTURE",
      page: 0
    });
  };

  // Configuration des filtres pour le DataTable
  const filters: FilterConfig[] = [
    {
      key: "type",
      label: "Type",
      type: "select",
      options: [
        { value: "INDIVIDUAL", label: "Particulier" },
        { value: "COMPANY", label: "Entreprise" },
        { value: "GOVERNMENT", label: "Gouvernement" }
      ],
      value: searchParams.type?.[0] || "ALL",
      onChange:(value: string | string[]) => {
        if (typeof value === 'string') {
          handleClientTypeChange(value);
        }
      } 
    },
    {
      key: "status",
      label: "Statut",
      type: "select",
      options: [
        { value: "ACTIVE", label: "Actif" },
        { value: "INACTIVE", label: "Inactif" },
        { value: "BLOCKED", label: "Bloqué" },
        { value: "SUSPENDED", label: "Suspendu" }
      ],
      value: searchParams.status?.[0] || "ALL",
      onChange:(value: string | string[]) => {
        if (typeof value === 'string') {
          handleClientStatusChange(value);
        }
      }
    },
    {
      key: "superStructureId",
      label: "Super Structure",
      type: "select",
      options: getSuperStructureOptions(),
      value: searchParams.organizationType === "SUPER_STRUCTURE" ? searchParams.organizationId || "ALL" : "ALL",
      onChange:(value: string | string[]) => {
        if (typeof value === 'string') {
          handleSuperStructureChange(value);
        }
      } 
    },
    {
      key: "structureId",
      label: "Structure",
      type: "select",
      options: getStructureOptions(),
      value: searchParams.organizationType === "STRUCTURE" ? searchParams.organizationId || "ALL" : "ALL",
      onChange:(value: string | string[]) => {
        if (typeof value === 'string') {
          handleStructureChange(value);
        }
      },
    }
  ];
  
  // Actions sur les lignes
  const handleView = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsModalOpen(true);
  };
  
  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };
  
  const handleDelete = (client: Client) => {
    if (client) {
      setClientToDelete(client);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleCreate = () => {
    setSelectedClient(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  // Gestionnaires des actions de statut
  const handleStatusChange = (client: Client, action: string) => {
    if (client) {
      setSelectedClientForStatus(client);
      setSelectedAction(action);
      setIsActionDialogOpen(true);
    }
  };

  const handleEnrollLoyalty = async (client: Client) => {
    try {
      await enrollInLoyalty.mutateAsync(client.id);
    } catch (error) {
      console.error('Failed to enroll in loyalty program:', error);
    }
  };

  const handleConfirmAction = async (reason?: string) => {
    if (!selectedClientForStatus || !selectedAction) return;

    try {
      // Map action to status
      const statusMap: Record<string, string> = {
        'block': 'BLOCKED',
        'unblock': 'ACTIVE',
        'activate': 'ACTIVE',
        'deactivate': 'INACTIVE'
      };

      const newStatus = statusMap[selectedAction];
      
      if (newStatus) {
        await changeClientStatus.mutateAsync({
          id: selectedClientForStatus.id,
          status: newStatus,
          reason: reason
        });
      }
      
      // Fermer la modal de confirmation
      setIsActionDialogOpen(false);
      setSelectedClientForStatus(null);
      setSelectedAction("");
      
    } catch (error) {
      // L'erreur est gérée par les hooks, pas besoin de traitement supplémentaire
      console.error('Action failed:', error);
    }
  };
  
  // Colonnes du tableau
  const columns = createClientColumns({
    sortBy: searchParams.sortBy,
    sortDir: searchParams.sortDir,
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
    onEnrollLoyalty: handleEnrollLoyalty
  });

  return (
    <div className="space-y-4">
      {/* Header avec bouton Create */}
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6" />
          Clients
        </h1>
        <PermissionGate
          permissions={[PERMISSIONS.CLIENT.CREATE]}
        >
          <Button onClick={handleCreate}>
            <PlusCircle /> Nouveau Client
          </Button>
        </PermissionGate>
      </div>
      
      {/* Tableau des données */}
      <div className="pt-4">
        <DataTable
          data={clientsData?.content || []}
          columns={columns}
          totalElements={clientsData?.totalElements || 0}
          totalPages={clientsData?.totalPages || 0}
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
          searchPlaceholder="Rechercher par nom, email, téléphone, code..."
          filters={filters}
          isLoading={isLoading}
          emptyMessage="Aucun client trouvé."
          defaultColumnVisibility={{
            alternatePhone: false,
            organizationName: false
          }}
        />
      </div>
      
      {/* Modal de détails */}
      <ClientDetailsModal
        client={selectedClient}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedClient(null);
        }}
        onEdit={handleEdit}
        onStatusChange={handleStatusChange}
        onEnrollLoyalty={handleEnrollLoyalty}
      />

      {/* Modal de formulaire */}
      <ClientFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        mode={formMode}
      />

      {/* Dialog de suppression */}
      <ClientDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setClientToDelete(null);
        }}
        client={clientToDelete}
      />

      {/* Dialog de confirmation d'action */}
      <ClientActionConfirmDialog
        isOpen={isActionDialogOpen}
        onClose={() => {
          setIsActionDialogOpen(false);
          setSelectedClientForStatus(null);
          setSelectedAction("");
        }}
        onConfirm={handleConfirmAction}
        client={selectedClientForStatus}
        action={selectedAction}
        isLoading={changeClientStatus.isPending}
      />
    </div>
  );
}
