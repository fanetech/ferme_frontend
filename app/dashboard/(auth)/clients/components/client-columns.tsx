import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Ban,
  CheckCircle,
  Award,
  Phone,
  Mail,
  ChevronUp,
  ChevronDown,
  UserCheck,
  Shield
} from "lucide-react";
import type { Client, ClientResponse } from "@/types/clients";
import { ClientBadge } from "./client-badge";
import { formatDate } from "@/lib/utils";

interface CreateClientColumnsProps {
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  onSort?: (field: string, direction: 'ASC' | 'DESC') => void;
  onView?: (client: Client) => void;
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onStatusChange?: (client: Client, action: string) => void;
  onEnrollLoyalty?: (client: Client) => void;
}

export const createClientColumns = ({
  sortBy,
  sortDir,
  onSort,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onEnrollLoyalty
}: CreateClientColumnsProps): ColumnDef<ClientResponse>[] => {
  const SortButton = ({ column, label }: { column: string; label: string }) => {
    const isActive = sortBy === column;
    const Icon = sortDir === 'ASC' ? ChevronUp : ChevronDown;
    
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => {
          if (onSort) {
            const newDirection = isActive && sortDir === 'ASC' ? 'DESC' : 'ASC';
            onSort(column, newDirection);
          }
        }}
      >
        <span>{label}</span>
        {isActive && <Icon className="ml-2 h-4 w-4" />}
      </Button>
    );
  };

  return [
    {
      accessorKey: "code",
      header: ({ column }) => <SortButton column="code" label="Code" />,
      cell: ({ row }) => (
        <div className="font-medium">{row.original.code}</div>
      ),
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => <SortButton column="lastName" label="Nom complet" />,
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {client.firstName} {client.lastName}
            </span>
            {client.type === 'COMPANY' && client.organizationName && (
              <span className="text-xs text-muted-foreground">
                {client.organizationName}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => {
        const client = row.original;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{client.phone}</span>
            </div>
            {client.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{client.email}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => <SortButton column="type" label="Type" />,
      cell: ({ row }) => {
        const type = row.original.type;
        const typeConfig = {
          INDIVIDUAL: { label: "Particulier", variant: "default" as const },
          COMPANY: { label: "Entreprise", variant: "secondary" as const },
          GOVERNMENT: { label: "Gouvernement", variant: "outline" as const },
        };
        const config = typeConfig[type] || { label: type, variant: "default" as const };
        
        return (
          <Badge variant={config.variant}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <SortButton column="status" label="Statut" />,
      cell: ({ row }) => <ClientBadge status={row.original.status} />,
    },
    {
      accessorKey: "loyalty",
      header: "Fidélité",
      cell: ({ row }) => {
        const client = row.original;
        if (client.isLoyaltyMember) {
          return (
            <div className="flex flex-col gap-1">
              <Badge variant="default" className="w-fit">
                <Award className="h-3 w-3 mr-1" />
                {client.loyaltyTier || "Membre"}
              </Badge>
              {client.loyaltyPoints !== undefined && (
                <span className="text-xs text-muted-foreground">
                  {client.loyaltyPoints} pts
                </span>
              )}
            </div>
          );
        }
        return <span className="text-xs text-muted-foreground">Non membre</span>;
      },
    },
    {
      accessorKey: "transactions",
      header: ({ column }) => <SortButton column="totalTransactions" label="Transactions" />,
      cell: ({ row }) => {
        const client = row.original;
        if (client.totalTransactions || client.totalAmount) {
          return (
            <div className="flex flex-col text-right">
              {client.totalTransactions !== undefined && (
                <span className="font-medium">{client.totalTransactions}</span>
              )}
              {client.totalAmount !== undefined && (
                <span className="text-xs text-muted-foreground">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'XOF',
                    minimumFractionDigits: 0
                  }).format(client.totalAmount)}
                </span>
              )}
            </div>
          );
        }
        return <span className="text-xs text-muted-foreground">Aucune</span>;
      },
    },
    {
      accessorKey: "profileCompletion",
      header: "Profil",
      cell: ({ row }) => {
        const completion = row.original.profileCompletion || 0;
        const getColor = (value: number) => {
          if (value >= 80) return "text-green-600";
          if (value >= 50) return "text-yellow-600";
          return "text-red-600";
        };
        
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${getColor(completion)}`}>
              {completion}%
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <SortButton column="createdAt" label="Créé le" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt!)}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const client = row.original;
        const isBlocked = client.status === 'BLOCKED';
        const isLoyaltyMember = client.isLoyaltyMember;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              
              <DropdownMenuItem onClick={() => onView?.(client)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => onEdit?.(client)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {!isLoyaltyMember && (
                <DropdownMenuItem onClick={() => onEnrollLoyalty?.(client)}>
                  <Award className="mr-2 h-4 w-4" />
                  Inscrire au programme de fidélité
                </DropdownMenuItem>
              )}
              
              {/* Status change actions based on current status */}
              {client.status === 'BLOCKED' && (
                <DropdownMenuItem onClick={() => onStatusChange?.(client, 'unblock')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Débloquer
                </DropdownMenuItem>
              )}
              
              {client.status === 'ACTIVE' && (
                <>
                  <DropdownMenuItem 
                    onClick={() => onStatusChange?.(client, 'block')}
                    className="text-orange-600"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Bloquer
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => onStatusChange?.(client, 'deactivate')}
                    className="text-gray-600"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Désactiver
                  </DropdownMenuItem>
                </>
              )}
              
              {client.status === 'SUSPENDED' && (
                <>
                  <DropdownMenuItem onClick={() => onStatusChange?.(client, 'activate')}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Activer
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => onStatusChange?.(client, 'block')}
                    className="text-orange-600"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Bloquer
                  </DropdownMenuItem>
                </>
              )}
              
              {client.status === 'INACTIVE' && (
                <DropdownMenuItem onClick={() => onStatusChange?.(client, 'activate')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Réactiver
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
