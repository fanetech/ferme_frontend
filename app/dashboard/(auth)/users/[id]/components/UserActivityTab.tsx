"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Activity, 
  Calendar as CalendarIcon, 
  Filter, 
  Download, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Settings,
  LogIn,
  LogOut,
  AlertTriangle,
  BarChart3,
  Clock
} from "lucide-react";

import { User } from "@/types/users";
import { useUserActivity } from "@/data/users";
import AvePayLoader from "@/components/avepay-loader";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserActivityTabProps {
  user: User;
}

export function UserActivityTab({ user }: UserActivityTabProps) {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const { data: activities, isLoading, error } = useUserActivity(user.id);

  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'connexion':
        return <LogIn className="h-4 w-4 text-green-500" />;
      case 'logout':
      case 'deconnexion':
        return <LogOut className="h-4 w-4 text-orange-500" />;
      case 'create':
      case 'creation':
        return <Plus className="h-4 w-4 text-blue-500" />;
      case 'update':
      case 'modification':
        return <Edit className="h-4 w-4 text-yellow-500" />;
      case 'delete':
      case 'suppression':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'view':
      case 'consultation':
        return <Eye className="h-4 w-4 text-gray-500" />;
      case 'config':
      case 'configuration':
        return <Settings className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'connexion':
        return "default";
      case 'logout':
      case 'deconnexion':
        return "secondary";
      case 'create':
      case 'creation':
        return "default";
      case 'update':
      case 'modification':
        return "outline";
      case 'delete':
      case 'suppression':
        return "destructive";
      case 'view':
      case 'consultation':
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getResourceTypeLabel = (resourceType?: string) => {
    if (!resourceType) return "Système";
    
    switch (resourceType.toLowerCase()) {
      case 'user':
        return "Utilisateur";
      case 'role':
        return "Rôle";
      case 'structure':
        return "Structure";
      case 'service':
        return "Service";
      case 'transaction':
        return "Transaction";
      case 'report':
        return "Rapport";
      default:
        return resourceType;
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    
    return format(activityDate, "dd MMM yyyy", { locale: fr });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <AvePayLoader />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span>Erreur lors du chargement de l'activité</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activityStats = activities?.reduce((acc, activity) => {
    acc[activity.action] = (acc[activity.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const uniqueActions = Array.from(new Set(activities?.map(a => a.action) || []));

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activité utilisateur
              </CardTitle>
              <CardDescription>
                Historique des actions et statistiques d'activité
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button size="sm" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Statistiques
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{activities?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Actions totales</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{uniqueActions.length}</div>
              <div className="text-sm text-muted-foreground">Types d'actions</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm font-medium">Dernière activité</div>
              <div className="text-sm text-muted-foreground">
                {user.lastActivityAt ? formatTimeAgo(user.lastActivityAt) : "Aucune"}
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-sm font-medium">Aujourd'hui</div>
              <div className="text-2xl font-bold">
                {activities?.filter(a => {
                  const today = new Date().toDateString();
                  const activityDate = new Date(a.timestamp).toDateString();
                  return today === activityDate;
                }).length || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Type d'action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action} ({activityStats[action]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, "dd MMM")} - ${format(dateRange.to, "dd MMM")}`
                    ) : (
                      format(dateRange.from, "dd MMM yyyy")
                    )
                  ) : (
                    "Sélectionner une période"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => setDateRange(range || {})}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline" onClick={() => {
              setSelectedAction("all");
              setDateRange({});
            }}>
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques par type d'action */}
      {Object.keys(activityStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Répartition des actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(activityStats)
                .sort(([,a], [,b]) => b - a)
                .map(([action, count]) => (
                <div key={action} className="text-center p-3 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    {getActivityIcon(action)}
                  </div>
                  <div className="font-medium">{count}</div>
                  <div className="text-xs text-muted-foreground">{action}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journal d'activité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Journal d'activité
          </CardTitle>
          <CardDescription>
            Chronologie détaillée des actions de l'utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities
                .filter(activity => selectedAction === "all" || activity.action === selectedAction)
                .slice(0, 50)
                .map((activity) => (
                <div key={`${activity.userId}-${activity.timestamp}`} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    {getActivityIcon(activity.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{activity.action}</span>
                      <Badge variant={getActivityColor(activity.action)} className="text-xs">
                        {getResourceTypeLabel(activity.resourceType)}
                      </Badge>
                      {activity.resourceId && (
                        <span className="text-xs text-muted-foreground font-mono">
                          ID: {activity.resourceId.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      {formatTimeAgo(activity.timestamp)}
                      {activity.ipAddress && (
                        <span className="ml-2">• {activity.ipAddress}</span>
                      )}
                    </div>
                    
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <div className="text-xs bg-muted/50 rounded p-2 mt-2">
                        <details>
                          <summary className="cursor-pointer">Détails</summary>
                          <pre className="mt-2 text-xs overflow-x-auto">
                            {JSON.stringify(activity.details, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(activity.timestamp), "HH:mm", { locale: fr })}
                  </div>
                </div>
              ))}
              
              {activities.length > 50 && (
                <div className="text-center py-4">
                  <Button variant="outline" size="sm">
                    Charger plus d'activités
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <h3 className="font-medium">Aucune activité enregistrée</h3>
              <p className="text-sm text-muted-foreground">
                Aucune action n'a été enregistrée pour cet utilisateur
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analyse des patterns d'activité */}
      {activities && activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analyse des patterns</CardTitle>
            <CardDescription>
              Tendances et habitudes d'utilisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Activité par heure</h4>
                <div className="space-y-2">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const hourActivities = activities.filter(a => 
                      new Date(a.timestamp).getHours() === hour
                    ).length;
                    const maxActivities = Math.max(...Array.from({ length: 24 }, (_, h) => 
                      activities.filter(a => new Date(a.timestamp).getHours() === h).length
                    ));
                    const percentage = maxActivities > 0 ? (hourActivities / maxActivities) * 100 : 0;
                    
                    return (
                      <div key={hour} className="flex items-center gap-2">
                        <span className="text-xs w-8">{hour}h</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">{hourActivities}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Actions les plus fréquentes</h4>
                <div className="space-y-2">
                  {Object.entries(activityStats)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([action, count]) => {
                      const percentage = (count / activities.length) * 100;
                      return (
                        <div key={action} className="flex items-center gap-2">
                          <span className="text-xs flex-1">{action}</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{count}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}