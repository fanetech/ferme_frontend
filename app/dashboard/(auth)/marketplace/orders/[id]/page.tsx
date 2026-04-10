"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useOrder, useUpdateOrderStatus } from "@/data/marketplace";

const orderStatusLabels: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Brouillon", className: "bg-gray-100 text-gray-800" }, PENDING: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Confirmé", className: "bg-blue-100 text-blue-800" }, PROCESSING: { label: "En cours", className: "bg-indigo-100 text-indigo-800" },
  READY: { label: "Prêt", className: "bg-green-100 text-green-800" }, DELIVERED: { label: "Livré", className: "bg-emerald-100 text-emerald-800" },
  CANCELLED: { label: "Annulé", className: "bg-red-100 text-red-800" },
};
const paymentLabels: Record<string, { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "bg-yellow-100 text-yellow-800" }, PARTIAL: { label: "Partiel", className: "bg-orange-100 text-orange-800" },
  PAID: { label: "Payé", className: "bg-green-100 text-green-800" }, OVERDUE: { label: "En retard", className: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Annulé", className: "bg-gray-100 text-gray-800" },
};

const statusFlow = ["PENDING", "CONFIRMED", "PROCESSING", "READY", "DELIVERED"];

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null) return null;
  return <div className="flex justify-between py-1.5"><span className="text-sm text-muted-foreground">{label}</span><span className="text-sm font-medium">{value}</span></div>;
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: orderData, isLoading } = useOrder(id);
  const updateStatus = useUpdateOrderStatus();

  const order = orderData?.data;

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-40 w-full" /></div>;
  if (!order) return <div className="flex flex-col items-center justify-center py-20"><p className="text-muted-foreground">Commande introuvable</p><Button variant="outline" className="mt-4" asChild><Link href="/dashboard/marketplace">Retour</Link></Button></div>;

  const oStatus = orderStatusLabels[order.orderStatus] ?? { label: order.orderStatus, className: "" };
  const pStatus = paymentLabels[order.paymentStatus] ?? { label: order.paymentStatus, className: "" };
  const currentIdx = statusFlow.indexOf(order.orderStatus);
  const nextStatus = currentIdx >= 0 && currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : null;

  const handleAdvanceStatus = () => {
    if (nextStatus) updateStatus.mutate({ id, data: { orderStatus: nextStatus as any } });
  };

  const handleMarkPaid = () => {
    updateStatus.mutate({ id, data: { paymentStatus: "PAID" as any } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/marketplace"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-pink-600" />
            <h1 className="text-2xl font-bold">Commande {order.orderNumber}</h1>
            <Badge className={oStatus.className}>{oStatus.label}</Badge>
            <Badge className={pStatus.className}>{pStatus.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{order.customerName} — {order.orderDate}</p>
        </div>
        <div className="flex gap-2">
          {nextStatus && order.orderStatus !== "CANCELLED" && (
            <Button size="sm" onClick={handleAdvanceStatus} disabled={updateStatus.isPending} className="bg-blue-600 hover:bg-blue-700">
              {orderStatusLabels[nextStatus]?.label ?? nextStatus}
            </Button>
          )}
          {order.paymentStatus !== "PAID" && order.paymentStatus !== "CANCELLED" && (
            <Button size="sm" variant="outline" onClick={handleMarkPaid} disabled={updateStatus.isPending} className="text-green-700 border-green-600">
              Marquer payé
            </Button>
          )}
          {order.orderStatus !== "CANCELLED" && order.orderStatus !== "DELIVERED" && (
            <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id, data: { orderStatus: "CANCELLED" as any } })} disabled={updateStatus.isPending} className="text-red-600 border-red-600">
              Annuler
            </Button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Détails commande</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="N° commande" value={order.orderNumber} />
            <InfoRow label="Date" value={order.orderDate} />
            <InfoRow label="Livraison prévue" value={order.deliveryDate} />
            <InfoRow label="Livraison réelle" value={order.actualDeliveryDate ? new Date(order.actualDeliveryDate).toLocaleDateString("fr-FR") : undefined} />
            <InfoRow label="Adresse livraison" value={order.deliveryAddress} />
            <InfoRow label="Créé par" value={order.createdByName} />
            <InfoRow label="Approuvé par" value={order.approvedByName} />
            {order.notes && <p className="text-sm text-muted-foreground mt-2 border-t pt-2">{order.notes}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Montants</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Total brut" value={`${order.totalAmount?.toLocaleString()} FCFA`} />
            <InfoRow label="Remise" value={order.discountAmount ? `${order.discountAmount.toLocaleString()} FCFA` : undefined} />
            <InfoRow label="Taxe" value={order.taxAmount ? `${order.taxAmount.toLocaleString()} FCFA` : undefined} />
            <Separator className="my-2" />
            <div className="flex justify-between py-2">
              <span className="text-base font-semibold">Total net</span>
              <span className="text-base font-bold text-green-700">{order.netAmount?.toLocaleString()} FCFA</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Order lines */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Package className="h-5 w-5" /> Lignes de commande ({order.orderLines?.length ?? 0})</h2>
        {!order.orderLines || order.orderLines.length === 0 ? (
          <div className="text-center py-10"><p className="text-sm text-muted-foreground">Aucune ligne</p></div>
        ) : (
          <div className="rounded-lg border">
            <div className="grid grid-cols-6 gap-4 p-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
              <span>#</span><span>Produit</span><span>Quantité</span><span>Prix unit.</span><span>Remise</span><span>Total ligne</span>
            </div>
            {order.orderLines.map((line: any) => (
              <div key={line.id} className="grid grid-cols-6 gap-4 p-3 border-b last:border-0 text-sm">
                <span className="text-muted-foreground">{line.lineNumber}</span>
                <span className="font-medium">{line.productName}</span>
                <span>{line.quantity} {line.unit}</span>
                <span>{line.unitPrice?.toLocaleString()} FCFA</span>
                <span className="text-muted-foreground">{line.discountAmount ? `${line.discountAmount.toLocaleString()} FCFA` : "—"}</span>
                <span className="font-medium">{line.lineTotal?.toLocaleString()} FCFA</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
