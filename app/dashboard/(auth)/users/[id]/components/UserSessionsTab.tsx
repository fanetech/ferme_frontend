"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  MapPin, 
  Clock,
  LogOut,
  AlertTriangle,
  Shield,
  Wifi,
  User,
  Activity,
  TrendingUp,
  Eye,
  Trash2,
  RefreshCw
} from "lucide-react";

import type { User } from "@/types/users";
import type { ActiveSession } from "@/types/user-sessions";
import { 
  useUserActiveSessions, 
  useUserSessionStats 
} from "@/data/users";
import AvePayLoader from "@/components/avepay-loader";
import { RevokeSessionModal } from "./RevokeSessionModal";

interface UserSessionsTabProps {
  user: User;
}

export function UserSessionsTab({ user }: UserSessionsTabProps) {
  const { data: userSessions, isLoading, error, refetch } = useUserActiveSessions(user.id);
  const { data: sessionStats } = useUserSessionStats(user.id);
  
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [sessionToRevoke, setSessionToRevoke] = useState<ActiveSession | undefined>(undefined);

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
      case 'web':
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getDeviceColor = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return "bg-blue-100 text-blue-800";
      case 'tablet':
        return "bg-purple-100 text-purple-800";
      case 'desktop':
        return "bg-green-100 text-green-800";
      case 'web':
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Handlers pour les modales
  const handleRevokeSession = (session: ActiveSession) => {
    setSessionToRevoke(session);
    setIsRevokeModalOpen(true);
  };

  const handleRevokeAllSessions = () => {
    setSessionToRevoke(undefined); // undefined = révoquer toutes
    setIsRevokeModalOpen(true);
  };

  const handleCloseRevokeModal = () => {
    setIsRevokeModalOpen(false);
    setSessionToRevoke(undefined);
  };

  const handleRevokeSuccess = () => {
    refetch();
    handleCloseRevokeModal();
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
            <span>Erreur lors du chargement des sessions</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeSessions = userSessions?.activeSessions || [];
  const summary = userSessions?.summary;

  return (
    <div className="space-y-6">
      {/* En-tête avec refresh et actions globales */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sessions utilisateur</h2>
          <p className="text-muted-foreground">
            Gérez les sessions actives et la sécurité des connexions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button 
            variant="destructive"
            size="sm"
            onClick={handleRevokeAllSessions}
            disabled={activeSessions.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Révoquer toutes
          </Button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessions actives</p>
                <p className="text-2xl font-bold text-green-600">
                  {summary?.totalActiveSessions || 0}
                </p>
              </div>
              <Wifi className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Appareils uniques</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary?.distinctDevices || 0}
                </p>
              </div>
              <Monitor className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Localisations</p>
                <p className="text-2xl font-bold text-purple-600">
                  {summary?.distinctLocations || 0}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score sécurité</p>
                <p className="text-2xl font-bold text-orange-600">
                  {summary?.securityScore || 0}/100
                </p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques détaillées */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Statistiques détaillées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Durée des sessions</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Moyenne :</span>
                    <span>{formatDuration(Math.round(summary.averageSessionDuration))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plus ancienne :</span>
                    <span>{formatDuration(summary.oldestSessionMinutes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plus récente :</span>
                    <span>{formatDuration(summary.newestSessionMinutes)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Répartition par appareil</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mobile :</span>
                    <span>{summary.deviceBreakdown.mobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Desktop :</span>
                    <span>{summary.deviceBreakdown.desktop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tablet :</span>
                    <span>{summary.deviceBreakdown.tablet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Web :</span>
                    <span>{summary.deviceBreakdown.web}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Activité</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accès total :</span>
                    <span>{summary.totalAccessCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sessions longues :</span>
                    <span>{summary.longSessionsCount}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Sécurité</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nouvelles IPs :</span>
                    <span>{summary.newLocationsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Suspectes :</span>
                    <span className="text-red-600">{summary.suspiciousSessionsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des sessions actives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Sessions actives ({activeSessions.length})
          </CardTitle>
          <CardDescription>
            Toutes les sessions actuellement connectées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeSessions.length > 0 ? (
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div 
                  key={session.sessionId} 
                  className={`border rounded-lg p-4 transition-colors ${
                    session.isSuspicious ? 'border-red-200 bg-red-50/50' : 
                    session.isCurrentSession ? 'border-green-200 bg-green-50/50' : 
                    'border-gray-200 bg-gray-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Device Icon */}
                      <div className={`p-2 rounded-lg ${getDeviceColor(session.deviceType)}`}>
                        {getDeviceIcon(session.deviceType)}
                      </div>

                      {/* Session Info */}
                      <div className="flex-1 space-y-3">
                        {/* Header avec badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">
                            {session.deviceName || `${session.deviceType} Device`}
                          </h3>
                          
                          <Badge variant="outline" className="text-xs">
                            {session.deviceType}
                          </Badge>
                          
                          {session.isCurrentSession && (
                            <Badge variant="default" className="text-xs bg-green-600">
                              Session actuelle
                            </Badge>
                          )}
                          
                          {session.isSuspicious && (
                            <Badge variant="destructive" className="text-xs">
                              Suspecte
                            </Badge>
                          )}
                          
                          {session.isLongSession && (
                            <Badge variant="secondary" className="text-xs">
                              Session longue
                            </Badge>
                          )}

                          {session.isNewLocation && (
                            <Badge variant="outline" className="text-xs text-orange-600">
                              Nouvelle localisation
                            </Badge>
                          )}
                        </div>

                        {/* Device Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div className="space-y-1">
                            <p className="text-muted-foreground font-medium">Appareil</p>
                            {session.operatingSystem && (
                              <p>{session.operatingSystem}</p>
                            )}
                            {session.browser && (
                              <p>{session.browser}</p>
                            )}
                            {session.deviceInfo && (
                              <p className="text-xs text-muted-foreground">{session.deviceInfo}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <p className="text-muted-foreground font-medium">Localisation</p>
                            <p className="font-mono text-xs">{session.ipAddress}</p>
                            {session.location && (
                              <p>{session.location}</p>
                            )}
                            {session.timezone && (
                              <p className="text-xs text-muted-foreground">{session.timezone}</p>
                            )}
                          </div>

                          <div className="space-y-1">
                            <p className="text-muted-foreground font-medium">Activité</p>
                            <p>
                              <Clock className="h-3 w-3 inline mr-1" />
                              Connecté {formatTimeAgo(session.createdAt)}
                            </p>
                            <p>Dernier accès {formatTimeAgo(session.lastAccessAt)}</p>
                            <p className="text-xs text-muted-foreground">
                              {session.accessCount} accès • Durée: {formatDuration(session.durationMinutes)}
                            </p>
                          </div>
                        </div>

                        {/* Timing Details */}
                        <div className="pt-2 border-t text-xs text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div>
                            <span className="font-medium">Créée :</span>
                            <span className="ml-1">{formatDateTime(session.createdAt).date} {formatDateTime(session.createdAt).time}</span>
                          </div>
                          <div>
                            <span className="font-medium">Expire :</span>
                            <span className="ml-1">{formatDateTime(session.expiresAt).date} {formatDateTime(session.expiresAt).time}</span>
                          </div>
                          <div>
                            <span className="font-medium">Restant :</span>
                            <span className="ml-1">{formatDuration(session.remainingMinutes)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Premier accès :</span>
                            <span className="ml-1">{formatDateTime(session.firstAccessAt).time}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      {!session.isCurrentSession && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRevokeSession(session)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Révoquer
                        </Button>
                      )}
                      {session.isCurrentSession && (
                        <Badge variant="outline" className="text-xs text-center">
                          Session actuelle
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Monitor className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune session active</h3>
              <p className="text-sm text-muted-foreground">
                Cet utilisateur n'a aucune session active actuellement
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de révocation */}
      <RevokeSessionModal
        isOpen={isRevokeModalOpen}
        onClose={handleCloseRevokeModal}
        user={user}
        session={sessionToRevoke}
        onSuccess={handleRevokeSuccess}
      />
    </div>
  );
}