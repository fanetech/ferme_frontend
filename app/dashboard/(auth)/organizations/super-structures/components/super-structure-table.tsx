"use client";

import * as React from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Ellipsis, 
  Building2,
  Mail,
  Phone,
  MapPin,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortDirection
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SuperStructureBadge } from "./super-structure-badge";
import type { SuperStructure } from "@/types/organization";
import { formatDate } from "@/lib/utils";

interface SuperStructureTableProps {
  data: SuperStructure[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSort: (field: string, direction: 'ASC' | 'DESC') => void;
  sortBy: string;
  sortDir: 'ASC' | 'DESC';
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

function SortIndicator({ column, sortBy, sortDir }: { 
  column: string; 
  sortBy: string; 
  sortDir: 'ASC' | 'DESC' 
}) {
  if (sortBy !== column) {
    return <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
  }
  
  return sortDir === 'ASC' 
    ? <ChevronUp className="ml-2 h-4 w-4" />
    : <ChevronDown className="ml-2 h-4 w-4" />;
}

export function SuperStructureTable({
  data,
  totalElements,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
  onSort,
  sortBy,
  sortDir,
  onView,
  onEdit,
  onDelete,
  isLoading = false
}: SuperStructureTableProps) {
  const columns: ColumnDef<SuperStructure>[] = [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => onSort('code', sortBy === 'code' && sortDir === 'ASC' ? 'DESC' : 'ASC')}
          className="-ml-4"
        >
          Code
          <SortIndicator column="code" sortBy={sortBy} sortDir={sortDir} />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.getValue("code")}</div>
            <div className="text-sm text-muted-foreground">ID: {row.original.id.slice(0, 8)}...</div>
          </div>
        </div>
      )
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => onSort('name', sortBy === 'name' && sortDir === 'ASC' ? 'DESC' : 'ASC')}
          className="-ml-4"
        >
          Nom
          <SortIndicator column="name" sortBy={sortBy} sortDir={sortDir} />
        </Button>
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
      accessorKey: "contact",
      header: "Contact",
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
        <Button
          variant="ghost"
          onClick={() => onSort('status', sortBy === 'status' && sortDir === 'ASC' ? 'DESC' : 'ASC')}
          className="-ml-4"
        >
          Statut
          <SortIndicator column="status" sortBy={sortBy} sortDir={sortDir} />
        </Button>
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
        <Button
          variant="ghost"
          onClick={() => onSort('createdAt', sortBy === 'createdAt' && sortDir === 'ASC' ? 'DESC' : 'ASC')}
          className="-ml-4"
        >
          Date création
          <SortIndicator column="createdAt" sortBy={sortBy} sortDir={sortDir} />
        </Button>
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
                  <Ellipsis className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onView(row.original.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir détails
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(row.original.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Aucune super structure trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between px-4 py-4">
          <div className="text-sm text-muted-foreground">
            {totalElements > 0 ? (
              <>
                Affichage de {((currentPage - 1) * pageSize) + 1} à{" "}
                {Math.min(currentPage * pageSize, totalElements)} sur {totalElements} entrées
              </>
            ) : (
              "Aucune entrée"
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-sm">
              Page {currentPage} sur {totalPages || 1}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}