"use client";

import { Building, Tractor, Users, ShoppingCart } from "lucide-react";
import { StatsCard } from "./components/stats-card";
import { RecentFarms } from "./components/recent-farms";
import { QuickActions } from "./components/quick-actions";
import { useFarms } from "@/data/farms";
import { useOrganizations } from "@/data/organizations";

export default function DashboardPage() {
  const { data: farmsData, isLoading: farmsLoading } = useFarms(0, 5);
  const { data: orgsData, isLoading: orgsLoading } = useOrganizations(0, 1);

  const totalFarms = farmsData?.data?.totalElements ?? 0;
  const totalOrgs = orgsData?.data?.totalElements ?? 0;
  const recentFarms = farmsData?.data?.content ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre exploitation agricole
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Organisations"
          value={totalOrgs}
          icon={Building}
          description="Total des organisations"
          loading={orgsLoading}
        />
        <StatsCard
          title="Fermes"
          value={totalFarms}
          icon={Tractor}
          description="Total des fermes"
          loading={farmsLoading}
          variant="green"
        />
        <StatsCard
          title="Utilisateurs"
          value="—"
          icon={Users}
          description="Gestion des accès"
          href="/dashboard/users"
        />
        <StatsCard
          title="Commandes"
          value="—"
          icon={ShoppingCart}
          description="Marché & ventes"
          href="/dashboard/marketplace/orders"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Recent Farms - takes 2 cols */}
        <div className="lg:col-span-2">
          <RecentFarms farms={recentFarms} loading={farmsLoading} />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
