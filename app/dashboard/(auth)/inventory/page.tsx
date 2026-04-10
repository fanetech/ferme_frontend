"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, PlusCircle, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFarms } from "@/data/farms";
import { useFarmInventory, useLowStockItems } from "@/data/inventory";
import { ItemFormModal } from "./components";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PERMISSIONS } from "@/lib/constants/permissions";

const categoryLabels: Record<string, string> = {
  SEED: "Semence", FERTILIZER: "Engrais", PESTICIDE: "Pesticide", HERBICIDE: "Herbicide",
  FEED: "Aliment", MEDICATION: "Médicament", EQUIPMENT: "Équipement", TOOL: "Outil",
  FUEL: "Carburant", PACKAGING: "Emballage", OTHER: "Autre",
};

const categoryColors: Record<string, string> = {
  SEED: "bg-green-100 text-green-800", FERTILIZER: "bg-emerald-100 text-emerald-800",
  PESTICIDE: "bg-red-100 text-red-800", HERBICIDE: "bg-orange-100 text-orange-800",
  FEED: "bg-yellow-100 text-yellow-800", MEDICATION: "bg-pink-100 text-pink-800",
  EQUIPMENT: "bg-blue-100 text-blue-800", TOOL: "bg-indigo-100 text-indigo-800",
  FUEL: "bg-amber-100 text-amber-800", PACKAGING: "bg-gray-100 text-gray-800",
};

export default function InventoryPage() {
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const { data: farmsData } = useFarms(0, 100);
  const farms = farmsData?.data?.content ?? [];
  const { data: inventoryData, isLoading } = useFarmInventory(selectedFarmId);
  const { data: lowStockData } = useLowStockItems(selectedFarmId);
  const allItems = inventoryData?.data ?? [];
  const lowStockItems = lowStockData?.data ?? [];
  const items = categoryFilter === "ALL" ? allItems : allItems.filter((i: any) => i.category === categoryFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6 text-cyan-600" /> Inventaire
          </h1>
          <p className="text-muted-foreground">Stock et matériel par ferme</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Catégorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes</SelectItem>
              {Object.entries(categoryLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
            <SelectTrigger className="w-[250px]"><SelectValue placeholder="Sélectionner une ferme" /></SelectTrigger>
            <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
          </Select>
          {selectedFarmId && (
            <PermissionGuard permission={PERMISSIONS.INVENTORY.ITEM_MANAGE}>
              <Button onClick={() => setIsFormOpen(true)} className="bg-green-600 hover:bg-green-700">
                <PlusCircle className="mr-2 h-4 w-4" /> Nouvel article
              </Button>
            </PermissionGuard>
          )}
        </div>
      </div>

      {!selectedFarmId ? (
        <div className="flex flex-col items-center justify-center py-20"><Package className="h-12 w-12 text-muted-foreground/30 mb-4" /><p className="text-muted-foreground">Sélectionnez une ferme</p></div>
      ) : (
        <>
          {lowStockItems.length > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-red-700"><AlertTriangle className="h-4 w-4" /> Alertes stock bas ({lowStockItems.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lowStockItems.map((item: any) => (
                    <Link key={item.id} href={`/dashboard/inventory/${item.id}`}>
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer">{item.name}: {item.currentStock} {item.unit}</Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : items.length === 0 ? (
            <div className="text-center py-20"><p className="text-muted-foreground">Aucun article</p></div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{items.length} article{items.length > 1 ? "s" : ""}</p>
              <div className="rounded-lg border">
                <div className="grid grid-cols-7 gap-4 p-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
                  <span>Article</span><span>Catégorie</span><span>Stock</span><span>Min / Réappro.</span><span>Prix unit.</span><span>Valeur</span><span>Statut</span>
                </div>
                {items.map((item: any) => {
                  const isLow = item.isLowStock || (item.minimumStock && item.currentStock <= item.minimumStock);
                  return (
                    <Link key={item.id} href={`/dashboard/inventory/${item.id}`} className="grid grid-cols-7 gap-4 p-3 border-b last:border-0 text-sm hover:bg-muted/50 transition-colors">
                      <div><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground font-mono">{item.code}</p></div>
                      <Badge className={categoryColors[item.category] ?? ""} variant="outline">{categoryLabels[item.category] ?? item.category}</Badge>
                      <span className={`font-medium ${isLow ? "text-red-600" : ""}`}>{item.currentStock} {item.unit}</span>
                      <span className="text-muted-foreground">{item.minimumStock ?? "—"} / {item.reorderPoint ?? "—"}</span>
                      <span>{item.unitPrice ? `${item.unitPrice.toLocaleString()} FCFA` : "—"}</span>
                      <span className="font-medium">{item.totalValue ? `${item.totalValue.toLocaleString()} FCFA` : "—"}</span>
                      <div>{isLow ? <Badge className="bg-red-100 text-red-700">Stock bas</Badge> : item.needsReorder ? <Badge className="bg-yellow-100 text-yellow-700">Réappro.</Badge> : <Badge className="bg-green-100 text-green-700">OK</Badge>}</div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {selectedFarmId && <ItemFormModal open={isFormOpen} onOpenChange={setIsFormOpen} farmId={selectedFarmId} />}
    </div>
  );
}
