"use client";

import { useState, useMemo } from "react";
import { PlusCircle, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  createOrganizationColumns,
  OrganizationFormModal,
  OrganizationDetailModal,
  OrganizationDeleteDialog,
} from "./components";
import { useOrganizations } from "@/data/organizations";
import { useDebounce } from "@/hooks/useDebounce";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import type { OrganizationResponse } from "@/types/organization";
import type { FilterConfig } from "@/types/data-table";

export default function OrganizationsPage() {
  // Filters & pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"ASC" | "DESC">("DESC");

  // Modals
  const [selected, setSelected] = useState<OrganizationResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<OrganizationResponse | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data: response, isLoading } = useOrganizations(currentPage - 1, pageSize);

  const organizations = response?.data?.content ?? [];
  const totalElements = response?.data?.totalElements ?? 0;
  const totalPages = response?.data?.totalPages ?? 0;

  // Filter client-side for search/status/type (server-side search is also available)
  const filteredData = useMemo(() => {
    let data = organizations;
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      data = data.filter(
        (o) =>
          o.name.toLowerCase().includes(term) ||
          o.code.toLowerCase().includes(term) ||
          o.contactPerson?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== "ALL") {
      data = data.filter((o) => o.status === statusFilter);
    }
    if (typeFilter !== "ALL") {
      data = data.filter((o) => o.type === typeFilter);
    }
    return data;
  }, [organizations, debouncedSearch, statusFilter, typeFilter]);

  const columns = useMemo(
    () =>
      createOrganizationColumns({
        onView: (org) => { setSelected(org); setIsDetailOpen(true); },
        onEdit: (org) => { setSelected(org); setFormMode("edit"); setIsFormOpen(true); },
        onDelete: (org) => { setToDelete(org); setIsDeleteOpen(true); },
      }),
    []
  );

  const filters: FilterConfig[] = [
    {
      key: "status",
      label: "Statut",
      type: "select",
      options: [
        { value: "ACTIVE", label: "Actif" },
        { value: "INACTIVE", label: "Inactif" },
        { value: "SUSPENDED", label: "Suspendu" },
      ],
      value: statusFilter,
      onChange: (v) => setStatusFilter(v as string),
    },
    {
      key: "type",
      label: "Type",
      type: "select",
      options: [
        { value: "COOPERATIVE", label: "Coopérative" },
        { value: "GROUPEMENT", label: "Groupement" },
        { value: "ENTREPRISE", label: "Entreprise" },
        { value: "ONG", label: "ONG" },
      ],
      value: typeFilter,
      onChange: (v) => setTypeFilter(v as string),
    },
  ];

  const handleCreate = () => {
    setSelected(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-6 w-6 text-blue-600" />
            Organisations
          </h1>
          <p className="text-muted-foreground">
            Gérez les coopératives, groupements et entreprises
          </p>
        </div>
        <PermissionGuard permission={PERMISSIONS.ORGANIZATION.CREATE}>
          <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvelle organisation
          </Button>
        </PermissionGuard>
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        totalElements={totalElements}
        totalPages={totalPages}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={(field, dir) => { setSortBy(field); setSortDir(dir); }}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        isLoading={isLoading}
        searchPlaceholder="Rechercher une organisation..."
        emptyMessage="Aucune organisation trouvée."
      />

      <OrganizationFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        organization={selected}
        mode={formMode}
      />

      <OrganizationDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        organization={selected}
      />

      <OrganizationDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        organization={toDelete}
      />
    </div>
  );
}
