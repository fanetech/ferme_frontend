"use client";

import { 
  Tag, 
  Hash, 
  Info,
  X,
  Building2,
  Calendar,
  Grid3x3,
  Palette,
  Code,
  Users
} from "lucide-react";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/constants/category-icons";
import type { Category } from "@/types/organization";

interface CategoryDetailsModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

// Composant pour afficher le badge de statut
function CategoryStatusBadge({ status }: { status: string }) {
  const variant = status === "ACTIVE" ? "default" : "secondary";
  const label = status === "ACTIVE" ? "Actif" : "Inactif";
  
  return (
    <Badge variant={variant} className="text-sm">
      {label}
    </Badge>
  );
}

export function CategoryDetailsModal({ 
  category, 
  isOpen, 
  onClose 
}: CategoryDetailsModalProps) {
  
  if (!category) return null;

  console.log(category)
  // Récupérer l'icône et ses informations
  const categoryIcon = getCategoryIcon(category.icon);
  const IconComponent = categoryIcon.component;

  const titleIcon = (
    <div 
      className="p-2.5 rounded-lg shadow-sm dark:shadow-none"
      style={{ backgroundColor: category.color || "#007bff" }}
    >
      <IconComponent className="h-5 w-5 text-white" />
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails de la catégorie"
      titleIcon={titleIcon}
      subtitle={`Informations détaillées de ${category.name}`}
      size="xl"
      className="max-w-3xl"
      noPadding={true}
      bodyClassName="flex flex-col flex-1 min-h-0"
    >
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* En-tête avec informations principales */}
          <div className="bg-muted/30 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{category.name}</h2>
                  <CategoryStatusBadge status={category.status} />
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  <span className="font-mono">{category.code}</span>
                </div>
                
                {category.description && (
                  <div className="flex items-start gap-2 text-muted-foreground max-w-2xl">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="text-sm">{category.description}</p>
                  </div>
                )}
              </div>
              
              {/* Statistiques à droite */}
              {category.totalServices !== undefined && (
                <div className="text-center bg-background rounded-lg p-4 border">
                  <div className="text-2xl font-bold text-primary">
                    {category.totalServices}
                  </div>
                  <div className="text-xs text-muted-foreground">Services</div>
                </div>
              )}
            </div>
          </div>

          {/* Super Structure parente */}
          {category.superStructureName && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Super Structure
              </h3>
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm">
                    {category.superStructureId}
                  </Badge>
                  <span className="font-medium">{category.superStructureName}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Apparence */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Apparence
              </h3>
              <div className="space-y-4 bg-muted/20 rounded-lg p-4">
                {/* Icône */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Icône:</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-md"
                      style={{ backgroundColor: category.color || "#007bff" }}
                    >
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{categoryIcon.label}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {category.icon || "building"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Couleur */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Couleur:</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded border border-border" 
                      style={{ backgroundColor: category.color || "#007bff" }}
                    />
                    <span className="text-sm font-mono">
                      {category.color || "#007bff"}
                    </span>
                  </div>
                </div>

                {/* Ordre d'affichage */}
                {category.displayOrder !== undefined && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Grid3x3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Ordre:</span>
                    </div>
                    <Badge variant="outline">
                      {category.displayOrder}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Informations techniques */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Code className="h-5 w-5" />
                Informations techniques
              </h3>
              <div className="space-y-3 bg-muted/20 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-sm">{category.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Super Structure ID:</span>
                  <span className="font-mono text-sm">{category.superStructureId}</span>
                </div>
                {category.version !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version:</span>
                    <span>{category.version}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Métadonnées */}
          {category.metadata && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Métadonnées
              </h3>
              <div className="bg-muted/20 rounded-lg p-4">
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(JSON.parse(category.metadata), null, 2)}
                </pre>
              </div>
            </div>
          )}

          <Separator />

          {/* Informations système */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informations système
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date de création:</span>
                  <span>{formatDate(category.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dernière modification:</span>
                  <span>{formatDate(category.updatedAt)}</span>
                </div>
              </div>
              <div className="space-y-2">
                {category.createdBy && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Créé par:</span>
                    <span>{category.createdBy}</span>
                  </div>
                )}
                {category.lastModifiedBy && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modifié par:</span>
                    <span>{category.lastModifiedBy}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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