"use client";

import { useForm, Controller } from "react-hook-form";
import { CheckCircle, Link, AlertTriangle } from "lucide-react";
import { FormModal } from "@/components/ui/modal/FormModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Payment } from "@/data/payment";

export interface PaymentValidationData {
  validationNotes?: string;
  externalReference: string;
  proofOfPaymentUrl?: string;
  validationData?: {
    reason?: string;
    [key: string]: any;
  };
  forceValidation: boolean;
  isManualValidation: boolean;
}

interface PaymentValidateModalProps {
  payment: Payment | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (payment: Payment, validationData: PaymentValidationData) => void;
}

interface ValidationFormData {
  externalReference: string;
  validationNotes: string;
  proofOfPaymentUrl: string;
  validationReason: string;
  forceValidation: boolean;
}

export function PaymentValidateModal({
  payment,
  isOpen,
  isLoading = false,
  onClose,
  onConfirm,
}: PaymentValidateModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    control,
  } = useForm<ValidationFormData>({
    defaultValues: {
      externalReference: "",
      validationNotes: "",
      proofOfPaymentUrl: "",
      validationReason: "",
      forceValidation: false,
    },
  });

  const validationNotes = watch("validationNotes");
  const forceValidation = watch("forceValidation");

  const onSubmit = async (data: ValidationFormData) => {
    if (!payment) return;

    const validationData: PaymentValidationData = {
      externalReference: data.externalReference.trim(),
      validationNotes: data.validationNotes.trim() || undefined,
      proofOfPaymentUrl: data.proofOfPaymentUrl.trim() || undefined,
      validationData: data.validationReason.trim()
        ? { reason: data.validationReason.trim() }
        : undefined,
      forceValidation: data.forceValidation,
      isManualValidation: true,
    };

    onConfirm(payment, validationData);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!payment) return null;

  const titleIcon = <CheckCircle className="h-5 w-5 text-green-600" />;
  const isFailedPayment = payment.status === "FAILED";

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Valider le paiement"
      titleIcon={titleIcon}
      subtitle={`Confirmez la validation du paiement ${payment.paymentReference}`}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Valider le paiement"
      isSubmitting={isLoading}
      isDirty={isDirty}
      size="md"
      footerNote="Cette validation sera enregistrée dans l'historique."
    >
      <div className="space-y-4">
        {/* Warning for failed payments */}
        {isFailedPayment && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              ⚠️ Ce paiement a échoué. La référence externe est obligatoire.
            </AlertDescription>
          </Alert>
        )}

        {/* External Reference */}
        <div>
          <Label htmlFor="externalReference">
            Référence externe (Gateway Transaction ID) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="externalReference"
            {...register("externalReference", {
              required: "La référence externe est obligatoire",
              minLength: {
                value: 3,
                message: "La référence doit contenir au moins 3 caractères"
              }
            })}
            placeholder="TXN_1234567890"
            className={`mt-1 ${errors.externalReference ? "border-red-500" : ""}`}
            disabled={isLoading}
          />
          {errors.externalReference ? (
            <p className="text-sm text-red-500 mt-1">{errors.externalReference.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              Référence de la transaction dans le système de paiement
            </p>
          )}
        </div>

        {/* Validation Notes */}
        <div>
          <Label htmlFor="validationNotes">
            Notes de validation (optionnel)
          </Label>
          <Textarea
            id="validationNotes"
            {...register("validationNotes", {
              maxLength: {
                value: 1000,
                message: "Les notes ne peuvent pas dépasser 1000 caractères"
              }
            })}
            placeholder="Ex: Validation forcée malgré un écart de montant - confirmé avec le service client"
            className={`mt-1 min-h-[80px] ${errors.validationNotes ? "border-red-500" : ""}`}
            maxLength={1000}
            disabled={isLoading}
          />
          <div className="flex justify-between mt-1">
            {errors.validationNotes ? (
              <p className="text-sm text-red-500">{errors.validationNotes.message}</p>
            ) : (
              <span className="text-sm text-muted-foreground">
                {validationNotes.length}/1000 caractères
              </span>
            )}
          </div>
        </div>

        {/* Proof of Payment URL */}
        <div>
          <Label htmlFor="proofOfPaymentUrl">
            <Link className="inline-block w-4 h-4 mr-1" />
            URL de preuve de paiement (optionnel)
          </Label>
          <Input
            id="proofOfPaymentUrl"
            type="url"
            {...register("proofOfPaymentUrl", {
              pattern: {
                value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                message: "Veuillez entrer une URL valide"
              }
            })}
            placeholder="https://example.com/proof/payment.pdf"
            className={`mt-1 ${errors.proofOfPaymentUrl ? "border-red-500" : ""}`}
            disabled={isLoading}
          />
          {errors.proofOfPaymentUrl && (
            <p className="text-sm text-red-500 mt-1">{errors.proofOfPaymentUrl.message}</p>
          )}
        </div>

        {/* Validation Reason */}
        <div>
          <Label htmlFor="validationReason">
            Raison de validation (optionnel)
          </Label>
          <Textarea
            id="validationReason"
            {...register("validationReason")}
            placeholder="Ex: Frais de transaction déduits par la banque intermédiaire"
            className="mt-1 min-h-[60px]"
            disabled={isLoading}
          />
        </div>

        {/* Force Validation Checkbox */}
        <div className="flex items-start space-x-2">
          <Controller
            name="forceValidation"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="forceValidation"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isLoading}
              />
            )}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="forceValidation"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Forcer la validation
            </Label>
            <p className="text-sm text-muted-foreground">
              Valider le paiement même en présence d'anomalies
            </p>
          </div>
        </div>

        {/* Warning when force validation is enabled */}
        {forceValidation && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              Attention: Vous forcez la validation. Assurez-vous d'avoir vérifié tous les détails avant de continuer.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </FormModal>
  );
}
