"use client";

import { BaseModal } from "@/components/ui/modal/BaseModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Hash,
  Info,
  Palette,
  X,
  Briefcase,
  Clock,
  Users
} from "lucide-react";
import { SuperStructureBadge } from "./super-structure-badge";
import { formatDate, cn } from "@/lib/utils";
import { getOrganizationTypeByCode } from "@/lib/constants/organization-types";
import { SuperStructure } from "@/types/organization";

interface SuperStructureDetailsModalProps {
  superStructure: SuperStructure | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SuperStructureDetailsModal({
  superStructure,
  isOpen,
  onClose
}: SuperStructureDetailsModalProps) {
  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <Building2 className="h-5 w-5 text-primary" />
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails de la Super Structure"
      titleIcon={titleIcon}
      size="xl"
      className="max-w-4xl"
      noPadding={true}
      bodyClassName="flex flex-col flex-1 min-h-0"
    >
      <div className="flex-1 overflow-y-auto p-6">
        {superStructure ? (
          <div className="space-y-6">
            {/* Header avec logo et statut */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="flex-shrink-0">
                  <Avatar className="h-16 w-16">
                    {superStructure.logoUrl ? (
                      <img
                        src={superStructure.logoUrl}
                        alt={`Logo ${superStructure.name}`}
                        className="h-full w-full object-cover rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <AvatarFallback className={`bg-primary/10 ${superStructure.logoUrl ? 'hidden' : ''}`}>
                      <Building2 className="h-8 w-8 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Informations principales */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-foreground">{superStructure.name}</h2>
                    <SuperStructureBadge status={superStructure.status} />
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span className="font-mono">{superStructure.code}</span>
                  </div>
                  
                  {/* Type d'organisation */}
                  {superStructure.organizationType && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      {(() => {
                        const orgType = getOrganizationTypeByCode(superStructure.organizationType);
                        return orgType ? (
                          <div className="flex items-center gap-2">
                            <span className="text-base">{orgType.icon}</span>
                            <span className="text-sm font-medium">{orgType.displayName}</span>
                            <span className="text-xs text-muted-foreground">({orgType.sector})</span>
                          </div>
                        ) : (
                          <span className="text-sm">{superStructure.organizationType}</span>
                        );
                      })()}
                    </div>
                  )}
                  
                  {superStructure.description && (
                    <div className="flex items-start gap-2 text-muted-foreground max-w-2xl">
                      <Info className="h-4 w-4 mt-0.5 shrink-0" />
                      <p className="text-sm">{superStructure.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistiques */}
              {superStructure.totalStructures !== undefined && (
                <div className="text-center bg-muted/50 dark:bg-muted/20 rounded-lg p-4 border border-border">
                  <div className="text-2xl font-bold text-primary">
                    {superStructure.activeStructures || 0}/{superStructure.totalStructures}
                  </div>
                  <div className="text-xs text-muted-foreground">Structures Actives</div>
                </div>
              )}
            </div>

            <Separator />

            {/* Informations de contact et localisation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Contact</h3>
                
                <div className="space-y-3">
                  {superStructure.contact && (
                    <div>
                      <span className="text-sm text-muted-foreground">Personne de contact</span>
                      <p className="font-medium text-foreground">{superStructure.contact}</p>
                    </div>
                  )}
                  
                  {superStructure.email && (
                    <div>
                      <span className="text-sm text-muted-foreground">Email</span>
                      <p className="font-medium">
                        <a href={`mailto:${superStructure.email}`} className="text-primary hover:underline">
                          {superStructure.email}
                        </a>
                      </p>
                    </div>
                  )}
                  
                  {superStructure.phone && (
                    <div>
                      <span className="text-sm text-muted-foreground">Téléphone</span>
                      <p className="font-medium">
                        <a href={`tel:${superStructure.phone}`} className="text-primary hover:underline">
                          {superStructure.phone}
                        </a>
                      </p>
                    </div>
                  )}
                  
                  {!superStructure.contact && !superStructure.email && !superStructure.phone && (
                    <p className="text-muted-foreground text-sm">Aucune information de contact renseignée</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Localisation</h3>
                
                <div className="space-y-3">
                  {superStructure.address && (
                    <div>
                      <span className="text-sm text-muted-foreground">Adresse</span>
                      <p className="font-medium text-foreground">{superStructure.address}</p>
                    </div>
                  )}
                  
                  {(superStructure.city || superStructure.postalCode) && (
                    <div>
                      <span className="text-sm text-muted-foreground">Ville</span>
                      <p className="font-medium text-foreground">
                        {[superStructure.postalCode, superStructure.city].filter(Boolean).join(" ")}
                      </p>
                    </div>
                  )}
                  
                  {superStructure.country && (
                    <div>
                      <span className="text-sm text-muted-foreground">Pays</span>
                      <p className="font-medium text-foreground">{superStructure.country}</p>
                    </div>
                  )}
                  
                  {!superStructure.address && !superStructure.city && !superStructure.country && (
                    <p className="text-muted-foreground text-sm">Aucune adresse renseignée</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Branding et couleurs */}
            {(superStructure.primaryColor || superStructure.secondaryColor || 
              superStructure.headerColor || superStructure.footerColor) && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-foreground">Branding</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {superStructure.primaryColor && (
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                          <Palette className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Couleur primaire</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div 
                              className="w-5 h-5 rounded border border-border shadow-sm" 
                              style={{ backgroundColor: superStructure.primaryColor }}
                            />
                            <p className="font-mono text-sm text-foreground">{superStructure.primaryColor}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {superStructure.secondaryColor && (
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                          <Palette className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Couleur secondaire</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div 
                              className="w-5 h-5 rounded border border-border shadow-sm" 
                              style={{ backgroundColor: superStructure.secondaryColor }}
                            />
                            <p className="font-mono text-sm text-foreground">{superStructure.secondaryColor}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {superStructure.headerColor && (
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                          <Palette className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Couleur en-tête</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div 
                              className="w-5 h-5 rounded border border-border shadow-sm" 
                              style={{ backgroundColor: superStructure.headerColor }}
                            />
                            <p className="font-mono text-sm text-foreground">{superStructure.headerColor}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {superStructure.footerColor && (
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                          <Palette className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Couleur pied de page</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div 
                              className="w-5 h-5 rounded border border-border shadow-sm" 
                              style={{ backgroundColor: superStructure.footerColor }}
                            />
                            <p className="font-mono text-sm text-foreground">{superStructure.footerColor}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Métadonnées additionnelles */}
            {superStructure.metadata && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-foreground">Métadonnées</h3>
                  
                  <div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-4">
                    <pre className="text-xs overflow-auto text-foreground">
                      {JSON.stringify(JSON.parse(superStructure.metadata), null, 2)}
                    </pre>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Informations système */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-foreground">Historique</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Date de création</span>
                    <p className="font-medium text-foreground">{formatDate(superStructure.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Dernière modification</span>
                    <p className="font-medium text-foreground">{formatDate(superStructure.updatedAt)}</p>
                  </div>
                </div>
                
                {superStructure.createdBy && (
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Créé par</span>
                      <p className="font-medium text-foreground">{superStructure.createdBy}</p>
                    </div>
                  </div>
                )}
                
                {superStructure.lastModifiedBy && (
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Modifié par</span>
                      <p className="font-medium text-foreground">{superStructure.lastModifiedBy}</p>
                    </div>
                  </div>
                )}
                
                {superStructure.version !== undefined && (
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                      <Hash className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Version</span>
                      <p className="font-medium text-foreground">{superStructure.version}</p>
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
