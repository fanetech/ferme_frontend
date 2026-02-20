import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Edit, Trash2, Settings, Copy, Package, Zap, Globe } from "lucide-react";
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
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { ServiceProductBadge } from "./service-product-badge";
import type { ServiceProduct, ServiceNature } from "@/types/catalog";
import { formatDate } from "@/lib/utils";

interface CreateColumnsProps {
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
  onSort?: (field: string, direction: 'ASC' | 'DESC') => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onConfig: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function createServiceProductColumns({
  sortBy,
  sortDir,
  onSort,
  onView,
  onEdit,
  onDelete,
  onConfig,
  onDuplicate
}: CreateColumnsProps): ColumnDef<ServiceProduct>[] {
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
      enableHiding: false,
    },
    {
      accessorKey: "displayOrder",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Ordre" 
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => {
        const order = row.getValue("displayOrder") as number;
        return (
          <div className="text-center font-mono text-sm">
            {order || "-"}
          </div>
        );
      },
      enableSorting: true,
      size: 80,
    },
    {
      accessorKey: "serviceNature",
      header: "Type",
      cell: ({ row }) => {
        const nature = row.getValue("serviceNature") as ServiceNature;
        const getIcon = () => {
          switch (nature) {
            case "PRODUCT":
              return <Package className="h-4 w-4 text-blue-600" />;
            case "INTERNAL_SERVICE":
              return <Zap className="h-4 w-4 text-green-600" />;
            case "EXTERNAL_SERVICE":
              return <Globe className="h-4 w-4 text-purple-600" />;
            default:
              return null;
          }
        };
        
        return (
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="text-sm">
              {nature === "PRODUCT" ? "Produit" :
               nature === "INTERNAL_SERVICE" ? "Service interne" :
               nature === "EXTERNAL_SERVICE" ? "Service externe" : nature}
            </span>
          </div>
        );
      },
      enableSorting: false,
      size: 120,
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Code" 
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => {
        const code = row.getValue("code") as string;
        return (
          <div className="font-mono text-sm">
            {code}
          </div>
        );
      },
      enableSorting: true,
      size: 120,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Nom" 
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        const description = row.original.description;
        
        return (
          <div className="flex flex-col">
            <div className="font-medium">{name}</div>
            {description && (
              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                {description}
              </div>
            )}
          </div>
        );
      },
      enableSorting: true,
      minSize: 200,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Montant" 
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => {
        const amount = row.getValue("amount") as number;
        const currency = row.original.currency || "XOF";
        
        return (
          <div className="text-right">
            <div className="font-medium">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: currency === 'XOF' ? 'XOF' : 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(amount)}
            </div>
          </div>
        );
      },
      enableSorting: true,
      size: 120,
    },
    {
      accessorKey: "structureName",
      header: "Structure",
      cell: ({ row }) => {
        const structureName = row.getValue("structureName") as string;
        const structureCode = row.original.structureCode;
        
        return (
          <div className="flex flex-col">
            <div className="font-medium text-sm">{structureName}</div>
            {structureCode && (
              <div className="text-xs text-muted-foreground">{structureCode}</div>
            )}
          </div>
        );
      },
      enableSorting: false,
      size: 150,
    },
    {
      accessorKey: "categoryName",
      header: "Catégorie",
      cell: ({ row }) => {
        const categoryName = row.getValue("categoryName") as string;
        
        return (
          <Badge variant="outline" className="text-xs">
            {categoryName}
          </Badge>
        );
      },
      enableSorting: false,
      size: 120,
    },
    {
      accessorKey: "stockQuantity",
      header: "Stock",
      cell: ({ row }) => {
        const serviceProduct = row.original;
        
        if (serviceProduct.serviceNature !== "PRODUCT") {
          return <div className="text-muted-foreground text-center">-</div>;
        }
        
        const stock = serviceProduct.stockQuantity;
        const minStock = serviceProduct.minStock || 0;
        
        if (stock === undefined || stock === null) {
          return <div className="text-muted-foreground text-center">-</div>;
        }
        
        const isLowStock = stock <= minStock;
        const isOutOfStock = stock === 0;
        
        return (
          <div className="text-center">
            <div className={`font-medium ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
              {stock}
            </div>
            {isOutOfStock && (
              <Badge variant="destructive" className="text-xs">Rupture</Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">Stock faible</Badge>
            )}
          </div>
        );
      },
      enableSorting: false,
      size: 100,
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        
        switch (status) {
          case "ACTIVE":
            return <Badge className="bg-green-100 text-green-800">✅ Actif</Badge>;
          case "INACTIVE":
            return <Badge variant="secondary">⏸️ Inactif</Badge>;
          case "SUSPENDED":
            return <Badge variant="destructive">🚫 Suspendu</Badge>;
          default:
            return <Badge variant="outline">{status}</Badge>;
        }
      },
      enableSorting: false,
      size: 100,
    },
    {
      accessorKey: "hasConfiguration",
      header: "Config",
      cell: ({ row }) => {
        const hasConfig = row.getValue("hasConfiguration") as boolean;
        const serviceNature = row.original.serviceNature;
        
        if (serviceNature === "PRODUCT") {
          return <div className="text-muted-foreground text-center">-</div>;
        }
        
        return (
          <div className="text-center">
            {hasConfig ? (
              <Badge className="bg-blue-100 text-blue-800 text-xs">✅ Configuré</Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">⚠️ À configurer</Badge>
            )}
          </div>
        );
      },
      enableSorting: false,
      size: 100,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Créé le" 
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={onSort}
        />
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return (
          <div className="text-sm text-muted-foreground">
            {formatDate(date)}
          </div>
        );
      },
      enableSorting: true,
      size: 120,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const serviceProduct = row.original;
        const serviceNature = serviceProduct.serviceNature;
        
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
              <DropdownMenuItem onClick={() => onView(serviceProduct.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(serviceProduct.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(serviceProduct.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Dupliquer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {serviceNature !== "PRODUCT" && (
                <DropdownMenuItem onClick={() => onConfig(serviceProduct.id)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuration
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(serviceProduct.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 80,
    },
  ];
}