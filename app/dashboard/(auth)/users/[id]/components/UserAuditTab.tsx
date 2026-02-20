"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  Eye,
  Filter,
  List,
  RefreshCw,
  Search,
  Shield,
  Table,
  TrendingUp
} from "lucide-react";

import type { User } from "@/types/users";
import type { AuditDisplayMode } from "@/types/audit";
import { useUserAuditLogs } from "@/data/audit";
import AvePayLoader from "@/components/avepay-loader";
import { AuditTimelineView } from "./audit/AuditTimelineView";
import { AuditTableView } from "./audit/AuditTableView";

interface UserAuditTabProps {
  user: User;
}

export function UserAuditTab({ user }: UserAuditTabProps) {
  const [displayMode, setDisplayMode] = useState<AuditDisplayMode>('timeline');
  const [searchParams, setSearchParams] = useState({
    page: 0,
    size: 20,
    sortBy: 'requestTime',
    sortDir: 'DESC' as const
  });

  const { data: auditData, isLoading, error, refetch } = useUserAuditLogs(user.id, searchParams);

  const handleModeChange = (mode: AuditDisplayMode) => {
    setDisplayMode(mode);
  };

  const handleRefresh = () => {
    refetch();
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
            <span>Erreur lors du chargement des logs d'audit</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = auditData?.stats;
  const logs = auditData?.auditLogs || [];
  const pagination = auditData?.pagination;

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Logs d'audit</h2>
          <p className="text-muted-foreground">
            Historique des actions et événements de sécurité
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle Mode d'affichage */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={displayMode === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleModeChange('timeline')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4 mr-1" />
              Timeline
            </Button>
            <Button
              variant={displayMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleModeChange('table')}
              className="h-8 px-3"
            >
              <Table className="h-4 w-4 mr-1" />
              Tableau
            </Button>
          </div>

          {/* Bouton Actualiser */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total logs</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalLogs.toLocaleString()}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dernières 24h</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.last24Hours}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taux succès</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {stats.successRate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Succès</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.successfulRequests}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">✓</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Échecs</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.failedRequests}
                  </p>
                </div>
                <Badge className="bg-red-100 text-red-800 border-red-200">✗</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Violations</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.securityViolations}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions principales */}
      {stats?.topActions && stats.topActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Actions les plus fréquentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.topActions.map((action, index) => (
                <div key={action.action} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium text-sm">{action.action}</span>
                  </div>
                  <Badge variant="secondary">
                    {action.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenu principal selon le mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {displayMode === 'timeline' ? (
                <>
                  <List className="h-5 w-5" />
                  Chronologie des événements
                </>
              ) : (
                <>
                  <Table className="h-5 w-5" />
                  Tableau détaillé
                </>
              )}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {pagination && (
                <span>
                  {logs.length} sur {pagination.totalElements.toLocaleString()} logs
                </span>
              )}
            </div>
          </div>
          <CardDescription>
            {displayMode === 'timeline' 
              ? "Affichage chronologique des actions avec détails visuels"
              : "Vue tabulaire complète avec toutes les colonnes de données"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <>
              {displayMode === 'timeline' ? (
                <AuditTimelineView 
                  logs={logs} 
                  user={user}
                />
              ) : (
                <AuditTableView 
                  logs={logs} 
                  user={user}
                  pagination={pagination}
                  onPageChange={(page) => setSearchParams(prev => ({ ...prev, page }))}
                  onSizeChange={(size) => setSearchParams(prev => ({ ...prev, size }))}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun log d'audit</h3>
              <p className="text-sm text-muted-foreground">
                Aucune activité enregistrée pour cet utilisateur
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}