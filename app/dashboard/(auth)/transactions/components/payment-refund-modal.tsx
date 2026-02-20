import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Payment, RefundRequest } from "@/data/payment";
import { FormModal } from "@/components/ui/modal/FormModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentRefundModalProps {
  payment: Payment | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (payment: Payment, refundData: RefundRequest) => Promise<void>;
}

interface RefundFormData {
  amount: string;
  reason: string;
  notes: string;
  refundType: 'PARTIAL' | 'FULL';
  notifyClient: boolean;
  reasonCode: string;
  externalReference: string;
  showAdvancedOptions: boolean;
}

// Reason codes for categorization
const REASON_CODES = [
  { value: "DAMAGED_GOODS", label: "Marchandise endommagée" },
  { value: "NOT_AS_DESCRIBED", label: "Non conforme à la description" },
  { value: "NOT_RECEIVED", label: "Non reçu" },
  { value: "DUPLICATE_PAYMENT", label: "Paiement en double" },
  { value: "FRAUD", label: "Fraude" },
  { value: "CUSTOMER_REQUEST", label: "Demande du client" },
  { value: "ORDER_CANCELLED", label: "Commande annulée" },
  { value: "TECHNICAL_ERROR", label: "Erreur technique" },
  { value: "QUALITY_ISSUE", label: "Problème de qualité" },
  { value: "OTHER", label: "Autre" },
];

export function PaymentRefundModal({
  payment,
  isOpen,
  isLoading = false,
  onClose,
  onConfirm,
}: PaymentRefundModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
    control,
  } = useForm<RefundFormData>({
    defaultValues: {
      amount: "",
      reason: "",
      notes: "",
      refundType: 'PARTIAL',
      notifyClient: true,
      reasonCode: "",
      externalReference: "",
      showAdvancedOptions: false,
    },
  });

  const refundType = watch("refundType");
  const amount = watch("amount");
  const reason = watch("reason");
  const notes = watch("notes");
  const showAdvancedOptions = watch("showAdvancedOptions");

  // Auto-generate external reference on mount
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setValue("externalReference", `REF-${dateStr}-${randomNum}`);
    }
  }, [isOpen, setValue]);

  // Update amount when refund type changes
  useEffect(() => {
    if (refundType === 'FULL' && payment) {
      setValue("amount", payment.refundableAmount.toString());
    } else if (refundType === 'PARTIAL') {
      setValue("amount", "");
    }
  }, [refundType, payment, setValue]);

  const onSubmit = async (data: RefundFormData) => {
    if (!payment) return;

    // Parse amount safely
    const numAmount = Number(data.amount.trim());

    // Build the request object
    const refundData: any = {
      reason: data.reason.trim(),
      refundType: data.refundType,
      notifyClient: data.notifyClient,
    };

    // Add amount as a number
    if (data.refundType === 'PARTIAL' && numAmount > 0) {
      refundData.amount = numAmount;
    } else if (data.refundType === 'FULL' && payment.refundableAmount > 0) {
      refundData.amount = payment.refundableAmount;
    }

    // Add optional fields only if they have values
    if (data.notes.trim()) {
      refundData.notes = data.notes.trim();
    }
    if (data.reasonCode) {
      refundData.reasonCode = data.reasonCode;
    }
    if (data.externalReference.trim()) {
      refundData.externalReference = data.externalReference.trim();
    }

    await onConfirm(payment, refundData);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!payment) return null;

  const isFullRefundDisabled = payment.refundableAmount === 0;
  const titleIcon = <DollarSign className="h-5 w-5 text-blue-600" />;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Remboursement du paiement"
      titleIcon={titleIcon}
      subtitle={`Paiement ${payment.paymentReference} - Remboursable: ${formatCurrency(payment.refundableAmount, payment.currency)}`}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={`Confirmer le remboursement${refundType === 'FULL' ? ' total' : ''}`}
      isSubmitting={isLoading}
      isDirty={isDirty}
      size="lg"
      footerNote="Le remboursement sera traité immédiatement."
    >
      <div className="space-y-4">
        {/* Payment Info Card */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">
              Informations du paiement
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-blue-700">Référence:</span>{" "}
              <span className="font-medium text-blue-900">{payment.paymentReference}</span>
            </div>
            <div>
              <span className="text-blue-700">Montant payé:</span>{" "}
              <span className="font-medium text-blue-900">
                {formatCurrency(payment.paidAmount, payment.currency)}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Déjà remboursé:</span>{" "}
              <span className="font-medium text-blue-900">
                {formatCurrency(payment.refundedAmount, payment.currency)}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Remboursable:</span>{" "}
              <span className="font-medium text-green-700">
                {formatCurrency(payment.refundableAmount, payment.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Refund Type Selection */}
        <div>
          <Label>Type de remboursement *</Label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="PARTIAL"
                {...register("refundType")}
                className="w-4 h-4"
                disabled={isLoading}
              />
              <span className="text-sm">Remboursement partiel</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="FULL"
                {...register("refundType")}
                className="w-4 h-4"
                disabled={isLoading || isFullRefundDisabled}
              />
              <span className="text-sm">Remboursement total</span>
            </label>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <Label htmlFor="amount">
            Montant à rembourser {refundType === 'PARTIAL' && '*'}
          </Label>
          <div className="relative mt-1">
            <Input
              id="amount"
              type="number"
              {...register("amount", {
                required: refundType === 'PARTIAL' ? "Le montant est obligatoire" : false,
                min: {
                  value: 0.01,
                  message: "Le montant doit être supérieur à 0"
                },
                max: {
                  value: payment.refundableAmount,
                  message: `Le montant ne peut pas dépasser ${formatCurrency(payment.refundableAmount, payment.currency)}`
                },
                validate: (value) => {
                  if (refundType === 'PARTIAL') {
                    const num = Number(value);
                    if (isNaN(num) || num <= 0) {
                      return "Le montant doit être supérieur à 0";
                    }
                    if (num > payment.refundableAmount) {
                      return `Le montant ne peut pas dépasser ${formatCurrency(payment.refundableAmount, payment.currency)}`;
                    }
                  }
                  return true;
                }
              })}
              placeholder={refundType === 'FULL' ?
                formatCurrency(payment.refundableAmount, '') : "0.00"}
              step="0.01"
              min="0.01"
              max={payment.refundableAmount}
              className={errors.amount ? "border-red-500 pr-16" : "pr-16"}
              disabled={isLoading || refundType === 'FULL'}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              {payment.currency}
            </span>
          </div>
          {errors.amount && (
            <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
          )}
          {refundType === 'FULL' && (
            <p className="text-xs text-gray-500 mt-1">
              Montant total: {formatCurrency(payment.refundableAmount, payment.currency)}
            </p>
          )}
        </div>

        {/* Reason Code Selection */}
        <div>
          <Label htmlFor="reasonCode">Code de raison</Label>
          <Controller
            name="reasonCode"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoading}
              >
                <SelectTrigger id="reasonCode" className="mt-1">
                  <SelectValue placeholder="Sélectionner un code de raison" />
                </SelectTrigger>
                <SelectContent>
                  {REASON_CODES.map((code) => (
                    <SelectItem key={code.value} value={code.value}>
                      {code.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Reason Text */}
        <div>
          <Label htmlFor="reason">Motif du remboursement *</Label>
          <Textarea
            id="reason"
            {...register("reason", {
              required: "Le motif du remboursement est obligatoire",
              maxLength: {
                value: 500,
                message: "Le motif ne peut pas dépasser 500 caractères"
              }
            })}
            placeholder="Entrez le motif détaillé du remboursement..."
            className={`mt-1 ${errors.reason ? "border-red-500" : ""}`}
            rows={3}
            maxLength={500}
            disabled={isLoading}
          />
          <div className="flex justify-between mt-1">
            {errors.reason ? (
              <p className="text-sm text-red-500">{errors.reason.message}</p>
            ) : (
              <span className="text-xs text-gray-500">
                {reason.length}/500 caractères
              </span>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <Label htmlFor="notes">Notes additionnelles</Label>
          <Textarea
            id="notes"
            {...register("notes", {
              maxLength: {
                value: 1000,
                message: "Les notes ne peuvent pas dépasser 1000 caractères"
              }
            })}
            placeholder="Notes internes sur ce remboursement (optionnel)..."
            className={`mt-1 ${errors.notes ? "border-red-500" : ""}`}
            rows={2}
            maxLength={1000}
            disabled={isLoading}
          />
          <div className="flex justify-between mt-1">
            {errors.notes ? (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            ) : (
              <span className="text-xs text-gray-500">
                {notes.length}/1000 caractères
              </span>
            )}
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="flex items-center space-x-2">
          <Controller
            name="showAdvancedOptions"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="showAdvanced"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isLoading}
              />
            )}
          />
          <Label
            htmlFor="showAdvanced"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Options avancées
          </Label>
        </div>

        {/* Advanced Options */}
        {showAdvancedOptions && (
          <Card>
            <CardContent className="pt-4 space-y-3">
              {/* External Reference */}
              <div>
                <Label htmlFor="externalReference">Référence externe</Label>
                <Input
                  id="externalReference"
                  {...register("externalReference")}
                  placeholder="REF-2025-10-07-001"
                  className="mt-1"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Référence unique pour le suivi externe
                </p>
              </div>

              {/* Notify Client Checkbox */}
              <div className="flex items-center space-x-2">
                <Controller
                  name="notifyClient"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="notifyClient"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  )}
                />
                <Label htmlFor="notifyClient" className="text-sm">
                  Notifier le client du remboursement
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warning for large refunds */}
        {amount && parseFloat(amount) > payment.paidAmount * 0.5 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              Attention: Vous êtes sur le point de rembourser plus de 50% du montant payé.
              Veuillez vérifier le montant avant de confirmer.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </FormModal>
  );
}
