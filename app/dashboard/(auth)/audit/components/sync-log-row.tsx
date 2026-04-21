"use client";

import { Clock, User, Smartphone, Tractor, ArrowUpDown, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SyncLogResponse } from "@/types/audit";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
  IN_PROGRESS: { label: "En cours", className: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Terminé", className: "bg-green-100 text-green-800" },
  FAILED: { label: "Échoué", className: "bg-red-100 text-red-800" },
  PARTIAL: { label: "Partiel", className: "bg-orange-100 text-orange-800" },
  CONFLICT: { label: "Conflit", className: "bg-purple-100 text-purple-800" },
};

interface Props {
  log: SyncLogResponse;
}

export function SyncLogRow({ log }: Props) {
  const status = statusConfig[log.status] ?? { label: log.status, className: "bg-gray-100 text-gray-800" };
  const hasConflict = (log.conflictsDetected ?? 0) > 0;
  const isError = !log.successful || log.status === "FAILED";

  return (
    <div className={cn("rounded-lg border p-4", isError && "border-red-200 bg-red-50/30", hasConflict && "border-purple-200 bg-purple-50/30")}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center flex-wrap gap-2">
          <Badge className={status.className}>{status.label}</Badge>
          {log.successful ? (
            <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle className="h-3 w-3" /> Succès</Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700 gap-1"><AlertCircle className="h-3 w-3" /> Échec</Badge>
          )}
          {log.durationMs != null && (
            <Badge variant="outline" className="text-[10px]">{(log.durationMs / 1000).toFixed(2)}s</Badge>
          )}
          {log.successRate != null && (
            <Badge variant="outline" className={cn(
              "text-[10px]",
              log.successRate >= 99 && "bg-green-50 text-green-700",
              log.successRate < 99 && log.successRate >= 80 && "bg-yellow-50 text-yellow-700",
              log.successRate < 80 && "bg-red-50 text-red-700"
            )}>{log.successRate.toFixed(1)}% succès</Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(log.startedAt).toLocaleString("fr-FR")}
        </span>
      </div>

      {/* Record counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2">
        {log.recordsSent != null && (
          <div className="flex items-center gap-1.5 text-sm">
            <ArrowUpDown className="h-3 w-3 text-blue-600" />
            <span className="text-muted-foreground">Envoyés:</span>
            <span className="font-medium">{log.recordsSent}</span>
          </div>
        )}
        {log.recordsReceived != null && (
          <div className="flex items-center gap-1.5 text-sm">
            <ArrowUpDown className="h-3 w-3 text-green-600" />
            <span className="text-muted-foreground">Reçus:</span>
            <span className="font-medium">{log.recordsReceived}</span>
          </div>
        )}
        {log.recordsFailed != null && log.recordsFailed > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <AlertCircle className="h-3 w-3 text-red-600" />
            <span className="text-muted-foreground">Échoués:</span>
            <span className="font-medium text-red-600">{log.recordsFailed}</span>
          </div>
        )}
        {hasConflict && (
          <div className="flex items-center gap-1.5 text-sm">
            <AlertCircle className="h-3 w-3 text-purple-600" />
            <span className="text-muted-foreground">Conflits:</span>
            <span className="font-medium text-purple-600">{log.conflictsDetected} ({log.conflictsResolved ?? 0} résolus)</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {log.userName && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {log.userName}</span>}
        {log.farmName && <span className="flex items-center gap-1"><Tractor className="h-3 w-3" /> {log.farmName}</span>}
        {log.deviceName && <span className="flex items-center gap-1"><Smartphone className="h-3 w-3" /> {log.deviceName}</span>}
        {log.dataSizeBytes != null && <span>{(log.dataSizeBytes / 1024).toFixed(1)} Ko</span>}
      </div>

      {log.errorMessage && (
        <div className="mt-2 p-2 rounded bg-red-100 text-red-800 text-xs">
          {log.errorMessage}
        </div>
      )}
    </div>
  );
}
