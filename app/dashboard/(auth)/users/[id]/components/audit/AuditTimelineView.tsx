"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  XCircle,
  Eye,
  Shield,
  Key,
  User,
  CreditCard,
  Download,
  LogIn,
  LogOut,
  UserPlus,
  UserCheck,
  UserX,
  UserCog,
  UserMinus,
  MonitorX,
  ShieldCheck,
  ShieldX
} from "lucide-react";

import type { User } from "@/types/users";
import type { AuditLogEntry } from "@/types/audit";
import { AUDIT_ACTION_ICONS, SEVERITY_COLORS, HTTP_METHOD_COLORS } from "@/types/audit";

interface AuditTimelineViewProps {
  logs: AuditLogEntry[];
  user: User;
}

export function AuditTimelineView({ logs, user }: AuditTimelineViewProps) {
  
  const getActionIcon = (action: string) => {
    const iconConfig = AUDIT_ACTION_ICONS[action] || AUDIT_ACTION_ICONS.DEFAULT;
    
    // Map des noms d'icônes vers les composants Lucide
    const iconMap: Record<string, React.ComponentType<any>> = {
      'user-plus': UserPlus,
      'user-check': UserCheck,
      'user-x': UserX,
      'log-in': LogIn,
      'log-out': LogOut,
      'key': Key,
      'shield-check': ShieldCheck,
      'shield-x': ShieldX,
      'user-cog': UserCog,
      'user-minus': UserMinus,
      'monitor': Monitor,
      'monitor-x': MonitorX,
      'credit-card': CreditCard,
      'download': Download,
      'alert-triangle': AlertTriangle,
      'activity': Activity
    };

    const IconComponent = iconMap[iconConfig.icon] || Activity;
    
    return {
      component: IconComponent,
      color: iconConfig.color,
      label: iconConfig.label
    };
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'desktop':
      case 'web':
      default:
        return Monitor;
    }
  };

  const getStatusIcon = (successful: boolean, securityViolation: boolean) => {
    if (securityViolation) return AlertTriangle;
    return successful ? CheckCircle : XCircle;
  };

  const getStatusColor = (successful: boolean, securityViolation: boolean) => {
    if (securityViolation) return 'text-red-600';
    return successful ? 'text-green-600' : 'text-red-600';
  };

  const getSeverityBadge = (severity: string) => {
    const color = SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.INFO;
    const variants = {
      'INFO': 'default',
      'WARN': 'secondary', 
      'ERROR': 'destructive',
      'CRITICAL': 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'default'} className="text-xs">
        {severity}
      </Badge>
    );
  };

  const getHttpMethodBadge = (method: string) => {
    const color = HTTP_METHOD_COLORS[method as keyof typeof HTTP_METHOD_COLORS] || '#64748b';
    const variants = {
      'GET': 'outline',
      'POST': 'default',
      'PUT': 'secondary',
      'DELETE': 'destructive',
      'PATCH': 'outline'
    } as const;

    return (
      <Badge variant={variants[method as keyof typeof variants] || 'outline'} className="text-xs">
        {method}
      </Badge>
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-border"></div>
      
      <ol className="relative space-y-6">
        {logs.map((log, index) => {
          const actionIcon = getActionIcon(log.action);
          const ActionIconComponent = actionIcon.component;
          const DeviceIconComponent = getDeviceIcon(log.deviceType);
          const StatusIconComponent = getStatusIcon(log.successful, log.securityViolation);
          const datetime = formatDateTime(log.requestTime);

          return (
            <li key={log.id} className="relative pl-12">
              {/* Timeline icon */}
              <span 
                className="absolute left-3 flex h-6 w-6 items-center justify-center rounded-full border bg-background"
                style={{ borderColor: actionIcon.color }}
              >
                <ActionIconComponent 
                  className="h-3 w-3" 
                  style={{ color: actionIcon.color }}
                />
              </span>

              {/* Content */}
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <span>{actionIcon.label}</span>
                      {log.securityViolation && (
                        <Badge variant="destructive" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Violation sécurité
                        </Badge>
                      )}
                      {getSeverityBadge(log.severity)}
                    </h3>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <time className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(log.requestTime)}
                      </time>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {datetime.date} à {datetime.time}
                      </span>
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="flex items-center gap-2">
                    <StatusIconComponent 
                      className={`h-4 w-4 ${getStatusColor(log.successful, log.securityViolation)}`}
                    />
                    <Badge variant={log.successful ? 'default' : 'destructive'} className="text-xs">
                      {log.statusCode}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {/* Request info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-muted-foreground">Requête</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getHttpMethodBadge(log.httpMethod)}
                        <span className="font-mono text-xs">{log.endpoint}</span>
                      </div>
                      {log.durationMs && (
                        <p className="text-xs text-muted-foreground">
                          Durée: {log.durationMs}ms
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Device & Location */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-muted-foreground">Appareil & Localisation</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <DeviceIconComponent className="h-3 w-3" />
                        <span className="text-xs">{log.deviceType || 'Inconnu'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3" />
                        <span className="font-mono text-xs">{log.clientIp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action details */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-muted-foreground">Détails</h4>
                    <div className="space-y-1">
                      <p className="text-xs">
                        <span className="text-muted-foreground">Action:</span> {log.action}
                      </p>
                      {log.errorMessage && (
                        <p className="text-xs text-red-600">
                          <span className="text-muted-foreground">Erreur:</span> {log.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error message (if any) */}
                {log.errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Erreur détectée</p>
                        <p className="text-sm text-red-700">{log.errorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security violation details */}
                {log.securityViolation && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">Violation de sécurité</p>
                        <p className="text-sm text-orange-700">
                          Cette action a été identifiée comme une potential violation de sécurité et nécessite une attention particulière.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Separator line (except for last item) */}
                {index < logs.length - 1 && (
                  <hr className="border-t border-muted mt-6" />
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Empty state for no logs */}
      {logs.length === 0 && (
        <div className="text-center py-12">
          <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-medium">Aucun événement</h3>
          <p className="text-sm text-muted-foreground">
            Aucune activité d'audit n'a été enregistrée
          </p>
        </div>
      )}
    </div>
  );
}