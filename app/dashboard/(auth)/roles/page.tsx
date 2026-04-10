"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { createRoleColumns, RoleFormModal, RoleDeleteDialog } from "./components";
import { useRoles } from "@/data/roles-permissions";
import { useDebounce } from "@/hooks/useDebounce";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import type { RoleResponse } from "@/types/role";

export default function RolesPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState("level");
  const [sortDir, setSortDir] = useState<"ASC" | "DESC">("ASC");

  const [selected, setSelected] = useState<RoleResponse | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<RoleResponse | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const { data: response, isLoading } = useRoles(currentPage - 1, pageSize);

  const roles = response?.data?.content ?? [];
  const totalElements = response?.data?.totalElements ?? 0;
  const totalPages = response?.data?.totalPages ?? 0;

  const filteredData = useMemo(() => {
    if (!debouncedSearch) return roles;
    const term = debouncedSearch.toLowerCase();
    return roles.filter(
      (r) => r.name.toLowerCase().includes(term) || r.code.toLowerCase().includes(term)
    );
  }, [roles, debouncedSearch]);

  const columns = useMemo(
    () =>
      createRoleColumns({
        onView: (role) => router.push(`/dashboard/roles/${role.id}`),
        onEdit: (role) => { setSelected(role); setFormMode("edit"); setIsFormOpen(true); },
        onDelete: (role) => { setToDelete(role); setIsDeleteOpen(true); },
      }),
    [router]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-600" />
            Rôles
          </h1>
          <p className="text-muted-foreground">Gérez les rôles et leurs permissions</p>
        </div>
        <PermissionGuard permission={PERMISSIONS.ROLE.CREATE}>
          <Button onClick={() => { setSelected(null); setFormMode("create"); setIsFormOpen(true); }} className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau rôle
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
        onSort={(f, d) => { setSortBy(f); setSortDir(d); }}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un rôle..."
        emptyMessage="Aucun rôle trouvé."
      />

      <RoleFormModal open={isFormOpen} onOpenChange={setIsFormOpen} role={selected} mode={formMode} />
      <RoleDeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} role={toDelete} />
    </div>
  );
}
