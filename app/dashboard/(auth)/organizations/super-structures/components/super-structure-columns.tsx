import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Building2, Mail, Phone, MapPin, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { SuperStructureBadge } from "./super-structure-badge";
import type { SuperStructure } from "@/types/organization";
import { formatDate } from "@/lib/utils";
import { getOrganizationTypeByCode } from "@/lib/constants/organization-types";
import PermissionGate from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/constants";

interface CreateColumnsProps {
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  onSort?: (field: string, direction: 'ASC' | 'DESC') => void;
  onView: (superStructure: SuperStructure) => void;
  onEdit: (superStructure: SuperStructure) => void;
  onDelete: (superStructure: SuperStructure) => void;
}

export function createSuperStructureColumns({
  sortBy,
  sortDir,
  onSort,
  onView,
  onEdit,
  onDelete
}: CreateColumnsProps): ColumnDef<SuperStructure>[] {
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
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Code"
          field="code"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {row.original.logoUrl ? (
              <img
                src={row.original.logoUrl}
                alt={`Logo ${row.original.name}`}
                className="h-full w-full object-cover rounded-full"
                onError={(e) => {
                  // Fallback si l'image ne charge pas
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <AvatarFallback className={`bg-primary/10 ${row.original.logoUrl ? 'hidden' : ''}`}>
              <Building2 className="h-5 w-5 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div className="font-medium">{row.getValue("code")}</div>
        </div>
      )
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Nom"
          field="name"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("name")}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground line-clamp-1">
              {row.original.description}
            </div>
          )}
        </div>
      )
    },
    {
      accessorKey: "organizationType",
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Type d'organisation"
          field="organizationType"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => {
        const organizationType = row.original.organizationType;
        if (!organizationType) {
          return <span className="text-muted-foreground">-</span>;
        }
        
        const orgType = getOrganizationTypeByCode(organizationType);
        if (!orgType) {
          return <span className="text-sm">{organizationType}</span>;
        }
        
        return (
          <div className="flex items-center gap-2">
            <span className="text-base">{orgType.icon}</span>
            <div>
              <div className="font-medium text-sm">{orgType.displayName}</div>
              <div className="text-xs text-muted-foreground">{orgType.sector}</div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "contact",
      header: "Contact",
      enableHiding: true,
      cell: ({ row }) => {
        const email = row.original.email;
        const phone = row.original.phone;
        const contact = row.original.contact;
        
        return (
          <div className="space-y-1">
            {contact && <div className="font-medium text-sm">{contact}</div>}
            {email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                {email}
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                {phone}
              </div>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "address",
      header: "Adresse",
      enableHiding: true,
      cell: ({ row }) => {
        const fullAddress = row.original.fullAddress;
        const city = row.original.city;
        const country = row.original.country;
        
        if (fullAddress) {
          return (
            <div className="flex items-start gap-2">
              <MapPin className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
              <span className="text-sm line-clamp-2">{fullAddress}</span>
            </div>
          );
        }
        
        if (city || country) {
          return (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{[city, country].filter(Boolean).join(", ")}</span>
            </div>
          );
        }
        
        return <span className="text-muted-foreground">-</span>;
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
      cell: ({ row }) => <SuperStructureBadge status={row.getValue("status")} />
    },
    {
      accessorKey: "structures",
      header: "Structures",
      cell: ({ row }) => {
        const total = row.original.totalStructures || 0;
        const active = row.original.activeStructures || 0;
        
        return (
          <div className="text-center">
            <div className="font-medium">{active}/{total}</div>
            <div className="text-xs text-muted-foreground">Actives/Total</div>
          </div>
        );
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
      cell: ({ row }) => formatDate(row.getValue("createdAt"))
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
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
               <PermissionGate permissions={[PERMISSIONS.ORGANIZATION.SUPERSTRUCTURE_UPDATE]}>
                 <DropdownMenuItem onClick={() => onView(row.original)}>
                   <Eye className="mr-2 h-4 w-4" />
                   Voir détails
                 </DropdownMenuItem>
               </PermissionGate>

                <PermissionGate permissions={[PERMISSIONS.ORGANIZATION.SUPERSTRUCTURE_READ]}>
                  <DropdownMenuItem onClick={() => onEdit(row.original)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                </PermissionGate>
                <PermissionGate permissions={[PERMISSIONS.ORGANIZATION.SUPERSTRUCTURE_DELETE]}>
                  <DropdownMenuItem
                    onClick={() => onDelete(row.original)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </PermissionGate>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ];
}