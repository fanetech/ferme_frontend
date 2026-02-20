"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  Code2, 
  Eye, 
  EyeOff,
  Hash,
  Type,
  Calculator,
  CheckCircle,
  Settings,
  Filter,
  SortAsc,
  ArrowRight,
  TestTube
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Hooks et types
import { useResponseMappings } from "@/data/catalog";
import { ServiceConfig, ResponseMapping, DataType, EndpointType } from "@/types/catalog";
import { ResponseMappingFormModal } from "../forms/ResponseMappingFormModal";
import { ResponseMappingDeleteDialog } from "../ui/ResponseMappingDeleteDialog";

interface ResponseMappingsListProps {
  serviceConfig: ServiceConfig | null | undefined;
  endpointId: string;
  endpointType: EndpointType;
  onUpdate: () => void;
}

// Catégories de mappings avec icônes et couleurs
const MAPPING_CATEGORIES = {
  amount: {
    label: "Montants",
    icon: "💰",
    color: "bg-green-50 border-green-200 text-green-800",
    description: "Valeurs monétaires et montants"
  },
  reference: {
    label: "Références",
    icon: "🔗", 
    color: "bg-blue-50 border-blue-200 text-blue-800",
    description: "Identifiants et références"
  },
  status: {
    label: "Statuts",
    icon: "✅",
    color: "bg-purple-50 border-purple-200 text-purple-800", 
    description: "États et statuts de transaction"
  },
  standard: {
    label: "Données standard",
    icon: "📝",
    color: "bg-gray-50 border-gray-200 text-gray-800",
    description: "Autres données"
  }
};

export function ResponseMappingsList({ 
  serviceConfig, 
  endpointId, 
  endpointType,
  onUpdate 
}: ResponseMappingsListProps) {
  const { data: mappings = [], isLoading, refetch } = useResponseMappings(endpointId);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "order" | "type">("order");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<ResponseMapping | null>(null);
  const [deletingMapping, setDeletingMapping] = useState<ResponseMapping | null>(null);

  // Vérification de sécurité pour serviceConfig
  if (!serviceConfig) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Configuration de service non disponible
      </div>
    );
  }

  // Filtrage et tri des mappings
  const filteredMappings = mappings
    .filter(mapping => {
      const matchesSearch = !searchTerm || 
        mapping.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.customDataKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.jsonPath.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === "all" || 
        (selectedCategory === "amount" && mapping.isAmount) ||
        (selectedCategory === "reference" && mapping.isReference) ||
        (selectedCategory === "status" && mapping.isStatus) ||
        (selectedCategory === "standard" && !mapping.isAmount && !mapping.isReference && !mapping.isStatus);

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.displayName.localeCompare(b.displayName);
        case "order":
          return (a.displayOrder || 0) - (b.displayOrder || 0);
        case "type":
          return a.dataType.localeCompare(b.dataType);
        default:
          return 0;
      }
    });

  // Grouper par catégorie pour l'affichage
  const groupedMappings = {
    amount: filteredMappings.filter(m => m.isAmount),
    reference: filteredMappings.filter(m => m.isReference),
    status: filteredMappings.filter(m => m.isStatus),
    standard: filteredMappings.filter(m => !m.isAmount && !m.isReference && !m.isStatus)
  };

  const getDataTypeIcon = (type: DataType) => {
    const icons = {
      [DataType.STRING]: <Type className="h-4 w-4" />,
      [DataType.INTEGER]: <Hash className="h-4 w-4" />,
      [DataType.DECIMAL]: <Calculator className="h-4 w-4" />,
      [DataType.BOOLEAN]: <CheckCircle className="h-4 w-4" />,
      [DataType.DATE]: <Settings className="h-4 w-4" />,
      [DataType.DATETIME]: <Settings className="h-4 w-4" />,
      [DataType.EMAIL]: <Type className="h-4 w-4" />,
      [DataType.PHONE]: <Type className="h-4 w-4" />,
      [DataType.URL]: <Type className="h-4 w-4" />,
      [DataType.JSON]: <Settings className="h-4 w-4" />
    };
    return icons[type] || <Settings className="h-4 w-4" />;
  };

  const getDataTypeColor = (type: DataType) => {
    const colors = {
      [DataType.STRING]: "bg-blue-100 text-blue-800",
      [DataType.INTEGER]: "bg-green-100 text-green-800", 
      [DataType.DECIMAL]: "bg-yellow-100 text-yellow-800",
      [DataType.BOOLEAN]: "bg-purple-100 text-purple-800",
      [DataType.DATE]: "bg-pink-100 text-pink-800",
      [DataType.DATETIME]: "bg-orange-100 text-orange-800",
      [DataType.EMAIL]: "bg-indigo-100 text-indigo-800",
      [DataType.PHONE]: "bg-teal-100 text-teal-800",
      [DataType.URL]: "bg-cyan-100 text-cyan-800",
      [DataType.JSON]: "bg-gray-100 text-gray-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const handleSuccess = () => {
    setIsCreateOpen(false);
    setEditingMapping(null);
    refetch();
    onUpdate();
  };

  const renderMappingCard = (mapping: ResponseMapping) => (
    <Card key={mapping.id} className="hover:shadow-sm transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2">
              {getDataTypeIcon(mapping.dataType)}
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {mapping.displayName}
                  {mapping.isHidden && <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  {mapping.isRequired && <span className="text-red-500 text-xs">*</span>}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Code2 className="h-3 w-3" />
                  <span className="font-mono text-xs">{mapping.customDataKey}</span>
                </CardDescription>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Badge className={getDataTypeColor(mapping.dataType)}>
              {mapping.dataType}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setEditingMapping(mapping)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeletingMapping(mapping)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* JSONPath */}
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
              {mapping.jsonPath}
            </span>
          </div>

          {/* Badges et informations */}
          <div className="flex flex-wrap gap-1">
            {mapping.isAmount && (
              <Badge variant="outline" className="text-xs">
                💰 Montant
              </Badge>
            )}
            {mapping.isReference && (
              <Badge variant="outline" className="text-xs">
                🔗 Référence
              </Badge>
            )}
            {mapping.isStatus && (
              <Badge variant="outline" className="text-xs">
                ✅ Statut
              </Badge>
            )}
            {mapping.isEditable && (
              <Badge variant="outline" className="text-xs">
                Modifiable
              </Badge>
            )}
            {mapping.defaultValue && (
              <Badge variant="outline" className="text-xs">
                Défaut: {mapping.defaultValue}
              </Badge>
            )}
          </div>

          {/* Transformation et formatage */}
          {(mapping.transformExpression || mapping.formatPattern || mapping.prefix || mapping.suffix) && (
            <div className="text-xs text-muted-foreground space-y-1">
              {mapping.transformExpression && (
                <div className="flex items-center gap-1">
                  <Code2 className="h-3 w-3" />
                  <span>Transformation active</span>
                </div>
              )}
              {mapping.formatPattern && (
                <div className="flex items-center gap-1">
                  <Settings className="h-3 w-3" />
                  <span>Format: {mapping.formatPattern}</span>
                </div>
              )}
              {(mapping.prefix || mapping.suffix) && (
                <div className="flex items-center gap-1">
                  <Type className="h-3 w-3" />
                  <span>
                    {mapping.prefix && `"${mapping.prefix}"`}
                    {mapping.prefix && mapping.suffix && " + "}
                    <span className="italic">valeur</span>
                    {mapping.prefix && mapping.suffix && " + "}
                    {mapping.suffix && `"${mapping.suffix}"`}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderMappingCategory = (categoryKey: keyof typeof MAPPING_CATEGORIES, mappingsInCategory: ResponseMapping[]) => {
    if (selectedCategory !== "all" && selectedCategory !== categoryKey) return null;
    if (mappingsInCategory.length === 0) return null;

    const category = MAPPING_CATEGORIES[categoryKey];
    
    return (
      <div key={categoryKey} className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{category.icon}</span>
          <h3 className="font-medium">{category.label}</h3>
          <Badge variant="outline">{mappingsInCategory.length}</Badge>
          <span className="text-sm text-muted-foreground">• {category.description}</span>
        </div>
        <div className="grid gap-3">
          {mappingsInCategory.map(renderMappingCard)}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Mappings de réponse</h2>
            <p className="text-sm text-muted-foreground">Configuration du mapping des données de réponse</p>
          </div>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          Chargement des mappings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mappings de réponse
          </h2>
          <p className="text-sm text-muted-foreground">
            Configuration du mapping des données de réponse pour {endpointType}
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau mapping
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(MAPPING_CATEGORIES).map(([key, category]) => {
          const count = groupedMappings[key as keyof typeof groupedMappings].length;
          return (
            <Card key={key} className={`cursor-pointer transition-colors hover:bg-accent ${selectedCategory === key ? 'ring-2 ring-primary' : ''}`} 
                  onClick={() => setSelectedCategory(selectedCategory === key ? "all" : key)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{category.label}</div>
                    <div className="text-lg font-bold">{count}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contrôles de recherche et filtrage */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans les mappings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Catégorie
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="ml-2">
                    {MAPPING_CATEGORIES[selectedCategory as keyof typeof MAPPING_CATEGORIES]?.label}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedCategory("all")}>
                Toutes les catégories
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {Object.entries(MAPPING_CATEGORIES).map(([key, category]) => (
                <DropdownMenuItem key={key} onClick={() => setSelectedCategory(key)}>
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                Tri
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("order")}>
                Par ordre d'affichage
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                Par nom
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("type")}>
                Par type de données
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredMappings.length} mapping{filteredMappings.length > 1 ? 's' : ''} 
          {searchTerm && ` (filtré${filteredMappings.length > 1 ? 's' : ''})`}
        </div>
      </div>

      {/* Liste des mappings */}
      {filteredMappings.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? "Aucun mapping trouvé" : "Aucun mapping configuré"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm 
              ? "Essayez de modifier vos critères de recherche"
              : "Commencez par créer votre premier mapping de réponse pour extraire les données du service externe"
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un mapping
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {selectedCategory === "all" 
            ? Object.entries(groupedMappings).map(([categoryKey, mappingsInCategory]) => 
                renderMappingCategory(categoryKey as keyof typeof MAPPING_CATEGORIES, mappingsInCategory)
              )
            : <div className="grid gap-3">
                {filteredMappings.map(renderMappingCard)}
              </div>
          }
        </div>
      )}

      {/* Modals */}
      <ResponseMappingFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        serviceConfig={serviceConfig}
        endpointId={endpointId}
        endpointType={endpointType}
        responseMapping={null}
        onSuccess={handleSuccess}
      />

      <ResponseMappingFormModal
        isOpen={!!editingMapping}
        onClose={() => setEditingMapping(null)}
        serviceConfig={serviceConfig}
        endpointId={endpointId}
        endpointType={endpointType}
        responseMapping={editingMapping}
        onSuccess={handleSuccess}
      />

      {deletingMapping && (
        <ResponseMappingDeleteDialog
          isOpen={!!deletingMapping}
          onClose={() => setDeletingMapping(null)}
          responseMapping={deletingMapping}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}