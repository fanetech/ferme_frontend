import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUpDown, 
  Search,
  MoreHorizontal,
  Eye,
  Code,
  TestTube
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Components
import { ResponseMappingForm } from "./response-mapping-form";

// Hooks
import { 
  useResponseMappings,
  useDeleteResponseMapping
} from "@/data/catalog";
import { ServiceConfig, ResponseMapping } from "@/types/catalog";

interface ResponseMappingListProps {
  serviceConfig?: ServiceConfig;
  onUpdate?: () => void;
}

export function ResponseMappingList({ serviceConfig, onUpdate }: ResponseMappingListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingMapping, setEditingMapping] = useState<ResponseMapping | null>(null);

  // Récupérer les mappings pour l'endpoint sélectionné
  const { 
    data: responseMappings, 
    isLoading 
  } = useResponseMappings(selectedEndpoint, !!selectedEndpoint);
  
  const { mutate: deleteMapping, isPending: isDeleting } = useDeleteResponseMapping();

  if (!serviceConfig) {
    return (
      <Alert>
        <AlertDescription>
          Aucune configuration de service trouvée. Créez d'abord une configuration de service.
        </AlertDescription>
      </Alert>
    );
  }

  const endpoints = serviceConfig.endpointConfigs || [];
  const selectedEndpointConfig = endpoints.find(e => e.id === selectedEndpoint);

  const filteredMappings = responseMappings?.filter(mapping =>
    mapping.sourceField.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.targetField.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (mapping: ResponseMapping) => {
    setEditingMapping(mapping);
  };

  const handleDelete = (mapping: ResponseMapping) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le mapping "${mapping.sourceField} → ${mapping.targetField}" ?`)) {
      deleteMapping({ 
        id: mapping.id, 
        endpointId: selectedEndpoint 
      }, {
        onSuccess: () => {
          onUpdate?.();
        }
      });
    }
  };

  const getFieldTypeBadge = (type: string) => {
    const colors = {
      string: "bg-blue-100 text-blue-800",
      number: "bg-green-100 text-green-800",
      boolean: "bg-purple-100 text-purple-800",
      date: "bg-pink-100 text-pink-800",
      array: "bg-orange-100 text-orange-800",
      object: "bg-gray-100 text-gray-800"
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {type}
      </Badge>
    );
  };

  const getTransformationBadge = (transformation?: string) => {
    if (!transformation || transformation === "NONE") {
      return <span className="text-muted-foreground text-sm">-</span>;
    }

    const labels = {
      TO_UPPER: "MAJUSCULES",
      TO_LOWER: "minuscules", 
      TRIM: "Nettoyer",
      FORMAT_DATE: "Format date",
      PARSE_NUMBER: "Nombre",
      CUSTOM: "Personnalisé"
    };

    return (
      <Badge variant="outline" className="text-xs">
        {labels[transformation as keyof typeof labels] || transformation}
      </Badge>
    );
  };

  if (isCreating) {
    return (
      <ResponseMappingForm
        endpointId={selectedEndpoint}
        onSuccess={() => {
          setIsCreating(false);
          onUpdate?.();
        }}
        onCancel={() => setIsCreating(false)}
      />
    );
  }

  if (editingMapping) {
    return (
      <ResponseMappingForm
        endpointId={selectedEndpoint}
        responseMapping={editingMapping}
        onSuccess={() => {
          setEditingMapping(null);
          onUpdate?.();
        }}
        onCancel={() => setEditingMapping(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec sélecteur d'endpoint */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Mappings de réponse</h3>
            <p className="text-sm text-muted-foreground">
              Configurez la transformation des réponses API pour chaque endpoint
            </p>
          </div>
          
          {selectedEndpoint && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau mapping
            </Button>
          )}
        </div>

        {/* Sélection de l'endpoint */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <label className="text-sm font-medium">Sélectionner un endpoint</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {endpoints.map((endpoint) => (
                  <div
                    key={endpoint.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedEndpoint === endpoint.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedEndpoint(endpoint.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{endpoint.name}</span>
                      <Badge variant="outline">{endpoint.method}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{endpoint.path}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {endpoint.responseMappings?.length || 0} mapping(s)
                    </p>
                  </div>
                ))}
              </div>
              
              {endpoints.length === 0 && (
                <div className="text-center py-8">
                  <ArrowUpDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun endpoint configuré</h3>
                  <p className="text-muted-foreground">
                    Créez d'abord des endpoints avant de configurer les mappings de réponse
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu des mappings pour l'endpoint sélectionné */}
      {selectedEndpoint && (
        <>
          {/* Barre de recherche */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un mapping..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              Endpoint : <span className="font-medium">{selectedEndpointConfig?.name}</span>
            </div>
          </div>

          {/* Liste des mappings */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : filteredMappings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <ArrowUpDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun mapping configuré</h3>
                  <p className="text-muted-foreground mb-4">
                    Créez des mappings de réponse pour transformer les données API
                  </p>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un mapping
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Mappings de réponse</span>
                  <Badge variant="outline">
                    {filteredMappings.length} mapping(s)
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Configuration de la transformation des réponses API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Champ source</TableHead>
                      <TableHead>Champ cible</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Requis</TableHead>
                      <TableHead>Transformation</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMappings.map((mapping) => (
                      <TableRow key={mapping.id}>
                        <TableCell>
                          <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                            {mapping.sourceField}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="font-medium">{mapping.targetField}</div>
                          {mapping.description && (
                            <div className="text-sm text-muted-foreground">
                              {mapping.description}
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {getFieldTypeBadge(mapping.fieldType)}
                        </TableCell>
                        
                        <TableCell>
                          {mapping.isRequired ? (
                            <Badge variant="destructive" className="text-xs">
                              Requis
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Optionnel
                            </Badge>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {getTransformationBadge(mapping.transformation)}
                        </TableCell>
                        
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(mapping)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(mapping)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}