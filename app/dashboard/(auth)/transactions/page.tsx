"use client";

import { useState } from "react";
import { CreditCard, Download, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import {
  createPaymentColumns,
  PaymentDetailsModal,
  PaymentCancelModal,
  PaymentRefundModal,
  PaymentValidateModal,
  PaymentRetryModal,
  PaymentSearchModal,
  PaymentStatusModal,
  type PaymentValidationData,
} from "./components";
import { usePaymentModals } from "./hooks/usePaymentModals";
import type { Payment, PaymentSearchParams, PaymentSearchCriteria } from "@/data/payment";
import {
  usePayments,
  useCancelPayment,
  useValidatePayment,
  useProcessRefund,
  useRetryPayment,
  useCheckPaymentStatus,
  useGenerateReceipt,
} from "@/data/payment";
import { useStructuresForFilter } from "@/data/organization";
import PermissionGate from "@/components/auth/permission-gate";
import { PERMISSIONS } from "@/lib/constants";
import type { FilterConfig } from "@/types";

export default function TransactionsPage() {
  // États pour les filtres et la pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [paymentMethod, setPaymentMethod] = useState<string>("ALL");
  const [structureId, setStructureId] = useState("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');
  
  // Modal management
  const {
    modals,
    openDetailsModal,
    openCancelModal,
    openRefundModal,
    openValidateModal,
    openRetryModal,
    openSearchModal,
    openStatusModal,
    closeModal,
  } = usePaymentModals();
  
  // Mutations
  const cancelPayment = useCancelPayment();
  const validatePayment = useValidatePayment();
  const processRefund = useProcessRefund();
  const retryPayment = useRetryPayment();
  const checkPaymentStatus = useCheckPaymentStatus();
  const generateReceipt = useGenerateReceipt();
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Construire les critères de recherche
  const searchCriteria: PaymentSearchCriteria = {
    paymentReference: debouncedSearchTerm || undefined,
    statuses: status === "ALL" ? undefined : [status],
    paymentMethods: paymentMethod === "ALL" ? undefined : [paymentMethod],
    structureId: structureId === "ALL" ? undefined : structureId,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    minAmount: minAmount ? parseFloat(minAmount) : undefined,
    maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
  };
  
  // Paramètres de recherche
  const searchParams: PaymentSearchParams = {
    page: currentPage - 1, // L'API commence à 0
    size: pageSize,
    sortBy,
    sortDirection: sortDir,
    criteria: searchCriteria,
  };

  // Requête des données
  const { data: response, isLoading, error, refetch } = usePayments(searchParams);
  const { data: structuresData } = useStructuresForFilter();
  
  // Configuration des filtres
  const filters: FilterConfig[] = [
    {
      key: "status",
      label: "Statut",
      type: "select",
      options: [
        { value: "INITIATED", label: "Initié" },
        { value: "PENDING", label: "En attente" },
        { value: "PROCESSING", label: "En traitement" },
        { value: "PENDING_AUTHENTICATION", label: "Auth. requise" },
        { value: "COMPLETED", label: "Complété" },
        { value: "FAILED", label: "Échoué" },
        { value: "CANCELLED", label: "Annulé" },
        { value: "EXPIRED", label: "Expiré" },
        { value: "REFUNDED", label: "Remboursé" },
        { value: "PARTIALLY_REFUNDED", label: "Part. remboursé" }
      ],
      value: status,
      onChange: (value: string | string[]) => {
        if (typeof value === 'string') {
          setStatus(value);
        }
      }
    },
    {
      key: "paymentMethod",
      label: "Méthode",
      type: "select",
      options: [
        { value: "CARD", label: "Carte" },
        { value: "MOBILE_MONEY", label: "Mobile Money" },
        { value: "CASH", label: "Espèces" },
        { value: "BANK_TRANSFER", label: "Virement" }
      ],
      value: paymentMethod,
      onChange: (value: string | string[]) => {
        if (typeof value === 'string') {
          setPaymentMethod(value);
        }
      }
    },
    {
      key: "structureId",
      label: "Structure",
      type: "select",
      options: structuresData?.content?.map(s => ({
        value: s.id,
        label: `${s.code} - ${s.name}`
      })) || [],
      value: structureId,
      onChange: (value: string | string[]) => {
        if (typeof value === 'string') {
          setStructureId(value);
        }
      }
    },
    {
      key: "startDate",
      label: "Date début",
      type: "date",
      value: startDate,
      onChange: (value: string | string[]) => {
        if (typeof value === 'string') {
          setStartDate(value);
        }
      }
    },
    {
      key: "endDate",
      label: "Date fin",
      type: "date",
      value: endDate,
      onChange: (value: string | string[]) => {
        if (typeof value === 'string') {
          setEndDate(value);
        }
      }
    },
    {
      key: "minAmount",
      label: "Montant min",
      type: "number",
      value: minAmount,
      onChange: (value: string | string[]) => {
        if (typeof value === 'string') {
          setMinAmount(value);
        }
      }
    },
    {
      key: "maxAmount",
      label: "Montant max",
      type: "number",
      value: maxAmount,
      onChange: (value: string | string[]) => {
        if (typeof value === 'string') {
          setMaxAmount(value);
        }
      }
    }
  ];
  
  // Actions sur les lignes
  const handleView = (payment: Payment) => {
    openDetailsModal(payment);
  };
  
  const handleValidate = (payment: Payment) => {
    openValidateModal(payment);
  };
  
  const handleCancel = (payment: Payment) => {
    openCancelModal(payment);
  };
  
  const handleRefund = (payment: Payment) => {
    openRefundModal(payment);
  };

  const handleGenerateReceipt = async (payment: Payment) => {
    try {
      await generateReceipt.mutateAsync(payment.id);
      toast.success("Reçu généré avec succès");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors de la génération du reçu");
    }
  };

  const handleCheckStatus = async (payment: Payment) => {
    openStatusModal(payment);
  };

  const handleStatusCheck = async (payment: Payment) => {
    try {
      const result = await checkPaymentStatus.mutateAsync(payment.id);
      toast.success("Statut mis à jour");
      refetch();
      return result;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors de la vérification du statut");
      throw error;
    }
  };

  const handleConfirmCancel = async (payment: Payment, reason: string) => {
    try {
      await cancelPayment.mutateAsync({
        id: payment.id,
        data: { reason }
      });
      toast.success("Paiement annulé avec succès");
      closeModal('cancel');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors de l'annulation");
      throw error;
    }
  };

  const handleConfirmRefund = async (payment: Payment, refundData: any) => {
    try {
      await processRefund.mutateAsync({
        id: payment.id,
        data: refundData
      });
      toast.success("Remboursement effectué avec succès");
      closeModal('refund');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors du remboursement");
      throw error;
    }
  };

  const handleConfirmValidate = async (payment: Payment, validationData: PaymentValidationData) => {
    try {
      await validatePayment.mutateAsync({
        id: payment.id,
        data: validationData
      });
      toast.success("Paiement validé avec succès");
      closeModal('validate');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors de la validation");
    }
  };

  const handleRetry = (payment: Payment) => {
    openRetryModal(payment);
  };

  const handleConfirmRetry = async (payment: Payment, data: any) => {
    try {
      await retryPayment.mutateAsync({
        id: payment.id,
        data
      });
      toast.success("Nouvelle tentative de paiement initiée");
      closeModal('retry');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors de la nouvelle tentative");
    }
  };

  const handlePaymentFound = (payment: Payment) => {
    openDetailsModal(payment);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info("Fonctionnalité d'export en cours de développement");
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Données actualisées");
  };
  
  // Colonnes du tableau
  const columns = createPaymentColumns({
    onView: handleView,
    onValidate: handleValidate,
    onCancel: handleCancel,
    onRefund: handleRefund,
    onRetry: handleRetry,
    onGenerateReceipt: handleGenerateReceipt,
    onCheckStatus: handleCheckStatus,
  });
  
  return (
    <div className="space-y-4">
      {/* Header avec boutons */}
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold tracking-tight">Paiements & Transactions</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openSearchModal}>
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <PermissionGate permissions={[PERMISSIONS.PAYMENT.EXPORT]}>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </PermissionGate>
        </div>
      </div>
      
      {/* Tableau des données */}
      <PermissionGate permissions={[PERMISSIONS.PAYMENT.READ]}>
        <div className="pt-4">
          <DataTable
            data={response?.content || []}
            columns={columns}
            totalElements={response?.totalElements || 0}
            totalPages={response?.totalPages || 0}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1); // Reset to first page
            }}
            sortBy={sortBy}
            sortDir={sortDir}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Rechercher par référence de paiement..."
            filters={filters}
            isLoading={isLoading}
            emptyMessage="Aucun paiement trouvé."
            defaultColumnVisibility={{
              clientName: false,
              completionPercentage: false,
            }}
          />
        </div>
      </PermissionGate>
      
      {/* Modals */}
      <PaymentDetailsModal
        payment={modals.details.payment}
        isOpen={modals.details.isOpen}
        onClose={() => closeModal('details')}
        onValidate={handleValidate}
        onCancel={handleCancel}
        onRefund={handleRefund}
        onGenerateReceipt={handleGenerateReceipt}
        onCheckStatus={handleCheckStatus}
      />
      
      <PaymentCancelModal
        payment={modals.cancel.payment}
        isOpen={modals.cancel.isOpen}
        isLoading={cancelPayment.isPending}
        onClose={() => closeModal('cancel')}
        onConfirm={handleConfirmCancel}
      />
      
      <PaymentRefundModal
        payment={modals.refund.payment}
        isOpen={modals.refund.isOpen}
        isLoading={processRefund.isPending}
        onClose={() => closeModal('refund')}
        onConfirm={handleConfirmRefund}
      />
      
      <PaymentValidateModal
        payment={modals.validate.payment}
        isOpen={modals.validate.isOpen}
        isLoading={validatePayment.isPending}
        onClose={() => closeModal('validate')}
        onConfirm={handleConfirmValidate}
      />
      
      <PaymentRetryModal
        payment={modals.retry.payment}
        isOpen={modals.retry.isOpen}
        isLoading={retryPayment.isPending}
        onClose={() => closeModal('retry')}
        onConfirm={handleConfirmRetry}
      />
      
      <PaymentSearchModal
        isOpen={modals.search.isOpen}
        onClose={() => closeModal('search')}
        onPaymentFound={handlePaymentFound}
      />
      
      <PaymentStatusModal
        payment={modals.status.payment}
        isOpen={modals.status.isOpen}
        isLoading={checkPaymentStatus.isPending}
        onClose={() => closeModal('status')}
        onCheckStatus={handleStatusCheck}
        onStatusChecked={refetch}
      />
    </div>
  );
}
