"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Tractor, Sprout, PawPrint, Users, Package, ShoppingCart, Cpu, ClipboardList, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useFarm, useFarmStatistics } from "@/data/farms";

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "bg-green-100 text-green-800" },
  INACTIVE: { label: "Inactif", className: "bg-gray-100 text-gray-800" },
  ABANDONED: { label: "Abandonné", className: "bg-red-100 text-red-800" },
};

const typeLabels: Record<string, string> = {
  CROP: "Culture", LIVESTOCK: "Élevage", MIXED: "Mixte", AQUACULTURE: "Aquaculture",
};

interface StatItemProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}

function StatItem({ label, value, icon: Icon, color }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-lg font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function FarmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: farmData, isLoading: farmLoading } = useFarm(id);
  const { data: statsData, isLoading: statsLoading } = useFarmStatistics(id);

  const farm = farmData?.data;
  const stats = statsData?.data;

  if (farmLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Ferme introuvable</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard/farms">Retour aux fermes</Link>
        </Button>
      </div>
    );
  }

  const status = statusConfig[farm.status] ?? { label: farm.status, className: "" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/farms"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Tractor className="h-6 w-6 text-green-600" />
            <h1 className="text-2xl font-bold">{farm.name}</h1>
            <Badge className={status.className}>{status.label}</Badge>
            <Badge variant="outline">{typeLabels[farm.type] ?? farm.type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {farm.code}
            {farm.province && ` — ${farm.province}`}
            {farm.organizationName && ` — ${farm.organizationName}`}
          </p>
        </div>
      </div>

      {/* Farm Info */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Propriétaire</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Nom :</span> {farm.ownerName ?? "—"}</p>
            <p><span className="text-muted-foreground">Téléphone :</span> {farm.ownerPhone ?? "—"}</p>
            {farm.managerName && <p><span className="text-muted-foreground">Gestionnaire :</span> {farm.managerName}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Caractéristiques</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Superficie :</span> {farm.totalAreaHectares ? `${farm.totalAreaHectares} ha` : "—"}</p>
            <p><span className="text-muted-foreground">Cultivable :</span> {farm.cultivableAreaHectares ? `${farm.cultivableAreaHectares} ha` : "—"}</p>
            {farm.soilType && <p><span className="text-muted-foreground">Sol :</span> {farm.soilType}</p>}
            {farm.waterSource && <p><span className="text-muted-foreground">Eau :</span> {farm.waterSource}</p>}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Statistics */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Statistiques</h2>
        {statsLoading ? (
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : stats ? (
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <StatItem label="Parcelles" value={stats.totalParcels} icon={Sprout} color="bg-emerald-100 text-emerald-700" />
            <StatItem label="Cultures actives" value={stats.activeCultivations} icon={Sprout} color="bg-green-100 text-green-700" />
            <StatItem label="Animaux" value={stats.totalLivestock} icon={PawPrint} color="bg-orange-100 text-orange-700" />
            <StatItem label="Animaux sains" value={stats.healthyLivestock} icon={PawPrint} color="bg-amber-100 text-amber-700" />
            <StatItem label="Employés actifs" value={stats.activeEmployees} icon={Users} color="bg-purple-100 text-purple-700" />
            <StatItem label="Articles inventaire" value={stats.inventoryItemsCount} icon={Package} color="bg-cyan-100 text-cyan-700" />
            <StatItem label="Alertes stock" value={stats.lowStockAlertsCount} icon={AlertTriangle} color="bg-red-100 text-red-700" />
            <StatItem label="Produits disponibles" value={stats.availableProducts} icon={ShoppingCart} color="bg-pink-100 text-pink-700" />
            <StatItem label="Commandes en attente" value={stats.pendingOrders} icon={ShoppingCart} color="bg-blue-100 text-blue-700" />
            <StatItem label="Capteurs IoT" value={stats.activeIoTSensors} icon={Cpu} color="bg-indigo-100 text-indigo-700" />
            <StatItem label="Tâches en cours" value={stats.tasksInProgress} icon={ClipboardList} color="bg-violet-100 text-violet-700" />
            <StatItem label="Tâches en retard" value={stats.overdueTasks} icon={AlertTriangle} color="bg-red-100 text-red-700" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Statistiques non disponibles</p>
        )}
      </div>

      {/* Financial summary if available */}
      {stats && (stats.currentMonthRevenue > 0 || stats.currentMonthExpenses > 0) && (
        <>
          <Separator />
          <div>
            <h2 className="text-lg font-semibold mb-4">Finance du mois</h2>
            <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Revenus</p>
                  <p className="text-2xl font-bold text-green-600">{stats.currentMonthRevenue.toLocaleString()} FCFA</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Dépenses</p>
                  <p className="text-2xl font-bold text-red-600">{stats.currentMonthExpenses.toLocaleString()} FCFA</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Bénéfice</p>
                  <p className={`text-2xl font-bold ${stats.currentMonthProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {stats.currentMonthProfit.toLocaleString()} FCFA
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
