"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, PawPrint, Heart, Stethoscope, BarChart3, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLivestock, useLivestockVetCare, useLivestockProduction } from "@/data/livestock";

const statusLabels: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "bg-green-100 text-green-800" },
  SICK: { label: "Malade", className: "bg-red-100 text-red-800" },
  SOLD: { label: "Vendu", className: "bg-blue-100 text-blue-800" },
  DECEASED: { label: "Décédé", className: "bg-gray-100 text-gray-800" },
};

const healthLabels: Record<string, string> = {
  HEALTHY: "Sain", SICK: "Malade", INJURED: "Blessé", RECOVERING: "Rétablissement", QUARANTINE: "Quarantaine", DECEASED: "Décédé",
};

const careTypeLabels: Record<string, string> = {
  VACCINATION: "Vaccination", DEWORMING: "Déparasitage", TREATMENT: "Traitement",
  SURGERY: "Chirurgie", CHECKUP: "Contrôle", INJURY_CARE: "Soins blessure",
  BIRTH_ASSISTANCE: "Aide à la mise-bas", DENTAL_CARE: "Soins dentaires",
  HOOF_CARE: "Soins sabots", OTHER: "Autre",
};

const productionTypeLabels: Record<string, string> = {
  MILK: "Lait", EGGS: "Œufs", WOOL: "Laine", HONEY: "Miel", MEAT: "Viande", MANURE: "Fumier", OTHER: "Autre",
};

const genderLabels: Record<string, string> = { M: "Mâle", F: "Femelle", OTHER: "Autre" };

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null) return null;
  return <div className="flex justify-between py-1.5"><span className="text-sm text-muted-foreground">{label}</span><span className="text-sm font-medium">{value}</span></div>;
}

export default function LivestockDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: animalData, isLoading } = useLivestock(id);
  const { data: vetData, isLoading: vetLoading } = useLivestockVetCare(id);
  const { data: prodData, isLoading: prodLoading } = useLivestockProduction(id);

  const animal = animalData?.data;
  const vetCare = vetData?.data ?? [];
  const production = prodData?.data ?? [];

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-40 w-full" /></div>;
  if (!animal) return <div className="flex flex-col items-center justify-center py-20"><p className="text-muted-foreground">Animal introuvable</p><Button variant="outline" className="mt-4" asChild><Link href="/dashboard/livestock">Retour</Link></Button></div>;

  const status = statusLabels[animal.status] ?? { label: animal.status, className: "" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/livestock"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <PawPrint className="h-6 w-6 text-orange-600" />
            <h1 className="text-2xl font-bold">{animal.name ?? animal.tagNumber ?? "Animal"}</h1>
            <Badge className={status.className}>{status.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{animal.animalTypeName} {animal.breed ? `— ${animal.breed}` : ""} — {animal.farmName}</p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Identité</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Tag" value={animal.tagNumber} />
            <InfoRow label="RFID" value={animal.rfidCode} />
            <InfoRow label="Genre" value={genderLabels[animal.gender] ?? animal.gender} />
            <InfoRow label="Âge" value={animal.ageInMonths != null ? (animal.ageInMonths >= 12 ? `${Math.floor(animal.ageInMonths / 12)} an(s) ${animal.ageInMonths % 12} mois` : `${animal.ageInMonths} mois`) : undefined} />
            <InfoRow label="Date naissance" value={animal.birthDate} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Heart className="h-4 w-4 text-red-500" /> Santé</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="État de santé" value={healthLabels[animal.healthStatus] ?? animal.healthStatus} />
            <InfoRow label="Poids" value={animal.currentWeightKg ? `${animal.currentWeightKg} kg` : undefined} />
            <InfoRow label="Condition corporelle" value={animal.bodyConditionScore} />
            <InfoRow label="Reproduction" value={animal.reproductiveStatus} />
            <InfoRow label="Production" value={animal.productionStatus} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Acquisition</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Date" value={animal.acquisitionDate} />
            <InfoRow label="Source" value={animal.acquisitionSource} />
            <InfoRow label="Coût" value={animal.acquisitionCost ? `${animal.acquisitionCost.toLocaleString()} FCFA` : undefined} />
            <InfoRow label="Mère" value={animal.motherTagNumber} />
            <InfoRow label="Père" value={animal.fatherTagNumber} />
            <InfoRow label="Progéniture" value={animal.numberOfOffspring} />
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Tabs: Vet Care + Production */}
      <Tabs defaultValue="vetcare">
        <TabsList>
          <TabsTrigger value="vetcare"><Stethoscope className="mr-1.5 h-4 w-4" /> Soins vétérinaires ({vetCare.length})</TabsTrigger>
          <TabsTrigger value="production"><BarChart3 className="mr-1.5 h-4 w-4" /> Production ({production.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="vetcare" className="mt-4">
          {vetLoading ? <Skeleton className="h-40" /> : vetCare.length === 0 ? (
            <div className="text-center py-10"><Stethoscope className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">Aucun soin enregistré</p></div>
          ) : (
            <div className="space-y-3">
              {vetCare.map((vc: any) => (
                <Card key={vc.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{careTypeLabels[vc.careType] ?? vc.careType}</Badge>
                        <span className="text-xs text-muted-foreground">{new Date(vc.careDate).toLocaleDateString("fr-FR")}</span>
                      </div>
                      {vc.cost && <span className="text-sm font-medium">{vc.cost.toLocaleString()} FCFA</span>}
                    </div>
                    {vc.diagnosis && <p className="text-sm"><span className="text-muted-foreground">Diagnostic:</span> {vc.diagnosis}</p>}
                    {vc.treatment && <p className="text-sm"><span className="text-muted-foreground">Traitement:</span> {vc.treatment}</p>}
                    {vc.medicationName && <p className="text-sm"><span className="text-muted-foreground">Médicament:</span> {vc.medicationName} {vc.medicationDosage ? `— ${vc.medicationDosage}` : ""}</p>}
                    {vc.veterinarianName && <p className="text-xs text-muted-foreground mt-1">Vétérinaire: {vc.veterinarianName}</p>}
                    {vc.followUpDate && <p className="text-xs text-blue-600 mt-1">Suivi prévu: {vc.followUpDate}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="production" className="mt-4">
          {prodLoading ? <Skeleton className="h-40" /> : production.length === 0 ? (
            <div className="text-center py-10"><BarChart3 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">Aucune production enregistrée</p></div>
          ) : (
            <div className="rounded-lg border">
              <div className="grid grid-cols-6 gap-4 p-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
                <span>Type</span><span>Date</span><span>Quantité</span><span>Qualité</span><span>Vendu</span><span>Perdu</span>
              </div>
              {production.map((p: any) => (
                <div key={p.id} className="grid grid-cols-6 gap-4 p-3 border-b last:border-0 text-sm">
                  <span className="font-medium">{productionTypeLabels[p.productionType] ?? p.productionType}</span>
                  <span className="text-muted-foreground">{new Date(p.productionDate).toLocaleDateString("fr-FR")}</span>
                  <span>{p.quantity} {p.unit}</span>
                  <span>{p.qualityGrade ?? "—"}</span>
                  <span>{p.quantitySold ?? "—"} {p.quantitySold ? p.unit : ""}</span>
                  <span className={p.quantityLost ? "text-red-600" : ""}>{p.quantityLost ?? "—"} {p.quantityLost ? p.unit : ""}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
