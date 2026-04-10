"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Pencil, Trash2, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FarmResponse } from "@/types/farm";

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "bg-green-100 text-green-800" },
  INACTIVE: { label: "Inactif", className: "bg-gray-100 text-gray-800" },
  ABANDONED: { label: "Abandonné", className: "bg-red-100 text-red-800" },
};

const typeConfig: Record<string, { label: string; className: string }> = {
  CROP: { label: "Culture", className: "bg-emerald-100 text-emerald-800" },
  LIVESTOCK: { label: "Élevage", className: "bg-orange-100 text-orange-800" },
  MIXED: { label: "Mixte", className: "bg-blue-100 text-blue-800" },
  AQUACULTURE: { label: "Aquaculture", className: "bg-cyan-100 text-cyan-800" },
};

interface ColumnActions {
  onView: (farm: FarmResponse) => void;
  onEdit: (farm: FarmResponse) => void;
  onDelete: (farm: FarmResponse) => void;
  onStats: (farm: FarmResponse) => void;
}

export function createFarmColumns(actions: ColumnActions): ColumnDef<FarmResponse>[] {
  return [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.code}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.province && (
            <p className="text-xs text-muted-foreground">
              {row.original.village ? `${row.original.village}, ` : ""}
              {row.original.commune ? `${row.original.commune}, ` : ""}
              {row.original.province}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const config = typeConfig[row.original.type] ?? { label: row.original.type, className: "" };
        return <Badge className={config.className}>{config.label}</Badge>;
      },
    },
    {
      accessorKey: "organizationName",
      header: "Organisation",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.organizationName ?? "—"}</span>
      ),
    },
    {
      accessorKey: "ownerName",
      header: "Propriétaire",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.ownerName && <p>{row.original.ownerName}</p>}
          {row.original.ownerPhone && (
            <p className="text-xs text-muted-foreground">{row.original.ownerPhone}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "totalAreaHectares",
      header: "Superficie",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.totalAreaHectares ? `${row.original.totalAreaHectares} ha` : "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const config = statusConfig[row.original.status] ?? { label: row.original.status, className: "" };
        return <Badge className={config.className}>{config.label}</Badge>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => actions.onView(row.original)}>
              <Eye className="mr-2 h-4 w-4" /> Voir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onStats(row.original)}>
              <BarChart3 className="mr-2 h-4 w-4" /> Statistiques
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => actions.onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onDelete(row.original)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
