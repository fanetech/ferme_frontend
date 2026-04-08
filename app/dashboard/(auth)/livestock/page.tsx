"use client";

import { useState } from "react";
import Link from "next/link";
import { PawPrint, PlusCircle, Heart, Weight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFarms } from "@/data/farms";
import { useFarmLivestock } from "@/data/livestock";
import { LivestockFormModal } from "./components";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PERMISSIONS } from "@/lib/constants/permissions";

const statusLabels: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "bg-green-100 text-green-800" },
  SICK: { label: "Malade", className: "bg-red-100 text-red-800" },
  SOLD: { label: "Vendu", className: "bg-blue-100 text-blue-800" },
  DECEASED: { label: "Décédé", className: "bg-gray-100 text-gray-800" },
  STOLEN: { label: "Volé", className: "bg-red-200 text-red-900" },
  LOST: { label: "Perdu", className: "bg-yellow-100 text-yellow-800" },
  TRANSFERRED: { label: "Transféré", className: "bg-indigo-100 text-indigo-800" },
  SLAUGHTERED: { label: "Abattu", className: "bg-gray-200 text-gray-900" },
};

const healthLabels: Record<string, { label: string; className: string }> = {
  HEALTHY: { label: "Sain", className: "text-green-600" },
  SICK: { label: "Malade", className: "text-red-600" },
  INJURED: { label: "Blessé", className: "text-orange-600" },
  RECOVERING: { label: "Rétablissement", className: "text-blue-600" },
  QUARANTINE: { label: "Quarantaine", className: "text-purple-600" },
};

const genderLabels: Record<string, string> = { M: "Mâle", F: "Femelle", OTHER: "Autre" };

export default function LivestockPage() {
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: farmsData } = useFarms(0, 100);
  const farms = farmsData?.data?.content ?? [];
  const { data: livestockData, isLoading } = useFarmLivestock(selectedFarmId);
  const allAnimals = livestockData?.data ?? [];
  const animals = statusFilter === "ALL" ? allAnimals : allAnimals.filter((a: any) => a.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-orange-600" /> Élevage
          </h1>
          <p className="text-muted-foreground">Suivi des animaux par ferme</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous</SelectItem>
              <SelectItem value="ACTIVE">Actifs</SelectItem>
              <SelectItem value="SICK">Malades</SelectItem>
              <SelectItem value="SOLD">Vendus</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
            <SelectTrigger className="w-[250px]"><SelectValue placeholder="Sélectionner une ferme" /></SelectTrigger>
            <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
          </Select>
          {selectedFarmId && (
            <PermissionGuard permission={PERMISSIONS.LIVESTOCK.CREATE}>
              <Button onClick={() => setIsFormOpen(true)} className="bg-green-600 hover:bg-green-700">
                <PlusCircle className="mr-2 h-4 w-4" /> Nouvel animal
              </Button>
            </PermissionGuard>
          )}
        </div>
      </div>

      {!selectedFarmId ? (
        <div className="flex flex-col items-center justify-center py-20">
          <PawPrint className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sélectionnez une ferme pour voir ses animaux</p>
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-40" />)}</div>
      ) : animals.length === 0 ? (
        <div className="text-center py-20"><PawPrint className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">{statusFilter !== "ALL" ? "Aucun animal avec ce statut" : "Aucun animal enregistré"}</p></div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{animals.length} animal{animals.length > 1 ? "x" : ""}</p>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {animals.map((a: any) => {
              const status = statusLabels[a.status] ?? { label: a.status, className: "" };
              const health = healthLabels[a.healthStatus] ?? { label: a.healthStatus, className: "" };
              return (
                <Link key={a.id} href={`/dashboard/livestock/${a.id}`}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{a.name ?? a.tagNumber ?? "Sans nom"}</CardTitle>
                        <Badge className={status.className}>{status.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{a.animalTypeName} {a.breed ? `— ${a.breed}` : ""}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1.5"><span className="text-muted-foreground">Genre:</span><span>{genderLabels[a.gender] ?? a.gender}</span></div>
                        <div className="flex items-center gap-1.5"><Heart className={`h-3.5 w-3.5 ${health.className}`} /><span className={health.className}>{health.label}</span></div>
                        {a.currentWeightKg && <div className="flex items-center gap-1.5"><Weight className="h-3.5 w-3.5 text-muted-foreground" /><span>{a.currentWeightKg} kg</span></div>}
                        {a.ageInMonths != null && <div className="flex items-center gap-1.5"><span className="text-muted-foreground">Âge:</span><span>{a.ageInMonths >= 12 ? `${Math.floor(a.ageInMonths / 12)} an${Math.floor(a.ageInMonths / 12) > 1 ? "s" : ""}` : `${a.ageInMonths} mois`}</span></div>}
                      </div>
                      {a.tagNumber && <p className="text-xs text-muted-foreground font-mono mt-2">Tag: {a.tagNumber}</p>}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {selectedFarmId && <LivestockFormModal open={isFormOpen} onOpenChange={setIsFormOpen} farmId={selectedFarmId} />}
    </div>
  );
}
