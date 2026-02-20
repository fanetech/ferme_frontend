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
  Database, 
  Search,
  MoreHorizontal,
  Type,
  Settings
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

// Components
import { DataFieldFormModal } from "../forms/DataFieldFormModal";
import { DataFieldDeleteDialog } from "../ui/DataFieldDeleteDialog";

// Hooks
import { 
  useDataFields
} from "@/data/catalog";
import { ServiceConfig, ServiceDataField } from "@/types/catalog";

interface DataFieldsListProps {
  serviceConfig: ServiceConfig;
  endpointId: string;
  onUpdate?: () => void;
}

export function DataFieldsList({ serviceConfig, endpointId, onUpdate }: DataFieldsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<ServiceDataField | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingField, setDeletingField] = useState<ServiceDataField | null>(null);

  // Récupérer les champs de données
  const { 
    data: dataFields = [], 
    isLoading 
  } = useDataFields(endpointId, !!endpointId);
  

  const filteredFields = dataFields.filter(field =>
    field.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    field.dataType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (field: ServiceDataField) => {
    setEditingField(field);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingField(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingField(null);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setEditingField(null);
    onUpdate?.();
  };

  const handleDelete = (field: ServiceDataField) => {
    setDeletingField(field);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setDeletingField(null);
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setDeletingField(null);
    onUpdate?.();
  };

  const getDataTypeBadge = (dataType: string) => {
    const colors = {
      STRING: "bg-blue-100 text-blue-800",
      INTEGER: "bg-green-100 text-green-800",
      DECIMAL: "bg-yellow-100 text-yellow-800",
      BOOLEAN: "bg-purple-100 text-purple-800",
      DATE: "bg-pink-100 text-pink-800",
      DATETIME: "bg-orange-100 text-orange-800",
      EMAIL: "bg-indigo-100 text-indigo-800",
      PHONE: "bg-teal-100 text-teal-800",
      URL: "bg-cyan-100 text-cyan-800",
      JSON: "bg-gray-100 text-gray-800"
    };
    
    return (
      <Badge className={colors[dataType as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {dataType}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Champs de données</h3>
          <p className="text-sm text-muted-foreground">
            Configurez les champs de données pour cet endpoint
          </p>
        </div>
        
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau champ
        </Button>
      </div>

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
          {filteredFields.length} champ(s)
        </div>
      </div>

      {/* Liste des champs */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : filteredFields.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? "Aucun champ trouvé" : "Aucun champ configuré"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Essayez de modifier votre recherche"
                  : "Créez des champs de données pour définir les paramètres de cet endpoint"
                }
              </p>
              {!searchTerm && (
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un champ
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Champs configurés</span>
              <Badge variant="outline">
                {filteredFields.length} champ(s)
              </Badge>
            </CardTitle>
            <CardDescription>
              Configuration des champs de données pour l'endpoint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Clé</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Propriétés</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{field.label}</div>
                          {field.description && (
                            <div className="text-xs text-muted-foreground">
                              {field.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-mono text-sm">{field.key}</div>
                    </TableCell>
                    
                    <TableCell>
                      {getDataTypeBadge(field.dataType)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-1">
                        {field.isRequired && (
                          <Badge variant="outline" className="text-xs">
                            Requis
                          </Badge>
                        )}
                        {field.isReadonly && (
                          <Badge variant="outline" className="text-xs">
                            Lecture
                          </Badge>
                        )}
                        {field.isHidden && (
                          <Badge variant="outline" className="text-xs">
                            Caché
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
            <div className="text-2xl font-bold">{dataFields.length}</div>
            <p className="text-xs text-muted-foreground">Total champs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {dataFields.filter(f => f.isRequired).length}
            </div>
            <p className="text-xs text-muted-foreground">Requis</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {dataFields.filter(f => f.isReadonly).length}
            </div>
            <p className="text-xs text-muted-foreground">Lecture seule</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {dataFields.filter(f => f.isHidden).length}
            </div>
            <p className="text-xs text-muted-foreground">Cachés</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal de création/modification */}
      <DataFieldFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        serviceConfig={serviceConfig}
        endpointId={endpointId}
        dataField={editingField}
        onSuccess={handleModalSuccess}
      />

      {/* Modal de confirmation de suppression */}
      {deletingField && (
        <DataFieldDeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleDeleteDialogClose}
          dataField={deletingField}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}