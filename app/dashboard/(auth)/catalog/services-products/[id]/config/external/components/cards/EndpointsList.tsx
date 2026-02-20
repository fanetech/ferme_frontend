"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Globe, 
  Search,
  MoreHorizontal,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  TestTube,
  Zap
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
import { EndpointFormModal } from "../forms/EndpointFormModal";
import { EndpointDeleteDialog } from "../ui/EndpointDeleteDialog";

// Hooks
import { 
  useEndpointConfigs,
  useDeleteEndpointConfig,
  useTestEndpointConfig
} from "@/data/catalog";
import { ServiceConfig, EndpointConfig, EndpointType } from "@/types/catalog";

interface EndpointsListProps {
  serviceConfig: ServiceConfig;
  onUpdate?: () => void;
}

export function EndpointsList({ serviceConfig, onUpdate }: EndpointsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<EndpointConfig | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEndpoint, setDeletingEndpoint] = useState<EndpointConfig | null>(null);

  // Récupérer les endpoints
  const { 
    data: endpoints = [], 
    isLoading 
  } = useEndpointConfigs(serviceConfig.id, !!serviceConfig.id);
  
  const { mutate: deleteEndpoint, isPending: isDeleting } = useDeleteEndpointConfig();
  const { mutate: testEndpoint, isPending: isTesting } = useTestEndpointConfig();

  const filteredEndpoints = endpoints.filter(endpoint =>
    endpoint.path?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.endpointType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.method?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (endpoint: EndpointConfig) => {
    setEditingEndpoint(endpoint);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingEndpoint(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEndpoint(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingEndpoint(null);
    onUpdate?.();
  };

  const handleDelete = (endpoint: EndpointConfig) => {
    setDeletingEndpoint(endpoint);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setDeletingEndpoint(null);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setDeletingEndpoint(null);
    onUpdate?.();
  };

  const handleTest = (endpoint: EndpointConfig) => {
    testEndpoint(endpoint.id, {
      onSuccess: () => {
        // Test réussi
      }
    });
  };

  const getEndpointTypeBadge = (type: string) => {
    const colors = {
      CONSULTATION: "bg-blue-100 text-blue-800",
      VALIDATION: "bg-green-100 text-green-800",
      VERIFICATION: "bg-purple-100 text-purple-800",
      CANCELLATION: "bg-orange-100 text-orange-800",
      WEBHOOK: "bg-pink-100 text-pink-800",
      REFUND: "bg-red-100 text-red-800"
    };
    
    const labels = {
      CONSULTATION: "Consultation",
      VALIDATION: "Validation",
      VERIFICATION: "Vérification",
      CANCELLATION: "Annulation",
      WEBHOOK: "Webhook",
      REFUND: "Remboursement"
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: "bg-green-100 text-green-800",
      POST: "bg-blue-100 text-blue-800",
      PUT: "bg-yellow-100 text-yellow-800",
      DELETE: "bg-red-100 text-red-800",
      PATCH: "bg-purple-100 text-purple-800"
    };
    
    return (
      <Badge className={colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {method}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return <Globe className="h-4 w-4" />;
      case 'VALIDATION':
        return <CheckCircle className="h-4 w-4" />;
      case 'VERIFICATION':
        return <Shield className="h-4 w-4" />;
      case 'CANCELLATION':
        return <XCircle className="h-4 w-4" />;
      case 'WEBHOOK':
        return <TestTube className="h-4 w-4" />;
      case 'REFUND':
        return <Zap className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Endpoints du service</h3>
          <p className="text-sm text-muted-foreground">
            Configurez les points d'accès de votre service externe
          </p>
        </div>
        
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel endpoint
        </Button>
      </div>

      {/* Informations du service */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Globe className="h-8 w-8 text-muted-foreground" />
            <div>
              <h4 className="font-medium">{serviceConfig.serviceName || "Service externe"}</h4>
              <p className="text-sm text-muted-foreground">
                {serviceConfig.isTestMode ? "Mode test" : "Mode production"} - 
                {serviceConfig.baseUrl || serviceConfig.testBaseUrl || "URL non configurée"}
              </p>
            </div>
            <div className="ml-auto">
              <Badge variant={serviceConfig.status === "ACTIVE" ? "default" : "secondary"}>
                {serviceConfig.status === "ACTIVE" ? "Actif" : "Inactif"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

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
        
        <div className="text-sm text-muted-foreground">
          {filteredEndpoints.length} endpoint(s)
        </div>
      </div>

      {/* Liste des endpoints */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : filteredEndpoints.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? "Aucun endpoint trouvé" : "Aucun endpoint configuré"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Essayez de modifier votre recherche"
                  : "Créez des endpoints pour définir les points d'accès de votre service externe"
                }
              </p>
              {!searchTerm && (
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un endpoint
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Endpoints configurés</span>
              <Badge variant="outline">
                {filteredEndpoints.length} endpoint(s)
              </Badge>
            </CardTitle>
            <CardDescription>
              Gestion des points d'accès du service externe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Méthode & Path</TableHead>
                  <TableHead>Auth</TableHead>
                  <TableHead>Configuration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEndpoints.map((endpoint) => (
                  <TableRow key={endpoint.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(endpoint.endpointType)}
                        <div>
                          {getEndpointTypeBadge(endpoint.endpointType)}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMethodBadge(endpoint.method)}
                        <div>
                          <div className="font-mono text-sm">{endpoint.path}</div>
                          {endpoint.fullUrl && (
                            <div className="text-xs text-muted-foreground">
                              {endpoint.fullUrl}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {endpoint.authRequired ? (
                          <Shield className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm">
                          {endpoint.authRequired ? "Requise" : "Non requise"}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {endpoint.timeout && (
                          <Badge variant="outline" className="text-xs">
                            Timeout: {endpoint.timeout}s
                          </Badge>
                        )}
                        {endpoint.retryCount && (
                          <Badge variant="outline" className="text-xs">
                            Retry: {endpoint.retryCount}
                          </Badge>
                        )}
                        {endpoint.successCodes && (
                          <Badge variant="outline" className="text-xs">
                            Success: {endpoint.successCodes}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleTest(endpoint)}>
                            <TestTube className="h-4 w-4 mr-2" />
                            Tester
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(endpoint)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
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
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{endpoints.length}</div>
            <p className="text-xs text-muted-foreground">Total endpoints</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {endpoints.filter(e => e.authRequired).length}
            </div>
            <p className="text-xs text-muted-foreground">Avec auth</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {endpoints.filter(e => e.method === 'POST').length}
            </div>
            <p className="text-xs text-muted-foreground">POST</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {endpoints.filter(e => e.endpointType === 'REFUND').length}
            </div>
            <p className="text-xs text-muted-foreground">Remboursement</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal de création/modification */}
      <EndpointFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        serviceConfig={serviceConfig}
        endpoint={editingEndpoint}
        onSuccess={handleModalSuccess}
      />

      {/* Modal de confirmation de suppression */}
      {deletingEndpoint && (
        <EndpointDeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleDeleteDialogClose}
          endpoint={deletingEndpoint}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}