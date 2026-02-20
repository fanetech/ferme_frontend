import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  History, 
  Search, 
  Filter,
  Calendar,
  User,
  Edit,
  Plus,
  Trash2,
  Eye,
  Settings,
  CheckCircle,
  XCircle,
  Package
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceProduct } from "@/types/catalog";
import { useState } from "react";

interface ServiceProductHistoryProps {
  serviceProduct: ServiceProduct;
}

export function ServiceProductHistory({ serviceProduct }: ServiceProductHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  // Données de démonstration - à remplacer par de vraies données
  const historyItems = [
    {
      id: "1",
      type: "CREATE",
      action: "Création du service/produit",
      user: "admin@example.com",
      timestamp: "2024-01-15T10:30:00Z",
      details: "Service créé avec les paramètres initiaux",
      status: "SUCCESS"
    },
    {
      id: "2",
      type: "UPDATE",
      action: "Modification des informations",
      user: "manager@example.com",
      timestamp: "2024-01-16T14:20:00Z",
      details: "Mise à jour du nom et de la description",
      status: "SUCCESS"
    },
    {
      id: "3",
      type: "CONFIG",
      action: "Configuration des endpoints",
      user: "tech@example.com",
      timestamp: "2024-01-17T09:15:00Z",
      details: "Ajout de 3 nouveaux endpoints API",
      status: "SUCCESS"
    },
    {
      id: "4",
      type: "STATUS",
      action: "Changement de statut",
      user: "admin@example.com",
      timestamp: "2024-01-18T11:45:00Z",
      details: "Service activé",
      status: "SUCCESS"
    },
    {
      id: "5",
      type: "ERROR",
      action: "Erreur de configuration",
      user: "tech@example.com",
      timestamp: "2024-01-19T16:30:00Z",
      details: "Échec de la connexion à l'API externe",
      status: "ERROR"
    },
    {
      id: "6",
      type: "CONFIG",
      action: "Correction de la configuration",
      user: "tech@example.com",
      timestamp: "2024-01-19T17:00:00Z",
      details: "Mise à jour des paramètres d'authentification",
      status: "SUCCESS"
    },
    {
      id: "7",
      type: "PRICING",
      action: "Mise à jour des prix",
      user: "finance@example.com",
      timestamp: "2024-01-20T08:30:00Z",
      details: "Ajustement des tarifs pour la nouvelle saison",
      status: "SUCCESS"
    },
    {
      id: "8",
      type: "STOCK",
      action: "Réapprovisionnement",
      user: "stock@example.com",
      timestamp: "2024-01-21T13:15:00Z",
      details: "Ajout de 500 unités en stock",
      status: "SUCCESS"
    }
  ];

  const filteredItems = historyItems.filter(item => {
    const searchMatch = !searchTerm || 
      item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const typeMatch = filterType === "all" || item.type === filterType;
    
    let dateMatch = true;
    if (dateRange !== "all") {
      const itemDate = new Date(item.timestamp);
      const now = new Date();
      
      switch (dateRange) {
        case "today":
          dateMatch = itemDate.toDateString() === now.toDateString();
          break;
        case "week":
          dateMatch = itemDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          dateMatch = itemDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
    }
    
    return searchMatch && typeMatch && dateMatch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "CREATE":
        return <Plus className="h-4 w-4 text-blue-500" />;
      case "UPDATE":
        return <Edit className="h-4 w-4 text-orange-500" />;
      case "DELETE":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case "CONFIG":
        return <Settings className="h-4 w-4 text-purple-500" />;
      case "STATUS":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "ERROR":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "PRICING":
        return <Badge className="h-4 w-4 text-yellow-500" />;
      case "STOCK":
        return <Package className="h-4 w-4 text-teal-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      CREATE: "bg-blue-100 text-blue-800",
      UPDATE: "bg-orange-100 text-orange-800",
      DELETE: "bg-red-100 text-red-800",
      CONFIG: "bg-purple-100 text-purple-800",
      STATUS: "bg-green-100 text-green-800",
      ERROR: "bg-red-100 text-red-800",
      PRICING: "bg-yellow-100 text-yellow-800",
      STOCK: "bg-teal-100 text-teal-800"
    };
    
    const labels = {
      CREATE: "Création",
      UPDATE: "Modification",
      DELETE: "Suppression",
      CONFIG: "Configuration",
      STATUS: "Statut",
      ERROR: "Erreur",
      PRICING: "Prix",
      STOCK: "Stock"
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === "SUCCESS" ? (
      <Badge className="bg-green-100 text-green-800">Succès</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Erreur</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium">Historique des modifications</h3>
        <p className="text-sm text-muted-foreground">
          Suivi de toutes les actions effectuées sur {serviceProduct.name}
        </p>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Action, utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            {/* Type */}
            <div className="space-y-2">
              <Label>Type d'action</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="CREATE">Création</SelectItem>
                  <SelectItem value="UPDATE">Modification</SelectItem>
                  <SelectItem value="DELETE">Suppression</SelectItem>
                  <SelectItem value="CONFIG">Configuration</SelectItem>
                  <SelectItem value="STATUS">Statut</SelectItem>
                  <SelectItem value="ERROR">Erreur</SelectItem>
                  <SelectItem value="PRICING">Prix</SelectItem>
                  <SelectItem value="STOCK">Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Période */}
            <div className="space-y-2">
              <Label>Période</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les périodes</SelectItem>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historique */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun historique trouvé</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== "all" || dateRange !== "all"
                  ? "Essayez de modifier vos filtres de recherche"
                  : "Aucune action enregistrée pour ce service/produit"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Historique des actions</span>
              <Badge variant="outline">
                {filteredItems.length} action(s)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(item.timestamp)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        {getTypeBadge(item.type)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="font-medium">{item.action}</span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.user}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm text-muted-foreground max-w-xs truncate">
                        {item.details}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total actions</p>
                <p className="text-2xl font-bold">{historyItems.length}</p>
              </div>
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Succès</p>
                <p className="text-2xl font-bold text-green-600">
                  {historyItems.filter(item => item.status === "SUCCESS").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Erreurs</p>
                <p className="text-2xl font-bold text-red-600">
                  {historyItems.filter(item => item.status === "ERROR").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilisateurs</p>
                <p className="text-2xl font-bold">
                  {new Set(historyItems.map(item => item.user)).size}
                </p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}