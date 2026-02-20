import { ColumnDef } from "@tanstack/react-table";
import { Payment } from "@/data/payment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, Receipt, RefreshCw, XCircle, CheckCircle, DollarSign, RotateCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import PermissionGate from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/constants";

interface PaymentColumnsProps {
  onView: (payment: Payment) => void;
  onValidate: (payment: Payment) => void;
  onCancel: (payment: Payment) => void;
  onRefund: (payment: Payment) => void;
  onRetry: (payment: Payment) => void;
  onGenerateReceipt: (payment: Payment) => void;
  onCheckStatus: (payment: Payment) => void;
}

export const getPaymentStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; className: string }> = {
    INITIATED: { label: "Initié", className: "bg-blue-100 text-blue-800" },
    PENDING: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
    PROCESSING: { label: "En traitement", className: "bg-orange-100 text-orange-800" },
    PENDING_AUTHENTICATION: { label: "Auth. requise", className: "bg-purple-100 text-purple-800" },
    COMPLETED: { label: "Complété", className: "bg-green-100 text-green-800" },
    FAILED: { label: "Échoué", className: "bg-red-100 text-red-800" },
    CANCELLED: { label: "Annulé", className: "bg-gray-100 text-gray-800" },
    EXPIRED: { label: "Expiré", className: "bg-gray-100 text-gray-800" },
    REFUNDED: { label: "Remboursé", className: "bg-cyan-100 text-cyan-800" },
    PARTIALLY_REFUNDED: { label: "Part. remboursé", className: "bg-cyan-100 text-cyan-800" },
  };

  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };

  return (
    <Badge className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
};

export const getPaymentMethodBadge = (method: string) => {
  const methodConfig: Record<string, { label: string; className: string }> = {
    CARD: { label: "Carte", className: "bg-blue-50 text-blue-700" },
    MOBILE_MONEY: { label: "Mobile Money", className: "bg-green-50 text-green-700" },
    CASH: { label: "Espèces", className: "bg-yellow-50 text-yellow-700" },
    BANK_TRANSFER: { label: "Virement", className: "bg-purple-50 text-purple-700" },
  };

  const config = methodConfig[method] || { label: method, className: "bg-gray-50 text-gray-700" };

  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
};

export const createPaymentColumns = ({
  onView,
  onValidate,
  onCancel,
  onRefund,
  onRetry,
  onGenerateReceipt,
  onCheckStatus,
}: PaymentColumnsProps): ColumnDef<Payment>[] => [
  {
    accessorKey: "paymentReference",
    header: "Référence",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("paymentReference")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => getPaymentStatusBadge(row.getValue("status")),
  },
  {
    accessorKey: "paymentMethod",
    header: "Méthode",
    cell: ({ row }) => getPaymentMethodBadge(row.getValue("paymentMethod")),
  },
  {
    accessorKey: "requestedAmount",
    header: "Montant",
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.getValue("requestedAmount"), row.original.currency)}
      </div>
    ),
  },
  {
    accessorKey: "initiatedByName",
    header: "Initié par",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">
        {row.getValue("initiatedByName") || "-"}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date création",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const payment = row.original;
      
      // Convert status to uppercase for comparison
      const statusUpper = payment.status?.toUpperCase() || "";
      
      // Determine which actions to show based on status
      // Validate only for PENDING and FAILED statuses
      const canValidate = statusUpper === "PENDING" || statusUpper === "FAILED";
      
      const canCancel = statusUpper !== "COMPLETED" && 
                       statusUpper !== "CANCELLED" && 
                       statusUpper !== "REFUNDED" &&
                       statusUpper !== "FAILED" &&
                       statusUpper !== "EXPIRED";
      
      const canRefund = statusUpper === "COMPLETED" || statusUpper === "PARTIALLY_REFUNDED";
      
      const canRetry = statusUpper === "FAILED" || statusUpper === "EXPIRED";
      
      const canGenerateReceipt = statusUpper === "COMPLETED";
      
      const canCheckStatus = statusUpper === "PENDING" || 
                           statusUpper === "PROCESSING" || 
                           statusUpper === "INITIATED" ||
                           statusUpper === "PENDING_AUTHENTICATION";
      
      return (
        <div className="flex items-center justify-end gap-1">
          {/* View Details Button - Always visible */}
          <PermissionGate permissions={[PERMISSIONS.PAYMENT.READ]}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(payment);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Voir détails</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Voir détails</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </PermissionGate>

          {/* Dropdown Menu for all actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              
              <PermissionGate permissions={[PERMISSIONS.PAYMENT.READ]}>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(payment);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Voir détails
                </DropdownMenuItem>
              </PermissionGate>
              
              <DropdownMenuSeparator />
              
              {/* Validate - Only for PENDING and FAILED */}
              <PermissionGate permissions={[PERMISSIONS.PAYMENT.VALIDATE]}>
                {canValidate && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Validate clicked for payment:", payment);
                      onValidate(payment);
                    }}
                    className="text-green-600 focus:text-green-600"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Valider le paiement
                  </DropdownMenuItem>
                )}
              </PermissionGate>
              
              {/* Cancel */}
              <PermissionGate permissions={[PERMISSIONS.PAYMENT.CANCEL]}>
                {canCancel && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Cancel clicked for payment:", payment);
                      onCancel(payment);
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Annuler le paiement
                  </DropdownMenuItem>
                )}
              </PermissionGate>
              
              {/* Refund */}
              <PermissionGate permissions={[PERMISSIONS.PAYMENT.REFUND]}>
                {canRefund && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Refund clicked for payment:", payment);
                      onRefund(payment);
                    }}
                    className="text-orange-600 focus:text-orange-600"
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Rembourser
                  </DropdownMenuItem>
                )}
              </PermissionGate>
              
              {/* Retry */}
              <PermissionGate permissions={[PERMISSIONS.PAYMENT.RETRY]}>
                {canRetry && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Retry clicked for payment:", payment);
                      onRetry(payment);
                    }}
                    className="text-blue-600 focus:text-blue-600"
                  >
                    <RotateCw className="mr-2 h-4 w-4" />
                    Réessayer le paiement
                  </DropdownMenuItem>
                )}
              </PermissionGate>
              
              {/* Generate Receipt */}
              {canGenerateReceipt && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Generate receipt clicked for payment:", payment);
                      onGenerateReceipt(payment);
                    }}
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    Générer le reçu
                  </DropdownMenuItem>
                </>
              )}
              
              {/* Check Status */}
              {canCheckStatus && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Check status clicked for payment:", payment);
                    onCheckStatus(payment);
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Vérifier le statut
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];