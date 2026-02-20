import { useForm } from "react-hook-form";
import { Payment } from "@/data/payment";
import { FormModal } from "@/components/ui/modal/FormModal";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";

interface PaymentCancelModalProps {
  payment: Payment | null;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (payment: Payment, reason: string) => Promise<void>;
}

interface CancelFormData {
  reason: string;
}

export function PaymentCancelModal({
  payment,
  isOpen,
  isLoading = false,
  onClose,
  onConfirm,
}: PaymentCancelModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<CancelFormData>({
    defaultValues: {
      reason: "",
    },
  });

  const onSubmit = async (data: CancelFormData) => {
    if (!payment) return;
    await onConfirm(payment, data.reason);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!payment) return null;

  const titleIcon = <AlertTriangle className="h-5 w-5 text-yellow-600" />;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Annuler le paiement"
      titleIcon={titleIcon}
      subtitle={`Vous êtes sur le point d'annuler le paiement ${payment.paymentReference} d'un montant de ${payment.requestedAmount} ${payment.currency}.`}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Confirmer l'annulation"
      isSubmitting={isLoading}
      isDirty={isDirty}
      size="md"
      footerNote="Cette action est irréversible."
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="reason">Motif d'annulation *</Label>
          <Textarea
            id="reason"
            {...register("reason", {
              required: "Le motif d'annulation est obligatoire",
            })}
            placeholder="Entrez le motif d'annulation..."
            className="mt-1"
            rows={3}
          />
          {errors.reason && (
            <p className="text-sm text-red-500 mt-1">{errors.reason.message}</p>
          )}
        </div>
      </div>
    </FormModal>
  );
}
