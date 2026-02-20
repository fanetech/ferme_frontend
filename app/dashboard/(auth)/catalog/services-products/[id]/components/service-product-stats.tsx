import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, DollarSign, Package, Calendar, Activity } from "lucide-react";
import { ServiceProduct, ServiceNature } from "@/types/catalog";

interface ServiceProductStatsProps {
  serviceProduct: ServiceProduct;
}

export function ServiceProductStats({ serviceProduct }: ServiceProductStatsProps) {
  // Données de démonstration - à remplacer par de vraies données
  const stats = {
    totalOrders: 145,
    revenue: 25430.50,
    usage: 89,
    growth: 12.5,
    lastMonth: {
      orders: 132,
      revenue: 22100.25,
      usage: 82
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getGrowthBadge = (growth: number) => {
    if (growth > 0) {
      return <Badge className="bg-green-100 text-green-800">+{growth}%</Badge>;
    } else if (growth < 0) {
      return <Badge className="bg-red-100 text-red-800">{growth}%</Badge>;
    }
    return <Badge variant="secondary">0%</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium">Statistiques</h3>
        <p className="text-sm text-muted-foreground">
          Analyse des performances pour {serviceProduct.name}
        </p>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {serviceProduct.serviceNature === ServiceNature.PRODUCT ? "Commandes" : "Utilisations"}
                </p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                +{stats.totalOrders - stats.lastMonth.orders} ce mois
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              {getGrowthBadge(stats.growth)}
              <span className="text-sm text-muted-foreground">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux d'utilisation</p>
                <p className="text-2xl font-bold">{stats.usage}%</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.usage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Croissance</p>
                <p className="text-2xl font-bold">{stats.growth}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sur 30 jours</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails par nature de service */}
      {serviceProduct.serviceNature === ServiceNature.PRODUCT && (
        <Card>
          <CardHeader>
            <CardTitle>Statistiques de stock</CardTitle>
            <CardDescription>
              Métriques liées à la gestion des stocks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Rotation moyenne</p>
                <p className="text-2xl font-bold">2.3x</p>
                <p className="text-xs text-muted-foreground">par mois</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Temps de rupture</p>
                <p className="text-2xl font-bold">2.1</p>
                <p className="text-xs text-muted-foreground">jours/mois</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Valeur moyenne</p>
                <p className="text-2xl font-bold">{formatCurrency(1250)}</p>
                <p className="text-xs text-muted-foreground">en stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {serviceProduct.serviceNature === ServiceNature.EXTERNAL_SERVICE && (
        <Card>
          <CardHeader>
            <CardTitle>Statistiques API</CardTitle>
            <CardDescription>
              Métriques d'utilisation des services externes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Appels API</p>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-xs text-muted-foreground">ce mois</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Taux de succès</p>
                <p className="text-2xl font-bold">99.2%</p>
                <p className="text-xs text-muted-foreground">disponibilité</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Temps de réponse</p>
                <p className="text-2xl font-bold">245ms</p>
                <p className="text-xs text-muted-foreground">moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {serviceProduct.serviceNature === ServiceNature.INTERNAL_SERVICE && (
        <Card>
          <CardHeader>
            <CardTitle>Statistiques de service</CardTitle>
            <CardDescription>
              Métriques d'utilisation des services internes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Demandes traitées</p>
                <p className="text-2xl font-bold">567</p>
                <p className="text-xs text-muted-foreground">ce mois</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Temps de traitement</p>
                <p className="text-2xl font-bold">1.8h</p>
                <p className="text-xs text-muted-foreground">moyenne</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">4.6/5</p>
                <p className="text-xs text-muted-foreground">note moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graphique de tendance placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Tendances</CardTitle>
          <CardDescription>
            Évolution des métriques sur les 30 derniers jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Graphique de tendances</p>
              <p className="text-sm text-muted-foreground">Intégration avec un système de graphiques à prévoir</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}