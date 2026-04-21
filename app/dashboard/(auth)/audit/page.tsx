"use client";

import { useState } from "react";
import {
  FileSearch, Activity, Server, ShieldAlert, RefreshCw, AlertTriangle,
  TrendingUp, CheckCircle, XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  useAuditLogs, useAuditStats, useFailedAudits,
  useSystemLogErrors, useServerErrors, useSecurityViolations, useSystemLogStats,
  useSyncLogs, useFailedSyncs, useSyncConflicts,
} from "@/data/audit";
import { safeArray } from "@/lib/utils/safe-array";
import { AuditLogRow, SystemLogRow, SyncLogRow } from "./components";

export default function AuditPage() {
  const [activeTab, setActiveTab] = useState("audit");

  // Audit data
  const { data: auditData, isLoading: auditLoading, refetch: refetchAudit } = useAuditLogs(0, 50);
  const { data: auditStatsData } = useAuditStats();
  const { data: failedAuditsData } = useFailedAudits();

  // System log data
  const { data: errorLogsData, isLoading: errorsLoading } = useSystemLogErrors(0, 30);
  const { data: serverErrorsData } = useServerErrors(0, 30);
  const { data: securityViolationsData } = useSecurityViolations(0, 30);
  const { data: sysStatsData } = useSystemLogStats();

  // Sync log data
  const { data: syncLogsData, isLoading: syncLoading } = useSyncLogs(0, 30);
  const { data: failedSyncsData } = useFailedSyncs();
  const { data: conflictsData } = useSyncConflicts();

  const auditLogs = auditData?.data?.content ?? [];
  const auditStats = auditStatsData?.data ?? {};
  const failedAudits = safeArray(failedAuditsData?.data);

  const errorLogs = errorLogsData?.data?.content ?? [];
  const serverErrors = serverErrorsData?.data?.content ?? [];
  const securityViolations = securityViolationsData?.data?.content ?? [];
  const sysStats = sysStatsData?.data;

  const syncLogs = syncLogsData?.data?.content ?? [];
  const failedSyncs = safeArray(failedSyncsData?.data);
  const conflicts = safeArray(conflictsData?.data);

  const totalActions = Object.values(auditStats).reduce((s, v: any) => s + (typeof v === "number" ? v : 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
              <FileSearch className="h-5 w-5 text-slate-700" />
            </div>
            Audit & Logs
          </h1>
          <p className="text-muted-foreground mt-1">Traçabilité et surveillance du système</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchAudit()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Actualiser
        </Button>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{totalActions.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Actions auditées</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-700">{failedAudits.length}</p>
              <p className="text-xs text-muted-foreground">Actions échouées</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-700">{securityViolations.length}</p>
              <p className="text-xs text-muted-foreground">Violations sécurité</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-emerald-600" />
            <div>
              <p className="text-2xl font-bold text-emerald-700">
                {sysStats?.successRate != null ? `${sysStats.successRate.toFixed(1)}%` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Taux de succès</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance summary if available */}
      {sysStats && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <div><p className="text-xs text-muted-foreground">Total requêtes</p><p className="text-lg font-semibold">{sysStats.totalRequests?.toLocaleString() ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Réussies</p><p className="text-lg font-semibold text-green-600">{sysStats.successfulRequests?.toLocaleString() ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Échouées</p><p className="text-lg font-semibold text-red-600">{sysStats.failedRequests?.toLocaleString() ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Temps moyen</p><p className="text-lg font-semibold">{sysStats.averageResponseTimeMs != null ? `${sysStats.averageResponseTimeMs.toFixed(0)} ms` : "—"}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="audit"><Activity className="mr-1.5 h-4 w-4" /> Audit ({auditLogs.length})</TabsTrigger>
          <TabsTrigger value="errors"><AlertTriangle className="mr-1.5 h-4 w-4" /> Erreurs ({errorLogs.length})</TabsTrigger>
          <TabsTrigger value="security"><ShieldAlert className="mr-1.5 h-4 w-4" /> Sécurité ({securityViolations.length})</TabsTrigger>
          <TabsTrigger value="server"><Server className="mr-1.5 h-4 w-4" /> Serveur ({serverErrors.length})</TabsTrigger>
          <TabsTrigger value="sync"><RefreshCw className="mr-1.5 h-4 w-4" /> Sync ({syncLogs.length})</TabsTrigger>
        </TabsList>

        {/* AUDIT TAB */}
        <TabsContent value="audit" className="mt-4 space-y-3">
          {/* Action breakdown */}
          {Object.keys(auditStats).length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 rounded-lg border bg-muted/30">
              {Object.entries(auditStats).map(([action, count]: [string, any]) => (
                <Badge key={action} variant="outline" className="gap-1.5">
                  <span className="font-semibold">{action}</span>
                  <span className="text-muted-foreground">{count}</span>
                </Badge>
              ))}
            </div>
          )}

          {auditLoading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}</div>
          ) : auditLogs.length === 0 ? (
            <EmptyState icon={Activity} message="Aucun log d'audit" />
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log: any) => <AuditLogRow key={log.id} log={log} />)}
            </div>
          )}
        </TabsContent>

        {/* ERRORS TAB */}
        <TabsContent value="errors" className="mt-4 space-y-3">
          {errorsLoading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}</div>
          ) : errorLogs.length === 0 ? (
            <EmptyState icon={AlertTriangle} message="Aucune erreur récente" />
          ) : (
            <div className="space-y-2">
              {errorLogs.map((log: any) => <SystemLogRow key={log.id} log={log} />)}
            </div>
          )}
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="mt-4 space-y-3">
          {securityViolations.length === 0 ? (
            <EmptyState icon={CheckCircle} message="Aucune violation de sécurité" iconClass="text-green-500" />
          ) : (
            <div className="space-y-2">
              {securityViolations.map((log: any) => <SystemLogRow key={log.id} log={log} />)}
            </div>
          )}
        </TabsContent>

        {/* SERVER ERRORS TAB */}
        <TabsContent value="server" className="mt-4 space-y-3">
          {serverErrors.length === 0 ? (
            <EmptyState icon={CheckCircle} message="Aucune erreur serveur" iconClass="text-green-500" />
          ) : (
            <div className="space-y-2">
              {serverErrors.map((log: any) => <SystemLogRow key={log.id} log={log} />)}
            </div>
          )}
        </TabsContent>

        {/* SYNC TAB */}
        <TabsContent value="sync" className="mt-4 space-y-3">
          {(failedSyncs.length > 0 || conflicts.length > 0) && (
            <div className="flex gap-3">
              {failedSyncs.length > 0 && (
                <Card className="flex-1 border-red-200 bg-red-50/50">
                  <CardContent className="pt-3 pb-3 flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-700">{failedSyncs.length}</p>
                      <p className="text-xs text-muted-foreground">Syncs échouées</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              {conflicts.length > 0 && (
                <Card className="flex-1 border-purple-200 bg-purple-50/50">
                  <CardContent className="pt-3 pb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-semibold text-purple-700">{conflicts.length}</p>
                      <p className="text-xs text-muted-foreground">Conflits non résolus</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {syncLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div>
          ) : syncLogs.length === 0 ? (
            <EmptyState icon={RefreshCw} message="Aucune synchronisation récente" />
          ) : (
            <div className="space-y-2">
              {syncLogs.map((log: any) => <SyncLogRow key={log.id} log={log} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ icon: Icon, message, iconClass = "text-muted-foreground/30" }: { icon: any; message: string; iconClass?: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Icon className={`h-10 w-10 ${iconClass} mb-3`} />
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
