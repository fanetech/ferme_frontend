"use client";

import { BaseModal } from "@/components/ui/modal/BaseModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Building,
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
  Navigation,
  Clock,
  Layers,
  UserCheck,
  GitBranch
} from "lucide-react";
import { StructureBadge } from "./structure-badge";
import { formatDate, cn } from "@/lib/utils";
import { Structure } from "@/types/organization";

interface StructureDetailsModalProps {
  structure: Structure | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StructureDetailsModal({
  structure,
  isOpen,
  onClose
}: StructureDetailsModalProps) {
  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <Building className="h-5 w-5 text-primary" />
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails de la structure"
      titleIcon={titleIcon}
      size="xl"
      className="max-w-3xl"
      noPadding={true}
      bodyClassName="flex flex-col flex-1 min-h-0"
    >
      <div className="flex-1 overflow-y-auto p-6">
        {structure ? (
          <div className="space-y-6">
            {/* Header avec statut et logo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {structure.logoUrl ? (
                  <Avatar className="h-12 w-12">
                    <img
                      src={structure.logoUrl}
                      alt={`Logo ${structure.name}`}
                      className="h-full w-full object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <AvatarFallback className="bg-primary/10 hidden">
                      <Building className="h-6 w-6 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-foreground">{structure.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      <Hash className="mr-1 h-3 w-3" />
                      {structure.code}
                    </Badge>
                    <StructureBadge status={structure.status} />
                  </div>
                </div>
              </div>
              {structure.totalCategories !== undefined && (
                <div className="text-center bg-muted/50 dark:bg-muted/20 rounded-lg p-3 border border-border">
                  <div className="text-2xl font-bold text-primary">
                    {structure.totalCategories}
                  </div>
                  <div className="text-xs text-muted-foreground">Catégories</div>
                </div>
              )}
            </div>

            {structure.description && (
              <div className="bg-muted/30 dark:bg-muted/10 rounded-lg p-4 border border-border/50">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground">{structure.description}</p>
                </div>
              </div>
            )}

            <Separator />

            {/* Informations générales et Localisation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Informations générales</h3>
                
                <div className="space-y-3">
                  {(structure.superStructureName || structure.superStructureCode) && (
                    <div>
                      <span className="text-sm text-muted-foreground">Super structure</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {structure.superStructureCode}
                        </Badge>
                        <p className="font-medium text-foreground">{structure.superStructureName}</p>
                      </div>
                    </div>
                  )}
                  
                  {structure.contact && (
                    <div>
                      <span className="text-sm text-muted-foreground">Contact</span>
                      <p className="font-medium text-foreground">{structure.contact}</p>
                    </div>
                  )}
                  
                  {structure.email && (
                    <div>
                      <span className="text-sm text-muted-foreground">Email</span>
                      <p className="font-medium">
                        <a href={`mailto:${structure.email}`} className="text-primary hover:underline">
                          {structure.email}
                        </a>
                      </p>
                    </div>
                  )}
                  
                  {structure.phone && (
                    <div>
                      <span className="text-sm text-muted-foreground">Téléphone</span>
                      <p className="font-medium">
                        <a href={`tel:${structure.phone}`} className="text-primary hover:underline">
                          {structure.phone}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground">Localisation</h3>
                
                <div className="space-y-3">
                  {structure.address && (
                    <div>
                      <span className="text-sm text-muted-foreground">Adresse</span>
                      <p className="font-medium text-foreground">{structure.address}</p>
                    </div>
                  )}
                  
                  {(structure.city || structure.postalCode) && (
                    <div>
                      <span className="text-sm text-muted-foreground">Ville</span>
                      <p className="font-medium text-foreground">
                        {[structure.postalCode, structure.city].filter(Boolean).join(" ")}
                      </p>
                    </div>
                  )}
                  
                  {structure.country && (
                    <div>
                      <span className="text-sm text-muted-foreground">Pays</span>
                      <p className="font-medium text-foreground">{structure.country}</p>
                    </div>
                  )}
                  
                  {structure.gpsCoordinates && (
                    <div>
                      <span className="text-sm text-muted-foreground">Coordonnées GPS</span>
                      <p className="font-mono text-sm bg-muted dark:bg-muted/50 px-2 py-1 rounded text-foreground">
                        {structure.gpsCoordinates}
                      </p>
                    </div>
                  )}
                  
                  {!structure.address && !structure.city && !structure.country && !structure.gpsCoordinates && (
                    <p className="text-sm text-muted-foreground italic">
                      Aucune localisation renseignée
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Couleurs et branding */}
            {(structure.primaryColor || structure.secondaryColor || structure.headerColor || structure.footerColor) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-foreground">Branding</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {structure.primaryColor && (
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                          <Palette className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Couleur primaire</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div 
                              className="w-5 h-5 rounded border border-border" 
                              style={{ backgroundColor: structure.primaryColor }}
                            />
                            <p className="font-mono text-xs text-foreground">{structure.primaryColor}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {structure.secondaryColor && (
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                          <Palette className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Couleur secondaire</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div 
                              className="w-5 h-5 rounded border border-border" 
                              style={{ backgroundColor: structure.secondaryColor }}
                            />
                            <p className="font-mono text-xs text-foreground">{structure.secondaryColor}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {structure.headerColor && (
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                          <Palette className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">En-tête</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div 
                              className="w-5 h-5 rounded border border-border" 
                              style={{ backgroundColor: structure.headerColor }}
                            />
                            <p className="font-mono text-xs text-foreground">{structure.headerColor}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {structure.footerColor && (
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                          <Palette className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Pied de page</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div 
                              className="w-5 h-5 rounded border border-border" 
                              style={{ backgroundColor: structure.footerColor }}
                            />
                            <p className="font-mono text-xs text-foreground">{structure.footerColor}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

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
                    <p className="font-medium text-foreground">{formatDate(structure.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Dernière modification</span>
                    <p className="font-medium text-foreground">{formatDate(structure.updatedAt)}</p>
                  </div>
                </div>
                
                {structure.createdBy && (
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                      <UserCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Créé par</span>
                      <p className="font-medium text-foreground">{structure.createdBy}</p>
                    </div>
                  </div>
                )}
                
                {structure.lastModifiedBy && (
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                      <UserCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Modifié par</span>
                      <p className="font-medium text-foreground">{structure.lastModifiedBy}</p>
                    </div>
                  </div>
                )}
                
                {structure.version !== undefined && (
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-primary/10 dark:bg-primary/20 rounded">
                      <GitBranch className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Version</span>
                      <p className="font-medium text-foreground">v{structure.version}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Métadonnées additionnelles */}
            {structure.metadata && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-foreground">Métadonnées</h3>
                  <div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-4 border border-border">
                    <pre className="text-xs overflow-auto text-foreground">
                      {JSON.stringify(JSON.parse(structure.metadata), null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            )}
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
