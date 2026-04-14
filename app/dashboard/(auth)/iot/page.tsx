"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { createSensorColumns, SensorFormModal } from "./components";
import { useFarmSensors } from "@/data/iot";
import { useFarms } from "@/data/farms";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { safeArray } from "@/lib/utils/safe-array";
import { PERMISSIONS } from "@/lib/constants/permissions";
import type { IoTSensorResponse } from "@/types/iot";

export default function IoTPage() {
  const router = useRouter();
  const [selectedFarmId, setSelectedFarmId] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: farmsData } = useFarms(0, 100);
  const farms = farmsData?.data?.content ?? [];

  const { data: sensorsData, isLoading: sensorsLoading } = useFarmSensors(selectedFarmId);
  const sensors = safeArray(sensorsData?.data);

  const columns = useMemo(
    () => createSensorColumns({
      onView: (sensor) => router.push(`/dashboard/iot/${sensor.id}?farmId=${selectedFarmId}`),
      onEdit: () => {},
      onDelete: () => {},
    }),
    [router, selectedFarmId]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Cpu className="h-6 w-6 text-indigo-600" />
            Capteurs IoT
          </h1>
          <p className="text-muted-foreground">Surveillance des capteurs par ferme</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Sélectionner une ferme" />
            </SelectTrigger>
            <SelectContent>
              {farms.map((farm) => (
                <SelectItem key={farm.id} value={farm.id}>{farm.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedFarmId && (
            <PermissionGuard permission={PERMISSIONS.IOT.SENSOR_CREATE}>
              <Button onClick={() => setIsFormOpen(true)} className="bg-green-600 hover:bg-green-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouveau capteur
              </Button>
            </PermissionGuard>
          )}
        </div>
      </div>

      {!selectedFarmId ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Cpu className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sélectionnez une ferme pour voir ses capteurs</p>
        </div>
      ) : (
        <DataTable
          data={sensors}
          columns={columns}
          totalElements={sensors.length}
          totalPages={1}
          currentPage={1}
          pageSize={sensors.length || 10}
          onPageChange={() => {}}
          isLoading={sensorsLoading}
          searchPlaceholder="Rechercher un capteur..."
          emptyMessage="Aucun capteur trouvé pour cette ferme."
        />
      )}

      {selectedFarmId && (
        <SensorFormModal open={isFormOpen} onOpenChange={setIsFormOpen} farmId={selectedFarmId} />
      )}
    </div>
  );
}
