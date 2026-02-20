"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  Settings,
  Users,
  Key,
  ArrowUpDown,
  Building2,
  Building,
  Shield,
} from "lucide-react";
import type { RoleSummary } from "@/types/roles";
import PermissionGate from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/constants";

interface CreateRoleColumnsProps {
  sortBy: string;
  sortDir: "ASC" | "DESC";
  onSort: (field: string, direction: "ASC" | "DESC") => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onConfigure: (id: string) => void;
}

export function createRoleColumns({
  sortBy,
  sortDir,
  onSort,
  onView,
  onEdit,
  onDelete,
  onConfigure,
}: CreateRoleColumnsProps): ColumnDef<RoleSummary>[] {
  return [
    {
      accessorKey: "displayName",
      header: ({ column }) => {
        const isSorted = sortBy === "displayName";
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const newDirection = isSorted && sortDir === "ASC" ? "DESC" : "ASC";
              onSort("displayName", newDirection);
            }}
            className="h-auto p-0 font-medium"
          >
            Nom du rôle
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{role.displayName}</div>
            <div className="text-sm text-muted-foreground">{role.name}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return type === "SYSTEM" ? (
          <Badge variant="secondary">Système</Badge>
        ) : (
          <Badge variant="outline">Personnalisé</Badge>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Statut",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return isActive ? (
          <Badge className="bg-green-100 text-green-800">Actif</Badge>
        ) : (
          <Badge variant="destructive">Inactif</Badge>
        );
      },
    },
    {
      accessorKey: "owner",
      header: "Organisation propriétaire",
      cell: ({ row }) => {
        const role = row.original;
        
        // Rôles SYSTEM = toujours globaux
        if (role.type === "SYSTEM") {
          return (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Shield className="h-3 w-3 mr-1" />
                Système
              </Badge>
              <span className="text-sm text-muted-foreground">Global</span>
            </div>
          );
        }
        
        // Rôles CUSTOM = doivent avoir un propriétaire
        if (role.type === "CUSTOM") {
          // CUSTOM sans propriétaire = erreur
          if (!role.ownerCode || !role.ownerType) {
            return (
              <div className="flex items-center gap-2">
                <Badge variant="destructive">
                  <Shield className="h-3 w-3 mr-1" />
                  Erreur
                </Badge>
                <span className="text-sm text-red-600">Non défini</span>
              </div>
            );
          }
          
          // CUSTOM avec propriétaire = normal
          return (
            <div className="flex items-center gap-2">
              <Badge variant={role.ownerType === "STRUCTURE" ? "default" : "secondary"}>
                {role.ownerType === "STRUCTURE" ? (
                  <Building className="h-3 w-3 mr-1" />
                ) : (
                  <Building2 className="h-3 w-3 mr-1" />
                )}
                {role.ownerType === "STRUCTURE" ? "Structure" : "Super Structure"}
              </Badge>
              <div>
                <div className="font-medium text-sm">{role.ownerCode}</div>
                {role.ownerName && (
                  <div className="text-xs text-muted-foreground max-w-32 truncate">
                    {role.ownerName}
                  </div>
                )}
              </div>
            </div>
          );
        }
        
        // Cas par défaut
        return <span className="text-muted-foreground text-sm">Inconnu</span>;
      },
    },
    {
      accessorKey: "userCount",
      header: ({ column }) => {
        const isSorted = sortBy === "userCount";
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => {
                const newDirection = isSorted && sortDir === "ASC" ? "DESC" : "ASC";
                onSort("userCount", newDirection);
              }}
              className="h-auto p-0 font-medium"
            >
              <Users className="mr-2 h-4 w-4" />
              Utilisateurs
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const count = row.getValue("userCount") as number;
        return (
          <div className="flex items-center justify-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{count}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "permissionCount",
      header: ({ column }) => {
        const isSorted = sortBy === "permissionCount";
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => {
                const newDirection = isSorted && sortDir === "ASC" ? "DESC" : "ASC";
                onSort("permissionCount", newDirection);
              }}
              className="h-auto p-0 font-medium"
            >
              <Key className="mr-2 h-4 w-4" />
              Permissions
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const count = row.getValue("permissionCount") as number;
        return (
          <div className="flex items-center justify-center gap-1">
            <Key className="h-4 w-4 text-muted-foreground" />
            <span>{count}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const role = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <PermissionGate permissions={[PERMISSIONS.AUTH.ROLE_READ]}>
                <DropdownMenuItem onClick={() => onView(role.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir les détails
                </DropdownMenuItem>
              </PermissionGate>
              {/* //TODO: mettre la permission ROLE_CONFIG */}
              <PermissionGate permissions={[PERMISSIONS.AUTH.ROLE_UPDATE]}>
                <DropdownMenuItem onClick={() => onConfigure(role.id)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurer
                </DropdownMenuItem>
              </PermissionGate>

              {role.canBeDeleted && (
                <>
                  <DropdownMenuSeparator />
                  
                 <PermissionGate permissions={[PERMISSIONS.AUTH.ROLE_UPDATE]}>
                   <DropdownMenuItem onClick={() => onEdit(role.id)}>
                     <Edit className="mr-2 h-4 w-4" />
                     Modifier
                   </DropdownMenuItem>
                 </PermissionGate>
                  
                  <DropdownMenuSeparator />
                  <PermissionGate permissions={[PERMISSIONS.AUTH.ROLE_DELETE]}>
                    <DropdownMenuItem
                      onClick={() => onDelete(role.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </PermissionGate>

                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}