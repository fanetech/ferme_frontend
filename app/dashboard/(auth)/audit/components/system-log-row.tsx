"use client";

import { Globe, Clock, User, Server, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SystemLogResponse } from "@/types/audit";

const logLevelConfig: Record<string, { className: string }> = {
  TRACE: { className: "bg-gray-100 text-gray-600" },
  DEBUG: { className: "bg-blue-100 text-blue-700" },
  INFO: { className: "bg-cyan-100 text-cyan-700" },
  WARN: { className: "bg-yellow-100 text-yellow-700" },
  ERROR: { className: "bg-red-100 text-red-700" },
  FATAL: { className: "bg-red-200 text-red-900" },
};

const methodColors: Record<string, string> = {
  GET: "bg-blue-100 text-blue-700",
  POST: "bg-green-100 text-green-700",
  PUT: "bg-yellow-100 text-yellow-700",
  PATCH: "bg-orange-100 text-orange-700",
  DELETE: "bg-red-100 text-red-700",
};

interface Props {
  log: SystemLogResponse;
}

export function SystemLogRow({ log }: Props) {
  const isError = log.serverError || log.clientError;
  const level = log.logLevel ? logLevelConfig[log.logLevel] : null;
  const methodClass = log.httpMethod ? methodColors[log.httpMethod] ?? "bg-gray-100 text-gray-700" : "";

  return (
    <div className={cn(
      "rounded-lg border p-4",
      log.serverError && "border-red-300 bg-red-50/50",
      log.clientError && !log.serverError && "border-orange-200 bg-orange-50/30",
      log.securityViolation && "border-purple-300 bg-purple-50/50"
    )}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center flex-wrap gap-2">
          {log.httpMethod && <Badge className={`font-mono text-[10px] ${methodClass}`}>{log.httpMethod}</Badge>}
          {log.statusCode && (
            <Badge className={cn(
              "font-mono text-[10px]",
              log.statusCode < 300 && "bg-green-100 text-green-700",
              log.statusCode >= 300 && log.statusCode < 400 && "bg-blue-100 text-blue-700",
              log.statusCode >= 400 && log.statusCode < 500 && "bg-orange-100 text-orange-700",
              log.statusCode >= 500 && "bg-red-100 text-red-700"
            )}>{log.statusCode}</Badge>
          )}
          {level && <Badge className={level.className}>{log.logLevel}</Badge>}
          {log.securityViolation && (
            <Badge className="bg-purple-100 text-purple-700 gap-1"><ShieldAlert className="h-3 w-3" /> Violation</Badge>
          )}
          {log.durationMs != null && (
            <Badge variant="outline" className={cn(
              "text-[10px]",
              log.durationMs > 1000 && "bg-yellow-50 text-yellow-700",
              log.durationMs > 3000 && "bg-red-50 text-red-700"
            )}>{log.durationMs}ms</Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(log.requestTime).toLocaleString("fr-FR")}
        </span>
      </div>

      {log.endpoint && (
        <p className="text-sm font-mono mb-2 break-all">{log.endpoint}</p>
      )}
      {log.message && <p className="text-sm mb-2">{log.message}</p>}

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {log.username && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {log.username}</span>}
        {log.clientIp && <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {log.clientIp}</span>}
        {log.browser && <span>{log.browser} / {log.os ?? "—"}</span>}
        {log.deviceType && <Badge variant="outline" className="text-[10px]">{log.deviceType}</Badge>}
      </div>

      {log.errorMessage && (
        <div className="mt-2 p-2 rounded bg-red-100 text-red-800 text-xs font-mono">
          {log.errorMessage}
        </div>
      )}
      {log.securityDetails && (
        <div className="mt-2 p-2 rounded bg-purple-100 text-purple-800 text-xs">
          {log.securityDetails}
        </div>
      )}
    </div>
  );
}
