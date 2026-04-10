"use client";

import { useState } from "react";
import { Wallet, TrendingUp, ShoppingCart, Package, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useFarms, useFarmStatistics } from "@/data/farms";
import { useFarmOrders, usePendingOrders } from "@/data/marketplace";

const orderStatusLabels: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Brouillon", className: "bg-gray-100 text-gray-800" },
  PENDING: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Confirmé", className: "bg-blue-100 text-blue-800" },
  PROCESSING: { label: "En cours", className: "bg-indigo-100 text-indigo-800" },
  READY: { label: "Prêt", className: "bg-green-100 text-green-800" },
  DELIVERED: { label: "Livré", className: "bg-emerald-100 text-emerald-800" },
  CANCELLED: { label: "Annulé", className: "bg-red-100 text-red-800" },
};

const paymentStatusLabels: Record<string, { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
  PARTIAL: { label: "Partiel", className: "bg-orange-100 text-orange-800" },
  PAID: { label: "Payé", className: "bg-green-100 text-green-800" },
  OVERDUE: { label: "En retard", className: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Annulé", className: "bg-gray-100 text-gray-800" },
};

export default function FinancePage() {
  const [selectedFarmId, setSelectedFarmId] = useState("");

  const { data: farmsData } = useFarms(0, 100);
  const farms = farmsData?.data?.content ?? [];
  const { data: statsData, isLoading: statsLoading } = useFarmStatistics(selectedFarmId);
  const { data: ordersData, isLoading: ordersLoading } = useFarmOrders(selectedFarmId);
  const { data: pendingData } = usePendingOrders(selectedFarmId);

  const stats = statsData?.data;
  const orders = ordersData?.data ?? [];
  const pendingOrders = pendingData?.data ?? [];

  // Compute totals from orders
  const totalRevenue = orders.filter((o: any) => o.orderStatus === "DELIVERED").reduce((sum: number, o: any) => sum + (o.netAmount ?? 0), 0);
  const totalPending = orders.filter((o: any) => o.paymentStatus === "PENDING" || o.paymentStatus === "PARTIAL").reduce((sum: number, o: any) => sum + (o.netAmount ?? 0), 0);
  const paidOrders = orders.filter((o: any) => o.paymentStatus === "PAID").length;
  const unpaidOrders = orders.filter((o: any) => o.paymentStatus !== "PAID" && o.paymentStatus !== "CANCELLED").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-600" /> Finance
          </h1>
          <p className="text-muted-foreground">Revenus, commandes et vue financière</p>
        </div>
        <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
          <SelectTrigger className="w-[250px]"><SelectValue placeholder="Sélectionner une ferme" /></SelectTrigger>
          <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {!selectedFarmId ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Wallet className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sélectionnez une ferme pour voir ses finances</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <TrendingUp className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    {statsLoading ? <Skeleton className="h-7 w-24" /> : (
                      <p className="text-2xl font-bold text-green-700">{(stats?.currentMonthRevenue ?? totalRevenue).toLocaleString()} <span className="text-sm font-normal">FCFA</span></p>
                    )}
                    <p className="text-xs text-muted-foreground">Revenus</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <DollarSign className="h-5 w-5 text-red-700" />
                  </div>
                  <div>
                    {statsLoading ? <Skeleton className="h-7 w-24" /> : (
                      <p className="text-2xl font-bold text-red-700">{(stats?.currentMonthExpenses ?? 0).toLocaleString()} <span className="text-sm font-normal">FCFA</span></p>
                    )}
                    <p className="text-xs text-muted-foreground">Dépenses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                    <ShoppingCart className="h-5 w-5 text-yellow-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-700">{totalPending.toLocaleString()} <span className="text-sm font-normal">FCFA</span></p>
                    <p className="text-xs text-muted-foreground">En attente de paiement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Package className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{paidOrders} <span className="text-sm font-normal text-muted-foreground">/ {paidOrders + unpaidOrders}</span></p>
                    <p className="text-xs text-muted-foreground">Commandes payées</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Farm statistics if available */}
          {stats && (stats.currentMonthRevenue > 0 || stats.currentMonthExpenses > 0) && (
            <Card>
              <CardHeader><CardTitle className="text-base">Bilan du mois</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-3">
                  <div className="text-center p-4 rounded-lg bg-green-50">
                    <p className="text-sm text-muted-foreground">Revenus</p>
                    <p className="text-xl font-bold text-green-700">{stats.currentMonthRevenue.toLocaleString()} FCFA</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-50">
                    <p className="text-sm text-muted-foreground">Dépenses</p>
                    <p className="text-xl font-bold text-red-700">{stats.currentMonthExpenses.toLocaleString()} FCFA</p>
                  </div>
                  <div className={`text-center p-4 rounded-lg ${stats.currentMonthProfit >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                    <p className="text-sm text-muted-foreground">Bénéfice</p>
                    <p className={`text-xl font-bold ${stats.currentMonthProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>{stats.currentMonthProfit.toLocaleString()} FCFA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Pending orders */}
          {pendingOrders.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Commandes en attente d'approbation ({pendingOrders.length})</h2>
              <div className="space-y-2">
                {pendingOrders.slice(0, 10).map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">Commande {o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{o.customerName} — {o.orderDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{o.netAmount?.toLocaleString()} FCFA</span>
                      <Badge className={paymentStatusLabels[o.paymentStatus]?.className ?? ""}>{paymentStatusLabels[o.paymentStatus]?.label ?? o.paymentStatus}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent orders */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Dernières commandes ({orders.length})</h2>
            {ordersLoading ? (
              <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-10"><p className="text-sm text-muted-foreground">Aucune commande</p></div>
            ) : (
              <div className="rounded-lg border">
                <div className="grid grid-cols-6 gap-4 p-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
                  <span>N° commande</span><span>Client</span><span>Date</span><span>Montant</span><span>Commande</span><span>Paiement</span>
                </div>
                {orders.slice(0, 20).map((o: any) => {
                  const oStatus = orderStatusLabels[o.orderStatus] ?? { label: o.orderStatus, className: "" };
                  const pStatus = paymentStatusLabels[o.paymentStatus] ?? { label: o.paymentStatus, className: "" };
                  return (
                    <div key={o.id} className="grid grid-cols-6 gap-4 p-3 border-b last:border-0 text-sm">
                      <span className="font-mono text-xs">{o.orderNumber}</span>
                      <span>{o.customerName ?? "—"}</span>
                      <span className="text-muted-foreground">{o.orderDate}</span>
                      <span className="font-medium">{o.netAmount?.toLocaleString()} FCFA</span>
                      <Badge className={oStatus.className}>{oStatus.label}</Badge>
                      <Badge className={pStatus.className}>{pStatus.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
