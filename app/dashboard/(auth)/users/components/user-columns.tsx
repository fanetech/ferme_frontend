"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Edit, Trash2, ArrowUpDown, User, Mail, Shield, Clock, ExternalLink, Play, Pause, Ban, Lock, Unlock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types/users";
import { UserBadge } from "./user-badge";
import { getAvailableActions } from "./user-status-mapper";
import PermissionGate from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/constants";

interface UserActionsProps {
  user: User;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, action: string) => void;
  onAdvancedView?: (id: string) => void;
}

interface ActionConfig {
  icon: any;
  label?: string;
  className?: string;
  permission?: string;
}

function UserActions({ user, onView, onEdit, onDelete, onStatusChange, onAdvancedView }: UserActionsProps) {
  const availableActions = getAvailableActions(user.accountStatus);

  const getActionConfig : ActionConfig | any= (action: string) => {
    switch (action) {
      case 'activate':
        return { icon: Play, label: 'Activer', className: 'text-green-600'  , permission: PERMISSIONS.USER.USER_ACTIVATE };
      case 'deactivate':
        return { icon: Pause, label: 'Désactiver', className: 'text-orange-600', permission: PERMISSIONS.USER.USER_DEACTIVATE };
      case 'suspend':
        return { icon: Ban, label: 'Suspendre', className: 'text-red-600' , permission: PERMISSIONS.USER.USER_SUSPEND };
      case 'lock':
        return { icon: Lock, label: 'Verrouiller', className: 'text-red-600', permission: PERMISSIONS.USER.USER_LOCK };
      case 'unlock':
        return { icon: Unlock, label: 'Déverrouiller', className: 'text-green-600' , permission: PERMISSIONS.USER.USER_UNLOCK };
      default:
        return { icon: Shield, label: action, className: '' };
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Ouvrir le menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        
        {/* Actions de consultation */}
        <PermissionGate permissions={[PERMISSIONS.USER.USER_READ]}>
          <DropdownMenuItem onClick={() => onView(user.id)}>
            <Eye className="mr-2 h-4 w-4" />
            Voir les détails
          </DropdownMenuItem>
        </PermissionGate>
        
        {onAdvancedView && (
          <PermissionGate permissions={[PERMISSIONS.USER.USER_READ]}>
            <DropdownMenuItem onClick={() => onAdvancedView(user.id)}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Vue avancée
            </DropdownMenuItem>
          </PermissionGate>
        )}
        <PermissionGate permissions={[PERMISSIONS.USER.USER_UPDATE]}>
          <DropdownMenuItem onClick={() => onEdit(user.id)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
        </PermissionGate>
        
        {/* Actions de statut */}
        {availableActions.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Gestion du statut</DropdownMenuLabel>
            {availableActions.map((action) => {
              const config = getActionConfig(action);
              const IconComponent = config.icon;
              return (
                <PermissionGate permissions={[config.permission]} key={action}>
                  <DropdownMenuItem
                    key={action}
                    onClick={() => onStatusChange?.(user.id, action)}
                    className={config.className}
                  >
                    <IconComponent className="mr-2 h-4 w-4" />
                    {config.label}
                  </DropdownMenuItem>
                </PermissionGate>
              );
            })}
          </>
        )}
        
        {/* Action de suppression */}
        <DropdownMenuSeparator />
        <PermissionGate permissions={[PERMISSIONS.USER.USER_DELETE]}>
          <DropdownMenuItem
            onClick={() => onDelete(user.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </PermissionGate>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface UserAvatarCellProps {
  user: User;
}

function UserAvatarCell({ user }: UserAvatarCellProps) {
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.profilePicture} alt={user.fullName} />
        <AvatarFallback className="bg-primary/10 text-primary text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="font-medium truncate">{user.fullName}</div>
        <div className="text-xs text-muted-foreground truncate">
          {user.email}
        </div>
      </div>
    </div>
  );
}


interface CreateUserColumnsProps {
  sortBy: string;
  sortDir: 'ASC' | 'DESC';
  onSort: (field: string, direction: 'ASC' | 'DESC') => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, action: string) => void;
  onAdvancedView?: (id: string) => void;
}

export function createUserColumns({
  sortBy,
  sortDir,
  onSort,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onAdvancedView
}: CreateUserColumnsProps): ColumnDef<User>[] {
  return [
    {
      accessorKey: "fullName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Utilisateur
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const user = row.original;
        return <UserAvatarCell user={user} />;
      },
    },
    {
      accessorKey: "organizationName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Organisation
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const organizationName = row.getValue("organizationName") as string;
        const user = row.original;
        return (
          <div className="max-w-[200px]">
            {organizationName ? (
              <div>
                <div className="font-medium text-sm truncate">{organizationName}</div>
                {user.departmentName && (
                  <div className="text-xs text-muted-foreground truncate">
                    {user.departmentName}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Non assigné
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "roles",
      header: "Rôles",
      cell: ({ row }) => {
        const user = row.original;
        const roles = user.roles || [];
        
        // Safety check to ensure roles is an array and contains valid objects
        const validRoles = Array.isArray(roles) ? roles.filter(role => 
          role && typeof role === 'object' && role.id && role.name
        ) : [];
        
        return (
          <div className="max-w-[200px]">
            {validRoles.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {validRoles.slice(0, 2).map((role) => (
                  <Badge key={role.id} variant="secondary" className="text-xs">
                    {role.name}
                  </Badge>
                ))}
                {validRoles.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{validRoles.length - 2}
                  </Badge>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Aucun rôle
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "phoneNumber",
      header: "Téléphone",
      cell: ({ row }) => {
        const phoneNumber = row.getValue("phoneNumber") as string;
        return (
          <div className="max-w-[150px]">
            {phoneNumber ? (
              <span className="text-sm">{phoneNumber}</span>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Non renseigné
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "lastLoginAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Dernière connexion
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const lastLogin = row.getValue("lastLoginAt") as string;
        return (
          <div className="text-sm text-muted-foreground">
            {lastLogin ? formatDate(lastLogin) : "Jamais"}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Statut
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <UserBadge status={row.getValue("status")} />;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Créé le
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.getValue("createdAt"))}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <UserActions
            user={user}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onAdvancedView={onAdvancedView}
          />
        );
      },
    },
  ];
}