"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Leaf, Activity, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useCultivation, useCultivationTimeline, useCultivationActivities } from "@/data/crops";

const statusLabels: Record<string, { label: string; className: string }> = {
  PLANNED: { label: "Planifié", className: "bg-gray-100 text-gray-800" },
  LAND_PREPARATION: { label: "Préparation", className: "bg-yellow-100 text-yellow-800" },
  PLANTED: { label: "Planté", className: "bg-green-100 text-green-800" },
  GERMINATING: { label: "Germination", className: "bg-lime-100 text-lime-800" },
  GROWING: { label: "Croissance", className: "bg-emerald-100 text-emerald-800" },
  FLOWERING: { label: "Floraison", className: "bg-pink-100 text-pink-800" },
  READY_FOR_HARVEST: { label: "Prêt à récolter", className: "bg-amber-100 text-amber-800" },
  HARVESTED: { label: "Récolté", className: "bg-blue-100 text-blue-800" },
  FAILED: { label: "Échoué", className: "bg-red-100 text-red-800" },
};

const activityTypeLabels: Record<string, string> = {
  LAND_CLEARING: "Défrichage", PLOWING: "Labour", HARROWING: "Hersage",
  SEEDING: "Semis", TRANSPLANTING: "Repiquage", WATERING: "Arrosage",
  FERTILIZING: "Fertilisation", WEEDING: "Désherbage", PEST_CONTROL: "Traitement insectes",
  DISEASE_TREATMENT: "Traitement maladies", PRUNING: "Taille", HARVESTING: "Récolte",
  POST_HARVEST: "Post-récolte", MONITORING: "Suivi", OTHER: "Autre",
};

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null) return null;
  return <div className="flex justify-between py-1.5"><span className="text-sm text-muted-foreground">{label}</span><span className="text-sm font-medium">{value}</span></div>;
}

export default function CultivationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: cultData, isLoading } = useCultivation(id);
  const { data: timelineData } = useCultivationTimeline(id);
  const { data: activitiesData } = useCultivationActivities(id);

  const cult = cultData?.data;
  const timeline = timelineData?.data?.timeline ?? [];
  const activities = activitiesData?.data ?? [];

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-40 w-full" /></div>;
  if (!cult) return <div className="flex flex-col items-center justify-center py-20"><p className="text-muted-foreground">Culture introuvable</p><Button variant="outline" className="mt-4" asChild><Link href="/dashboard/crops">Retour</Link></Button></div>;

  const status = statusLabels[cult.status] ?? { label: cult.status, className: "" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/crops"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Leaf className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold">{cult.cropTypeName ?? "Culture"}</h1>
            <Badge className={status.className}>{status.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{cult.parcelName} — {cult.season} {cult.seasonYear} {cult.variety ? `— ${cult.variety}` : ""}</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Parcelle" value={cult.parcelName} />
            <InfoRow label="Type de culture" value={cult.cropTypeName} />
            <InfoRow label="Variété" value={cult.variety} />
            <InfoRow label="Source semence" value={cult.seedSource} />
            <InfoRow label="Qualité semence" value={cult.seedQuality} />
            <InfoRow label="Quantité semence" value={cult.seedQuantityKg ? `${cult.seedQuantityKg} kg` : undefined} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" /> Dates</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Plantation" value={cult.plantingDate} />
            <InfoRow label="Germination prévue" value={cult.expectedGerminationDate} />
            <InfoRow label="Germination réelle" value={cult.actualGerminationDate} />
            <InfoRow label="Récolte prévue" value={cult.expectedHarvestDate} />
            <InfoRow label="Récolte réelle" value={cult.actualHarvestDate} />
            <Separator className="my-2" />
            <InfoRow label="Rendement cible" value={cult.targetYieldTonnesPerHectare ? `${cult.targetYieldTonnesPerHectare} t/ha` : undefined} />
            <InfoRow label="Rendement réel" value={cult.actualYieldTonnesPerHectare ? `${cult.actualYieldTonnesPerHectare} t/ha` : undefined} />
            <InfoRow label="Quantité récoltée" value={cult.harvestedQuantityKg ? `${cult.harvestedQuantityKg} kg` : undefined} />
            <InfoRow label="Pertes" value={cult.lossQuantityKg ? `${cult.lossQuantityKg} kg` : undefined} />
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="text-lg font-semibold mb-4">Chronologie</h2>
            <div className="relative pl-6 space-y-4">
              {timeline.map((event: any, i: number) => (
                <div key={i} className="relative">
                  <div className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                  {i < timeline.length - 1 && <div className="absolute -left-[18px] top-4 h-full w-0.5 bg-border" />}
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{event.title}</span>
                      <span className="text-xs text-muted-foreground">{event.eventDate}</span>
                    </div>
                    {event.description && <p className="text-xs text-muted-foreground">{event.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Activities */}
      <Separator />
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity className="h-5 w-5" /> Activités ({activities.length})</h2>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucune activité enregistrée</p>
        ) : (
          <div className="rounded-lg border">
            <div className="grid grid-cols-5 gap-4 p-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
              <span>Type</span><span>Date</span><span>Durée</span><span>Coût</span><span>Conditions</span>
            </div>
            {activities.map((a: any) => (
              <div key={a.id} className="grid grid-cols-5 gap-4 p-3 border-b last:border-0 text-sm">
                <span className="font-medium">{activityTypeLabels[a.activityType] ?? a.activityType}</span>
                <span className="text-muted-foreground">{a.activityDate}</span>
                <span>{a.durationHours ? `${a.durationHours}h` : "—"}</span>
                <span>{a.totalCostFcfa ? `${a.totalCostFcfa.toLocaleString()} FCFA` : "—"}</span>
                <span className="text-muted-foreground text-xs">{a.weatherConditions ?? "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
