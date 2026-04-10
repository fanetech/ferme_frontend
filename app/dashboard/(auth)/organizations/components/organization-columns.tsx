"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OrganizationResponse } from "@/types/organization";

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "bg-green-100 text-green-800" },
  INACTIVE: { label: "Inactif", className: "bg-gray-100 text-gray-800" },
  SUSPENDED: { label: "Suspendu", className: "bg-red-100 text-red-800" },
};

const typeConfig: Record<string, string> = {
  COOPERATIVE: "Coopérative",
  GROUPEMENT: "Groupement",
  ENTREPRISE: "Entreprise",
  ONG: "ONG",
};

interface ColumnActions {
  onView: (org: OrganizationResponse) => void;
  onEdit: (org: OrganizationResponse) => void;
  onDelete: (org: OrganizationResponse) => void;
}

export function createOrganizationColumns(actions: ColumnActions): ColumnDef<OrganizationResponse>[] {
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
            <p className="text-xs text-muted-foreground">{row.original.province}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">
          {typeConfig[row.original.type] ?? row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "contactPerson",
      header: "Contact",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.contactPerson && <p>{row.original.contactPerson}</p>}
          {row.original.phone && (
            <p className="text-xs text-muted-foreground">{row.original.phone}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "farmCount",
      header: "Fermes",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.farmCount ?? 0}</span>
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
