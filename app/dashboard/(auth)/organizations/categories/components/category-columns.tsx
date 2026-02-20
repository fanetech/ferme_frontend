"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Edit, Trash2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import type { Category } from "@/types/organization";
import { CategoryBadge } from "./category-badge";
import { getCategoryIcon } from "@/lib/constants/category-icons";
import PermissionGate from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/constants";

interface CategoryActionsProps {
  category: Category;
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

function CategoryActions({ category, onView, onEdit, onDelete }: CategoryActionsProps) {
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
        <PermissionGate permissions={[PERMISSIONS.ORGANIZATION.CATEGORY_READ]}>
          <DropdownMenuItem onClick={() => onView(category)}>
            <Eye className="mr-2 h-4 w-4" />
            Voir détails
          </DropdownMenuItem>
        </PermissionGate>

        <PermissionGate permissions={[PERMISSIONS.ORGANIZATION.CATEGORY_UPDATE]}>
          <DropdownMenuItem onClick={() => onEdit(category)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
        </PermissionGate>
        <PermissionGate permissions={[PERMISSIONS.ORGANIZATION.CATEGORY_DELETE]}>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(category)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </PermissionGate>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface CategoryIconCellProps {
  icon?: string;
  color?: string;
  name: string;
}

function CategoryIconCell({ icon, color, name }: CategoryIconCellProps) {
  const categoryIcon = getCategoryIcon(icon);
  const IconComponent = categoryIcon.component;
  
  return (
    <div className="flex items-center gap-3">
      <div 
        className="p-2 rounded-md flex-shrink-0"
        style={{ backgroundColor: color || "#007bff" }}
        title={categoryIcon.label}
      >
        <IconComponent className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0">
        <div className="font-medium truncate">{name}</div>
        <div className="text-xs text-muted-foreground">
          {categoryIcon.label}
        </div>
      </div>
    </div>
  );
}

interface CreateCategoryColumnsProps {
  sortBy: string;
  sortDir: 'ASC' | 'DESC';
  onSort: (field: string, direction: 'ASC' | 'DESC') => void;
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function createCategoryColumns({
  sortBy,
  sortDir,
  onSort,
  onView,
  onEdit,
  onDelete
}: CreateCategoryColumnsProps): ColumnDef<Category>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Catégorie
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const category = row.original;
        return (
          <CategoryIconCell
            icon={category.icon}
            color={category.color}
            name={category.name}
          />
        );
      },
    },
    {
      accessorKey: "code",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Code
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <code className="bg-muted px-2 py-1 rounded text-sm">
            {row.getValue("code")}
          </code>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-[300px]">
            {description ? (
              <span className="text-sm text-muted-foreground line-clamp-2">
                {description}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Aucune description
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "superStructureName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Super Structure
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const superStructureName = row.getValue("superStructureName") as string;
        return (
          <div className="max-w-[200px]">
            {superStructureName ? (
              <span className="text-sm truncate block">
                {superStructureName}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Non définie
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "displayOrder",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Ordre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const order = row.getValue("displayOrder") as number;
        return (
          <Badge variant="outline" className="text-xs">
            {order ?? "-"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "totalServices",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold text-center"
          >
            Services
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const total = row.getValue("totalServices") as number;
        return (
          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              {total ?? 0}
            </Badge>
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
        return <CategoryBadge status={row.getValue("status")} />;
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
        const category = row.original;
        return (
          <CategoryActions
            category={category}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      },
    },
  ];
}
