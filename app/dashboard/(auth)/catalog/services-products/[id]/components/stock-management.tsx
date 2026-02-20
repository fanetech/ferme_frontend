import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  History,
  Edit,
  RefreshCw,
  ArrowUpDown,
  BarChart3,
  Search,
  Calendar,
  User,
  FileText
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
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Components
import { StockAdjustmentForm } from "./stock-adjustment-form";
import { StockMovementHistory } from "./stock-movement-history";
import { StockAlertsConfig } from "./stock-alerts-config";

// Hooks
// TODO: Implement these hooks when stock management API is ready
// import { 
//   useProductStock,
//   useStockMovements,
//   useStockAdjustment,
//   useStockAlerts
// } from "@/data/catalog";
import { ServiceProduct, ServiceNature } from "@/types/catalog";

interface StockManagementProps {
  serviceProduct: ServiceProduct;
  onUpdate?: () => void;
}

export function StockManagement({ serviceProduct, onUpdate }: StockManagementProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease" | null>(null);

  // Temporary mock data until hooks are implemented
  const stockData = serviceProduct.stockData || null;
  const isLoading = false;
  const refetch = () => {};
  const stockMovements = [];
  const stockAlerts = [];
  const adjustStock = () => {};
  const isProcessing = false;

  if (serviceProduct.serviceNature !== ServiceNature.PRODUCT) {
    return (
      <Alert>
        <AlertDescription>
          La gestion des stocks n'est disponible que pour les produits.
        </AlertDescription>
      </Alert>
    );
  }

  const handleQuickAdjustment = (type: "increase" | "decrease") => {
    setAdjustmentType(type);
    setIsAdjusting(true);
  };

  const getStockStatus = (currentStock: number, minStock: number, maxStock: number) => {
    if (currentStock <= minStock) {
      return { status: "critical", color: "bg-red-100 text-red-800", label: "Stock critique" };
    } else if (currentStock <= minStock * 1.5) {
      return { status: "low", color: "bg-orange-100 text-orange-800", label: "Stock faible" };
    } else if (currentStock >= maxStock) {
      return { status: "high", color: "bg-blue-100 text-blue-800", label: "Stock élevé" };
    } else {
      return { status: "normal", color: "bg-green-100 text-green-800", label: "Stock normal" };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <Alert>
        <AlertDescription>
          Aucune donnée de stock disponible pour ce produit.
        </AlertDescription>
      </Alert>
    );
  }

  const stockStatus = getStockStatus(stockData.currentStock, stockData.minStock, stockData.maxStock);

  if (isAdjusting) {
    return (
      <StockAdjustmentForm
        serviceProduct={serviceProduct}
        stockData={stockData}
        adjustmentType={adjustmentType}
        onSuccess={() => {
          setIsAdjusting(false);
          setAdjustmentType(null);
          refetch();
          onUpdate?.();
        }}
        onCancel={() => {
          setIsAdjusting(false);
          setAdjustmentType(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestion des stocks</h2>
          <p className="text-muted-foreground">
            Suivi et gestion des stocks pour {serviceProduct.name}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleQuickAdjustment("increase")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleQuickAdjustment("decrease")}
          >
            <Minus className="h-4 w-4 mr-2" />
            Retirer
          </Button>
        </div>
      </div>

      {/* Aperçu du stock */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock actuel</p>
                <p className="text-2xl font-bold">{stockData.currentStock}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-4">
              <Badge className={stockStatus.color}>
                {stockStatus.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock minimum</p>
                <p className="text-2xl font-bold">{stockData.minStock}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                Seuil d'alerte
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock maximum</p>
                <p className="text-2xl font-bold">{stockData.maxStock}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                Capacité optimale
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valeur stock</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stockData.currentStock * (stockData.unitCost || 0))}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                À {formatCurrency(stockData.unitCost || 0)} l'unité
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes actives */}
      {stockAlerts && stockAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertes actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stockAlerts.map((alert) => (
                <Alert key={alert.id} className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    {alert.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onglets de gestion */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="movements">Mouvements</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations produit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Informations produit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nom du produit</label>
                  <p className="text-sm font-medium">{serviceProduct.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">SKU</label>
                  <p className="text-sm font-mono bg-muted p-2 rounded">
                    {stockData.sku || "Non défini"}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Unité</label>
                  <p className="text-sm">{stockData.unit || "Unité"}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Emplacement</label>
                  <p className="text-sm">{stockData.location || "Non spécifié"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Entrées (30j)</label>
                    <p className="text-2xl font-bold text-green-600">
                      +{stockMovements?.filter(m => m.type === 'IN' && 
                        new Date(m.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                        .reduce((sum, m) => sum + m.quantity, 0) || 0}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sorties (30j)</label>
                    <p className="text-2xl font-bold text-red-600">
                      -{stockMovements?.filter(m => m.type === 'OUT' && 
                        new Date(m.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                        .reduce((sum, m) => sum + m.quantity, 0) || 0}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rotation de stock</label>
                  <p className="text-sm">
                    {stockData.turnoverRate ? `${stockData.turnoverRate.toFixed(1)}x/an` : "Non calculé"}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dernière mise à jour</label>
                  <p className="text-sm">
                    {stockData.lastUpdated ? 
                      new Date(stockData.lastUpdated).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 
                      "Non disponible"
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="movements">
          <StockMovementHistory 
            serviceProduct={serviceProduct}
            stockMovements={stockMovements || []}
          />
        </TabsContent>

        <TabsContent value="alerts">
          <StockAlertsConfig 
            serviceProduct={serviceProduct}
            stockData={stockData}
            onUpdate={() => refetch()}
          />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de stock</CardTitle>
              <CardDescription>
                Configuration des seuils et paramètres de gestion des stocks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="minStock">Stock minimum</Label>
                    <Input
                      id="minStock"
                      type="number"
                      defaultValue={stockData.minStock}
                      placeholder="Seuil minimum"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxStock">Stock maximum</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      defaultValue={stockData.maxStock}
                      placeholder="Seuil maximum"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="unitCost">Coût unitaire (€)</Label>
                    <Input
                      id="unitCost"
                      type="number"
                      step="0.01"
                      defaultValue={stockData.unitCost}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      defaultValue={stockData.sku}
                      placeholder="Code produit"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Emplacement</Label>
                    <Input
                      id="location"
                      defaultValue={stockData.location}
                      placeholder="Lieu de stockage"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="unit">Unité</Label>
                    <Select defaultValue={stockData.unit || "piece"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une unité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="piece">Pièce</SelectItem>
                        <SelectItem value="kg">Kilogramme</SelectItem>
                        <SelectItem value="g">Gramme</SelectItem>
                        <SelectItem value="l">Litre</SelectItem>
                        <SelectItem value="ml">Millilitre</SelectItem>
                        <SelectItem value="m">Mètre</SelectItem>
                        <SelectItem value="cm">Centimètre</SelectItem>
                        <SelectItem value="box">Boîte</SelectItem>
                        <SelectItem value="pack">Pack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button>
                  Enregistrer les paramètres
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}