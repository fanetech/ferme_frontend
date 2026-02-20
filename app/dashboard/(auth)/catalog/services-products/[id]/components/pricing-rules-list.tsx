import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calculator, 
  Search,
  MoreHorizontal,
  Percent,
  DollarSign,
  TrendingUp,
  Target,
  Users,
  Calendar
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
import { PricingRuleForm } from "./pricing-rule-form";

// Hooks
import { 
  usePricingRules,
  useDeletePricingRule
} from "@/data/catalog";
import { ServiceConfig, PricingRule } from "@/types/catalog";

interface PricingRulesListProps {
  serviceConfig?: ServiceConfig;
  onUpdate?: () => void;
}

export function PricingRulesList({ serviceConfig, onUpdate }: PricingRulesListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

  // Récupérer les règles de pricing
  const { 
    data: pricingRules, 
    isLoading 
  } = usePricingRules(serviceConfig?.id || "", !!serviceConfig?.id);
  
  const { mutate: deleteRule, isPending: isDeleting } = useDeletePricingRule();

  if (!serviceConfig) {
    return (
      <Alert>
        <AlertDescription>
          Aucune configuration de service trouvée. Créez d'abord une configuration de service.
        </AlertDescription>
      </Alert>
    );
  }

  const filteredRules = pricingRules?.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (rule: PricingRule) => {
    setEditingRule(rule);
  };

  const handleDelete = (rule: PricingRule) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la règle "${rule.name}" ?`)) {
      deleteRule({ 
        id: rule.id, 
        serviceConfigId: serviceConfig.id 
      }, {
        onSuccess: () => {
          onUpdate?.();
        }
      });
    }
  };

  const getRuleTypeBadge = (type: string) => {
    const colors = {
      FIXED: "bg-blue-100 text-blue-800",
      PERCENTAGE: "bg-green-100 text-green-800",
      TIERED: "bg-purple-100 text-purple-800",
      QUANTITY_BASED: "bg-orange-100 text-orange-800",
      TIME_BASED: "bg-pink-100 text-pink-800"
    };
    
    const labels = {
      FIXED: "Fixe",
      PERCENTAGE: "Pourcentage",
      TIERED: "Échelonné",
      QUANTITY_BASED: "Basé quantité",
      TIME_BASED: "Basé temps"
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Actif</Badge>
    ) : (
      <Badge variant="secondary">Inactif</Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FIXED':
        return <DollarSign className="h-4 w-4" />;
      case 'PERCENTAGE':
        return <Percent className="h-4 w-4" />;
      case 'TIERED':
        return <TrendingUp className="h-4 w-4" />;
      case 'QUANTITY_BASED':
        return <Target className="h-4 w-4" />;
      case 'TIME_BASED':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Calculator className="h-4 w-4" />;
    }
  };

  if (isCreating) {
    return (
      <PricingRuleForm
        serviceConfig={serviceConfig}
        onSuccess={() => {
          setIsCreating(false);
          onUpdate?.();
        }}
        onCancel={() => setIsCreating(false)}
      />
    );
  }

  if (editingRule) {
    return (
      <PricingRuleForm
        serviceConfig={serviceConfig}
        pricingRule={editingRule}
        onSuccess={() => {
          setEditingRule(null);
          onUpdate?.();
        }}
        onCancel={() => setEditingRule(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Règles de pricing</h3>
          <p className="text-sm text-muted-foreground">
            Configurez les méthodes de calcul des prix pour ce service interne
          </p>
        </div>
        
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle règle
        </Button>
      </div>

      {/* Informations du service */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Calculator className="h-8 w-8 text-muted-foreground" />
            <div>
              <h4 className="font-medium">{serviceConfig.name}</h4>
              <p className="text-sm text-muted-foreground">
                Service interne avec calculs de prix personnalisés
              </p>
            </div>
            <div className="ml-auto">
              <Badge variant={serviceConfig.isActive ? "default" : "secondary"}>
                {serviceConfig.isActive ? "Actif" : "Inactif"}
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
            placeholder="Rechercher une règle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="text-sm text-muted-foreground">
          {filteredRules.length} règle(s)
        </div>
      </div>

      {/* Liste des règles */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : filteredRules.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm ? "Aucune règle trouvée" : "Aucune règle de pricing configurée"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Essayez de modifier votre recherche"
                  : "Créez des règles de pricing pour automatiser le calcul des prix"
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une règle
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Règles de pricing configurées</span>
              <Badge variant="outline">
                {filteredRules.length} règle(s)
              </Badge>
            </CardTitle>
            <CardDescription>
              Gestion des règles de calcul des prix pour le service interne
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(rule.type)}
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          {rule.description && (
                            <div className="text-sm text-muted-foreground">
                              {rule.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getRuleTypeBadge(rule.type)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {rule.type === 'FIXED' && (
                          <div className="font-medium">
                            {formatCurrency(rule.value)}
                          </div>
                        )}
                        {rule.type === 'PERCENTAGE' && (
                          <div className="font-medium">
                            {rule.value}%
                          </div>
                        )}
                        {rule.type === 'TIERED' && (
                          <div className="text-sm">
                            {rule.tiers?.length || 0} niveau(x)
                          </div>
                        )}
                        {rule.basePrice && (
                          <div className="text-xs text-muted-foreground">
                            Base: {formatCurrency(rule.basePrice)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {rule.minQuantity && (
                          <Badge variant="outline" className="text-xs">
                            Min: {rule.minQuantity}
                          </Badge>
                        )}
                        {rule.maxQuantity && (
                          <Badge variant="outline" className="text-xs">
                            Max: {rule.maxQuantity}
                          </Badge>
                        )}
                        {rule.conditions?.length && (
                          <Badge variant="outline" className="text-xs">
                            {rule.conditions.length} condition(s)
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(rule.isActive)}
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(rule)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(rule)}
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
            <div className="text-2xl font-bold">{pricingRules?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total règles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {pricingRules?.filter(r => r.isActive).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Actives</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {pricingRules?.filter(r => r.type === 'TIERED').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Échelonnées</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {pricingRules?.reduce((total, r) => total + (r.conditions?.length || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Conditions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}