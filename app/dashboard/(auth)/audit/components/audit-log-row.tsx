"use client";

import { User, Globe, Clock, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AuditLogResponse } from "@/types/audit";

const actionConfig: Record<string, { label: string; className: string }> = {
  CREATE: { label: "Créer", className: "bg-green-100 text-green-800" },
  UPDATE: { label: "Modifier", className: "bg-yellow-100 text-yellow-800" },
  DELETE: { label: "Supprimer", className: "bg-red-100 text-red-800" },
  READ: { label: "Lire", className: "bg-blue-100 text-blue-800" },
  LOGIN: { label: "Connexion", className: "bg-emerald-100 text-emerald-800" },
  LOGOUT: { label: "Déconnexion", className: "bg-gray-100 text-gray-800" },
  APPROVE: { label: "Approuver", className: "bg-green-100 text-green-800" },
  REJECT: { label: "Rejeter", className: "bg-red-100 text-red-800" },
  EXPORT: { label: "Export", className: "bg-violet-100 text-violet-800" },
  IMPORT: { label: "Import", className: "bg-violet-100 text-violet-800" },
  SYNC: { label: "Sync", className: "bg-cyan-100 text-cyan-800" },
};

interface Props {
  log: AuditLogResponse;
}

export function AuditLogRow({ log }: Props) {
  const action = actionConfig[log.action] ?? { label: log.action, className: "bg-gray-100 text-gray-800" };
  const isError = log.error || !log.successful;

  return (
    <div className={cn("rounded-lg border p-4", isError ? "border-red-200 bg-red-50/30" : "")}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Badge className={action.className}>{action.label}</Badge>
          {log.entityType && <Badge variant="outline">{log.entityType}</Badge>}
          {isError ? (
            <Badge className="bg-red-100 text-red-700 gap-1"><AlertCircle className="h-3 w-3" /> Échec</Badge>
          ) : (
            <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle className="h-3 w-3" /> Succès</Badge>
          )}
          {log.statusCode && <Badge variant="outline" className="font-mono text-xs">{log.statusCode}</Badge>}
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(log.actionTimestamp).toLocaleString("fr-FR")}
        </span>
      </div>

      {log.description && <p className="text-sm mb-2">{log.description}</p>}
      {log.entityName && (
        <p className="text-sm mb-2"><span className="text-muted-foreground">Entité:</span> <span className="font-medium">{log.entityName}</span></p>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {log.userName && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {log.userName}</span>}
        {log.ipAddress && <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {log.ipAddress}</span>}
        {log.requestMethod && log.requestUrl && (
          <span className="flex items-center gap-1 font-mono"><FileText className="h-3 w-3" /> {log.requestMethod} {log.requestUrl}</span>
        )}
      </div>

      {log.errorMessage && (
        <div className="mt-2 p-2 rounded bg-red-100 text-red-800 text-xs">
          {log.errorMessage}
        </div>
      )}
    </div>
  );
}
