"use client";

import { useState, useMemo } from "react";
import {
  Lock, Search, Shield, Tractor, Building, Users, UserCog, Sprout, PawPrint,
  Package, ShoppingCart, ShoppingBasket, UserCheck, Wallet, Cpu, Bell, BarChart3,
  Brain, FileSearch, Database, LayoutGrid, List,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/data/roles-permissions";
import { useDebounce } from "@/hooks/useDebounce";

// Module visual configuration
const moduleConfig: Record<string, { icon: typeof Lock; color: string; bg: string; label: string }> = {
  USERS: { icon: UserCog, color: "text-purple-700", bg: "bg-purple-100", label: "Utilisateurs" },
  ROLES: { icon: Shield, color: "text-indigo-700", bg: "bg-indigo-100", label: "Rôles" },
  PERMISSIONS: { icon: Lock, color: "text-amber-700", bg: "bg-amber-100", label: "Permissions" },
  ORGANIZATIONS: { icon: Building, color: "text-blue-700", bg: "bg-blue-100", label: "Organisations" },
  FARMS: { icon: Tractor, color: "text-green-700", bg: "bg-green-100", label: "Fermes" },
  CROPS: { icon: Sprout, color: "text-emerald-700", bg: "bg-emerald-100", label: "Cultures" },
  LIVESTOCK: { icon: PawPrint, color: "text-orange-700", bg: "bg-orange-100", label: "Élevage" },
  INVENTORY: { icon: Package, color: "text-cyan-700", bg: "bg-cyan-100", label: "Inventaire" },
  HR: { icon: Users, color: "text-pink-700", bg: "bg-pink-100", label: "RH" },
  MARKETPLACE: { icon: ShoppingCart, color: "text-rose-700", bg: "bg-rose-100", label: "Marché" },
  FINANCE: { icon: Wallet, color: "text-emerald-700", bg: "bg-emerald-100", label: "Finance" },
  IOT: { icon: Cpu, color: "text-sky-700", bg: "bg-sky-100", label: "IoT" },
  NOTIFICATIONS: { icon: Bell, color: "text-yellow-700", bg: "bg-yellow-100", label: "Notifications" },
  REPORTS: { icon: BarChart3, color: "text-violet-700", bg: "bg-violet-100", label: "Rapports" },
  AI: { icon: Brain, color: "text-fuchsia-700", bg: "bg-fuchsia-100", label: "IA" },
  AUDIT: { icon: FileSearch, color: "text-slate-700", bg: "bg-slate-100", label: "Audit" },
  SETTINGS: { icon: Database, color: "text-gray-700", bg: "bg-gray-100", label: "Paramètres" },
};

const actionConfig: Record<string, { label: string; className: string }> = {
  VIEW: { label: "Voir", className: "bg-blue-50 text-blue-700 border-blue-200" },
  LIST: { label: "Lister", className: "bg-sky-50 text-sky-700 border-sky-200" },
  SEARCH: { label: "Rechercher", className: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  CREATE: { label: "Créer", className: "bg-green-50 text-green-700 border-green-200" },
  EDIT: { label: "Modifier", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  UPDATE: { label: "Mettre à jour", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  DELETE: { label: "Supprimer", className: "bg-red-50 text-red-700 border-red-200" },
  MANAGE: { label: "Gérer", className: "bg-purple-50 text-purple-700 border-purple-200" },
  APPROVE: { label: "Approuver", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CHANGE_STATUS: { label: "Changer statut", className: "bg-orange-50 text-orange-700 border-orange-200" },
  VIEW_STATS: { label: "Voir stats", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  EXPORT: { label: "Exporter", className: "bg-violet-50 text-violet-700 border-violet-200" },
  LIST_BY_MODULE: { label: "Lister par module", className: "bg-slate-50 text-slate-700 border-slate-200" },
};

type ViewMode = "grid" | "list";

export default function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { data: response, isLoading } = usePermissions(0, 500);

  const allPermissions = response?.data?.content ?? [];

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    let perms = allPermissions;
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      perms = perms.filter(
        (p) =>
          p.code.toLowerCase().includes(term) ||
          p.name.toLowerCase().includes(term) ||
          p.module.toLowerCase().includes(term) ||
          p.action?.toLowerCase().includes(term) ||
          p.resource?.toLowerCase().includes(term)
      );
    }
    if (selectedModule !== "ALL") {
      perms = perms.filter((p) => p.module === selectedModule);
    }
    return perms.reduce<Record<string, typeof perms>>((acc, p) => {
      const mod = p.module || "OTHER";
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(p);
      return acc;
    }, {});
  }, [allPermissions, debouncedSearch, selectedModule]);

  // Modules list for filter chips (from unfiltered data)
  const modulesList = useMemo(() => {
    const modules = new Map<string, number>();
    allPermissions.forEach((p) => {
      const m = p.module || "OTHER";
      modules.set(m, (modules.get(m) ?? 0) + 1);
    });
    return Array.from(modules.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [allPermissions]);

  const totalPerms = Object.values(groupedPermissions).reduce((s, p) => s + p.length, 0);
  const moduleCount = Object.keys(groupedPermissions).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
              <Lock className="h-5 w-5 text-amber-700" />
            </div>
            Permissions
          </h1>
          <p className="text-muted-foreground mt-1">
            Catalogue des permissions disponibles dans le système
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={viewMode === "grid" ? "default" : "outline"}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-amber-700">{totalPerms}</p>
            <p className="text-xs text-muted-foreground">Permissions{debouncedSearch || selectedModule !== "ALL" ? " (filtré)" : ""}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-blue-700">{moduleCount}</p>
            <p className="text-xs text-muted-foreground">Modules</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-emerald-700">{allPermissions.length}</p>
            <p className="text-xs text-muted-foreground">Total système</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-purple-700">{modulesList.length}</p>
            <p className="text-xs text-muted-foreground">Modules totaux</p>
          </CardContent>
        </Card>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par code, nom, module, action..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {/* Module filter chips */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedModule === "ALL" ? "default" : "outline"}
          className={cn(
            "cursor-pointer transition-all hover:scale-105",
            selectedModule === "ALL" && "bg-gray-900 hover:bg-gray-800"
          )}
          onClick={() => setSelectedModule("ALL")}
        >
          Tous ({allPermissions.length})
        </Badge>
        {modulesList.map(([module, count]) => {
          const cfg = moduleConfig[module] ?? { icon: Lock, color: "text-gray-700", bg: "bg-gray-100", label: module };
          const isActive = selectedModule === module;
          return (
            <Badge
              key={module}
              variant="outline"
              className={cn(
                "cursor-pointer transition-all hover:scale-105 border",
                isActive ? `${cfg.bg} ${cfg.color} border-current` : "hover:bg-muted"
              )}
              onClick={() => setSelectedModule(module)}
            >
              <cfg.icon className="mr-1 h-3 w-3" />
              {cfg.label} ({count})
            </Badge>
          );
        })}
      </div>

      {/* Permissions display */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : Object.keys(groupedPermissions).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Lock className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Aucune permission trouvée</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {debouncedSearch ? "Essayez un autre terme de recherche" : "Aucune permission correspondante"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPermissions)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([module, perms]) => {
              const cfg = moduleConfig[module] ?? { icon: Lock, color: "text-gray-700", bg: "bg-gray-100", label: module };
              return (
                <div key={module}>
                  {/* Module header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", cfg.bg)}>
                      <cfg.icon className={cn("h-5 w-5", cfg.color)} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold">{cfg.label}</h2>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">{module}</p>
                    </div>
                    <Badge variant="secondary" className="text-sm">{perms.length}</Badge>
                  </div>

                  {/* Permissions */}
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {perms.map((perm) => {
                        const action = actionConfig[perm.action] ?? { label: perm.action, className: "bg-gray-50 text-gray-700 border-gray-200" };
                        return (
                          <Card key={perm.id} className="hover:shadow-md transition-shadow group">
                            <CardContent className="pt-4 pb-4">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <Badge variant="outline" className={cn("text-[10px] border", action.className)}>
                                  {action.label}
                                </Badge>
                                {perm.resource && (
                                  <span className="text-[10px] text-muted-foreground font-mono uppercase">{perm.resource}</span>
                                )}
                              </div>
                              <p className="text-xs font-mono font-semibold text-foreground/90 mb-1 break-all">{perm.code}</p>
                              <p className="text-sm font-medium">{perm.name}</p>
                              {perm.description && (
                                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{perm.description}</p>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg border overflow-hidden">
                      <div className="grid grid-cols-[1fr_120px_120px_2fr] gap-4 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
                        <span>Code</span>
                        <span>Action</span>
                        <span>Ressource</span>
                        <span>Description</span>
                      </div>
                      {perms.map((perm) => {
                        const action = actionConfig[perm.action] ?? { label: perm.action, className: "bg-gray-50 text-gray-700 border-gray-200" };
                        return (
                          <div key={perm.id} className="grid grid-cols-[1fr_120px_120px_2fr] gap-4 px-4 py-3 border-t text-sm hover:bg-muted/30 transition-colors">
                            <div>
                              <p className="font-mono text-xs font-semibold">{perm.code}</p>
                              <p className="text-xs text-muted-foreground">{perm.name}</p>
                            </div>
                            <Badge variant="outline" className={cn("text-[10px] border w-fit", action.className)}>
                              {action.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">{perm.resource ?? "—"}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">{perm.description ?? "—"}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
