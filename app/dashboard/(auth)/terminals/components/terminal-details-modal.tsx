"use client";

import { BaseModal } from "@/components/ui/modal/BaseModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Smartphone,
  Wifi,
  WifiOff,
  Calendar,
  Clock,
  MapPin,
  Phone,
  FileText,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  X
} from "lucide-react";
import { TerminalBadge } from "./terminal-badge";
import { formatDate, cn } from "@/lib/utils";
import { Terminal } from "@/types";

interface TerminalDetailsModalProps {
  terminal: Terminal | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TerminalDetailsModal({
  terminal,
  isOpen,
  onClose
}: TerminalDetailsModalProps) {
  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <Smartphone className="h-5 w-5 text-primary" />
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails du terminal"
      titleIcon={titleIcon}
      size="xl"
      className="max-w-3xl"
      noPadding={true}
      bodyClassName="flex flex-col flex-1 min-h-0"
    >
      <div className="flex-1 overflow-y-auto p-6">
        {terminal ? (
          <div className="space-y-6">
            {/* Header avec statut et connexion */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TerminalBadge status={terminal.status} />
                {terminal.isOnline ? (
                  <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                    <Wifi className="mr-1 h-3 w-3" />
                    En ligne
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-400 dark:text-gray-500">
                    <WifiOff className="mr-1 h-3 w-3" />
                    Hors ligne
                  </Badge>
                )}
                {terminal.isExpired && (
                  <Badge variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" />
                    Expiré
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Informations générales</h3>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Numéro de série</span>
                    <p className="font-medium text-foreground">{terminal.serialNumber ? terminal.serialNumber : "-"}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Code d'activation</span>
                    <p className="font-mono text-sm bg-muted dark:bg-muted/50 px-2 py-1 rounded text-foreground">
                      {terminal.activationCode ? terminal.activationCode : "-"}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Super structure</span>
                    <p className="font-medium text-foreground">{terminal.superStructureName ? terminal.superStructureName : "-"}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Structure</span>
                    <p className="font-medium text-foreground">{terminal.structureName ? terminal.structureName : "-"}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Modèle</span>
                    <p className="font-medium text-foreground">{terminal.model ? terminal.model : "-"}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Fabricant</span>
                    <p className="font-medium text-foreground">{terminal.manufacturer ? terminal.manufacturer : "-"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Système et versions</h3>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Système d'exploitation</span>
                    <p className="font-medium text-foreground">{terminal.osVersion ? terminal.osVersion : "-"}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Version de l'application</span>
                    <p className="font-medium text-foreground">v{terminal.appVersion ? terminal.appVersion : "-"}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Date d'activation</span>
                    <p className="font-medium text-foreground">
                      {terminal.activatedAt ? formatDate(terminal.activatedAt) : '-'}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Date d'expiration</span>
                    <p className={cn(
                      "font-medium",
                      terminal.isExpired ? "text-red-600 dark:text-red-400" : "text-foreground"
                    )}>
                      {terminal.expirationDate ? formatDate(terminal.expirationDate) : '-'}
                    </p>
                    {terminal.daysUntilExpiration !== undefined && !terminal.isExpired && (
                      <p className={cn(
                        "text-sm",
                        terminal.daysUntilExpiration <= 30 
                          ? "text-orange-600 dark:text-orange-400" 
                          : "text-muted-foreground"
                      )}>
                        {terminal.daysUntilExpiration ? terminal.daysUntilExpiration : "-"} jours restants
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Métadonnées */}
            {terminal.metadata && Object.keys(terminal.metadata).length > 0 && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-foreground">Informations supplémentaires</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {terminal.metadata.location && (
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Localisation</span>
                          <p className="font-medium text-foreground">{terminal.metadata.location}</p>
                        </div>
                      </div>
                    )}
                    
                    {terminal.metadata.contact && (
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Contact</span>
                          <p className="font-medium text-foreground">{terminal.metadata.contact}</p>
                        </div>
                      </div>
                    )}
                    
                    {terminal.metadata.incidentNumber && (
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Numéro d'incident</span>
                          <p className="font-medium text-foreground">{terminal.metadata.incidentNumber}</p>
                        </div>
                      </div>
                    )}
                    
                    {terminal.metadata.policeReport && (
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Rapport de police</span>
                          <p className="font-medium text-foreground">{terminal.metadata.policeReport}</p>
                        </div>
                      </div>
                    )}
                    
                    {terminal.metadata.reportedBy && (
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                          <AlertCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Signalé par</span>
                          <p className="font-medium text-foreground">{terminal.metadata.reportedBy}</p>
                        </div>
                      </div>
                    )}
                    
                    {terminal.metadata.reactivatedAt && (
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Réactivé le</span>
                          <p className="font-medium text-foreground">{formatDate(terminal.metadata.reactivatedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Dates système */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-foreground">Historique</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Date de création</span>
                    <p className="font-medium text-foreground">{formatDate(terminal.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Dernière modification</span>
                    <p className="font-medium text-foreground">{formatDate(terminal.updatedAt)}</p>
                  </div>
                </div>
                
                {terminal.lastConnectionAt && (
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                      <Wifi className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Dernière connexion</span>
                      <p className="font-medium text-foreground">{formatDate(terminal.lastConnectionAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">Chargement des détails...</div>
        )}
      </div>
      <div className="flex-shrink-0 px-6 py-4 bg-muted/50 dark:bg-muted/20 border-t border-border">
        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="min-w-[120px]"
          >
            <X className="mr-2 h-4 w-4" />
            Fermer
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
