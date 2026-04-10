"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Tractor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  createFarmColumns,
  FarmFormModal,
  FarmDetailModal,
  FarmDeleteDialog,
} from "./components";
import { useFarms } from "@/data/farms";
import { useDebounce } from "@/hooks/useDebounce";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import type { FarmResponse } from "@/types/farm";
import type { FilterConfig } from "@/types/data-table";

export default function FarmsPage() {
  const router = useRouter();

  // Filters & pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"ASC" | "DESC">("DESC");

  // Modals
  const [selected, setSelected] = useState<FarmResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<FarmResponse | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data: response, isLoading } = useFarms(currentPage - 1, pageSize);

  const farms = response?.data?.content ?? [];
  const totalElements = response?.data?.totalElements ?? 0;
  const totalPages = response?.data?.totalPages ?? 0;

  const filteredData = useMemo(() => {
    let data = farms;
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      data = data.filter(
        (f) =>
          f.name.toLowerCase().includes(term) ||
          f.code.toLowerCase().includes(term) ||
          f.ownerName?.toLowerCase().includes(term) ||
          f.province?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== "ALL") data = data.filter((f) => f.status === statusFilter);
    if (typeFilter !== "ALL") data = data.filter((f) => f.type === typeFilter);
    return data;
  }, [farms, debouncedSearch, statusFilter, typeFilter]);

  const columns = useMemo(
    () =>
      createFarmColumns({
        onView: (farm) => { setSelected(farm); setIsDetailOpen(true); },
        onEdit: (farm) => { setSelected(farm); setFormMode("edit"); setIsFormOpen(true); },
        onDelete: (farm) => { setToDelete(farm); setIsDeleteOpen(true); },
        onStats: (farm) => router.push(`/dashboard/farms/${farm.id}`),
      }),
    [router]
  );

  const filters: FilterConfig[] = [
    {
      key: "status",
      label: "Statut",
      type: "select",
      options: [
        { value: "ACTIVE", label: "Actif" },
        { value: "INACTIVE", label: "Inactif" },
        { value: "ABANDONED", label: "Abandonné" },
      ],
      value: statusFilter,
      onChange: (v) => setStatusFilter(v as string),
    },
    {
      key: "type",
      label: "Type",
      type: "select",
      options: [
        { value: "CROP", label: "Culture" },
        { value: "LIVESTOCK", label: "Élevage" },
        { value: "MIXED", label: "Mixte" },
        { value: "AQUACULTURE", label: "Aquaculture" },
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
            <Tractor className="h-6 w-6 text-green-600" />
            Fermes
          </h1>
          <p className="text-muted-foreground">
            Gérez vos exploitations agricoles
          </p>
        </div>
        <PermissionGuard permission={PERMISSIONS.FARM.CREATE}>
          <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvelle ferme
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
        searchPlaceholder="Rechercher une ferme..."
        emptyMessage="Aucune ferme trouvée."
      />

      <FarmFormModal open={isFormOpen} onOpenChange={setIsFormOpen} farm={selected} mode={formMode} />
      <FarmDetailModal open={isDetailOpen} onOpenChange={setIsDetailOpen} farm={selected} />
      <FarmDeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} farm={toDelete} />
    </div>
  );
}
