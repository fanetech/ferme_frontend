"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Pencil, Trash2, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IoTSensorResponse } from "@/types/iot";

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

interface ColumnActions {
  onView: (sensor: IoTSensorResponse) => void;
  onEdit: (sensor: IoTSensorResponse) => void;
  onDelete: (sensor: IoTSensorResponse) => void;
}

export function createSensorColumns(actions: ColumnActions): ColumnDef<IoTSensorResponse>[] {
  return [
    {
      accessorKey: "sensorCode",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.sensorCode}</span>,
    },
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.manufacturer && (
            <p className="text-xs text-muted-foreground">{row.original.manufacturer} {row.original.model ?? ""}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "sensorType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">{typeLabels[row.original.sensorType] ?? row.original.sensorType}</Badge>
      ),
    },
    {
      accessorKey: "batteryLevel",
      header: "Batterie",
      cell: ({ row }) => {
        const level = row.original.batteryLevel;
        if (level == null) return <span className="text-xs text-muted-foreground">—</span>;
        const color = level > 50 ? "text-green-600" : level > 20 ? "text-yellow-600" : "text-red-600";
        return <span className={`text-sm font-medium ${color}`}>{level}%</span>;
      },
    },
    {
      accessorKey: "lastReadingAt",
      header: "Dernière lecture",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.lastReadingAt
            ? new Date(row.original.lastReadingAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
            : "Aucune"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const config = statusConfig[row.original.status] ?? { label: row.original.status, className: "" };
        return (
          <div className="flex items-center gap-1.5">
            <Badge className={config.className}>{config.label}</Badge>
            {row.original.isLowBattery && <Badge className="bg-red-100 text-red-700 text-[10px]">Batterie faible</Badge>}
            {row.original.needsCalibration && <Badge className="bg-yellow-100 text-yellow-700 text-[10px]">Calibration</Badge>}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => actions.onView(row.original)}>
              <Eye className="mr-2 h-4 w-4" /> Voir les lectures
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => actions.onDelete(row.original)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
