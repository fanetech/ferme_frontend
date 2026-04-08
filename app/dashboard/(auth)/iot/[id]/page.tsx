"use client";

import { use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Cpu, Activity, Thermometer, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useSensor, useSensorReadings, useSensorStatistics } from "@/data/iot";

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "bg-green-100 text-green-800" },
  INACTIVE: { label: "Inactif", className: "bg-gray-100 text-gray-800" },
  MAINTENANCE: { label: "Maintenance", className: "bg-yellow-100 text-yellow-800" },
  FAULT: { label: "Défaillant", className: "bg-red-100 text-red-800" },
  CALIBRATING: { label: "Calibration", className: "bg-blue-100 text-blue-800" },
};

const typeLabels: Record<string, string> = {
  TEMPERATURE: "Température", HUMIDITY: "Humidité", SOIL_MOISTURE: "Humidité sol",
  SOIL_PH: "pH sol", LIGHT: "Luminosité", CO2: "CO2", WATER_LEVEL: "Niveau d'eau",
  MOTION: "Mouvement", CAMERA: "Caméra", RAIN_GAUGE: "Pluviomètre",
};

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null) return null;
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function SensorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const farmId = searchParams.get("farmId") ?? "";

  const { data: sensorData, isLoading: sensorLoading } = useSensor(farmId, id);
  const { data: readingsData, isLoading: readingsLoading } = useSensorReadings(id);
  const { data: statsData } = useSensorStatistics(id);

  const sensor = sensorData?.data;
  const readings = readingsData?.data ?? [];
  const stats = statsData?.data;

  if (sensorLoading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-40 w-full" /></div>;
  }

  if (!sensor) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Capteur introuvable</p>
        <Button variant="outline" className="mt-4" asChild><Link href="/dashboard/iot">Retour</Link></Button>
      </div>
    );
  }

  const status = statusConfig[sensor.status] ?? { label: sensor.status, className: "" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/iot"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Cpu className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold">{sensor.name}</h1>
            <Badge className={status.className}>{status.label}</Badge>
            <Badge variant="outline">{typeLabels[sensor.sensorType] ?? sensor.sensorType}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{sensor.sensorCode}</p>
        </div>
      </div>

      {/* Info + Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Fabricant" value={sensor.manufacturer} />
            <InfoRow label="Modèle" value={sensor.model} />
            <InfoRow label="N° série" value={sensor.serialNumber} />
            <InfoRow label="Unité" value={sensor.unit} />
            <InfoRow label="Intervalle" value={sensor.readingIntervalMinutes ? `${sensor.readingIntervalMinutes} min` : undefined} />
            <InfoRow label="Plage" value={sensor.minValue != null && sensor.maxValue != null ? `${sensor.minValue} — ${sensor.maxValue}` : undefined} />
            <InfoRow label="Batterie" value={sensor.batteryLevel != null ? `${sensor.batteryLevel}%` : undefined} />
            <InfoRow label="Installation" value={sensor.installationDate} />
            <InfoRow label="Dernière calibration" value={sensor.lastCalibrationDate} />
          </CardContent>
        </Card>

        {stats && (
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Statistiques</CardTitle></CardHeader>
            <CardContent>
              <InfoRow label="Total lectures" value={stats.totalReadings} />
              <InfoRow label="Anomalies" value={stats.anomalousReadings} />
              <InfoRow label="Taux anomalie" value={`${(stats.anomalyRate * 100).toFixed(1)}%`} />
              <Separator className="my-2" />
              <InfoRow label="Min" value={`${stats.minValue} ${stats.unit ?? ""}`} />
              <InfoRow label="Max" value={`${stats.maxValue} ${stats.unit ?? ""}`} />
              <InfoRow label="Moyenne" value={`${stats.avgValue.toFixed(2)} ${stats.unit ?? ""}`} />
              <InfoRow label="Écart-type" value={stats.stdDeviation.toFixed(2)} />
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Recent Readings */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Dernières lectures</h2>
        {readingsLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : readings.length === 0 ? (
          <div className="text-center py-10">
            <Thermometer className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune lecture enregistrée</p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <div className="grid grid-cols-4 gap-4 p-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
              <span>Date</span>
              <span>Valeur</span>
              <span>Batterie</span>
              <span>Anomalie</span>
            </div>
            {readings.slice(0, 20).map((reading) => (
              <div key={reading.id} className="grid grid-cols-4 gap-4 p-3 border-b last:border-0 text-sm">
                <span className="text-muted-foreground">
                  {new Date(reading.recordedAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="font-medium">{reading.value} {reading.unit ?? sensor.unit ?? ""}</span>
                <span>{reading.batteryLevel != null ? `${reading.batteryLevel}%` : "—"}</span>
                <span>
                  {reading.isAnomaly ? (
                    <Badge className="bg-red-100 text-red-700 gap-1"><AlertTriangle className="h-3 w-3" /> Oui</Badge>
                  ) : (
                    <span className="text-muted-foreground">Non</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
