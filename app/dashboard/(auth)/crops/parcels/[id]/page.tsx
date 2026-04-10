"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Leaf, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useParcel } from "@/data/crops";
import { cultivationApi } from "@/data/crops";
import { useQuery } from "@tanstack/react-query";
import { CultivationFormModal } from "../../components";

const statusLabels: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "bg-green-100 text-green-800" },
  FALLOW: { label: "Jachère", className: "bg-yellow-100 text-yellow-800" },
  RESTING: { label: "Repos", className: "bg-blue-100 text-blue-800" },
  INACTIVE: { label: "Inactif", className: "bg-gray-100 text-gray-800" },
};

const cultStatusLabels: Record<string, { label: string; className: string }> = {
  PLANNED: { label: "Planifié", className: "bg-gray-100 text-gray-800" },
  PLANTED: { label: "Planté", className: "bg-green-100 text-green-800" },
  GROWING: { label: "Croissance", className: "bg-emerald-100 text-emerald-800" },
  HARVESTED: { label: "Récolté", className: "bg-blue-100 text-blue-800" },
  FAILED: { label: "Échoué", className: "bg-red-100 text-red-800" },
};

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null) return null;
  return <div className="flex justify-between py-1.5"><span className="text-sm text-muted-foreground">{label}</span><span className="text-sm font-medium">{value}</span></div>;
}

export default function ParcelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: parcelData, isLoading } = useParcel(id);
  const { data: cultsData } = useQuery({ queryKey: ["cultivations", "parcel", id], queryFn: () => cultivationApi.byParcel(id), enabled: !!id });
  const [isCultFormOpen, setIsCultFormOpen] = useState(false);

  const parcel = parcelData?.data;
  const cultivations = cultsData?.data ?? [];

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-40 w-full" /></div>;
  if (!parcel) return <div className="flex flex-col items-center justify-center py-20"><p className="text-muted-foreground">Parcelle introuvable</p><Button variant="outline" className="mt-4" asChild><Link href="/dashboard/crops">Retour</Link></Button></div>;

  const status = statusLabels[parcel.status] ?? { label: parcel.status, className: "" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/crops"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold">{parcel.name}</h1>
            <Badge className={status.className}>{status.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{parcel.code} — {parcel.farmName}</p>
        </div>
        <Button onClick={() => setIsCultFormOpen(true)} className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Nouvelle culture
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Superficie" value={parcel.areaHectares ? `${parcel.areaHectares} ha` : undefined} />
            <InfoRow label="Irrigation" value={parcel.irrigationType} />
            <InfoRow label="pH sol" value={parcel.soilPh} />
            <InfoRow label="Matière organique" value={parcel.organicMatterPercentage ? `${parcel.organicMatterPercentage}%` : undefined} />
            <InfoRow label="Élévation" value={parcel.elevation ? `${parcel.elevation} m` : undefined} />
            <InfoRow label="Cultures" value={parcel.cultivationCount} />
            {parcel.notes && <p className="text-sm text-muted-foreground mt-2 border-t pt-2">{parcel.notes}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Leaf className="h-4 w-4" /> Cultures ({cultivations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {cultivations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucune culture</p>
            ) : (
              <div className="space-y-2">
                {cultivations.map((c: any) => {
                  const cStatus = cultStatusLabels[c.status] ?? { label: c.status, className: "" };
                  return (
                    <Link key={c.id} href={`/dashboard/crops/cultivations/${c.id}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium">{c.cropTypeName ?? "Culture"}</p>
                        <p className="text-xs text-muted-foreground">{c.season} {c.seasonYear} {c.variety ? `— ${c.variety}` : ""}</p>
                      </div>
                      <Badge className={cStatus.className}>{cStatus.label}</Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CultivationFormModal open={isCultFormOpen} onOpenChange={setIsCultFormOpen} parcel={parcel} />
    </div>
  );
}
