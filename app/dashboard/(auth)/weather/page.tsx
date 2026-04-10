"use client";

import { useState } from "react";
import { CloudSun, Thermometer, Droplets, Wind, CloudRain, Sun, AlertTriangle, History } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFarms } from "@/data/farms";
import { useCurrentWeather, useWeatherForecast, useWeatherHistory } from "@/data/iot";
import { sensorApi } from "@/data/iot";
import { useQuery } from "@tanstack/react-query";

const conditionLabels: Record<string, { label: string; icon: typeof Sun }> = {
  CLEAR: { label: "Dégagé", icon: Sun },
  PARTLY_CLOUDY: { label: "Partiellement nuageux", icon: CloudSun },
  CLOUDY: { label: "Nuageux", icon: CloudSun },
  RAIN: { label: "Pluie", icon: CloudRain },
  HEAVY_RAIN: { label: "Forte pluie", icon: CloudRain },
  STORM: { label: "Orage", icon: AlertTriangle },
  FOG: { label: "Brouillard", icon: CloudSun },
  DUST: { label: "Poussière", icon: Wind },
  HARMATTAN: { label: "Harmattan", icon: Wind },
};

function WeatherCard({ label, value, unit, icon: Icon, color }: { label: string; value?: number | null; unit: string; icon: typeof Thermometer; color: string }) {
  return (
    <Card>
      <CardContent className="pt-6 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value ?? "—"}<span className="text-sm font-normal text-muted-foreground ml-1">{value != null ? unit : ""}</span></p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WeatherPage() {
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const { data: farmsData } = useFarms(0, 100);
  const farms = farmsData?.data?.content ?? [];
  const { data: currentData, isLoading: currentLoading } = useCurrentWeather(selectedFarmId);
  const { data: forecastData, isLoading: forecastLoading } = useWeatherForecast(selectedFarmId);
  const { data: historyData, isLoading: historyLoading } = useWeatherHistory(selectedFarmId);
  const { data: anomaliesData } = useQuery({
    queryKey: ["iot", "anomalies", selectedFarmId],
    queryFn: () => sensorApi.anomalies(selectedFarmId),
    enabled: !!selectedFarmId,
  });

  const current = currentData?.data;
  const forecast = forecastData?.data ?? [];
  const history = historyData?.data ?? [];
  const anomalies = anomaliesData?.data ?? [];

  const condInfo = current?.weatherCondition ? conditionLabels[current.weatherCondition] : null;
  const CondIcon = condInfo?.icon ?? CloudSun;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CloudSun className="h-6 w-6 text-sky-600" /> Météo & Conditions
          </h1>
          <p className="text-muted-foreground">Surveillance météorologique des fermes</p>
        </div>
        <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
          <SelectTrigger className="w-[250px]"><SelectValue placeholder="Sélectionner une ferme" /></SelectTrigger>
          <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {!selectedFarmId ? (
        <div className="flex flex-col items-center justify-center py-20">
          <CloudSun className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sélectionnez une ferme pour voir les conditions météo</p>
        </div>
      ) : currentLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-5"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
      ) : !current ? (
        <div className="text-center py-20"><CloudSun className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">Aucune donnée météo disponible pour cette ferme</p></div>
      ) : (
        <>
          {/* Current condition banner */}
          <Card className="bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200">
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CondIcon className="h-12 w-12 text-sky-600" />
                <div>
                  <p className="text-lg font-semibold">{condInfo?.label ?? "Conditions actuelles"}</p>
                  <p className="text-sm text-muted-foreground">
                    Enregistré le {new Date(current.recordedAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
              {current.heatIndex && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Indice de chaleur</p>
                  <p className="text-xl font-bold text-orange-600">{current.heatIndex}°C</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current readings */}
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <WeatherCard label="Température" value={current.temperature} unit="°C" icon={Thermometer} color="bg-red-100 text-red-600" />
            <WeatherCard label="Humidité" value={current.humidity} unit="%" icon={Droplets} color="bg-blue-100 text-blue-600" />
            <WeatherCard label="Vent" value={current.windSpeed} unit="km/h" icon={Wind} color="bg-gray-100 text-gray-600" />
            <WeatherCard label="Précipitations" value={current.rainfall} unit="mm" icon={CloudRain} color="bg-sky-100 text-sky-600" />
            <WeatherCard label="Pression" value={current.pressure} unit="hPa" icon={Sun} color="bg-amber-100 text-amber-600" />
          </div>

          {/* Anomalies alert */}
          {anomalies.length > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" /> Anomalies détectées ({anomalies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {anomalies.slice(0, 5).map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between text-sm">
                      <span>Capteur {a.sensorCode}: <span className="font-medium">{a.value} {a.unit ?? ""}</span></span>
                      <span className="text-xs text-muted-foreground">{new Date(a.recordedAt).toLocaleString("fr-FR")}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          <Tabs defaultValue="forecast">
            <TabsList>
              <TabsTrigger value="forecast"><CloudSun className="mr-1.5 h-4 w-4" /> Prévisions ({forecast.length})</TabsTrigger>
              <TabsTrigger value="history"><History className="mr-1.5 h-4 w-4" /> Historique ({history.length})</TabsTrigger>
            </TabsList>

            {/* FORECAST TAB */}
            <TabsContent value="forecast" className="mt-4">
              {forecastLoading ? <Skeleton className="h-40" /> : forecast.length === 0 ? (
                <div className="text-center py-10"><p className="text-sm text-muted-foreground">Aucune prévision disponible</p></div>
              ) : (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {forecast.slice(0, 7).map((f: any, i: number) => {
                    const fCond = f.weatherCondition ? conditionLabels[f.weatherCondition] : null;
                    const FIcon = fCond?.icon ?? CloudSun;
                    return (
                      <Card key={i}>
                        <CardContent className="pt-4 text-center">
                          <p className="text-sm font-medium mb-2">{f.forecastDate}</p>
                          <FIcon className="h-8 w-8 text-sky-500 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground mb-1">{fCond?.label ?? f.weatherCondition ?? "—"}</p>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-sm font-medium text-blue-600">{f.minTemperature ?? "—"}°</span>
                            <span className="text-muted-foreground">—</span>
                            <span className="text-sm font-medium text-red-600">{f.maxTemperature ?? "—"}°</span>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                            {f.humidity != null && <p>Humidité: {f.humidity}%</p>}
                            {f.windSpeed != null && <p>Vent: {f.windSpeed} km/h</p>}
                            {f.precipitationProbability != null && (
                              <p className="text-blue-600">Pluie: {f.precipitationProbability}% {f.expectedRainfall ? `(${f.expectedRainfall} mm)` : ""}</p>
                            )}
                            {f.uvIndex != null && <p>UV: {f.uvIndex}</p>}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* HISTORY TAB */}
            <TabsContent value="history" className="mt-4">
              {historyLoading ? <Skeleton className="h-40" /> : history.length === 0 ? (
                <div className="text-center py-10"><p className="text-sm text-muted-foreground">Aucun historique disponible</p></div>
              ) : (
                <div className="rounded-lg border">
                  <div className="grid grid-cols-7 gap-4 p-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground">
                    <span>Date</span><span>Temp.</span><span>Humidité</span><span>Vent</span><span>Pluie</span><span>Pression</span><span>Conditions</span>
                  </div>
                  {history.slice(0, 30).map((h: any, i: number) => {
                    const hCond = h.weatherCondition ? conditionLabels[h.weatherCondition] : null;
                    return (
                      <div key={i} className="grid grid-cols-7 gap-4 p-3 border-b last:border-0 text-sm">
                        <span className="text-muted-foreground">{new Date(h.recordedAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        <span className={h.temperature && h.temperature > 40 ? "text-red-600 font-medium" : ""}>{h.temperature ?? "—"}°C</span>
                        <span>{h.humidity ?? "—"}%</span>
                        <span>{h.windSpeed ?? "—"} km/h {h.windDirectionCardinal ?? ""}</span>
                        <span className={h.rainfall && h.rainfall > 10 ? "text-blue-600 font-medium" : ""}>{h.rainfall ?? 0} mm</span>
                        <span>{h.pressure ?? "—"} hPa</span>
                        <span className="text-xs">{hCond?.label ?? h.weatherCondition ?? "—"}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
