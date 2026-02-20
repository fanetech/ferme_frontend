import { Payment, PaymentAttempt, ServiceProduct, PaymentMethod, Refund } from "@/data/payment";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getPaymentStatusBadge, getPaymentMethodBadge } from "./payment-columns";
import { 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Receipt, 
  RefreshCw,
  CreditCard,
  User,
  Building,
  Calendar,
  AlertTriangle,
  Smartphone,
  X,
  Package,
  Hash,
  Clock,
  CreditCard as CardIcon,
  Coins
} from "lucide-react";
import { PERMISSIONS } from "@/lib/constants";
import PermissionGate from "@/components/auth/permission-gate";

interface PaymentDetailsModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onValidate?: (payment: Payment) => void;
  onCancel?: (payment: Payment) => void;
  onRefund?: (payment: Payment) => void;
  onGenerateReceipt?: (payment: Payment) => void;
  onCheckStatus?: (payment: Payment) => void;
}

export function PaymentDetailsModal({
  payment,
  isOpen,
  onClose,
  onValidate,
  onCancel,
  onRefund,
  onGenerateReceipt,
  onCheckStatus
}: PaymentDetailsModalProps) {
  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <Smartphone className="h-5 w-5 text-primary" />
    </div>
  );

  if (!payment) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Détails du paiement ${payment.paymentReference}`}
      titleIcon={titleIcon}
      size="xl"
      className="max-w-4xl"
      noPadding={true}
      bodyClassName="flex flex-col flex-1 min-h-0"
    >
      <div className="overflow-y-auto space-y-6 p-6">
        {/* Status and main info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getPaymentStatusBadge(payment.status)}
            {getPaymentMethodBadge(payment.paymentMethod)}
            {payment.isTest && (
              <Badge variant="outline" className="border-orange-500 text-orange-500">
                Test
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <PermissionGate permissions={[PERMISSIONS.PAYMENT.VALIDATE]}>
              {payment.status === "PENDING" && payment.requiresManualValidation && onValidate && (
                <Button onClick={() => onValidate(payment)} size="sm" variant="default">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Valider
                </Button>
              )}
          </PermissionGate>
            <PermissionGate permissions={[PERMISSIONS.PAYMENT.CANCEL]}>
              {payment.cancellable && onCancel && (
                <Button onClick={() => onCancel(payment)} size="sm" variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
              )}
          </PermissionGate>
            <PermissionGate permissions={[PERMISSIONS.PAYMENT.REFUND]}>
              {payment.refundable && payment.refundableAmount > 0 && onRefund && (
                <Button onClick={() => onRefund(payment)} size="sm" variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Rembourser
                </Button>
              )}
          </PermissionGate>
          </div>
        </div>

        <Separator />

        {/* Financial Information */}
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Informations financières
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Montant demandé</p>
              <p className="font-medium">{formatCurrency(payment.requestedAmount, payment.currency)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Montant payé</p>
              <p className="font-medium text-green-600">
                {formatCurrency(payment.paidAmount, payment.currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Montant restant</p>
              <p className="font-medium">{formatCurrency(payment.remainingAmount, payment.currency)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Frais</p>
              <p className="font-medium">{formatCurrency(payment.feeAmount, payment.currency)}</p>
            </div>
            {payment.taxAmount > 0 && (
              <div>
                <p className="text-sm text-gray-500">Taxes</p>
                <p className="font-medium">{formatCurrency(payment.taxAmount, payment.currency)}</p>
              </div>
            )}
            {payment.refundedAmount > 0 && (
              <div>
                <p className="text-sm text-gray-500">Montant remboursé</p>
                <p className="font-medium text-cyan-600">
                  {formatCurrency(payment.refundedAmount, payment.currency)}
                </p>
              </div>
            )}
            {payment.refundableAmount > 0 && (
              <div>
                <p className="text-sm text-gray-500">Montant remboursable</p>
                <p className="font-medium text-blue-600">
                  {formatCurrency(payment.refundableAmount, payment.currency)}
                </p>
              </div>
            )}
            <div className="col-span-2 md:col-span-3">
              <p className="text-sm text-gray-500 mb-1">Progression</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${payment.completionPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{payment.completionPercentage.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Products */}
        {payment.serviceProducts && payment.serviceProducts.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Produits/Services
              </h3>
              <div className="space-y-2">
                {payment.serviceProducts.map((product: ServiceProduct) => (
                  <div key={product.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">Code: {product.code}</p>
                        {product.description && (
                          <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Transaction Information */}
        <Separator />
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Informations de transaction
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <User className="h-3 w-3" />
                Initié par
              </p>
              <p className="font-medium">{payment.initiatedByName}</p>
            </div>
            {payment.gatewayTransactionId && (
              <div>
                <p className="text-sm text-gray-500">ID Transaction Gateway</p>
                <p className="font-medium font-mono text-xs">{payment.gatewayTransactionId}</p>
              </div>
            )}
            {payment.rrn && (
              <div>
                <p className="text-sm text-gray-500">RRN</p>
                <p className="font-medium font-mono text-xs">{payment.rrn}</p>
              </div>
            )}
            {payment.description && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{payment.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Card Information */}
        {(payment.pan || payment.cardName) && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Informations de carte
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {payment.pan && (
                  <div>
                    <p className="text-sm text-gray-500">Numéro masqué (PAN)</p>
                    <p className="font-medium font-mono">{payment.pan}</p>
                  </div>
                )}
                {payment.cardName && (
                  <div>
                    <p className="text-sm text-gray-500">Nom sur la carte</p>
                    <p className="font-medium">{payment.cardName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">3D Secure</p>
                  <Badge variant={payment.requires3DS ? "default" : "secondary"}>
                    {payment.requires3DS ? "Activé" : "Non requis"}
                  </Badge>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Payment Methods Details */}
        {payment.paymentMethods && payment.paymentMethods.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Méthodes de paiement utilisées
              </h3>
              <div className="space-y-2">
                {payment.paymentMethods.map((method: PaymentMethod) => (
                  <div key={method.methodId} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{method.paymentMethod}</Badge>
                          <Badge variant={method.status === 'VALIDATED' ? 'default' : 'secondary'}>
                            {method.status}
                          </Badge>
                          {method.usageOrder && (
                            <span className="text-sm text-gray-500">Ordre #{method.usageOrder}</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Montant:</span>{" "}
                            {formatCurrency(method.amount, method.currency)}
                          </div>
                          {method.cardMask && (
                            <div>
                              <span className="text-gray-500">Carte:</span>{" "}
                              <span className="font-mono">{method.cardMask}</span>
                            </div>
                          )}
                          {method.mobileMoneyReference && (
                            <div>
                              <span className="text-gray-500">Réf. Mobile Money:</span>{" "}
                              {method.mobileMoneyReference}
                            </div>
                          )}
                          {method.bankTransferReference && (
                            <div>
                              <span className="text-gray-500">Réf. Virement:</span>{" "}
                              {method.bankTransferReference}
                            </div>
                          )}
                          {method.gatewayTransactionId && (
                            <div className="col-span-2">
                              <span className="text-gray-500">ID Gateway:</span>{" "}
                              <span className="font-mono text-xs">{method.gatewayTransactionId}</span>
                            </div>
                          )}
                          {method.usedAt && (
                            <div>
                              <span className="text-gray-500">Utilisé le:</span>{" "}
                              {formatDate(method.usedAt)}
                            </div>
                          )}
                          {method.confirmedAt && (
                            <div>
                              <span className="text-gray-500">Confirmé le:</span>{" "}
                              {formatDate(method.confirmedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Dates */}
        <Separator />
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Chronologie
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Initié le</p>
              <p className="font-medium">{formatDate(payment.initiatedAt)}</p>
            </div>
            {payment.processedAt && (
              <div>
                <p className="text-sm text-gray-500">Traité le</p>
                <p className="font-medium">{formatDate(payment.processedAt)}</p>
              </div>
            )}
            {payment.completedAt && (
              <div>
                <p className="text-sm text-gray-500">Complété le</p>
                <p className="font-medium text-green-600">{formatDate(payment.completedAt)}</p>
              </div>
            )}
            {payment.failedAt && (
              <div>
                <p className="text-sm text-gray-500">Échoué le</p>
                <p className="font-medium text-red-600">{formatDate(payment.failedAt)}</p>
              </div>
            )}
            {payment.cancelledAt && (
              <div>
                <p className="text-sm text-gray-500">Annulé le</p>
                <p className="font-medium text-gray-600">{formatDate(payment.cancelledAt)}</p>
              </div>
            )}
            {payment.expiresAt && (
              <div>
                <p className="text-sm text-gray-500">Expire le</p>
                <p className="font-medium text-orange-600">{formatDate(payment.expiresAt)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Créé le</p>
              <p className="font-medium">{formatDate(payment.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mis à jour le</p>
              <p className="font-medium">{formatDate(payment.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Payment Attempts */}
        {payment.attempts && payment.attempts.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Tentatives de paiement
              </h3>
              <div className="space-y-2">
                {payment.attempts.map((attempt: PaymentAttempt) => (
                  <div key={attempt.attemptId} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Tentative #{attempt.attemptNumber}</span>
                        <Badge variant={attempt.successful ? "default" : attempt.pending ? "secondary" : "destructive"}>
                          {attempt.successful ? "Succès" : attempt.pending ? "En cours" : "Échec"}
                        </Badge>
                        {attempt.retryable && (
                          <Badge variant="outline" className="text-orange-500">
                            Réessayable
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(attempt.initiatedAt)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Montant:</span>{" "}
                        {formatCurrency(attempt.attemptAmount, payment.currency)}
                      </div>
                      <div>
                        <span className="text-gray-500">Méthode:</span> {attempt.paymentMethod}
                      </div>
                      {attempt.gatewayTransactionId && (
                        <div className="col-span-2 md:col-span-1">
                          <span className="text-gray-500">ID Gateway:</span>{" "}
                          <span className="font-mono text-xs">{attempt.gatewayTransactionId}</span>
                        </div>
                      )}
                      {attempt.processingTimeMs !== undefined && (
                        <div>
                          <span className="text-gray-500">Durée:</span> {attempt.processingTimeMs}ms
                        </div>
                      )}
                      {attempt.completedAt && (
                        <div>
                          <span className="text-gray-500">Complété:</span>{" "}
                          {formatDate(attempt.completedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Refunds */}
        {payment.refunds && payment.refunds.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Remboursements
              </h3>
              <div className="space-y-2">
                {payment.refunds.map((refund: Refund) => (
                  <div key={refund.refundId} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatCurrency(refund.amount, refund.currency)}
                        </span>
                        <Badge variant="outline">{refund.status}</Badge>
                      </div>
                      {refund.refundedAt && (
                        <span className="text-sm text-gray-500">
                          {formatDate(refund.refundedAt)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-500">Raison: <span className="text-gray-700">{refund.reason}</span></p>
                      {refund.gatewayRefundId && (
                        <p className="text-gray-500">
                          ID Gateway: <span className="font-mono text-xs">{refund.gatewayRefundId}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Status Flags */}
        <Separator />
        <div>
          <h3 className="text-sm font-semibold mb-3">Indicateurs d'état</h3>
          <div className="flex flex-wrap gap-2">
            {payment.completed && <Badge variant="default">Complété</Badge>}
            {payment.processing && <Badge variant="secondary">En traitement</Badge>}
            {payment.failed && <Badge variant="destructive">Échoué</Badge>}
            {payment.partiallyPaid && <Badge variant="outline">Partiellement payé</Badge>}
            {payment.requiresManualValidation && <Badge variant="outline" className="border-orange-500 text-orange-500">Validation manuelle requise</Badge>}
            {payment.notificationSent && <Badge variant="outline">Notification envoyée</Badge>}
            {payment.receiptGenerated && <Badge variant="outline">Reçu généré</Badge>}
          </div>
        </div>

        <Separator />
      </div>
      <div className="flex-shrink-0 px-6 py-4 bg-muted/50 dark:bg-muted/20 border-t border-border">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {onCheckStatus && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onCheckStatus(payment)}
                size="sm"
              >
                <Clock className="mr-2 h-4 w-4" />
                Vérifier le statut
              </Button>
            )}
            {!payment.receiptGenerated && onGenerateReceipt && payment.status !== 'CANCELLED' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onGenerateReceipt(payment)}
                size="sm"
              >
                <Receipt className="mr-2 h-4 w-4" />
                Générer le reçu
              </Button>
            )}
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="min-w-[120px]"
          >
            <X className="mr-2 h-4 w-4" />
            Fermer
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}