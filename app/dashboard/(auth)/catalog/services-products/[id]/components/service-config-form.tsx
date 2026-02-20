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
import { Settings, Globe, Key, Clock, RefreshCw, Save, X, TestTube } from "lucide-react";
import { toast } from "sonner";

// Hooks
import { useCreateServiceConfig, useUpdateServiceConfig } from "@/data/catalog";
import { ServiceProduct, ServiceConfig } from "@/types/catalog";

const serviceConfigSchema = z.object({
  baseUrl: z.string().url("URL invalide").min(1, "L'URL est requise"),
  authType: z.enum(["NONE", "API_KEY", "BASIC", "BEARER", "OAUTH2"]),
  authData: z.record(z.string()).optional(),
  timeout: z.number().min(1000).max(60000),
  retryCount: z.number().min(0).max(10),
  isActive: z.boolean(),
  description: z.string().optional(),
  headers: z.record(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

type ServiceConfigFormData = z.infer<typeof serviceConfigSchema>;

interface ServiceConfigFormProps {
  serviceProduct: ServiceProduct;
  serviceConfig?: ServiceConfig;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ServiceConfigForm({ 
  serviceProduct, 
  serviceConfig, 
  onSuccess, 
  onCancel 
}: ServiceConfigFormProps) {
  const [testingConnection, setTestingConnection] = useState(false);
  
  const { mutate: createConfig, isPending: isCreating } = useCreateServiceConfig();
  const { mutate: updateConfig, isPending: isUpdating } = useUpdateServiceConfig();
  
  const isEditing = !!serviceConfig;
  const isPending = isCreating || isUpdating;

  const form = useForm<ServiceConfigFormData>({
    resolver: zodResolver(serviceConfigSchema),
    defaultValues: {
      baseUrl: serviceConfig?.baseUrl || "",
      authType: serviceConfig?.authType || "NONE",
      authData: serviceConfig?.authData || {},
      timeout: serviceConfig?.timeout || 30000,
      retryCount: serviceConfig?.retryCount || 3,
      isActive: serviceConfig?.isActive ?? true,
      description: serviceConfig?.description || "",
      headers: serviceConfig?.headers || {},
      metadata: serviceConfig?.metadata || {}
    }
  });

  const watchedAuthType = form.watch("authType");

  const authTypes = [
    { value: "NONE", label: "Aucune authentification" },
    { value: "API_KEY", label: "Clé API" },
    { value: "BASIC", label: "Basic Auth" },
    { value: "BEARER", label: "Bearer Token" },
    { value: "OAUTH2", label: "OAuth 2.0" }
  ];

  const popularServices = [
    {
      name: "SONABEL",
      baseUrl: "https://api.sonabel.bf",
      authType: "API_KEY" as const,
      headers: { "Content-Type": "application/json" }
    },
    {
      name: "ONEA", 
      baseUrl: "https://api.onea.bf",
      authType: "API_KEY" as const,
      headers: { "Content-Type": "application/json" }
    },
    {
      name: "Orange Money",
      baseUrl: "https://api.orange.com",
      authType: "OAUTH2" as const,
      headers: { "Content-Type": "application/json" }
    }
  ];

  const handlePresetSelect = (preset: typeof popularServices[0]) => {
    form.setValue("baseUrl", preset.baseUrl);
    form.setValue("authType", preset.authType);
    form.setValue("headers", preset.headers);
    toast.info(`Configuration ${preset.name} appliquée`);
  };

  const updateAuthData = (key: string, value: string) => {
    const currentAuthData = form.getValues("authData") || {};
    form.setValue("authData", {
      ...currentAuthData,
      [key]: value
    });
  };

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

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      // Simulation du test de connexion
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Connexion testée avec succès");
    } catch (error) {
      toast.error("Erreur lors du test de connexion");
    } finally {
      setTestingConnection(false);
    }
  };

  const onSubmit = async (data: ServiceConfigFormData) => {
    try {
      const configData = {
        ...data,
        serviceId: serviceProduct.id
      };

      if (isEditing && serviceConfig) {
        await updateConfig({ 
          id: serviceConfig.id, 
          data: configData 
        }, {
          onSuccess: () => {
            toast.success("Configuration mise à jour avec succès");
            onSuccess?.();
          }
        });
      } else {
        await createConfig(configData, {
          onSuccess: () => {
            toast.success("Configuration créée avec succès");
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
            {isEditing ? "Modifier la configuration" : "Créer une configuration"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Paramètres de connexion pour le service externe
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
          {/* Services prédéfinis */}
          {!isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Services populaires</CardTitle>
                <CardDescription>
                  Configurations prêtes à l'emploi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {popularServices.map((service) => (
                    <Button
                      key={service.name}
                      type="button"
                      variant="outline"
                      className="h-auto p-4 justify-start"
                      onClick={() => handlePresetSelect(service)}
                    >
                      <div className="text-left">
                        <div className="font-medium">{service.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {authTypes.find(a => a.value === service.authType)?.label}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configuration de base */}
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
                name="baseUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <span className="text-red-500">*</span>
                      URL de base
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://api.example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL racine de l'API du service externe
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description de la configuration..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
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
                      <FormLabel className="text-base">Configuration active</FormLabel>
                      <FormDescription>
                        Activer cette configuration pour le service
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

          {/* Authentification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Authentification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="authType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'authentification</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {authTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Champs d'authentification dynamiques */}
              {watchedAuthType !== "NONE" && (
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    {watchedAuthType === "API_KEY" && (
                      <div>
                        <label className="text-sm font-medium">Clé API</label>
                        <Input
                          type="password"
                          placeholder="Votre clé API"
                          value={form.watch("authData")?.apiKey || ""}
                          onChange={(e) => updateAuthData("apiKey", e.target.value)}
                        />
                      </div>
                    )}

                    {watchedAuthType === "BASIC" && (
                      <>
                        <div>
                          <label className="text-sm font-medium">Nom d'utilisateur</label>
                          <Input
                            placeholder="Utilisateur"
                            value={form.watch("authData")?.username || ""}
                            onChange={(e) => updateAuthData("username", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Mot de passe</label>
                          <Input
                            type="password"
                            placeholder="Mot de passe"
                            value={form.watch("authData")?.password || ""}
                            onChange={(e) => updateAuthData("password", e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    {watchedAuthType === "BEARER" && (
                      <div>
                        <label className="text-sm font-medium">Token Bearer</label>
                        <Input
                          type="password"
                          placeholder="Bearer token"
                          value={form.watch("authData")?.token || ""}
                          onChange={(e) => updateAuthData("token", e.target.value)}
                        />
                      </div>
                    )}

                    {watchedAuthType === "OAUTH2" && (
                      <>
                        <div>
                          <label className="text-sm font-medium">Client ID</label>
                          <Input
                            placeholder="Client ID"
                            value={form.watch("authData")?.clientId || ""}
                            onChange={(e) => updateAuthData("clientId", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Client Secret</label>
                          <Input
                            type="password"
                            placeholder="Client Secret"
                            value={form.watch("authData")?.clientSecret || ""}
                            onChange={(e) => updateAuthData("clientSecret", e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Paramètres avancés */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres avancés
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="timeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Timeout (ms)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1000"
                          max="60000"
                          step="1000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 30000)}
                        />
                      </FormControl>
                      <FormDescription>1-60 secondes</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="retryCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Tentatives
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 3)}
                        />
                      </FormControl>
                      <FormDescription>0-10 tentatives</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* En-têtes personnalisés */}
              <div>
                <label className="text-sm font-medium mb-2 block">En-têtes HTTP personnalisés</label>
                <div className="space-y-2">
                  {Object.entries(form.watch("headers") || {}).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-5 gap-2">
                      <Input 
                        value={key} 
                        placeholder="Nom de l'en-tête"
                        onChange={(e) => {
                          const newHeaders = { ...form.watch("headers") };
                          delete newHeaders[key];
                          if (e.target.value) {
                            newHeaders[e.target.value] = value;
                          }
                          form.setValue("headers", newHeaders);
                        }}
                        className="col-span-2"
                      />
                      <Input 
                        value={value} 
                        placeholder="Valeur"
                        onChange={(e) => updateHeaders(key, e.target.value)}
                        className="col-span-2"
                      />
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm"
                        onClick={() => updateHeaders(key, "")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateHeaders(`header-${Date.now()}`, "")}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Ajouter un en-tête
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={testConnection}
              disabled={testingConnection || !form.watch("baseUrl")}
            >
              {testingConnection ? (
                <>
                  <TestTube className="h-4 w-4 mr-2 animate-pulse" />
                  Test en cours...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Tester la connexion
                </>
              )}
            </Button>

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