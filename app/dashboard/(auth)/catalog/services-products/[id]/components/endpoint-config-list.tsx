import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Edit, 
  Trash2, 
  TestTube, 
  Globe, 
  ArrowRight,
  Search,
  MoreHorizontal
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
import { EndpointConfigForm } from "./endpoint-config-form";

// Hooks
import { 
  useEndpointConfigs,
  useDeleteEndpointConfig,
  useTestEndpointConfig
} from "@/data/catalog";
import { ServiceConfig, EndpointConfig } from "@/types/catalog";

interface EndpointConfigListProps {
  serviceConfig?: ServiceConfig;
  onUpdate?: () => void;
}

export function EndpointConfigList({ serviceConfig, onUpdate }: EndpointConfigListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<EndpointConfig | null>(null);

  const { 
    data: endpoints, 
    isLoading 
  } = useEndpointConfigs(serviceConfig?.id || "", !!serviceConfig?.id);
  
  const { mutate: deleteEndpoint, isPending: isDeleting } = useDeleteEndpointConfig();
  const { mutate: testEndpoint, isPending: isTesting } = useTestEndpointConfig();

  if (!serviceConfig) {
    return (
      <Alert>
        <AlertDescription>
          Aucune configuration de service trouvée. Créez d'abord une configuration de service.
        </AlertDescription>
      </Alert>
    );
  }

  const filteredEndpoints = endpoints?.filter(endpoint =>
    endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.path.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (endpoint: EndpointConfig) => {
    setEditingEndpoint(endpoint);
  };

  const handleDelete = (endpoint: EndpointConfig) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'endpoint "${endpoint.name}" ?`)) {
      deleteEndpoint({ 
        id: endpoint.id, 
        configId: serviceConfig.id 
      }, {
        onSuccess: () => {
          onUpdate?.();
        }
      });
    }
  };

  const handleTest = (endpoint: EndpointConfig) => {
    testEndpoint(endpoint.id);
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: "bg-green-100 text-green-800",
      POST: "bg-blue-100 text-blue-800", 
      PUT: "bg-orange-100 text-orange-800",
      DELETE: "bg-red-100 text-red-800",
      PATCH: "bg-purple-100 text-purple-800"
    };
    
    return (
      <Badge className={colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {method}
      </Badge>
    );
  };

  if (isCreating) {
    return (
      <EndpointConfigForm
        serviceConfig={serviceConfig}
        onSuccess={() => {
          setIsCreating(false);
          onUpdate?.();
        }}
        onCancel={() => setIsCreating(false)}
      />
    );
  }

  if (editingEndpoint) {
    return (
      <EndpointConfigForm
        serviceConfig={serviceConfig}
        endpointConfig={editingEndpoint}
        onSuccess={() => {
          setEditingEndpoint(null);
          onUpdate?.();
        }}
        onCancel={() => setEditingEndpoint(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Endpoints configurés</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les endpoints disponibles pour ce service externe
          </p>
        </div>
        
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel endpoint
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un endpoint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Liste des endpoints */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : filteredEndpoints.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun endpoint configuré</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par créer votre premier endpoint pour ce service externe
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un endpoint
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead>Chemin</TableHead>
                <TableHead>Champs</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEndpoints.map((endpoint) => (
                <TableRow key={endpoint.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{endpoint.name}</div>
                      {endpoint.description && (
                        <div className="text-sm text-muted-foreground">
                          {endpoint.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getMethodBadge(endpoint.method)}
                  </TableCell>
                  
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-xs">
                      {endpoint.path}
                    </code>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline">
                      {endpoint.dataFields?.length || 0} champ(s)
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    {endpoint.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Actif</Badge>
                    ) : (
                      <Badge variant="secondary">Inactif</Badge>
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
                        <DropdownMenuItem onClick={() => handleEdit(endpoint)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTest(endpoint)}>
                          <TestTube className="h-4 w-4 mr-2" />
                          Tester
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(endpoint)}
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
        </Card>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{endpoints?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total endpoints</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {endpoints?.filter(e => e.isActive).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Actifs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {endpoints?.reduce((total, e) => total + (e.dataFields?.length || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Champs de données</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {endpoints?.reduce((total, e) => total + (e.responseMappings?.length || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Mappings réponse</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}