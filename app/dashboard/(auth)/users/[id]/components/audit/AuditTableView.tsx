"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  XCircle,
  Eye,
  Shield,
  ArrowUpDown,
  MoreHorizontal
} from "lucide-react";

import type { User } from "@/types/users";
import type { AuditLogEntry, PaginationInfo } from "@/types/audit";
import { AUDIT_ACTION_ICONS, SEVERITY_COLORS, HTTP_METHOD_COLORS } from "@/types/audit";

interface AuditTableViewProps {
  logs: AuditLogEntry[];
  user: User;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onSizeChange?: (size: number) => void;
}

export function AuditTableView({ 
  logs, 
  user, 
  pagination, 
  onPageChange, 
  onSizeChange 
}: AuditTableViewProps) {
  
  const getActionIcon = (action: string) => {
    const iconConfig = AUDIT_ACTION_ICONS[action] || AUDIT_ACTION_ICONS.DEFAULT;
    return iconConfig;
  };

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

  const getStatusIcon = (successful: boolean, securityViolation: boolean) => {
    if (securityViolation) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    return successful ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getSeverityBadge = (severity: string) => {
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handlePageChange = (newPage: number) => {
    if (onPageChange && pagination) {
      onPageChange(newPage);
    }
  };

  const handleSizeChange = (newSize: string) => {
    if (onSizeChange) {
      onSizeChange(parseInt(newSize));
    }
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px]">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Heure
                </div>
              </TableHead>
              <TableHead className="w-[120px]">
                <div className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  Action
                </div>
              </TableHead>
              <TableHead className="w-[100px]">Méthode</TableHead>
              <TableHead className="min-w-[200px]">Endpoint</TableHead>
              <TableHead className="w-[80px]">Statut</TableHead>
              <TableHead className="w-[80px]">Durée</TableHead>
              <TableHead className="w-[120px]">
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  IP Client
                </div>
              </TableHead>
              <TableHead className="w-[100px]">Appareil</TableHead>
              <TableHead className="w-[80px]">Sévérité</TableHead>
              <TableHead className="w-[120px]">Sécurité</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => {
              const datetime = formatDateTime(log.requestTime);
              const actionIcon = getActionIcon(log.action);

              return (
                <TableRow key={log.id} className="hover:bg-muted/30">
                  {/* Time */}
                  <TableCell className="font-mono text-xs">
                    <div>
                      <div className="font-medium">{datetime.time}</div>
                      <div className="text-muted-foreground">{datetime.date}</div>
                    </div>
                  </TableCell>

                  {/* Action */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: actionIcon.color }}
                      />
                      <span className="text-sm font-medium">
                        {truncateText(log.action, 15)}
                      </span>
                    </div>
                  </TableCell>

                  {/* HTTP Method */}
                  <TableCell>
                    {getHttpMethodBadge(log.httpMethod)}
                  </TableCell>

                  {/* Endpoint */}
                  <TableCell className="font-mono text-xs">
                    <span title={log.endpoint}>
                      {truncateText(log.endpoint, 40)}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.successful, log.securityViolation)}
                      <Badge 
                        variant={log.successful ? 'default' : 'destructive'} 
                        className="text-xs"
                      >
                        {log.statusCode}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Duration */}
                  <TableCell className="font-mono text-xs">
                    {formatDuration(log.durationMs)}
                  </TableCell>

                  {/* Client IP */}
                  <TableCell className="font-mono text-xs">
                    {log.clientIp}
                  </TableCell>

                  {/* Device */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(log.deviceType)}
                      <span className="text-xs">{log.deviceType || 'N/A'}</span>
                    </div>
                  </TableCell>

                  {/* Severity */}
                  <TableCell>
                    {getSeverityBadge(log.severity)}
                  </TableCell>

                  {/* Security */}
                  <TableCell>
                    {log.securityViolation ? (
                      <Badge variant="destructive" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Violation
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        OK
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Empty state */}
        {logs.length === 0 && (
          <div className="text-center py-12">
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <h3 className="font-medium">Aucun log d'audit</h3>
            <p className="text-sm text-muted-foreground">
              Aucune activité enregistrée pour cet utilisateur
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && logs.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Afficher</span>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={handleSizeChange}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              entrées par page
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {pagination.currentPage + 1} sur {pagination.totalPages} 
              ({pagination.totalElements.toLocaleString()} total)
            </span>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevious}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}