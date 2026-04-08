"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Pencil, Trash2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RoleResponse } from "@/types/role";

interface ColumnActions {
  onView: (role: RoleResponse) => void;
  onEdit: (role: RoleResponse) => void;
  onDelete: (role: RoleResponse) => void;
}

export function createRoleColumns(actions: ColumnActions): ColumnDef<RoleResponse>[] {
  return [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">{row.original.description}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "level",
      header: "Niveau",
      cell: ({ row }) => <span className="text-sm">{row.original.level ?? "—"}</span>,
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      cell: ({ row }) => (
        <Badge variant="outline" className="gap-1">
          <Lock className="h-3 w-3" />
          {row.original.permissions?.length ?? 0}
        </Badge>
      ),
    },
    {
      accessorKey: "isSystem",
      header: "Système",
      cell: ({ row }) =>
        row.original.isSystem ? (
          <Badge className="bg-blue-100 text-blue-800">Système</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">Personnalisé</span>
        ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const role = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => actions.onView(role)}>
                <Eye className="mr-2 h-4 w-4" /> Voir les permissions
              </DropdownMenuItem>
              {!role.isSystem && (
                <>
                  <DropdownMenuItem onClick={() => actions.onEdit(role)}>
                    <Pencil className="mr-2 h-4 w-4" /> Modifier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => actions.onDelete(role)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
