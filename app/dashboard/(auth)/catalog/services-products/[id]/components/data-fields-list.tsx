import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Database, 
  ArrowUpDown,
  Search,
  MoreHorizontal,
  GripVertical
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
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

// Components
import { DataFieldForm } from "./data-field-form";

// Hooks
import {
  useDataFields,
  useDeleteDataField,
  useReorderDataFields,
  useEndpointConfigs
} from "@/data/catalog";
import { ServiceConfig, ServiceDataField } from "@/types/catalog";

interface DataFieldsListProps {
  serviceConfig?: ServiceConfig;
  onUpdate?: () => void;
}

export function DataFieldsList({ serviceConfig, onUpdate }: DataFieldsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingField, setEditingField] = useState<ServiceDataField | null>(null);

  // Récupérer les endpoints et les champs
  const {
    data: endpointsData,
    isLoading: isLoadingEndpoints
  } = useEndpointConfigs(serviceConfig?.id || "", !!serviceConfig?.id);

  const {
    data: dataFields,
    isLoading
  } = useDataFields(selectedEndpoint, !!selectedEndpoint);

  const { mutate: deleteField, isPending: isDeleting } = useDeleteDataField();
  const { mutate: reorderFields, isPending: isReordering } = useReorderDataFields();

  if (!serviceConfig) {
    return (
      <Alert>
        <AlertDescription>
          Aucune configuration de service trouvée. Créez d'abord une configuration de service.
        </AlertDescription>
      </Alert>
    );
  }

  const endpoints = endpointsData || [];
  const selectedEndpointConfig = endpoints.find(e => e.id === selectedEndpoint);

  const filteredFields = dataFields?.filter(field =>
    field.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.label.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (field: ServiceDataField) => {
    setEditingField(field);
  };

  const handleDelete = (field: ServiceDataField) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le champ "${field.label}" ?`)) {
      deleteField({ 
        id: field.id, 
        endpointId: selectedEndpoint 
      }, {
        onSuccess: () => {
          onUpdate?.();
        }
      });
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !dataFields) return;

    const items = Array.from(dataFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const fieldIds = items.map(item => item.id);
    reorderFields({ fieldIds, endpointId: selectedEndpoint });
  };

  const getFieldTypeBadge = (type: string) => {
    const colors = {
      text: "bg-blue-100 text-blue-800",
      number: "bg-green-100 text-green-800",
      boolean: "bg-purple-100 text-purple-800",
      select: "bg-orange-100 text-orange-800",
      date: "bg-pink-100 text-pink-800",
      email: "bg-cyan-100 text-cyan-800",
      phone: "bg-yellow-100 text-yellow-800"
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {type}
      </Badge>
    );
  };

  if (isCreating) {
    return (
      <DataFieldForm
        endpointId={selectedEndpoint}
        onSuccess={() => {
          setIsCreating(false);
          onUpdate?.();
        }}
        onCancel={() => setIsCreating(false)}
      />
    );
  }

  if (editingField) {
    return (
      <DataFieldForm
        endpointId={selectedEndpoint}
        dataField={editingField}
        onSuccess={() => {
          setEditingField(null);
          onUpdate?.();
        }}
        onCancel={() => setEditingField(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec sélecteur d'endpoint */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Champs de données</h3>
            <p className="text-sm text-muted-foreground">
              Configurez les champs de saisie pour chaque endpoint
            </p>
          </div>
          
          {selectedEndpoint && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau champ
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
                      <span className="font-medium">{endpoint.endpointType || endpoint.path}</span>
                      <Badge variant="outline">{endpoint.method}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{endpoint.path}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(endpoint as any).dataFields?.length || 0} champ(s)
                    </p>
                  </div>
                ))}
              </div>
              
              {endpoints.length === 0 && (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun endpoint configuré</h3>
                  <p className="text-muted-foreground">
                    Créez d'abord des endpoints avant de configurer les champs de données
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu des champs pour l'endpoint sélectionné */}
      {selectedEndpoint && (
        <>
          {/* Barre de recherche */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un champ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              Endpoint : <span className="font-medium">{selectedEndpointConfig?.name}</span>
            </div>
          </div>

          {/* Liste des champs */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : filteredFields.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun champ configuré</h3>
                  <p className="text-muted-foreground mb-4">
                    Créez des champs de données pour cet endpoint
                  </p>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un champ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Champs de données</span>
                  <Badge variant="outline">
                    {filteredFields.length} champ(s)
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Réorganisez les champs par glisser-déposer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="fields">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40px]"></TableHead>
                              <TableHead>Nom</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Requis</TableHead>
                              <TableHead>Valeur par défaut</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredFields.map((field, index) => (
                              <Draggable key={field.id} draggableId={field.id} index={index}>
                                {(provided, snapshot) => (
                                  <TableRow
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={snapshot.isDragging ? "bg-muted/50" : ""}
                                  >
                                    <TableCell>
                                      <div {...provided.dragHandleProps}>
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    </TableCell>
                                    
                                    <TableCell>
                                      <div>
                                        <div className="font-medium">{field.label}</div>
                                        <div className="text-sm text-muted-foreground">
                                          {field.key}
                                        </div>
                                      </div>
                                    </TableCell>

                                    <TableCell>
                                      {getFieldTypeBadge(field.dataType)}
                                    </TableCell>

                                    <TableCell>
                                      {field.isRequired ? (
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
                                      {field.defaultValue ? (
                                        <code className="px-2 py-1 bg-muted rounded text-xs">
                                          {field.defaultValue}
                                        </code>
                                      ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                      )}
                                    </TableCell>
                                    
                                    <TableCell>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => handleEdit(field)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Modifier
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            onClick={() => handleDelete(field)}
                                            className="text-red-600"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Supprimer
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </Draggable>
                            ))}
                          </TableBody>
                        </Table>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}