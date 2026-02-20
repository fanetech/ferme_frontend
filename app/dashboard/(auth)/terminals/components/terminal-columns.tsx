import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Smartphone, Wifi, WifiOff, Eye, Edit, Trash2, Lock, Unlock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { TerminalBadge } from "./terminal-badge";
import type { Terminal, TerminalPaginatedResponse, UpdateTerminalStatus } from "@/types";
import { formatDate, cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import PermissionGate from "@/components/auth/permission-gate";
import { PERMISSIONS, ROLES } from "@/lib/constants";

interface CreateColumnsProps {
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  onSort?: (field: string, direction: 'ASC' | 'DESC') => void;
  onView: (terminal: Terminal) => void;
  onEdit: (terminal: Terminal) => void;
  onDelete: (terminal: Terminal) => void;
  onUpdateTerminalStatus: (terminal: Terminal, updateData: UpdateTerminalStatus) => void;
  onBlock: (terminal: Terminal) => void
}

export function createTerminalColumns({
  sortBy,
  sortDir,
  onSort,
  onView,
  onEdit,
  onUpdateTerminalStatus,
  onBlock,
  onDelete
}: CreateColumnsProps): ColumnDef<Terminal>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: "serialNumber",
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Numéro de série"
          field="serialNumber"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.getValue("serialNumber")}</div>
            <div className="text-xs text-muted-foreground">{row.original.activationCode}</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: "structureName",
      header: "Structure",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("structureName")}</div>
          {row.original.metadata?.location && (
            <div className="text-sm text-muted-foreground">{row.original.metadata.location}</div>
          )}
        </div>
      )
    },
    {
      accessorKey: "model",
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Modèle"
          field="model"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("model")}</div>
          <div className="text-sm text-muted-foreground">{row.original.manufacturer}</div>
        </div>
      )
    },
    {
      accessorKey: "osVersion",
      header: "Système",
      enableHiding: true,
      cell: ({ row }) => (
        <div className="space-y-1">
          <Badge variant="outline" className="text-xs">
            {row.original.osVersion}
          </Badge>
          <div className="text-xs text-muted-foreground">
            App v{row.original.appVersion}
          </div>
        </div>
      )
    },
    {
      accessorKey: "isOnline",
      header: "Connexion",
      cell: ({ row }) => {
        const isOnline = row.getValue("isOnline");
        const lastConnection = row.original.lastConnectionAt;
        
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Wifi className="h-4 w-4" />
                      <span className="text-sm font-medium">En ligne</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <WifiOff className="h-4 w-4" />
                      <span className="text-sm font-medium">Hors ligne</span>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              {lastConnection && (
                <TooltipContent>
                  <p>Dernière connexion: {formatDate(lastConnection)}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      }
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Statut"
          field="status"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => <TerminalBadge status={row.getValue("status")} />
    },
    {
      accessorKey: "expirationDate",
      header: "Expiration",
      enableHiding: true,
      cell: ({ row }) => {
        const expirationDate = row.original.expirationDate;
        const daysUntilExpiration = row.original.daysUntilExpiration;
        const isExpired = row.original.isExpired;
        
        if (!expirationDate) {
          return <span className="text-muted-foreground">-</span>;
        }
        
        return (
          <div className="space-y-1">
            <div className={cn(
              "text-sm",
              isExpired && "text-red-600",
              !isExpired && daysUntilExpiration && daysUntilExpiration <= 30 && "text-orange-600"
            )}>
              {formatDate(expirationDate)}
            </div>
            {daysUntilExpiration !== undefined && (
              <div className="text-xs text-muted-foreground">
                {isExpired ? (
                  <span className="text-red-600 font-medium">Expiré</span>
                ) : (
                  <span>{daysUntilExpiration} jours restants</span>
                )}
              </div>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "activatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Date d'activation"
          field="activatedAt"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
        />
      ),
      enableHiding: true,
      cell: ({ row }) => {
        const activatedAt = row.original.activatedAt;
        return activatedAt ? formatDate(activatedAt) : <span className="text-muted-foreground">-</span>;
      }
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Date création"
          field="createdAt"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
        />
      ),
      enableHiding: true,
      cell: ({ row }) => formatDate(row.getValue("createdAt"))
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const terminal = row.original;
        const isActive = terminal.status === 'ACTIVE';
        const isBlocked = terminal.status === 'LOCKED';
        const isDeleted = terminal.status === 'DEACTIVATED';
        
        return (
          <div className="text-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <PermissionGate permissions={[PERMISSIONS.TERMINAL.READ]}>
                  <DropdownMenuItem onClick={() => onView(terminal)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir détails
                  </DropdownMenuItem>
                </PermissionGate>
                <PermissionGate permissions={[PERMISSIONS.TERMINAL.UPDATE]}>
                  <DropdownMenuItem onClick={() => onEdit(terminal)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                </PermissionGate>
                <DropdownMenuSeparator />
                <PermissionGate permissions={[PERMISSIONS.TERMINAL.DEACTIVATE]}>
                  {isActive ? (
                    <DropdownMenuItem onClick={() => onUpdateTerminalStatus(terminal, {action: "DEACTIVATE" , reason: "désactiver" })}>
                      <WifiOff className="mr-2 h-4 w-4" />
                      Désactiver
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onUpdateTerminalStatus(terminal, {action: "REACTIVATE" , reason: "Reactivation" })}>
                      <Wifi className="mr-2 h-4 w-4" />
                      Activer
                    </DropdownMenuItem>
                  )}
                </PermissionGate>
                <PermissionGate permissions={[PERMISSIONS.TERMINAL.BLOCKED]}>
                  {isBlocked ? (
                    <DropdownMenuItem onClick={() => onUpdateTerminalStatus(terminal, {action: "REACTIVATE" , reason: "Reactivation" })}>
                      <Unlock className="mr-2 h-4 w-4" />
                      Débloquer
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onBlock(terminal)}>
                      <Lock className="mr-2 h-4 w-4" />
                      Bloquer
                    </DropdownMenuItem>
                  )}
                </PermissionGate>
                <PermissionGate permissions={[PERMISSIONS.TERMINAL.DELETE]}>
                  {!isDeleted && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(terminal)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </>
                  ) }
                </PermissionGate>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ];
}
