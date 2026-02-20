import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Download,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Calendar,
  User,
  FileText,
  Package,
  ArrowUpDown
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Types
import { ServiceProduct, StockMovement } from "@/types/catalog";

interface StockMovementHistoryProps {
  serviceProduct: ServiceProduct;
  stockMovements: StockMovement[];
}

export function StockMovementHistory({ serviceProduct, stockMovements }: StockMovementHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterReason, setFilterReason] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  const filteredMovements = stockMovements
    .filter(movement => {
      // Filter by search term
      const searchMatch = !searchTerm || 
        movement.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.createdBy?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by type
      const typeMatch = filterType === "all" || movement.type === filterType;
      
      // Filter by reason
      const reasonMatch = filterReason === "all" || movement.reason === filterReason;
      
      // Filter by date range
      let dateMatch = true;
      if (dateRange !== "all") {
        const movementDate = new Date(movement.createdAt);
        const now = new Date();
        
        switch (dateRange) {
          case "today":
            dateMatch = movementDate.toDateString() === now.toDateString();
            break;
          case "week":
            dateMatch = movementDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "month":
            dateMatch = movementDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "year":
            dateMatch = movementDate.getFullYear() === now.getFullYear();
            break;
        }
      }
      
      return searchMatch && typeMatch && reasonMatch && dateMatch;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "IN":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "OUT":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "ADJUSTMENT":
        return <RotateCcw className="h-4 w-4 text-blue-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      IN: "bg-green-100 text-green-800",
      OUT: "bg-red-100 text-red-800",
      ADJUSTMENT: "bg-blue-100 text-blue-800"
    };
    
    const labels = {
      IN: "Entrée",
      OUT: "Sortie",
      ADJUSTMENT: "Ajustement"
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getReasonLabel = (reason: string) => {
    const labels = {
      PURCHASE: "Achat",
      SALE: "Vente",
      RETURN: "Retour",
      DAMAGE: "Dommage",
      LOSS: "Perte",
      INVENTORY: "Inventaire",
      TRANSFER: "Transfert",
      PRODUCTION: "Production",
      CONSUMPTION: "Consommation",
      CORRECTION: "Correction",
      OTHER: "Autre"
    };
    return labels[reason as keyof typeof labels] || reason;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Motif', 'Quantité', 'Référence', 'Utilisateur', 'Notes'];
    const rows = filteredMovements.map(movement => [
      formatDate(movement.createdAt),
      movement.type,
      getReasonLabel(movement.reason),
      movement.quantity.toString(),
      movement.reference || '',
      movement.createdBy || '',
      movement.notes || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `stock-history-${serviceProduct.name}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Historique des mouvements</h3>
          <p className="text-sm text-muted-foreground">
            {filteredMovements.length} mouvement(s) trouvé(s)
          </p>
        </div>
        
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="space-y-2">
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Référence, notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            {/* Type */}
            <div className="space-y-2">
              <Label>Type de mouvement</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="IN">Entrées</SelectItem>
                  <SelectItem value="OUT">Sorties</SelectItem>
                  <SelectItem value="ADJUSTMENT">Ajustements</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Motif */}
            <div className="space-y-2">
              <Label>Motif</Label>
              <Select value={filterReason} onValueChange={setFilterReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les motifs</SelectItem>
                  <SelectItem value="PURCHASE">Achat</SelectItem>
                  <SelectItem value="SALE">Vente</SelectItem>
                  <SelectItem value="RETURN">Retour</SelectItem>
                  <SelectItem value="DAMAGE">Dommage</SelectItem>
                  <SelectItem value="LOSS">Perte</SelectItem>
                  <SelectItem value="INVENTORY">Inventaire</SelectItem>
                  <SelectItem value="TRANSFER">Transfert</SelectItem>
                  <SelectItem value="PRODUCTION">Production</SelectItem>
                  <SelectItem value="CONSUMPTION">Consommation</SelectItem>
                  <SelectItem value="CORRECTION">Correction</SelectItem>
                  <SelectItem value="OTHER">Autre</SelectItem>
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
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des mouvements */}
      {filteredMovements.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun mouvement trouvé</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== "all" || filterReason !== "all" || dateRange !== "all"
                  ? "Essayez de modifier vos filtres de recherche"
                  : "Aucun mouvement de stock enregistré pour ce produit"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Mouvements de stock</span>
              <Badge variant="outline">
                {filteredMovements.length} mouvement(s)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(movement.createdAt)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(movement.type)}
                        {getTypeBadge(movement.type)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm">{getReasonLabel(movement.reason)}</span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className={`font-medium ${
                          movement.type === "IN" ? "text-green-600" : 
                          movement.type === "OUT" ? "text-red-600" : 
                          "text-blue-600"
                        }`}>
                          {movement.type === "IN" ? "+" : movement.type === "OUT" ? "-" : ""}
                          {movement.quantity}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          {movement.unit || "pcs"}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {movement.reference ? (
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {movement.reference}
                        </code>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {movement.unitCost ? (
                        <div className="text-sm">
                          <div>{formatCurrency(movement.unitCost * movement.quantity)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(movement.unitCost)}/unité
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{movement.createdBy || "Système"}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {movement.notes ? (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm max-w-xs truncate" title={movement.notes}>
                            {movement.notes}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total entrées</p>
                <p className="text-2xl font-bold text-green-600">
                  +{filteredMovements
                    .filter(m => m.type === "IN")
                    .reduce((sum, m) => sum + m.quantity, 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total sorties</p>
                <p className="text-2xl font-bold text-red-600">
                  -{filteredMovements
                    .filter(m => m.type === "OUT")
                    .reduce((sum, m) => sum + m.quantity, 0)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ajustements</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredMovements.filter(m => m.type === "ADJUSTMENT").length}
                </p>
              </div>
              <RotateCcw className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}