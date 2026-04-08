"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Pencil, Trash2, ShieldCheck, ShieldOff, ShieldBan } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserResponse } from "@/types/user";

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "bg-green-100 text-green-800" },
  INACTIVE: { label: "Inactif", className: "bg-gray-100 text-gray-800" },
  BLOCKED: { label: "Bloqué", className: "bg-red-100 text-red-800" },
  DELETED: { label: "Supprimé", className: "bg-red-200 text-red-900" },
};

const genderLabels: Record<string, string> = {
  M: "Homme",
  F: "Femme",
  OTHER: "Autre",
};

interface ColumnActions {
  onView: (user: UserResponse) => void;
  onEdit: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
  onChangeStatus: (user: UserResponse, status: string) => void;
}

export function createFmUserColumns(actions: ColumnActions): ColumnDef<UserResponse>[] {
  return [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
    },
    {
      accessorKey: "firstName",
      header: "Nom complet",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.firstName} {row.original.lastName}</p>
          {row.original.otherNames && <p className="text-xs text-muted-foreground">{row.original.otherNames}</p>}
        </div>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Téléphone",
      cell: ({ row }) => <span className="text-sm">{row.original.phoneNumber}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <span className="text-sm">{row.original.email ?? "—"}</span>,
    },
    {
      accessorKey: "gender",
      header: "Genre",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.gender ? genderLabels[row.original.gender] ?? row.original.gender : "—"}</span>
      ),
    },
    {
      accessorKey: "lastLoginAt",
      header: "Dernière connexion",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.lastLoginAt
            ? new Date(row.original.lastLoginAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
            : "Jamais"}
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
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => actions.onView(user)}>
                <Eye className="mr-2 h-4 w-4" /> Voir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => actions.onEdit(user)}>
                <Pencil className="mr-2 h-4 w-4" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.status !== "ACTIVE" && (
                <DropdownMenuItem onClick={() => actions.onChangeStatus(user, "ACTIVE")}>
                  <ShieldCheck className="mr-2 h-4 w-4 text-green-600" /> Activer
                </DropdownMenuItem>
              )}
              {user.status === "ACTIVE" && (
                <DropdownMenuItem onClick={() => actions.onChangeStatus(user, "INACTIVE")}>
                  <ShieldOff className="mr-2 h-4 w-4 text-orange-600" /> Désactiver
                </DropdownMenuItem>
              )}
              {user.status !== "BLOCKED" && (
                <DropdownMenuItem onClick={() => actions.onChangeStatus(user, "BLOCKED")}>
                  <ShieldBan className="mr-2 h-4 w-4 text-red-600" /> Bloquer
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => actions.onDelete(user)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
