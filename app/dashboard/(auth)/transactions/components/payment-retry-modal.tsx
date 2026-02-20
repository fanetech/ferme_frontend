"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { RotateCw, AlertCircle } from "lucide-react";
import { FormModal } from "@/components/ui/modal/FormModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Payment, RetryPaymentRequest } from "@/data/payment";

interface PaymentRetryModalProps {
  payment: Payment | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (payment: Payment, data: RetryPaymentRequest) => void;
}

interface RetryFormData {
  paymentMethod: string;
  retryReason: string;
  isManualRetry: boolean;
  forceRetry: boolean;
  delaySeconds: string;
  showAdvancedOptions: boolean;

  // Card Payment fields
  cardPan: string;
  cardName: string;
  cardRrn: string;
  cardStatus: string;
  cardResponseMessage: string;
  cardResponseCode: string;

  // Mobile Money fields
  phoneNumber: string;
  provider: string;
  accountHolderNameMM: string;
  otp: string;
}

export function PaymentRetryModal({
  payment,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: PaymentRetryModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
    control,
  } = useForm<RetryFormData>({
    defaultValues: {
      paymentMethod: "",
      retryReason: "",
      isManualRetry: true,
      forceRetry: false,
      delaySeconds: "",
      showAdvancedOptions: false,

      cardPan: "",
      cardName: "",
      cardRrn: "",
      cardStatus: "SUCCESS",
      cardResponseMessage: "",
      cardResponseCode: "",

      phoneNumber: "",
      provider: "",
      accountHolderNameMM: "",
      otp: "",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const retryReason = watch("retryReason");
  const forceRetry = watch("forceRetry");
  const showAdvancedOptions = watch("showAdvancedOptions");
  const phoneNumber = watch("phoneNumber");
  const provider = watch("provider");

  // Check if payment has more than 3 attempts
  const hasExceededMaxAttempts = payment?.attempts && payment.attempts.length >= 3;

  // Auto-enable forceRetry if attempts exceed 3
  useEffect(() => {
    if (hasExceededMaxAttempts) {
      setValue("forceRetry", true);
    }
  }, [hasExceededMaxAttempts, setValue]);

  // Pre-fill card data if payment method is CARD
  useEffect(() => {
    if (payment?.paymentMethod === 'CARD') {
      if (payment.pan) setValue("cardPan", payment.pan);
      if (payment.cardName) setValue("cardName", payment.cardName);
      if (payment.rrn) setValue("cardRrn", payment.rrn);
    }
  }, [payment, setValue]);

  const onSubmit = async (data: RetryFormData) => {
    if (!payment) return;

    const retryData: RetryPaymentRequest = {
      retryReason: data.retryReason.trim(),
      forceRetry: data.forceRetry,
    };

    // Add delay if specified
    if (data.delaySeconds) {
      retryData.delaySeconds = parseInt(data.delaySeconds);
    }

    // Add new payment method if changed
    if (data.paymentMethod) {
      retryData.newPaymentMethod = data.paymentMethod;
    }

    // Determine the current payment method
    const currentMethod = data.paymentMethod || payment.paymentMethod;

    // Add Card Payment Request if method is CARD
    if (currentMethod === "CARD") {
      const cardPaymentRequest: any = {
        paymentId: payment.id,
        status: data.cardStatus,
        isManualRetry: data.isManualRetry,
        retryReason: data.retryReason.trim()
      };

      // Add optional fields only if they have values
      if (data.cardPan) cardPaymentRequest.pan = data.cardPan;
      if (data.cardName) cardPaymentRequest.cardName = data.cardName;
      if (data.cardRrn) cardPaymentRequest.rrn = data.cardRrn;
      if (data.cardResponseMessage) cardPaymentRequest.responseMessage = data.cardResponseMessage;
      if (data.cardResponseCode) cardPaymentRequest.responseCode = data.cardResponseCode;

      // Add force retry flag if attempts > 3
      if (hasExceededMaxAttempts || data.forceRetry) {
        cardPaymentRequest.isForcedRetry = true;
      }

      retryData.cardPaymentRequest = cardPaymentRequest;
    }
    // Add Mobile Money Request if method is MOBILE_MONEY
    else if (currentMethod === "MOBILE_MONEY") {
      retryData.mobileMoneyRequest = {
        paymentId: payment.id,
        phoneNumber: data.phoneNumber,
        provider: data.provider,
        accountHolderName: data.accountHolderNameMM || undefined,
        otp: data.otp || undefined,
      };
    }

    onConfirm(payment, retryData);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!payment) return null;

  const currentPaymentMethod = paymentMethod || payment.paymentMethod;
  const titleIcon = <RotateCw className="h-5 w-5 text-blue-600" />;

  const subtitle = payment.failedAt
    ? `Réessayer le paiement échoué ${payment.paymentReference} - Échec le: ${new Date(payment.failedAt).toLocaleString('fr-FR')}`
    : `Réessayer le paiement échoué ${payment.paymentReference}`;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Réessayer le paiement"
      titleIcon={titleIcon}
      subtitle={subtitle}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Réessayer le paiement"
      isSubmitting={isLoading}
      isDirty={isDirty}
      size="lg"
      footerNote="La tentative sera enregistrée dans l'historique des paiements."
    >
      <div className="space-y-4">
        {/* Alert if max attempts exceeded */}
        {hasExceededMaxAttempts && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              Ce paiement a déjà {payment.attempts.length} tentatives échouées.
              La nouvelle tentative sera forcée pour contourner la limite maximale.
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Method Selection */}
        <div>
          <Label htmlFor="paymentMethod">Méthode de paiement</Label>
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoading}
              >
                <SelectTrigger id="paymentMethod" className="mt-1">
                  <SelectValue placeholder={`Conserver: ${payment.paymentMethod || 'Non défini'}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CARD">Carte bancaire</SelectItem>
                  <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Virement bancaire</SelectItem>
                  <SelectItem value="CASH">Espèces</SelectItem>
                  <SelectItem value="WALLET">Portefeuille électronique</SelectItem>
                  <SelectItem value="QR_CODE">QR Code</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Card Payment Details */}
        {currentPaymentMethod === "CARD" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Détails du paiement par carte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cardPan">PAN (Numéro masqué)</Label>
                  <Input
                    id="cardPan"
                    {...register("cardPan")}
                    placeholder="**** **** **** 1234"
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="cardName">Nom du titulaire</Label>
                  <Input
                    id="cardName"
                    {...register("cardName")}
                    placeholder="JOHN DOE"
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cardRrn">RRN (Référence)</Label>
                  <Input
                    id="cardRrn"
                    {...register("cardRrn")}
                    placeholder="123456789012"
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="cardStatus">Statut *</Label>
                  <Controller
                    name="cardStatus"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="cardStatus" className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SUCCESS">SUCCESS</SelectItem>
                          <SelectItem value="FAILED">FAILED</SelectItem>
                          <SelectItem value="PENDING">PENDING</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cardResponseCode">Code de réponse</Label>
                  <Input
                    id="cardResponseCode"
                    {...register("cardResponseCode")}
                    placeholder="00"
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="cardResponseMessage">Message de réponse</Label>
                  <Input
                    id="cardResponseMessage"
                    {...register("cardResponseMessage")}
                    placeholder="Transaction approuvée"
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mobile Money Details */}
        {currentPaymentMethod === "MOBILE_MONEY" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Détails Mobile Money</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="phoneNumber">
                  Numéro de téléphone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  {...register("phoneNumber", {
                    required: currentPaymentMethod === "MOBILE_MONEY" ? "Le numéro de téléphone est obligatoire" : false
                  })}
                  placeholder="+22670123456"
                  className={`mt-1 ${errors.phoneNumber ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500 mt-1">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="provider">
                  Fournisseur <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="provider"
                  control={control}
                  rules={{
                    required: currentPaymentMethod === "MOBILE_MONEY" ? "Le fournisseur est obligatoire" : false
                  }}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="provider" className={`mt-1 ${errors.provider ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Sélectionner un fournisseur" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ORANGE_MONEY">Orange Money</SelectItem>
                        <SelectItem value="MOOV_MONEY">Moov Money</SelectItem>
                        <SelectItem value="MTN_MONEY">MTN Money</SelectItem>
                        <SelectItem value="WAVE">Wave</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.provider && (
                  <p className="text-sm text-red-500 mt-1">{errors.provider.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="accountHolderNameMM">Nom du titulaire</Label>
                <Input
                  id="accountHolderNameMM"
                  {...register("accountHolderNameMM")}
                  placeholder="Nom du titulaire du compte"
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="otp">Code OTP (si requis)</Label>
                <Input
                  id="otp"
                  {...register("otp")}
                  placeholder="Code de validation"
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Retry Reason */}
        <div>
          <Label htmlFor="retryReason">
            Raison de la nouvelle tentative <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="retryReason"
            {...register("retryReason", {
              required: "La raison de la nouvelle tentative est obligatoire",
              maxLength: {
                value: 500,
                message: "La raison ne peut pas dépasser 500 caractères"
              }
            })}
            placeholder="Expliquer pourquoi cette nouvelle tentative..."
            className={`mt-1 min-h-[80px] ${errors.retryReason ? "border-red-500" : ""}`}
            maxLength={500}
            disabled={isLoading}
          />
          <div className="flex justify-between mt-1">
            {errors.retryReason ? (
              <p className="text-sm text-red-500">{errors.retryReason.message}</p>
            ) : (
              <span className="text-xs text-gray-500">
                {retryReason.length}/500 caractères
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
              <div className="flex items-center space-x-2">
                <Controller
                  name="isManualRetry"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isManualRetry"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  )}
                />
                <Label htmlFor="isManualRetry" className="text-sm">
                  Tentative manuelle
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="forceRetry"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="forceRetry"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading || hasExceededMaxAttempts}
                    />
                  )}
                />
                <Label htmlFor="forceRetry" className="text-sm">
                  Forcer la tentative (ignorer limite max)
                  {hasExceededMaxAttempts && (
                    <span className="text-orange-600 ml-2">(Activé automatiquement)</span>
                  )}
                </Label>
              </div>

              <div>
                <Label htmlFor="delaySeconds">Délai avant tentative (secondes)</Label>
                <Input
                  id="delaySeconds"
                  type="number"
                  {...register("delaySeconds", {
                    min: {
                      value: 0,
                      message: "Le délai doit être supérieur ou égal à 0"
                    }
                  })}
                  placeholder="0"
                  className={`mt-1 ${errors.delaySeconds ? "border-red-500" : ""}`}
                  min="0"
                  disabled={isLoading}
                />
                {errors.delaySeconds && (
                  <p className="text-sm text-red-500 mt-1">{errors.delaySeconds.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </FormModal>
  );
}
