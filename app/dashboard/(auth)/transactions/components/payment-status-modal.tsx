import { useState } from "react";
import { Payment } from "@/data/payment";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { getPaymentStatusBadge } from "./payment-columns";

interface PaymentStatusResponse {
  paymentId: string;
  reference: string;
  status: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  lastUpdated: string;
  gatewayStatus?: string;
  gatewayMessage?: string;
}

interface PaymentStatusModalProps {
  payment: Payment | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onCheckStatus: (payment: Payment) => Promise<PaymentStatusResponse>;
  onStatusChecked?: () => void;
}

export function PaymentStatusModal({
  payment,
  isOpen,
  isLoading = false,
  onClose,
  onCheckStatus,
  onStatusChecked
}: PaymentStatusModalProps) {
  const [statusResult, setStatusResult] = useState<PaymentStatusResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckStatus = async () => {
    if (!payment) return;

    setIsChecking(true);
    setError(null);

    try {
      const result = await onCheckStatus(payment);
      setStatusResult(result);

      if (onStatusChecked) {
        onStatusChecked();
      }
    } catch (err) {
      setError("Erreur lors de la vérification du statut");
    } finally {
      setIsChecking(false);
    }
  };

  const handleClose = () => {
    setStatusResult(null);
    setError(null);
    onClose();
  };

  if (!payment) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case "FAILED":
      case "CANCELLED":
      case "EXPIRED":
        return <XCircle className="h-12 w-12 text-red-500" />;
      case "PENDING":
      case "PROCESSING":
      case "PENDING_AUTHENTICATION":
        return <Clock className="h-12 w-12 text-orange-500" />;
      default:
        return <AlertCircle className="h-12 w-12 text-gray-500" />;
    }
  };

  const titleIcon = <RefreshCw className="h-5 w-5 text-blue-600" />;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Vérification du statut du paiement"
      titleIcon={titleIcon}
      subtitle={`Vérifier le statut actuel du paiement ${payment.paymentReference}`}
      size="md"
    >
      <div className="space-y-4">
        {/* Informations du paiement */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Référence</span>
            <span className="text-sm font-mono">{payment.paymentReference}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Statut actuel</span>
            {getPaymentStatusBadge(payment.status)}
          </div>
        </div>

        {/* Résultat de la vérification */}
        {statusResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-4">
              {getStatusIcon(statusResult.status)}
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                Statut mis à jour
              </h3>
              <div className="flex justify-center mb-4">
                {getPaymentStatusBadge(statusResult.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Montant demandé</p>
                <p className="font-medium">{formatCurrency(statusResult.amount, payment.currency)}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Montant payé</p>
                <p className="font-medium text-green-600">
                  {formatCurrency(statusResult.paidAmount, payment.currency)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Montant restant</p>
                <p className="font-medium">
                  {formatCurrency(statusResult.remainingAmount, payment.currency)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Dernière mise à jour</p>
                <p className="font-medium">{formatDate(statusResult.lastUpdated)}</p>
              </div>
            </div>

            {statusResult.gatewayStatus && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Statut passerelle
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{statusResult.gatewayStatus}</Badge>
                  {statusResult.gatewayMessage && (
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      {statusResult.gatewayMessage}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleCheckStatus}
            disabled={isChecking}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? "Vérification..." : "Vérifier le statut"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isChecking}
          >
            Fermer
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
