"use client";

import { useState } from "react";
import { Bell, CheckCheck, Send, ShieldAlert, Mail, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications, useNotificationStats, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/data/notifications";
import { SendNotificationModal, AlertRulesPanel } from "./components";

const typeConfig: Record<string, { label: string; className: string; icon: typeof Bell }> = {
  ALERT: { label: "Alerte", className: "bg-red-100 text-red-800", icon: AlertTriangle },
  WARNING: { label: "Avertissement", className: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
  INFO: { label: "Info", className: "bg-blue-100 text-blue-800", icon: Info },
  SUCCESS: { label: "Succès", className: "bg-green-100 text-green-800", icon: CheckCircle },
  REMINDER: { label: "Rappel", className: "bg-purple-100 text-purple-800", icon: Bell },
  TASK: { label: "Tâche", className: "bg-indigo-100 text-indigo-800", icon: Bell },
  SYSTEM: { label: "Système", className: "bg-gray-100 text-gray-800", icon: Bell },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  LOW: { label: "Basse", className: "text-gray-500" },
  MEDIUM: { label: "Moyenne", className: "text-blue-500" },
  HIGH: { label: "Haute", className: "text-orange-500" },
  URGENT: { label: "Urgente", className: "text-red-600 font-semibold" },
};

export default function NotificationsPage() {
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("ALL");

  const { data: notifData, isLoading } = useNotifications();
  const { data: statsData, isLoading: statsLoading } = useNotificationStats();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const allNotifications = notifData?.data ?? [];
  const notifications = typeFilter === "ALL" ? allNotifications : allNotifications.filter((n: any) => n.notificationType === typeFilter);
  const stats = statsData?.data;
  const unreadCount = allNotifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-amber-600" /> Notifications
          </h1>
          <p className="text-muted-foreground">Monitoring et gestion des alertes</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
              <CheckCheck className="mr-2 h-4 w-4" /> Tout marquer lu ({unreadCount})
            </Button>
          )}
          <Button size="sm" onClick={() => setIsSendOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Send className="mr-2 h-4 w-4" /> Envoyer
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{stats.totalNotifications}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.unreadNotifications}</p>
            <p className="text-xs text-muted-foreground">Non lues</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.sentNotifications}</p>
            <p className="text-xs text-muted-foreground">Envoyées</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.failedNotifications}</p>
            <p className="text-xs text-muted-foreground">Échouées</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{stats.notificationsLast24Hours}</p>
            <p className="text-xs text-muted-foreground">24 dernières heures</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{stats.notificationsLast7Days}</p>
            <p className="text-xs text-muted-foreground">7 derniers jours</p>
          </CardContent></Card>
        </div>
      )}

      <Tabs defaultValue="notifications">
        <TabsList>
          <TabsTrigger value="notifications"><Mail className="mr-1.5 h-4 w-4" /> Notifications ({allNotifications.length})</TabsTrigger>
          <TabsTrigger value="alerts"><ShieldAlert className="mr-1.5 h-4 w-4" /> Règles d'alerte</TabsTrigger>
        </TabsList>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="mt-4 space-y-4">
          {/* Type filter */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={typeFilter === "ALL" ? "default" : "outline"} className="cursor-pointer" onClick={() => setTypeFilter("ALL")}>Toutes</Badge>
            {Object.entries(typeConfig).map(([key, cfg]) => (
              <Badge key={key} variant={typeFilter === key ? "default" : "outline"} className={`cursor-pointer ${typeFilter === key ? "" : cfg.className}`} onClick={() => setTypeFilter(key)}>{cfg.label}</Badge>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">{typeFilter !== "ALL" ? "Aucune notification de ce type" : "Aucune notification"}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n: any) => {
                const cfg = typeConfig[n.notificationType] ?? { label: n.notificationType, className: "bg-gray-100 text-gray-800", icon: Bell };
                const pCfg = priorityConfig[n.priority] ?? { label: n.priority, className: "" };
                const IconComp = cfg.icon;
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 rounded-lg border p-4 transition-colors cursor-pointer ${n.isRead ? "bg-background" : "bg-blue-50/50 border-blue-200"}`}
                    onClick={() => !n.isRead && markRead.mutate(n.id)}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cfg.className}`}>
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={cfg.className} variant="outline">{cfg.label}</Badge>
                        <span className={`text-xs ${pCfg.className}`}>{pCfg.label}</span>
                        <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString("fr-FR")}</span>
                        {!n.isRead && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                      </div>
                      <p className="text-sm font-medium">{n.subject}</p>
                      {n.body && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.body}</p>}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {n.isSent && <span className="text-green-600">Envoyé {n.sentAt ? new Date(n.sentAt).toLocaleString("fr-FR") : ""}</span>}
                        {n.targetType && <span>{n.targetType}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ALERT RULES TAB */}
        <TabsContent value="alerts" className="mt-4">
          <AlertRulesPanel />
        </TabsContent>
      </Tabs>

      <SendNotificationModal open={isSendOpen} onOpenChange={setIsSendOpen} />
    </div>
  );
}
