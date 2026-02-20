import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Globe, Key, Clock, RefreshCw, Plus, Trash2, Settings, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ServiceProductFormData } from "./form-schema";

interface ExternalServiceConfigSectionProps {
  form: UseFormReturn<ServiceProductFormData>;
}

export function ExternalServiceConfigSection({ form }: ExternalServiceConfigSectionProps) {
  const watchedApiConfig = form.watch("apiConfig");
  const [testingConnection, setTestingConnection] = useState(false);

  const authTypes = [
    { value: "NONE", label: "Aucune authentification" },
    { value: "API_KEY", label: "Clé API" },
    { value: "BASIC", label: "Basic Auth (utilisateur/mot de passe)" },
    { value: "BEARER", label: "Bearer Token" },
    { value: "OAUTH2", label: "OAuth 2.0" }
  ];

  const popularServices = [
    {
      name: "SONABEL",
      baseUrl: "https://api.sonabel.bf",
      authType: "API_KEY" as const,
      description: "Société Nationale d'Électricité du Burkina"
    },
    {
      name: "ONEA",
      baseUrl: "https://api.onea.bf", 
      authType: "API_KEY" as const,
      description: "Office National de l'Eau et de l'Assainissement"
    },
    {
      name: "Orange Money",
      baseUrl: "https://api.orange.com",
      authType: "OAUTH2" as const,
      description: "Service de paiement mobile Orange"
    }
  ];

  const handlePresetSelect = (preset: typeof popularServices[0]) => {
    form.setValue("apiConfig", {
      baseUrl: preset.baseUrl,
      authType: preset.authType,
      authData: {},
      timeout: 30000,
      retryCount: 3
    });
  };

  const testConnection = async () => {
    setTestingConnection(true);
    // Simulation du test de connexion
    setTimeout(() => {
      setTestingConnection(false);
    }, 2000);
  };

  const updateAuthData = (key: string, value: string) => {
    const currentAuthData = form.getValues("apiConfig.authData") || {};
    form.setValue("apiConfig.authData", {
      ...currentAuthData,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Services prédéfinis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Services populaires
          </CardTitle>
          <CardDescription>
            Configurations prêtes à l'emploi pour les services courants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularServices.map((service) => (
              <div
                key={service.name}
                className="p-4 border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handlePresetSelect(service)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4" />
                  <span className="font-medium">{service.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {service.description}
                </p>
                <Badge variant="outline" className="text-xs">
                  {authTypes.find(a => a.value === service.authType)?.label}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration de l'API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Configuration de l'API
          </CardTitle>
          <CardDescription>
            Paramètres de connexion au service externe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL de base */}
          <FormField
            control={form.control}
            name="apiConfig.baseUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <span className="text-red-500">*</span>
                  URL de base de l'API
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://api.example.com"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  URL racine de l'API du service externe
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Type d'authentification */}
          <FormField
            control={form.control}
            name="apiConfig.authType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type d'authentification</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type" />
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
          {watchedApiConfig?.authType && watchedApiConfig.authType !== "NONE" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Données d'authentification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {watchedApiConfig.authType === "API_KEY" && (
                  <div>
                    <label className="text-sm font-medium">Clé API</label>
                    <Input
                      type="password"
                      placeholder="Votre clé API"
                      value={watchedApiConfig.authData?.apiKey || ""}
                      onChange={(e) => updateAuthData("apiKey", e.target.value)}
                    />
                  </div>
                )}

                {watchedApiConfig.authType === "BASIC" && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Nom d'utilisateur</label>
                      <Input
                        placeholder="Utilisateur"
                        value={watchedApiConfig.authData?.username || ""}
                        onChange={(e) => updateAuthData("username", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Mot de passe</label>
                      <Input
                        type="password"
                        placeholder="Mot de passe"
                        value={watchedApiConfig.authData?.password || ""}
                        onChange={(e) => updateAuthData("password", e.target.value)}
                      />
                    </div>
                  </>
                )}

                {watchedApiConfig.authType === "BEARER" && (
                  <div>
                    <label className="text-sm font-medium">Token Bearer</label>
                    <Input
                      type="password"
                      placeholder="Bearer token"
                      value={watchedApiConfig.authData?.token || ""}
                      onChange={(e) => updateAuthData("token", e.target.value)}
                    />
                  </div>
                )}

                {watchedApiConfig.authType === "OAUTH2" && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Client ID</label>
                      <Input
                        placeholder="Client ID"
                        value={watchedApiConfig.authData?.clientId || ""}
                        onChange={(e) => updateAuthData("clientId", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Client Secret</label>
                      <Input
                        type="password"
                        placeholder="Client Secret"
                        value={watchedApiConfig.authData?.clientSecret || ""}
                        onChange={(e) => updateAuthData("clientSecret", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">URL d'autorisation</label>
                      <Input
                        placeholder="https://api.example.com/oauth/authorize"
                        value={watchedApiConfig.authData?.authorizeUrl || ""}
                        onChange={(e) => updateAuthData("authorizeUrl", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">URL du token</label>
                      <Input
                        placeholder="https://api.example.com/oauth/token"
                        value={watchedApiConfig.authData?.tokenUrl || ""}
                        onChange={(e) => updateAuthData("tokenUrl", e.target.value)}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Paramètres avancés */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="apiConfig.timeout"
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
              name="apiConfig.retryCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Nombre de tentatives
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      placeholder="3"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 3)}
                    />
                  </FormControl>
                  <FormDescription>
                    Tentatives en cas d'échec (0-10)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Test de connexion */}
          {watchedApiConfig?.baseUrl && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={testingConnection}
              >
                {testingConnection ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Tester la connexion
                  </>
                )}
              </Button>
              <Badge variant="outline">
                URL: {watchedApiConfig.baseUrl}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations et conseils */}
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>Configuration avancée :</strong> Une fois le service créé, vous pourrez configurer les endpoints spécifiques, 
          les mappings de réponse et les champs de données dans la section de gestion avancée.
        </AlertDescription>
      </Alert>

      {watchedApiConfig?.authType === "OAUTH2" && (
        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            <strong>OAuth 2.0 :</strong> L'autorisation OAuth sera gérée automatiquement. 
            Assurez-vous que les URLs et identifiants sont corrects.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}