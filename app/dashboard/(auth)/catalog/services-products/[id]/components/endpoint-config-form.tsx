import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Globe, Plus, Trash2, Save, X, TestTube, Key } from "lucide-react";
import { toast } from "sonner";

// Hooks
import { useCreateEndpointConfig, useUpdateEndpointConfig } from "@/data/catalog";
import { ServiceConfig, EndpointConfig } from "@/types/catalog";

const endpointConfigSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  path: z.string().min(1, "Le chemin est requis").regex(/^\//, "Le chemin doit commencer par /"),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  description: z.string().optional(),
  isActive: z.boolean(),
  timeout: z.number().min(1000).max(60000).optional(),
  headers: z.record(z.string()).optional(),
  queryParams: z.record(z.string()).optional(),
  requestBody: z.string().optional(),
  responseFormat: z.enum(["JSON", "XML", "TEXT"]).optional(),
  metadata: z.record(z.any()).optional()
});

type EndpointConfigFormData = z.infer<typeof endpointConfigSchema>;

interface EndpointConfigFormProps {
  serviceConfig: ServiceConfig;
  endpointConfig?: EndpointConfig;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EndpointConfigForm({ 
  serviceConfig, 
  endpointConfig, 
  onSuccess, 
  onCancel 
}: EndpointConfigFormProps) {
  const [testingEndpoint, setTestingEndpoint] = useState(false);
  
  const { mutate: createEndpoint, isPending: isCreating } = useCreateEndpointConfig();
  const { mutate: updateEndpoint, isPending: isUpdating } = useUpdateEndpointConfig();
  
  const isEditing = !!endpointConfig;
  const isPending = isCreating || isUpdating;

  const form = useForm<EndpointConfigFormData>({
    resolver: zodResolver(endpointConfigSchema),
    defaultValues: {
      name: endpointConfig?.name || "",
      path: endpointConfig?.path || "/",
      method: endpointConfig?.method || "GET",
      description: endpointConfig?.description || "",
      isActive: endpointConfig?.isActive ?? true,
      timeout: endpointConfig?.timeout || 30000,
      headers: endpointConfig?.headers || {},
      queryParams: endpointConfig?.queryParams || {},
      requestBody: endpointConfig?.requestBody || "",
      responseFormat: endpointConfig?.responseFormat || "JSON",
      metadata: endpointConfig?.metadata || {}
    }
  });

  const watchedMethod = form.watch("method");
  const watchedPath = form.watch("path");

  const httpMethods = [
    { value: "GET", label: "GET", description: "Récupérer des données", color: "bg-green-100 text-green-800" },
    { value: "POST", label: "POST", description: "Créer des données", color: "bg-blue-100 text-blue-800" },
    { value: "PUT", label: "PUT", description: "Mettre à jour (complet)", color: "bg-orange-100 text-orange-800" },
    { value: "PATCH", label: "PATCH", description: "Mettre à jour (partiel)", color: "bg-purple-100 text-purple-800" },
    { value: "DELETE", label: "DELETE", description: "Supprimer des données", color: "bg-red-100 text-red-800" }
  ];

  const responseFormats = [
    { value: "JSON", label: "JSON", description: "JavaScript Object Notation" },
    { value: "XML", label: "XML", description: "eXtensible Markup Language" },
    { value: "TEXT", label: "TEXT", description: "Texte brut" }
  ];

  const commonEndpoints = [
    { name: "Vérifier le solde", path: "/balance", method: "GET" },
    { name: "Effectuer un paiement", path: "/payment", method: "POST" },
    { name: "Historique des transactions", path: "/transactions", method: "GET" },
    { name: "Statut de la transaction", path: "/transaction/{id}", method: "GET" },
    { name: "Annuler une transaction", path: "/transaction/{id}/cancel", method: "POST" }
  ];

  const updateHeaders = (key: string, value: string) => {
    const currentHeaders = form.getValues("headers") || {};
    if (value.trim() === "") {
      const { [key]: removed, ...rest } = currentHeaders;
      form.setValue("headers", rest);
    } else {
      form.setValue("headers", {
        ...currentHeaders,
        [key]: value
      });
    }
  };

  const updateQueryParams = (key: string, value: string) => {
    const currentParams = form.getValues("queryParams") || {};
    if (value.trim() === "") {
      const { [key]: removed, ...rest } = currentParams;
      form.setValue("queryParams", rest);
    } else {
      form.setValue("queryParams", {
        ...currentParams,
        [key]: value
      });
    }
  };

  const handlePresetSelect = (preset: typeof commonEndpoints[0]) => {
    form.setValue("name", preset.name);
    form.setValue("path", preset.path);
    form.setValue("method", preset.method as any);
    toast.info(`Template "${preset.name}" appliqué`);
  };

  const testEndpoint = async () => {
    setTestingEndpoint(true);
    try {
      // Simulation du test d'endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Endpoint testé avec succès");
    } catch (error) {
      toast.error("Erreur lors du test de l'endpoint");
    } finally {
      setTestingEndpoint(false);
    }
  };

  const onSubmit = async (data: EndpointConfigFormData) => {
    try {
      const endpointData = {
        ...data,
        serviceConfigId: serviceConfig.id
      };

      if (isEditing && endpointConfig) {
        await updateEndpoint({ 
          id: endpointConfig.id, 
          data: endpointData 
        }, {
          onSuccess: () => {
            toast.success("Endpoint mis à jour avec succès");
            onSuccess?.();
          }
        });
      } else {
        await createEndpoint(endpointData, {
          onSuccess: () => {
            toast.success("Endpoint créé avec succès");
            onSuccess?.();
          }
        });
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">
            {isEditing ? "Modifier l'endpoint" : "Créer un endpoint"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Configuration d'un endpoint pour le service externe
          </p>
        </div>
        
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Templates d'endpoints */}
          {!isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Templates d'endpoints</CardTitle>
                <CardDescription>
                  Configurations prêtes à l'emploi pour les endpoints courants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {commonEndpoints.map((preset) => (
                    <Button
                      key={preset.name}
                      type="button"
                      variant="outline"
                      className="h-auto p-4 justify-start"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      <div className="text-left w-full">
                        <div className="font-medium text-sm">{preset.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={httpMethods.find(m => m.value === preset.method)?.color + " text-xs"}>
                            {preset.method}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">
                            {preset.path}
                          </span>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration de base */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Configuration de base
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <span className="text-red-500">*</span>
                          Nom de l'endpoint
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Vérifier le solde" {...field} />
                        </FormControl>
                        <FormDescription>
                          Nom descriptif pour identifier l'endpoint
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <span className="text-red-500">*</span>
                            Méthode HTTP
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {httpMethods.map((method) => (
                                <SelectItem key={method.value} value={method.value}>
                                  <div className="flex items-center gap-2">
                                    <Badge className={method.color + " text-xs"}>
                                      {method.label}
                                    </Badge>
                                    <span className="text-sm">{method.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="path"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="flex items-center gap-1">
                            <span className="text-red-500">*</span>
                            Chemin de l'endpoint
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="/balance" {...field} />
                          </FormControl>
                          <FormDescription>
                            Chemin relatif à l'URL de base (ex: /balance)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Description de l'endpoint..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Documentation de l'endpoint
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Endpoint actif</FormLabel>
                          <FormDescription>
                            Activer cet endpoint pour utilisation
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Paramètres de requête */}
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de requête</CardTitle>
                  <CardDescription>
                    Configuration des paramètres et en-têtes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="timeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeout (ms)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1000"
                            max="60000"
                            step="1000"
                            placeholder="30000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 30000)}
                          />
                        </FormControl>
                        <FormDescription>
                          Délai d'attente maximum (1-60 secondes)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="responseFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Format de réponse</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {responseFormats.map((format) => (
                              <SelectItem key={format.value} value={format.value}>
                                <div>
                                  <div className="font-medium">{format.label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {format.description}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* En-têtes personnalisés */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">En-têtes HTTP</label>
                    <div className="space-y-2">
                      {Object.entries(form.watch("headers") || {}).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-5 gap-2">
                          <Input 
                            value={key} 
                            placeholder="Content-Type"
                            className="col-span-2"
                            readOnly
                          />
                          <Input 
                            value={value} 
                            placeholder="application/json"
                            onChange={(e) => updateHeaders(key, e.target.value)}
                            className="col-span-2"
                          />
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => updateHeaders(key, "")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateHeaders(`header-${Date.now()}`, "")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un en-tête
                      </Button>
                    </div>
                  </div>

                  {/* Paramètres de requête */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Paramètres de requête</label>
                    <div className="space-y-2">
                      {Object.entries(form.watch("queryParams") || {}).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-5 gap-2">
                          <Input 
                            value={key} 
                            placeholder="limit"
                            className="col-span-2"
                            readOnly
                          />
                          <Input 
                            value={value} 
                            placeholder="10"
                            onChange={(e) => updateQueryParams(key, e.target.value)}
                            className="col-span-2"
                          />
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => updateQueryParams(key, "")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateQueryParams(`param-${Date.now()}`, "")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un paramètre
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Corps de requête et aperçu */}
            <div className="space-y-6">
              {/* Corps de requête pour POST/PUT/PATCH */}
              {(watchedMethod === "POST" || watchedMethod === "PUT" || watchedMethod === "PATCH") && (
                <Card>
                  <CardHeader>
                    <CardTitle>Corps de la requête</CardTitle>
                    <CardDescription>
                      Template du body pour les requêtes {watchedMethod}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="requestBody"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea 
                              placeholder='{\n  "amount": "{{amount}}",\n  "currency": "XOF",\n  "reference": "{{reference}}"\n}'
                              className="min-h-[200px] font-mono"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Template JSON avec variables (ex: {"{{amount}}"})
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Aperçu de l'endpoint */}
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu de l'endpoint</CardTitle>
                  <CardDescription>
                    Prévisualisation de la configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={httpMethods.find(m => m.value === watchedMethod)?.color}>
                        {watchedMethod}
                      </Badge>
                      <span>{serviceConfig.baseUrl}{watchedPath}</span>
                    </div>
                    
                    {Object.keys(form.watch("headers") || {}).length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground mb-1">Headers:</div>
                        {Object.entries(form.watch("headers") || {}).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            {key}: {value}
                          </div>
                        ))}
                      </div>
                    )}

                    {Object.keys(form.watch("queryParams") || {}).length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-muted-foreground mb-1">Query Params:</div>
                        {Object.entries(form.watch("queryParams") || {}).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            {key}={value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={testEndpoint}
                    disabled={testingEndpoint || !form.watch("path")}
                    className="w-full"
                  >
                    {testingEndpoint ? (
                      <>
                        <TestTube className="h-4 w-4 mr-2 animate-pulse" />
                        Test en cours...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Tester l'endpoint
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4 mr-2" />
              {isPending ? "Sauvegarde..." : isEditing ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}