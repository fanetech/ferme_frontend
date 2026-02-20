"use client";

import { useState } from "react";
import { PlusCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  createTerminalColumns,
  TerminalModalsManager,
} from "./components";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import type { TerminalSearchParams, Terminal, FilterConfig, UpdateTerminalStatus } from "@/types";
import { useTerminals, useUpdateTerminalStatus } from "@/data/terminal";
import { useStructuresForFilter, useSuperStructuresForFilter } from "@/data/organization";
import { useTerminalModals } from "./hooks/useTerminalModals";
import PermissionGate from "@/components/auth/permission-gate";
import { PERMISSIONS, ROLES } from "@/lib/constants";

export default function TerminalsPage() {
  const router = useRouter();
  
  // États pour les filtres et la pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [structureId, setStructureId] = useState("ALL");
  const [superStructureId, setSuperStructureId] = useState("ALL");
  const [isOnline, setIsOnline] = useState<string>("ALL");
  const [model, setModel] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');
  
  // Modal management
  const {
    modals,
    closeModal,
    openDetailsModal,
    openFormModal,
    openDeleteModal,
    openBlockModal,
    openBatchUploadModal,
  } = useTerminalModals();
  
  // Mutations
  const updateTerminalStatus = useUpdateTerminalStatus();
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Paramètres de recherche
  const searchParams: TerminalSearchParams = {
    page: currentPage - 1, // L'API commence à 0
    size: pageSize,
    searchTerm: debouncedSearchTerm || undefined,
    status: status === "ALL" ? undefined : status,
    structureId: structureId === "ALL" ? undefined : structureId,
    superStructureId: superStructureId === "ALL" ? undefined : superStructureId,
    isOnline: isOnline === "ALL" ? undefined : isOnline === "true",
    model: model === "ALL" ? undefined : model,
    sortBy,
    sortDirection: sortDir
  };

  // Requête des données
  const { data: response, isLoading, error } = useTerminals(searchParams);
  const { data: structuresData, isLoading: isLoadingStructures } = useStructuresForFilter();
  const { data: superStructuresData, isLoading: isLoadingSuperStructures } = useSuperStructuresForFilter();
  
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
        { value: "LOCKED", label: "Bloqué" },
        { value: "PENDING", label: "En attente" },
        { value: "EXPIRED", label: "Expiré" }
      ],
      value: status,
      onChange: (value: string | string[]) => {
        if (typeof value === 'string') {
          setStatus(value);
        }
      }
    },
    {
      key: "superStructureId",
      label: "Super structure",
      type: "select",
      options: superStructuresData?.content?.map(s => ({
        value: s.id,
        label: `${s.code} - ${s.name}`
      })) || [],
      value: superStructureId,
      onChange: (value: string | string[]) => {
        if (typeof value === 'string') {
          setSuperStructureId(value);
        }
      }
    },
    {
      key: "structureId",
      label: "Structure",
      type: "select",
      options: structuresData?.content?.map(s => ({
        value: s.id,
        label: `${s.code} - ${s.name}`
      })) || [],
      value: structureId,
      onChange: (value: string | string[]) => {
        if (typeof value === 'string') {
          setStructureId(value);
        }
      }
    },
    {
      key: "isOnline",
      label: "Connexion",
      type: "select",
      options: [
        { value: "true", label: "En ligne" },
        { value: "false", label: "Hors ligne" }
      ],
      value: isOnline,
      onChange: (value: string | string[]) => {
        if (typeof value === 'string') {
          setIsOnline(value);
        }
      }
    },
    {
      key: "model",
      label: "Modèle",
      type: "select",
      options: (['AvePay Pro', 'AvePay Pro 2000', 'AvePay Lite', 'AvePay Mini']).map(m => ({
        value: m,
        label: m
      })),
      value: model,
      onChange: (value: string | string[]) => {
        if (typeof value === 'string') {
          setModel(value);
        }
      }
    }
  ];
  
  // Actions sur les lignes
  const handleView = (terminal: Terminal) => {
    openDetailsModal(terminal);
  };
  
  const handleEdit = (terminal: Terminal) => {
    openFormModal("edit", terminal);
  };
  
  const handleDelete = (terminal: Terminal) => {
    if (terminal) {
      openDeleteModal(terminal);
    }
  };

  const handleCreate = () => {
    openFormModal("create");
  };

  const handleBatchUpload = () => {
    openBatchUploadModal();
  };

  const handleUpdateTerminalStatus = async (terminal: Terminal, updateData: UpdateTerminalStatus) => {
    const successMessages = {
      MARK_AS_LOST: "Terminal marqué comme perdu effectué avec succès",
      SET_IN_MAINTENANCE: "Terminal mis en maintenance avec succès",
      REACTIVATE: "Terminal réactivé avec succès",
      DEACTIVATE: "Terminal désactivé avec succès",
      LOCK: "Terminal bloqué avec succès",
      DELETE: "Terminal supprimé avec succès",
    };

    try {
      await updateTerminalStatus.mutateAsync({id: terminal.id, data: updateData});
      toast.success(successMessages[updateData.action] || "Opération réussie");
      closeModal('details');
      closeModal('block');
      closeModal('delete');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Une erreur est survenue");
    }
  };
  
  const handleBlock = (terminal: Terminal) => {
    if (terminal) {
      openBlockModal(terminal);
    }
  };
  
  // Colonnes du tableau
  const columns = createTerminalColumns({
    sortBy,
    sortDir,
    onSort: (field: string, direction: 'ASC' | 'DESC') => {
      setSortBy(field);
      setSortDir(direction);
    },
    onView: handleView,
    onEdit: handleEdit,
    onUpdateTerminalStatus: handleUpdateTerminalStatus,
    onBlock: handleBlock,
    onDelete: handleDelete
  });
  
  return (
    <div className="space-y-4">
      {/* Header avec boutons Create et Batch Upload */}
          <PermissionGate roles={[ROLES.SUPER_ADMIN]} permissions={[PERMISSIONS.TERMINAL.CREATE]}>
            <div className="flex items-center justify-between space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Terminaux</h1>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBatchUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Création en lot
                </Button>
                  <Button onClick={handleCreate}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nouveau Terminal
                  </Button>
              </div>
            </div>
          </PermissionGate>
      
      {/* Tableau des données */}
      <PermissionGate permissions={[PERMISSIONS.TERMINAL.LIST]}>
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
            searchPlaceholder="Rechercher par numéro de série, code d'activation..."
            filters={filters}
            isLoading={isLoading}
            emptyMessage="Aucun terminal trouvé."
            defaultColumnVisibility={{
              osVersion: false,
              activatedAt: false,
              createdAt: false
            }}
          />
        </div>
      </PermissionGate>
      
      {/* Modals Manager */}
      <TerminalModalsManager
        modals={modals}
        closeModal={closeModal}
        updateTerminalStatus={updateTerminalStatus}
        onUpdateTerminalStatus={handleUpdateTerminalStatus}
        isLoadingStructures={isLoadingStructures}
        isLoadingSuperStructures={isLoadingSuperStructures}
        structuresData={structuresData}
        superStructuresData={superStructuresData}
      />
    </div>
  );
}
