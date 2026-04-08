"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, ArrowUpCircle, ArrowDownCircle, PlusCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useInventoryItem, useItemMovements } from "@/data/inventory";
import { MovementFormModal } from "../components";

const categoryLabels: Record<string, string> = {
  SEED: "Semence", FERTILIZER: "Engrais", PESTICIDE: "Pesticide", HERBICIDE: "Herbicide",
  FEED: "Aliment", MEDICATION: "Médicament", EQUIPMENT: "Équipement", TOOL: "Outil",
  FUEL: "Carburant", PACKAGING: "Emballage", OTHER: "Autre",
};

const movementTypeLabels: Record<string, { label: string; icon: "in" | "out" | "neutral" }> = {
  PURCHASE: { label: "Achat", icon: "in" }, SALE: { label: "Vente", icon: "out" },
  USAGE: { label: "Utilisation", icon: "out" }, TRANSFER_IN: { label: "Transfert entrant", icon: "in" },
  TRANSFER_OUT: { label: "Transfert sortant", icon: "out" }, ADJUSTMENT: { label: "Ajustement", icon: "neutral" },
  RETURN: { label: "Retour", icon: "in" }, EXPIRED: { label: "Expiré", icon: "out" },
  DAMAGED: { label: "Endommagé", icon: "out" }, LOST: { label: "Perdu", icon: "out" },
};

function InfoRow({ label, value }: { label: string; value?: string | number | null | boolean }) {
  if (value == null) return null;
  const display = typeof value === "boolean" ? (value ? "Oui" : "Non") : value;
  return <div className="flex justify-between py-1.5"><span className="text-sm text-muted-foreground">{label}</span><span className="text-sm font-medium">{display}</span></div>;
}

export default function InventoryItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: itemData, isLoading } = useInventoryItem(id);
  const { data: movementsData, isLoading: movLoading } = useItemMovements(id);
  const [isMovFormOpen, setIsMovFormOpen] = useState(false);

  const item = itemData?.data;
  const movements = movementsData?.data ?? [];

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-40 w-full" /></div>;
  if (!item) return <div className="flex flex-col items-center justify-center py-20"><p className="text-muted-foreground">Article introuvable</p><Button variant="outline" className="mt-4" asChild><Link href="/dashboard/inventory">Retour</Link></Button></div>;

  const isLow = item.isLowStock || (item.minimumStock && item.currentStock <= item.minimumStock);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/inventory"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-cyan-600" />
            <h1 className="text-2xl font-bold">{item.name}</h1>
            {isLow ? <Badge className="bg-red-100 text-red-700">Stock bas</Badge> : <Badge className="bg-green-100 text-green-700">OK</Badge>}
            <Badge variant="outline">{categoryLabels[item.category] ?? item.category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{item.code}</p>
        </div>
        <Button onClick={() => setIsMovFormOpen(true)} className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Mouvement
        </Button>
      </div>

      {/* Info */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Stock</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{item.currentStock} <span className="text-lg text-muted-foreground">{item.unit}</span></div>
            <InfoRow label="Minimum" value={item.minimumStock} />
            <InfoRow label="Seuil réappro." value={item.reorderPoint} />
            <InfoRow label="Maximum" value={item.maximumStock} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Valeur</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Prix unitaire" value={item.unitPrice ? `${item.unitPrice.toLocaleString()} FCFA` : undefined} />
            <InfoRow label="Valeur totale" value={item.totalValue ? `${item.totalValue.toLocaleString()} FCFA` : undefined} />
            <Separator className="my-2" />
            <InfoRow label="Marque" value={item.brand} />
            <InfoRow label="Fournisseur" value={item.supplier} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Détails</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Emplacement" value={item.storageLocation} />
            <InfoRow label="Périssable" value={item.isPerishable} />
            <InfoRow label="Alerte expiration" value={item.expiryAlertDays ? `${item.expiryAlertDays} jours` : undefined} />
            {item.description && <p className="text-sm text-muted-foreground mt-2 border-t pt-2">{item.description}</p>}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Movements */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><RefreshCw className="h-5 w-5" /> Mouvements de stock ({movements.length})</h2>
        {movLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : movements.length === 0 ? (
          <div className="text-center py-10"><RefreshCw className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">Aucun mouvement enregistré</p></div>
        ) : (
          <div className="rounded-lg border">
            <div className="grid grid-cols-7 gap-4 p-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
              <span>Type</span><span>Date</span><span>Quantité</span><span>Prix unit.</span><span>Total</span><span>Stock après</span><span>Fournisseur / Lot</span>
            </div>
            {movements.map((m: any) => {
              const typeInfo = movementTypeLabels[m.movementType] ?? { label: m.movementType, icon: "neutral" };
              const IconComp = typeInfo.icon === "in" ? ArrowUpCircle : typeInfo.icon === "out" ? ArrowDownCircle : RefreshCw;
              const iconColor = typeInfo.icon === "in" ? "text-green-600" : typeInfo.icon === "out" ? "text-red-600" : "text-blue-600";
              return (
                <div key={m.id} className="grid grid-cols-7 gap-4 p-3 border-b last:border-0 text-sm">
                  <div className="flex items-center gap-1.5"><IconComp className={`h-4 w-4 ${iconColor}`} /><span>{typeInfo.label}</span></div>
                  <span className="text-muted-foreground">{new Date(m.movementDate).toLocaleDateString("fr-FR")}</span>
                  <span className={`font-medium ${typeInfo.icon === "in" ? "text-green-600" : typeInfo.icon === "out" ? "text-red-600" : ""}`}>
                    {typeInfo.icon === "in" ? "+" : typeInfo.icon === "out" ? "-" : ""}{m.quantity}
                  </span>
                  <span>{m.unitPrice ? `${m.unitPrice.toLocaleString()} FCFA` : "—"}</span>
                  <span>{m.totalPrice ? `${m.totalPrice.toLocaleString()} FCFA` : "—"}</span>
                  <span>{m.stockAfter ?? "—"}</span>
                  <div className="text-xs text-muted-foreground">
                    {m.supplierName && <p>{m.supplierName}</p>}
                    {m.batchNumber && <p className="font-mono">Lot: {m.batchNumber}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MovementFormModal open={isMovFormOpen} onOpenChange={setIsMovFormOpen} inventoryItemId={id} itemName={item.name} />
    </div>
  );
}
