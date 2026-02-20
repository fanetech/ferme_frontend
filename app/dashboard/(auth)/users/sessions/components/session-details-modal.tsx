"use client";

import { BaseModal } from "@/components/ui/modal/BaseModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  MapPin,
  Clock,
  User,
  Calendar,
  Activity,
  AlertTriangle,
  Ban,
  RefreshCw,
  Eye
} from "lucide-react";

import { useSessionDetails, useRevokeSession } from "@/data/sessions";
import AvePayLoader from "@/components/avepay-loader";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface SessionDetailsModalProps {
  sessionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SessionDetailsModal({ sessionId, isOpen, onClose }: SessionDetailsModalProps) {
  const { data: session, isLoading, refetch } = useSessionDetails(sessionId!, !!sessionId && isOpen);
  const revokeSessionMutation = useRevokeSession();

  const handleRevoke = async () => {
    if (!sessionId) return;
    
    try {
      await revokeSessionMutation.mutateAsync(sessionId);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la révocation:", error);
    }
  };

  const getDeviceIcon = () => {
    if (!session) return <Globe className="h-5 w-5" />;
    
    switch (session.deviceType?.toUpperCase()) {
      case 'MOBILE': return <Smartphone className="h-5 w-5" />;
      case 'TABLET': return <Tablet className="h-5 w-5" />;
      case 'DESKTOP': return <Monitor className="h-5 w-5" />;
      default: return <Globe className="h-5 w-5" />;
    }
  };

  const getDeviceLabel = () => {
    if (!session) return 'Inconnu';
    
    switch (session.deviceType?.toUpperCase()) {
      case 'MOBILE': return 'Mobile';
      case 'TABLET': return 'Tablette';
      case 'DESKTOP': return 'Desktop';
      case 'WEB': return 'Web';
      default: return 'Inconnu';
    }
  };

  const getStatusBadge = () => {
    if (!session) return null;
    
    if (session.isExpired) {
      return <Badge variant="destructive">Expirée</Badge>;
    }
    if (session.isActive) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails de la session"
      titleIcon={<Shield className="h-5 w-5 text-purple-500" />}
      size="xl"
      noPadding={true}
      contentClassName="overflow-y-auto px-3"
    >

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <AvePayLoader />
        </div>
      ) : session ? (
        <div className="space-y-6">
            {/* En-tête avec actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusBadge()}
                {session.isCurrentSession && (
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-600 font-medium">Session actuelle</span>
                  </div>
                )}
                {session.isLongSession && (
                  <Badge variant="outline" className="text-orange-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Session longue
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
                {session.isActive && !session.isCurrentSession && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleRevoke}
                    disabled={revokeSessionMutation.isPending}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    {revokeSessionMutation.isPending ? "Révocation..." : "Révoquer"}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations utilisateur */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Utilisateur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Nom complet</div>
                    <div className="text-sm">{session.userFullName || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Email</div>
                    <div className="text-sm">{session.userEmail || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">ID Utilisateur</div>
                    <div className="text-sm font-mono">{session.userId}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Informations d'appareil */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {getDeviceIcon()}
                    Appareil & Navigateur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Type d'appareil</div>
                    <div className="text-sm">{getDeviceLabel()}</div>
                  </div>
                  {session.deviceName && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Nom de l'appareil</div>
                      <div className="text-sm">{session.deviceName}</div>
                    </div>
                  )}
                  {session.operatingSystem && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Système d'exploitation</div>
                      <div className="text-sm">{session.operatingSystem}</div>
                    </div>
                  )}
                  {session.browserName && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Navigateur</div>
                      <div className="text-sm">
                        {session.browserName}
                        {session.browserVersion && ` ${session.browserVersion}`}
                      </div>
                    </div>
                  )}
                  {session.deviceInfo && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Informations d'appareil</div>
                      <div className="text-sm">{session.deviceInfo}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Localisation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Localisation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Adresse IP</div>
                    <div className="text-sm font-mono">{session.ipAddress || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Localisation</div>
                    <div className="text-sm">{session.location || 'Inconnue'}</div>
                  </div>
                  {session.timezone && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Fuseau horaire</div>
                      <div className="text-sm">{session.timezone}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informations de session */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Activité de session
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">ID Session</div>
                    <div className="text-sm font-mono">{session.sessionId}</div>
                  </div>
                  {session.accessTokenJti && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Token JTI</div>
                      <div className="text-sm font-mono">{session.accessTokenJti}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Nombre d'accès</div>
                    <div className="text-sm">{session.accessCount || 0} requêtes</div>
                  </div>
                  {session.durationMinutes && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Durée</div>
                      <div className="text-sm">
                        {Math.floor(session.durationMinutes / 60) > 0 
                          ? `${Math.floor(session.durationMinutes / 60)}h ${session.durationMinutes % 60}m`
                          : `${session.durationMinutes}m`
                        }
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chronologie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Chronologie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {session.createdAt && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Création
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm">{format(new Date(session.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: fr })}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true, locale: fr })}
                        </div>
                      </div>
                    </div>
                  )}

                  {session.lastAccessAt && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Dernier accès
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm">{format(new Date(session.lastAccessAt), "dd/MM/yyyy HH:mm:ss", { locale: fr })}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(session.lastAccessAt), { addSuffix: true, locale: fr })}
                        </div>
                      </div>
                    </div>
                  )}

                  {session.expiresAt && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Expiration
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm">{format(new Date(session.expiresAt), "dd/MM/yyyy HH:mm:ss", { locale: fr })}</div>
                        <div className="text-xs text-muted-foreground">
                          {session.isExpired ? 'Déjà expirée' : 
                            formatDistanceToNow(new Date(session.expiresAt), { addSuffix: true, locale: fr })
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {session.firstAccessAt && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Premier accès</div>
                      <div className="text-sm">{format(new Date(session.firstAccessAt), "dd/MM/yyyy HH:mm:ss", { locale: fr })}</div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* User Agent (si disponible) */}
            {session.userAgent && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">User Agent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-mono break-all bg-muted/50 p-3 rounded">
                    {session.userAgent}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Session introuvable</h3>
          <p className="text-muted-foreground">
            Impossible de charger les détails de cette session
          </p>
        </div>
      )}
    </BaseModal>
  );
}