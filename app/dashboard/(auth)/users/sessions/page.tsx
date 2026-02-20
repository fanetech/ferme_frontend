"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, RefreshCw, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

import { useActiveSessions } from "@/data/sessions";
import type { SessionSearchParams } from "@/types/sessions";
import type { FilterConfig } from "@/types/data-table";
import { createSessionColumns } from "./components/session-columns";
import { useDebounce } from "@/hooks/useDebounce";
import { SessionDetailsModal } from "./components/session-details-modal";
import { BulkRevokeModal } from "./components/bulk-revoke-modal";
import { SingleRevokeModal } from "./components/single-revoke-modal";
import PermissionGate from "@/components/auth/permission-gate";
import { PERMISSIONS, ROLES } from "@/lib/constants";

export default function SessionsPage() {
  const router = useRouter();
  
  // États pour les filtres et la pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [deviceType, setDeviceType] = useState("ALL");
  const [userId, setUserId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("lastAccessAt");
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');
  
  // États pour les modals
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [bulkRevokeOpen, setBulkRevokeOpen] = useState(false);
  const [singleRevokeOpen, setSingleRevokeOpen] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Paramètres de recherche
  const searchParams: SessionSearchParams = {
    page: currentPage - 1, // L'API commence à 0
    size: pageSize,
    searchTerm: debouncedSearchTerm || undefined,
    deviceType: deviceType === "ALL" ? undefined : deviceType as any,
    userId: userId || undefined,
    sortBy,
    sortDir
  };
  
  // Requête des données
  const { data: sessionsData, isLoading, error, refetch } = useActiveSessions(searchParams);
  
  // Configuration des filtres
  const filters: FilterConfig[] = [
    {
      key: "deviceType",
      label: "Type d'appareil",
      type: "select",
      options: [
        { value: "MOBILE", label: "Mobile" },
        { value: "TABLET", label: "Tablette" },
        { value: "DESKTOP", label: "Desktop" },
        { value: "WEB", label: "Web" }
      ],
      value: deviceType,
      onChange: (value) => setDeviceType(value as string)
    },
    {
      key: "userId",
      label: "ID Utilisateur",
      type: "input",
      value: userId,
      onChange: (value) => setUserId(value as string),
      placeholder: "Rechercher par ID utilisateur..."
    }
  ];
  
  // Actions sur les lignes
  const handleViewDetails = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessionToRevoke(sessionId);
    setSingleRevokeOpen(true);
  };

  const handleBulkRevoke = () => {
    if (selectedSessions.length > 0) {
      setBulkRevokeOpen(true);
    }
  };

  const handleRefresh = () => {
    refetch();
  };
  
  // Colonnes du tableau
  const columns = createSessionColumns({
    sortBy,
    sortDir,
    onSort: (field: string, direction: 'ASC' | 'DESC') => {
      setSortBy(field);
      setSortDir(direction);
    },
    onViewDetails: handleViewDetails,
    onRevokeSession: handleRevokeSession,
    selectedSessions,
    onSelectionChange: setSelectedSessions,
  });

  return (
    <div className="space-y-4">
      {/* Header avec bouton d'actions */}
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-500" />
          Gestion des sessions
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          {/* //TODO: Ajouter une permission pour le bouton de revocation unique */}
          <PermissionGate role={ROLES.SUPER_ADMIN}>
            {selectedSessions.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkRevoke}>
                <Ban className="h-4 w-4 mr-2" />
                Révoquer ({selectedSessions.length})
              </Button>
            )}
          </PermissionGate>
        </div>
      </div>
      
      {/* Tableau des données */}
      <div className="pt-4">
        <DataTable
          data={sessionsData?.content || []}
          columns={columns}
          totalElements={sessionsData?.totalElements || 0}
          totalPages={sessionsData?.totalPages || 0}
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
          searchPlaceholder="Rechercher par email, IP..."
          filters={filters}
          isLoading={isLoading}
          emptyMessage="Aucune session trouvée."
          defaultColumnVisibility={{
            // Toutes les colonnes visibles par défaut
          }}
        />
      </div>

      {/* Modals */}
      <SessionDetailsModal
        sessionId={selectedSessionId}
        isOpen={!!selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
      />

      <SingleRevokeModal
        sessionId={sessionToRevoke}
        isOpen={singleRevokeOpen}
        onClose={() => {
          setSingleRevokeOpen(false);
          setSessionToRevoke(null);
        }}
        onSuccess={() => {
          refetch();
        }}
      />

      <BulkRevokeModal
        sessionIds={selectedSessions}
        isOpen={bulkRevokeOpen}
        onClose={() => setBulkRevokeOpen(false)}
        onSuccess={() => {
          setSelectedSessions([]);
          refetch();
        }}
      />
    </div>
  );
}