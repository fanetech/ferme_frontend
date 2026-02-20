"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  MapPin,
  Clock,
  Shield,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Ban
} from "lucide-react";
import { SessionInfoResponse } from "@/types/sessions";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface SessionColumnsProps {
  sortBy: string;
  sortDir: 'ASC' | 'DESC';
  onSort: (field: string, direction: 'ASC' | 'DESC') => void;
  onViewDetails: (sessionId: string) => void;
  onRevokeSession: (sessionId: string) => void;
  selectedSessions: string[];
  onSelectionChange: (sessionIds: string[]) => void;
}

const SortButton = ({ field, sortBy, sortDir, onSort, children }: {
  field: string;
  sortBy: string;
  sortDir: 'ASC' | 'DESC';
  onSort: (field: string, direction: 'ASC' | 'DESC') => void;
  children: React.ReactNode;
}) => {
  const isActive = sortBy === field;
  const nextDirection = isActive && sortDir === 'ASC' ? 'DESC' : 'ASC';

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 data-[state=open]:bg-accent"
      onClick={() => onSort(field, nextDirection)}
    >
      {children}
      {isActive ? (
        sortDir === 'ASC' ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
};

export const createSessionColumns = ({ 
  sortBy,
  sortDir,
  onSort,
  onViewDetails,
  onRevokeSession,
  selectedSessions, 
  onSelectionChange 
}: SessionColumnsProps): ColumnDef<SessionInfoResponse>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => {
          table.toggleAllPageRowsSelected(!!value);
          if (value) {
            const allSessionIds = table.getRowModel().rows.map(row => row.original.sessionId);
            onSelectionChange([...new Set([...selectedSessions, ...allSessionIds])]);
          } else {
            const pageSessionIds = table.getRowModel().rows.map(row => row.original.sessionId);
            onSelectionChange(selectedSessions.filter(id => !pageSessionIds.includes(id)));
          }
        }}
        aria-label="Sélectionner tout"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={selectedSessions.includes(row.original.sessionId)}
        onCheckedChange={(value) => {
          const sessionId = row.original.sessionId;
          if (value) {
            onSelectionChange([...selectedSessions, sessionId]);
          } else {
            onSelectionChange(selectedSessions.filter(id => id !== sessionId));
          }
        }}
        aria-label="Sélectionner la ligne"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "userEmail",
    header: ({ column }) => (
      <SortButton field="userEmail" sortBy={sortBy} sortDir={sortDir} onSort={onSort}>
        Utilisateur
      </SortButton>
    ),
    cell: ({ row }) => {
      const session = row.original;
      return (
        <div className="space-y-1">
          <div className="font-medium">{session.userFullName || session.userEmail || 'N/A'}</div>
          {session.userEmail && session.userFullName && (
            <div className="text-xs text-muted-foreground">{session.userEmail}</div>
          )}
          <div className="text-xs text-muted-foreground">{session.userId}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "deviceType",
    header: ({ column }) => (
      <SortButton field="deviceType" sortBy={sortBy} sortDir={sortDir} onSort={onSort}>
        Appareil
      </SortButton>
    ),
    cell: ({ row }) => {
      const session = row.original;
      const getDeviceIcon = () => {
        switch (session.deviceType?.toUpperCase()) {
          case 'MOBILE': return <Smartphone className="h-4 w-4" />;
          case 'TABLET': return <Tablet className="h-4 w-4" />;
          case 'DESKTOP': return <Monitor className="h-4 w-4" />;
          default: return <Globe className="h-4 w-4" />;
        }
      };

      const getDeviceLabel = () => {
        switch (session.deviceType?.toUpperCase()) {
          case 'MOBILE': return 'Mobile';
          case 'TABLET': return 'Tablette';
          case 'DESKTOP': return 'Desktop';
          case 'WEB': return 'Web';
          default: return 'Inconnu';
        }
      };

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {getDeviceIcon()}
            <span className="font-medium">{getDeviceLabel()}</span>
          </div>
          {session.deviceName && (
            <div className="text-xs text-muted-foreground">{session.deviceName}</div>
          )}
          {session.operatingSystem && (
            <div className="text-xs text-muted-foreground">{session.operatingSystem}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Localisation",
    cell: ({ row }) => {
      const session = row.original;
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{session.location || 'Inconnue'}</span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">{session.ipAddress}</div>
          {session.timezone && (
            <div className="text-xs text-muted-foreground">{session.timezone}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <SortButton field="createdAt" sortBy={sortBy} sortDir={sortDir} onSort={onSort}>
        Créée
      </SortButton>
    ),
    cell: ({ row }) => {
      const session = row.original;
      if (!session.createdAt) return 'N/A';
      
      const createdDate = new Date(session.createdAt);
      return (
        <div className="space-y-1">
          <div className="text-sm">{format(createdDate, "dd/MM/yyyy", { locale: fr })}</div>
          <div className="text-xs text-muted-foreground">{format(createdDate, "HH:mm:ss", { locale: fr })}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "lastAccessAt",
    header: ({ column }) => (
      <SortButton field="lastAccessAt" sortBy={sortBy} sortDir={sortDir} onSort={onSort}>
        Dernier accès
      </SortButton>
    ),
    cell: ({ row }) => {
      const session = row.original;
      if (!session.lastAccessAt) return 'N/A';
      
      const lastAccessDate = new Date(session.lastAccessAt);
      return (
        <div className="space-y-1">
          <div className="text-sm">
            {formatDistanceToNow(lastAccessDate, { addSuffix: true, locale: fr })}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(lastAccessDate, "HH:mm:ss", { locale: fr })}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "durationMinutes",
    header: "Durée",
    cell: ({ row }) => {
      const session = row.original;
      if (!session.durationMinutes) return 'N/A';
      
      const hours = Math.floor(session.durationMinutes / 60);
      const minutes = session.durationMinutes % 60;
      
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
            </span>
          </div>
          {session.isLongSession && (
            <Badge variant="outline" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Longue
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const session = row.original;
      
      const getStatusBadge = () => {
        if (session.isExpired) {
          return <Badge variant="destructive">Expirée</Badge>;
        }
        if (session.isActive) {
          return <Badge className="bg-green-100 text-green-800">Active</Badge>;
        }
        return <Badge variant="secondary">Inactive</Badge>;
      };

      return (
        <div className="space-y-1">
          {getStatusBadge()}
          {session.isCurrentSession && (
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-blue-600">Session actuelle</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "accessCount",
    header: "Accès",
    cell: ({ row }) => {
      const session = row.original;
      return (
        <div className="text-center">
          <div className="text-sm font-medium">{session.accessCount || 0}</div>
          <div className="text-xs text-muted-foreground">requêtes</div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const session = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onViewDetails(session.sessionId)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Voir les détails
            </DropdownMenuItem>
            {session.isActive && !session.isCurrentSession && (
              <DropdownMenuItem
                onClick={() => onRevokeSession(session.sessionId)}
                className="text-red-600"
              >
                <Ban className="mr-2 h-4 w-4" />
                Révoquer
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];