"use client";

import { useState } from "react";
import Link from "next/link";
import { Sprout, PlusCircle, MapPin, Leaf } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFarms } from "@/data/farms";
import { useFarmParcels, useFarmCultivations } from "@/data/crops";
import { ParcelFormModal, CultivationFormModal } from "./components";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { safeArray } from "@/lib/utils/safe-array";
import type { ParcelResponse } from "@/types/crop";

const parcelStatusLabels: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "bg-green-100 text-green-800" },
  FALLOW: { label: "Jachère", className: "bg-yellow-100 text-yellow-800" },
  RESTING: { label: "Repos", className: "bg-blue-100 text-blue-800" },
  DEGRADED: { label: "Dégradé", className: "bg-red-100 text-red-800" },
  UNDER_RESTORATION: { label: "Restauration", className: "bg-purple-100 text-purple-800" },
  INACTIVE: { label: "Inactif", className: "bg-gray-100 text-gray-800" },
};

const cultivationStatusLabels: Record<string, { label: string; className: string }> = {
  PLANNED: { label: "Planifié", className: "bg-gray-100 text-gray-800" },
  LAND_PREPARATION: { label: "Préparation", className: "bg-yellow-100 text-yellow-800" },
  PLANTED: { label: "Planté", className: "bg-green-100 text-green-800" },
  GERMINATING: { label: "Germination", className: "bg-lime-100 text-lime-800" },
  GROWING: { label: "Croissance", className: "bg-emerald-100 text-emerald-800" },
  FLOWERING: { label: "Floraison", className: "bg-pink-100 text-pink-800" },
  FRUITING: { label: "Fructification", className: "bg-orange-100 text-orange-800" },
  READY_FOR_HARVEST: { label: "Prêt à récolter", className: "bg-amber-100 text-amber-800" },
  HARVESTING: { label: "Récolte en cours", className: "bg-cyan-100 text-cyan-800" },
  HARVESTED: { label: "Récolté", className: "bg-blue-100 text-blue-800" },
  FAILED: { label: "Échoué", className: "bg-red-100 text-red-800" },
  ABANDONED: { label: "Abandonné", className: "bg-red-200 text-red-900" },
};

const irrigationLabels: Record<string, string> = {
  NONE: "Aucune", RAIN_FED: "Pluviale", DRIP: "Goutte à goutte",
  SPRINKLER: "Aspersion", FLOOD: "Submersion", MANUAL: "Manuelle", MIXED: "Mixte",
};

export default function CropsPage() {
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [isParcelFormOpen, setIsParcelFormOpen] = useState(false);
  const [isCultivationFormOpen, setIsCultivationFormOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<ParcelResponse | null>(null);

  const { data: farmsData } = useFarms(0, 100);
  const farms = farmsData?.data?.content ?? [];
  const { data: parcelsData, isLoading: parcelsLoading } = useFarmParcels(selectedFarmId);
  const { data: cultivationsData, isLoading: cultivationsLoading } = useFarmCultivations(selectedFarmId);
  const parcels = safeArray(parcelsData?.data);
  const cultivations = safeArray(cultivationsData?.data);

  const handleAddCultivation = (parcel: ParcelResponse) => {
    setSelectedParcel(parcel);
    setIsCultivationFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sprout className="h-6 w-6 text-emerald-600" /> Parcelles & Cultures
          </h1>
          <p className="text-muted-foreground">Gestion des parcelles et suivi des cultures</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
            <SelectTrigger className="w-[250px]"><SelectValue placeholder="Sélectionner une ferme" /></SelectTrigger>
            <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
          </Select>
          {selectedFarmId && (
            <PermissionGuard permission={PERMISSIONS.CROP.CREATE}>
              <Button onClick={() => setIsParcelFormOpen(true)} className="bg-green-600 hover:bg-green-700">
                <PlusCircle className="mr-2 h-4 w-4" /> Nouvelle parcelle
              </Button>
            </PermissionGuard>
          )}
        </div>
      </div>

      {!selectedFarmId ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Sprout className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sélectionnez une ferme pour voir ses parcelles et cultures</p>
        </div>
      ) : (
        <Tabs defaultValue="parcels">
          <TabsList>
            <TabsTrigger value="parcels"><MapPin className="mr-1.5 h-4 w-4" /> Parcelles ({parcels.length})</TabsTrigger>
            <TabsTrigger value="cultivations"><Leaf className="mr-1.5 h-4 w-4" /> Cultures ({cultivations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="parcels" className="mt-4">
            {parcelsLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
            ) : parcels.length === 0 ? (
              <div className="text-center py-16">
                <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Aucune parcelle enregistrée</p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {parcels.map((p: any) => {
                  const status = parcelStatusLabels[p.status] ?? { label: p.status, className: "" };
                  return (
                    <Card key={p.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{p.name}</CardTitle>
                          <Badge className={status.className}>{status.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{p.code}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm space-y-1 mb-3">
                          {p.areaHectares && <p><span className="text-muted-foreground">Superficie:</span> {p.areaHectares} ha</p>}
                          {p.irrigationType && <p><span className="text-muted-foreground">Irrigation:</span> {irrigationLabels[p.irrigationType] ?? p.irrigationType}</p>}
                          {p.soilPh && <p><span className="text-muted-foreground">pH sol:</span> {p.soilPh}</p>}
                          <p><span className="text-muted-foreground">Cultures:</span> {p.cultivationCount ?? 0}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/crops/parcels/${p.id}`}>Détails</Link>
                          </Button>
                          <PermissionGuard permission={PERMISSIONS.CROP.CREATE}>
                            <Button size="sm" variant="outline" onClick={() => handleAddCultivation(p)}>
                              <PlusCircle className="mr-1 h-3 w-3" /> Culture
                            </Button>
                          </PermissionGuard>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cultivations" className="mt-4">
            {cultivationsLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : cultivations.length === 0 ? (
              <div className="text-center py-16">
                <Leaf className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Aucune culture en cours</p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <div className="grid grid-cols-6 gap-4 p-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
                  <span>Culture</span><span>Parcelle</span><span>Saison</span><span>Plantation</span><span>Récolte prévue</span><span>Statut</span>
                </div>
                {cultivations.map((c: any) => {
                  const status = cultivationStatusLabels[c.status] ?? { label: c.status, className: "" };
                  return (
                    <Link key={c.id} href={`/dashboard/crops/cultivations/${c.id}`} className="grid grid-cols-6 gap-4 p-3 border-b last:border-0 text-sm hover:bg-muted/50 transition-colors">
                      <div><p className="font-medium">{c.cropTypeName ?? "—"}</p>{c.variety && <p className="text-xs text-muted-foreground">{c.variety}</p>}</div>
                      <span className="text-muted-foreground">{c.parcelName}</span>
                      <span>{c.season} {c.seasonYear}</span>
                      <span className="text-muted-foreground">{c.plantingDate ?? "—"}</span>
                      <span className="text-muted-foreground">{c.expectedHarvestDate ?? "—"}</span>
                      <Badge className={status.className}>{status.label}</Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {selectedFarmId && <ParcelFormModal open={isParcelFormOpen} onOpenChange={setIsParcelFormOpen} farmId={selectedFarmId} />}
      <CultivationFormModal open={isCultivationFormOpen} onOpenChange={setIsCultivationFormOpen} parcel={selectedParcel} />
    </div>
  );
}
