import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertTriangle, 
  Bell, 
  Mail, 
  MessageSquare,
  Save,
  Plus,
  Trash2,
  Settings,
  CheckCircle,
  XCircle,
  Edit
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

// Hooks
// TODO: Implement these hooks when stock alerts API is ready
// import { 
//   useStockAlerts,
//   useCreateStockAlert,
//   useUpdateStockAlert,
//   useDeleteStockAlert
// } from "@/data/catalog";
import { ServiceProduct, StockData, StockAlert } from "@/types/catalog";

const stockAlertSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  type: z.enum(["LOW_STOCK", "HIGH_STOCK", "OUT_OF_STOCK", "EXPIRY_DATE"]),
  condition: z.enum(["LESS_THAN", "GREATER_THAN", "EQUALS"]),
  threshold: z.number().min(0, "Le seuil doit être positif"),
  isActive: z.boolean().default(true),
  notificationMethods: z.array(z.enum(["EMAIL", "SMS", "PUSH", "WEBHOOK"])).min(1, "Au moins une méthode de notification est requise"),
  recipients: z.array(z.string()).min(1, "Au moins un destinataire est requis"),
  message: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM")
});

type StockAlertFormData = z.infer<typeof stockAlertSchema>;

interface StockAlertsConfigProps {
  serviceProduct: ServiceProduct;
  stockData: StockData;
  onUpdate?: () => void;
}

export function StockAlertsConfig({ serviceProduct, stockData, onUpdate }: StockAlertsConfigProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingAlert, setEditingAlert] = useState<StockAlert | null>(null);

  // Temporary mock data until hooks are implemented
  const alerts = [];
  const isLoading = false;
  const refetch = () => {};
  const createAlert = () => {};
  const isCreatingAlert = false;
  const updateAlert = () => {};
  const isUpdatingAlert = false;
  const deleteAlert = () => {};
  const isDeletingAlert = false;

  const form = useForm<StockAlertFormData>({
    resolver: zodResolver(stockAlertSchema),
    defaultValues: {
      name: "",
      type: "LOW_STOCK",
      condition: "LESS_THAN",
      threshold: stockData.minStock || 10,
      isActive: true,
      notificationMethods: ["EMAIL"],
      recipients: [],
      message: "",
      priority: "MEDIUM"
    }
  });

  const onSubmit = (data: StockAlertFormData) => {
    if (editingAlert) {
      updateAlert({
        id: editingAlert.id,
        ...data,
        productId: serviceProduct.id
      }, {
        onSuccess: () => {
          setEditingAlert(null);
          refetch();
          onUpdate?.();
        }
      });
    } else {
      createAlert({
        ...data,
        productId: serviceProduct.id
      }, {
        onSuccess: () => {
          setIsCreating(false);
          form.reset();
          refetch();
          onUpdate?.();
        }
      });
    }
  };

  const handleEdit = (alert: StockAlert) => {
    setEditingAlert(alert);
    form.reset({
      name: alert.name,
      type: alert.type,
      condition: alert.condition,
      threshold: alert.threshold,
      isActive: alert.isActive,
      notificationMethods: alert.notificationMethods,
      recipients: alert.recipients,
      message: alert.message || "",
      priority: alert.priority
    });
  };

  const handleDelete = (alert: StockAlert) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'alerte "${alert.name}" ?`)) {
      deleteAlert(alert.id, {
        onSuccess: () => {
          refetch();
          onUpdate?.();
        }
      });
    }
  };

  const getAlertTypeLabel = (type: string) => {
    const labels = {
      LOW_STOCK: "Stock faible",
      HIGH_STOCK: "Stock élevé",
      OUT_OF_STOCK: "Rupture de stock",
      EXPIRY_DATE: "Date d'expiration"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case "LOW_STOCK":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "HIGH_STOCK":
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case "OUT_OF_STOCK":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "EXPIRY_DATE":
        return <AlertTriangle className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {priority}
      </Badge>
    );
  };

  const getNotificationMethodIcon = (method: string) => {
    switch (method) {
      case "EMAIL":
        return <Mail className="h-3 w-3" />;
      case "SMS":
        return <MessageSquare className="h-3 w-3" />;
      case "PUSH":
        return <Bell className="h-3 w-3" />;
      case "WEBHOOK":
        return <Settings className="h-3 w-3" />;
      default:
        return <Bell className="h-3 w-3" />;
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Configuration des alertes</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les alertes de stock pour {serviceProduct.name}
          </p>
        </div>
        
        <Button 
          onClick={() => setIsCreating(true)}
          disabled={isCreating || editingAlert !== null}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle alerte
        </Button>
      </div>

      {/* Alertes prédéfinies */}
      <Card>
        <CardHeader>
          <CardTitle>Alertes recommandées</CardTitle>
          <CardDescription>
            Créez rapidement des alertes basées sur vos seuils de stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <h4 className="font-medium">Stock faible</h4>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    form.reset({
                      name: "Stock faible - " + serviceProduct.name,
                      type: "LOW_STOCK",
                      condition: "LESS_THAN",
                      threshold: stockData.minStock || 10,
                      isActive: true,
                      notificationMethods: ["EMAIL"],
                      recipients: [],
                      priority: "HIGH"
                    });
                    setIsCreating(true);
                  }}
                >
                  Créer
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Alerte quand le stock passe en dessous de {stockData.minStock || 10} unités
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <h4 className="font-medium">Rupture de stock</h4>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    form.reset({
                      name: "Rupture de stock - " + serviceProduct.name,
                      type: "OUT_OF_STOCK",
                      condition: "EQUALS",
                      threshold: 0,
                      isActive: true,
                      notificationMethods: ["EMAIL", "SMS"],
                      recipients: [],
                      priority: "CRITICAL"
                    });
                    setIsCreating(true);
                  }}
                >
                  Créer
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Alerte critique quand le stock atteint 0
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de création/édition */}
      {(isCreating || editingAlert) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAlert ? "Modifier l'alerte" : "Nouvelle alerte"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'alerte</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Ex: Stock faible produit X"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Type d'alerte</Label>
                  <Select 
                    value={form.watch("type")} 
                    onValueChange={(value) => form.setValue("type", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW_STOCK">Stock faible</SelectItem>
                      <SelectItem value="HIGH_STOCK">Stock élevé</SelectItem>
                      <SelectItem value="OUT_OF_STOCK">Rupture de stock</SelectItem>
                      <SelectItem value="EXPIRY_DATE">Date d'expiration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select 
                    value={form.watch("condition")} 
                    onValueChange={(value) => form.setValue("condition", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LESS_THAN">Inférieur à</SelectItem>
                      <SelectItem value="GREATER_THAN">Supérieur à</SelectItem>
                      <SelectItem value="EQUALS">Égal à</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="threshold">Seuil</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="0"
                    {...form.register("threshold", { valueAsNumber: true })}
                    placeholder="Valeur seuil"
                  />
                  {form.formState.errors.threshold && (
                    <p className="text-sm text-red-600">{form.formState.errors.threshold.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priorité</Label>
                  <Select 
                    value={form.watch("priority")} 
                    onValueChange={(value) => form.setValue("priority", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Faible</SelectItem>
                      <SelectItem value="MEDIUM">Moyenne</SelectItem>
                      <SelectItem value="HIGH">Élevée</SelectItem>
                      <SelectItem value="CRITICAL">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipients">Destinataires (emails)</Label>
                  <Input
                    id="recipients"
                    placeholder="admin@example.com, user@example.com"
                    onChange={(e) => {
                      const emails = e.target.value.split(',').map(email => email.trim()).filter(Boolean);
                      form.setValue("recipients", emails);
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Méthodes de notification</Label>
                <div className="flex flex-wrap gap-2">
                  {["EMAIL", "SMS", "PUSH", "WEBHOOK"].map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={method}
                        checked={form.watch("notificationMethods").includes(method as any)}
                        onChange={(e) => {
                          const current = form.watch("notificationMethods");
                          if (e.target.checked) {
                            form.setValue("notificationMethods", [...current, method as any]);
                          } else {
                            form.setValue("notificationMethods", current.filter(m => m !== method));
                          }
                        }}
                      />
                      <Label htmlFor={method} className="flex items-center gap-1">
                        {getNotificationMethodIcon(method)}
                        {method}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message personnalisé (optionnel)</Label>
                <Input
                  id="message"
                  {...form.register("message")}
                  placeholder="Message d'alerte personnalisé"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={form.watch("isActive")}
                    onCheckedChange={(checked) => form.setValue("isActive", checked)}
                  />
                  <Label htmlFor="isActive">Alerte active</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreating(false);
                      setEditingAlert(null);
                      form.reset();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isCreatingAlert || isUpdatingAlert}>
                    <Save className="h-4 w-4 mr-2" />
                    {isCreatingAlert || isUpdatingAlert ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des alertes */}
      {alerts && alerts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Alertes configurées</span>
              <Badge variant="outline">
                {alerts.length} alerte(s)
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Notifications</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAlertTypeIcon(alert.type)}
                        <span className="font-medium">{alert.name}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline">
                        {getAlertTypeLabel(alert.type)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm">
                        {alert.condition} {alert.threshold}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      {getPriorityBadge(alert.priority)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {alert.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-sm">
                          {alert.isActive ? "Actif" : "Inactif"}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-1">
                        {alert.notificationMethods.map((method) => (
                          <div key={method} className="flex items-center gap-1">
                            {getNotificationMethodIcon(method)}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(alert)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(alert)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune alerte configurée</h3>
              <p className="text-muted-foreground mb-4">
                Configurez des alertes pour être notifié des changements de stock
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une alerte
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}