"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { createFmUserColumns } from "./components/fm-user-columns";
import { FmUserFormModal } from "./components/fm-user-form-modal";
import { FmUserDetailModal } from "./components/fm-user-detail-modal";
import { FmUserDeleteDialog } from "./components/fm-user-delete-dialog";
import { useFmUsers, useChangeUserStatus } from "@/data/fm-users";
import { useDebounce } from "@/hooks/useDebounce";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import type { UserResponse } from "@/types/user";
import type { FilterConfig } from "@/types/data-table";
import { toast } from "sonner";

export default function UsersPage() {
  const router = useRouter();

  // Filters & pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"ASC" | "DESC">("DESC");

  // Modals
  const [selected, setSelected] = useState<UserResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<UserResponse | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const changeStatusMutation = useChangeUserStatus();

  const { data: response, isLoading } = useFmUsers(currentPage - 1, pageSize);

  const users = response?.data?.content ?? [];
  const totalElements = response?.data?.totalElements ?? 0;
  const totalPages = response?.data?.totalPages ?? 0;

  const filteredData = useMemo(() => {
    let data = users;
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      data = data.filter(
        (u) =>
          u.firstName.toLowerCase().includes(term) ||
          u.lastName.toLowerCase().includes(term) ||
          u.phoneNumber.toLowerCase().includes(term) ||
          u.code.toLowerCase().includes(term) ||
          u.email?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== "ALL") data = data.filter((u) => u.status === statusFilter);
    return data;
  }, [users, debouncedSearch, statusFilter]);

  const handleChangeStatus = (user: UserResponse, status: string) => {
    changeStatusMutation.mutate({ id: user.id, status });
  };

  const columns = useMemo(
    () =>
      createFmUserColumns({
        onView: (user) => { setSelected(user); setIsDetailOpen(true); },
        onEdit: (user) => { setSelected(user); setFormMode("edit"); setIsFormOpen(true); },
        onDelete: (user) => { setToDelete(user); setIsDeleteOpen(true); },
        onChangeStatus: handleChangeStatus,
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
        { value: "BLOCKED", label: "Bloqué" },
      ],
      value: statusFilter,
      onChange: (v) => setStatusFilter(v as string),
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
            <UserCog className="h-6 w-6 text-purple-600" />
            Utilisateurs
          </h1>
          <p className="text-muted-foreground">
            Gérez les comptes utilisateurs de la plateforme
          </p>
        </div>
        <PermissionGuard permission={PERMISSIONS.USER.CREATE}>
          <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvel utilisateur
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
        searchPlaceholder="Rechercher un utilisateur..."
        emptyMessage="Aucun utilisateur trouvé."
      />

      <FmUserFormModal open={isFormOpen} onOpenChange={setIsFormOpen} user={selected} mode={formMode} />
      <FmUserDetailModal open={isDetailOpen} onOpenChange={setIsDetailOpen} user={selected} />
      <FmUserDeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} user={toDelete} />
    </div>
  );
}
