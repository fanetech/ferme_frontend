"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit3, Save, X, Info, Globe, Shield, Clock, Settings, Key, Webhook, Trash2, AlertTriangle, Play, Pause } from "lucide-react";
import { ServiceProduct, AuthType } from "@/types/catalog";
import { useCreateOrUpdateServiceConfig, useDeleteServiceConfig, useActivateServiceConfig, useDeactivateServiceConfig } from "@/data/catalog";
import { toast } from "sonner";
import AvePayLoader from "@/components/avepay-loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ServiceInfoTabProps {
  serviceProduct: ServiceProduct;
  serviceConfig?: any;
  isLoading?: boolean;
}

const serviceConfigSchema = z.object({
  baseUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  testBaseUrl: z.union([
    z.string().url("URL de test invalide"),
    z.literal(""),
    z.undefined()
  ]).optional(),
  authType: z.nativeEnum(AuthType),
  authUsername: z.string().optional(),
  authPassword: z.string().optional(),
  authToken: z.string().optional(),
  apiKey: z.string().optional(),
  oauthClientId: z.string().optional(),
  oauthTokenUrl: z.union([
    z.string().url("URL OAuth invalide"),
    z.literal(""),
    z.undefined()
  ]).optional(),
  fullPaymentRequired: z.boolean(),
  generateReceipt: z.boolean(),
  webhookNotification: z.boolean(),
  webhookUrl: z.union([
    z.string().url("URL de webhook invalide"),
    z.literal(""),
    z.undefined()
  ]).optional(),
  timeout: z.number().min(1).max(300).optional(),
  connectionTimeout: z.number().min(1).max(300).optional(),
  readTimeout: z.number().min(1).max(300).optional(),
  retryCount: z.number().min(0).max(10).optional(),
  successCodes: z.string().optional(),
  isTestMode: z.boolean(),
});

type ServiceConfigFormData = z.infer<typeof serviceConfigSchema>;


export function ServiceInfoTab({ serviceProduct, serviceConfig, isLoading }: ServiceInfoTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { mutate: createOrUpdateServiceConfig, isPending: isSaving } = useCreateOrUpdateServiceConfig();
  const { mutate: deleteServiceConfig, isPending: isDeleting } = useDeleteServiceConfig();
  const { mutate: activateServiceConfig, isPending: isActivating } = useActivateServiceConfig();
  const { mutate: deactivateServiceConfig, isPending: isDeactivating } = useDeactivateServiceConfig();

  const form = useForm<ServiceConfigFormData>({
    resolver: zodResolver(serviceConfigSchema),
    defaultValues: {
      baseUrl: "",
      testBaseUrl: "",
      authType: AuthType.NONE,
      authUsername: "",
      authPassword: "",
      authToken: "",
      apiKey: "",
      oauthClientId: "",
      oauthTokenUrl: "",
      fullPaymentRequired: false,
      generateReceipt: true,
      webhookNotification: false,
      webhookUrl: "",
      timeout: 30,
      connectionTimeout: 10,
      readTimeout: 30,
      retryCount: 3,
      successCodes: "200,201,202",
      isTestMode: true,
    },
  });

  // Mise à jour du formulaire quand la config est chargée
  useEffect(() => {
    if (serviceConfig) {
      form.reset({
        baseUrl: serviceConfig.baseUrl || "",
        testBaseUrl: serviceConfig.testBaseUrl || "",
        authType: serviceConfig.authType,
        authUsername: serviceConfig.authUsername || "",
        authPassword: serviceConfig.authPassword || "",
        authToken: serviceConfig.authToken || "",
        apiKey: serviceConfig.apiKey || "",
        oauthClientId: serviceConfig.oauthClientId || "",
        oauthTokenUrl: serviceConfig.oauthTokenUrl || "",
        fullPaymentRequired: serviceConfig.fullPaymentRequired || false,
        generateReceipt: serviceConfig.generateReceipt !== false,
        webhookNotification: serviceConfig.webhookNotification || false,
        webhookUrl: serviceConfig.webhookUrl || "",
        timeout: serviceConfig.timeout || 30,
        connectionTimeout: serviceConfig.connectionTimeout || 10,
        readTimeout: serviceConfig.readTimeout || 30,
        retryCount: serviceConfig.retryCount || 3,
        successCodes: serviceConfig.successCodes || "200,201,202",
        isTestMode: serviceConfig.isTestMode,
      });
      setIsEditing(!serviceConfig.id); // Si une config existe, on n'est pas en mode édition
    }
  }, [serviceConfig, form]);

  const onSubmit = async (data: ServiceConfigFormData) => {
    try {
      // Nettoyer les données - convertir les chaînes vides en undefined
      const cleanedData = {
        baseUrl: data.baseUrl || undefined,
        testBaseUrl: data.testBaseUrl || undefined,
        authType: data.authType,
        authUsername: data.authUsername || undefined,
        authPassword: data.authPassword || undefined,
        authToken: data.authToken || undefined,
        apiKey: data.apiKey || undefined,
        oauthClientId: data.oauthClientId || undefined,
        oauthTokenUrl: data.oauthTokenUrl || undefined,
        fullPaymentRequired: data.fullPaymentRequired,
        generateReceipt: data.generateReceipt,
        webhookNotification: data.webhookNotification,
        webhookUrl: data.webhookUrl || undefined,
        timeout: data.timeout,
        connectionTimeout: data.connectionTimeout,
        readTimeout: data.readTimeout,
        retryCount: data.retryCount,
        successCodes: data.successCodes || undefined,
        isTestMode: data.isTestMode,
      };

      // Utiliser le hook idempotent (créer ou mettre à jour)
      createOrUpdateServiceConfig({
        serviceId: serviceProduct.id,
        data: cleanedData,
      }, {
        onSuccess: () => {
          setIsEditing(false);
        },
      });
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de la configuration");
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const isPending = isSaving || isDeleting || isActivating || isDeactivating;

  const handleDeleteConfig = () => {
    if (serviceConfig?.id) {
      deleteServiceConfig(serviceConfig.id, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          // Le query sera invalidé par le hook
        },
        onError: () => {
          setShowDeleteDialog(false);
        }
      });
    }
  };

  const handleActivateConfig = () => {
    if (serviceConfig?.id) {
      activateServiceConfig(serviceConfig.id);
    }
  };

  const handleDeactivateConfig = () => {
    if (serviceConfig?.id) {
      deactivateServiceConfig(serviceConfig.id);
    }
  };

  // Si hasConfiguration est false, afficher directement le composant de création
  if (isEditing) {
    if (isEditing) {
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Créer la configuration
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* URLs de base */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Configuration réseau
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="baseUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de base (Production)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://api.example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="testBaseUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            URL de test 
                            <span className="text-muted-foreground text-xs ml-2">(Optionnel)</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://api-test.example.com" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Permet de tester sans utiliser l'API de production
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Authentification */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Authentification
                  </h4>
                  <FormField
                    control={form.control}
                    name="authType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type d'authentification</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={AuthType.NONE}>Aucune</SelectItem>
                            <SelectItem value={AuthType.API_KEY}>Clé API</SelectItem>
                            <SelectItem value={AuthType.BASIC}>Basic Auth</SelectItem>
                            <SelectItem value={AuthType.BEARER}>Bearer Token</SelectItem>
                            <SelectItem value={AuthType.OAUTH2}>OAuth2</SelectItem>
                            <SelectItem value={AuthType.CUSTOM}>Personnalisé</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Username et Password - Toujours affichés */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="authUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom d'utilisateur</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Utilisé selon le type d'authentification choisi
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="authPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Utilisé selon le type d'authentification choisi
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {(form.watch("authType") === AuthType.API_KEY) && (
                    <FormField
                      control={form.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clé API</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Votre clé API" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {(form.watch("authType") === AuthType.BEARER) && (
                    <FormField
                      control={form.control}
                      name="authToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bearer Token</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Votre token" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("authType") === AuthType.OAUTH2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="oauthClientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client ID</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="oauthTokenUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Token URL
                              <span className="text-muted-foreground text-xs ml-2">(Optionnel)</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="https://oauth.example.com/token" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Configuration technique */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Configuration technique
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="timeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeout (s)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="300"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="connectionTimeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeout connexion (s)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="300"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="readTimeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeout lecture (s)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="300"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="retryCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de tentatives</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 3)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="successCodes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Codes de succès</FormLabel>
                        <FormControl>
                          <Input placeholder="200,201,202" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Options */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Options
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="isTestMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Mode test</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Utiliser l'URL de test
                            </div>
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

                    <FormField
                      control={form.control}
                      name="fullPaymentRequired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Paiement complet requis</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Interdire les paiements partiels
                            </div>
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

                    <FormField
                      control={form.control}
                      name="generateReceipt"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Générer un reçu</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Créer automatiquement un reçu
                            </div>
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

                    <FormField
                      control={form.control}
                      name="webhookNotification"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Notifications webhook</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Envoyer des notifications
                            </div>
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
                  </div>

                  {form.watch("webhookNotification") && (
                    <FormField
                      control={form.control}
                      name="webhookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            URL du webhook
                            <span className="text-muted-foreground text-xs ml-2">(Optionnel)</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://votre-webhook.com/notify" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Configuration du service externe
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Configurer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune configuration</h3>
          <p className="text-muted-foreground mb-4">
            Ce service externe n'a pas encore été configuré.
          </p>
          <Button onClick={() => setIsEditing(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Créer la configuration
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && serviceProduct.hasConfiguration) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <AvePayLoader />
        </CardContent>
      </Card>
    );
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Modifier la configuration
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* URLs de base */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Configuration réseau
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="baseUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de base (Production)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://api.example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="testBaseUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          URL de test 
                          <span className="text-muted-foreground text-xs ml-2">(Optionnel)</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://api-test.example.com" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Permet de tester sans utiliser l'API de production
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Authentification */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Authentification
                </h4>
                <FormField
                  control={form.control}
                  name="authType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type d'authentification</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={AuthType.NONE}>Aucune</SelectItem>
                          <SelectItem value={AuthType.API_KEY}>Clé API</SelectItem>
                          <SelectItem value={AuthType.BASIC}>Basic Auth</SelectItem>
                          <SelectItem value={AuthType.BEARER}>Bearer Token</SelectItem>
                          <SelectItem value={AuthType.OAUTH2}>OAuth2</SelectItem>
                          <SelectItem value={AuthType.CUSTOM}>Personnalisé</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Username et Password - Toujours affichés */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="authUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d'utilisateur</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Utilisé selon le type d'authentification choisi
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="authPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Utilisé selon le type d'authentification choisi
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {(form.watch("authType") === AuthType.API_KEY) && (
                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clé API</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Votre clé API" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {(form.watch("authType") === AuthType.BEARER) && (
                  <FormField
                    control={form.control}
                    name="authToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bearer Token</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Votre token" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch("authType") === AuthType.OAUTH2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="oauthClientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client ID</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="oauthTokenUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Token URL
                            <span className="text-muted-foreground text-xs ml-2">(Optionnel)</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://oauth.example.com/token" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Configuration technique */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Configuration technique
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="timeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeout (s)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="300"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="connectionTimeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeout connexion (s)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="300"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="readTimeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeout lecture (s)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="300"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="retryCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de tentatives</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 3)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="successCodes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Codes de succès</FormLabel>
                      <FormControl>
                        <Input placeholder="200,201,202" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Options */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Options
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="isTestMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Mode test</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Utiliser l'URL de test
                          </div>
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

                  <FormField
                    control={form.control}
                    name="fullPaymentRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Paiement complet requis</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Interdire les paiements partiels
                          </div>
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

                  <FormField
                    control={form.control}
                    name="generateReceipt"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Générer un reçu</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Créer automatiquement un reçu
                          </div>
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

                  <FormField
                    control={form.control}
                    name="webhookNotification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Notifications webhook</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Envoyer des notifications
                          </div>
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
                </div>

                {form.watch("webhookNotification") && (
                  <FormField
                    control={form.control}
                    name="webhookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          URL du webhook
                          <span className="text-muted-foreground text-xs ml-2">(Optionnel)</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="https://votre-webhook.com/notify" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  if (!serviceConfig) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Configuration du service externe
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Configurer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune configuration</h3>
          <p className="text-muted-foreground mb-4">
            Ce service externe n'a pas encore été configuré.
          </p>
          <Button onClick={() => setIsEditing(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Créer la configuration
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Configuration du service externe
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Modifier
              </Button>

              {/* Bouton d'activation/désactivation */}
              {serviceConfig?.status === 'ACTIVE' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeactivateConfig}
                  disabled={isPending}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  {isDeactivating ? "Désactivation..." : "Désactiver"}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleActivateConfig}
                  disabled={isPending}
                  className="text-green-600 hover:text-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isActivating ? "Activation..." : "Activer"}
                </Button>
              )}

              {/* Bouton de suppression - uniquement si la configuration est désactivée */}
              {serviceConfig?.status !== 'ACTIVE' && (
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Supprimer la configuration du service
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <p>
                        <strong>Attention :</strong> Cette action est irréversible et supprimera définitivement :
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>La configuration du service externe (authentification, URLs, timeouts)</li>
                        <li>Tous les endpoints configurés</li>
                        <li>Tous les mappings de réponse associés</li>
                        <li>Tous les champs de données (data fields) configurés</li>
                        <li>L'historique des tests et simulations</li>
                      </ul>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-sm text-orange-800">
                          <strong>Note :</strong> Cette configuration est actuellement désactivée, ce qui permet sa suppression. 
                          Une configuration active ne peut pas être supprimée pour des raisons de sécurité.
                        </p>
                      </div>
                      <p className="text-destructive font-medium">
                        Êtes-vous absolument certain de vouloir supprimer cette configuration ?
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                      Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteConfig}
                      disabled={isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <>
                          <Settings className="h-4 w-4 mr-2 animate-spin" />
                          Suppression...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Oui, supprimer définitivement
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
                )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statut et mode */}
          <div className="flex items-center gap-3">
            <Badge 
              variant={serviceConfig.status === 'ACTIVE' ? "default" : "secondary"} 
              className={`gap-2 ${serviceConfig.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}
            >
              {serviceConfig.status === 'ACTIVE' ? '✅' : '⏸️'} {serviceConfig.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
            </Badge>
            <Badge variant={serviceConfig.isTestMode ? "secondary" : "default"} className="gap-2">
              🌐 {serviceConfig.isTestMode ? "Mode test" : "Mode production"}
            </Badge>
            <Separator orientation="vertical" className="h-6" />
            <div className="text-sm text-muted-foreground">
              Service externe configuré
            </div>
          </div>

          {/* Configuration réseau */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Configuration réseau
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {serviceConfig.baseUrl && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h5 className="font-medium">URL de production</h5>
                    <p className="text-sm text-muted-foreground font-mono break-all">
                      {serviceConfig.baseUrl}
                    </p>
                  </div>
                </div>
              )}

              {serviceConfig.testBaseUrl && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h5 className="font-medium">URL de test</h5>
                    <p className="text-sm text-muted-foreground font-mono break-all">
                      {serviceConfig.testBaseUrl}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Authentification */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Authentification
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h5 className="font-medium">Type d'authentification</h5>
                  <p className="text-sm text-muted-foreground">
                    {serviceConfig.authType === AuthType.NONE && "Aucune"}
                    {serviceConfig.authType === AuthType.API_KEY && "Clé API"}
                    {serviceConfig.authType === AuthType.BASIC && "Basic Auth"}
                    {serviceConfig.authType === AuthType.BEARER && "Bearer Token"}
                    {serviceConfig.authType === AuthType.OAUTH2 && "OAuth2"}
                    {serviceConfig.authType === AuthType.CUSTOM && "Personnalisé"}
                  </p>
                </div>
              </div>

              {serviceConfig.authType === AuthType.BASIC && serviceConfig.authUsername && (
                <div className="flex items-start gap-3">
                  <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h5 className="font-medium">Nom d'utilisateur</h5>
                    <p className="text-sm text-muted-foreground">{serviceConfig.authUsername}</p>
                  </div>
                </div>
              )}

              {serviceConfig.authType === AuthType.BASIC && serviceConfig.authPassword && (
                <div className="flex items-start gap-3">
                  <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h5 className="font-medium">Mot de passe</h5>
                    <p className="text-sm text-muted-foreground">••••••••</p>
                  </div>
                </div>
              )}

              {serviceConfig.authType === AuthType.OAUTH2 && serviceConfig.oauthClientId && (
                <div className="flex items-start gap-3">
                  <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h5 className="font-medium">Client ID</h5>
                    <p className="text-sm text-muted-foreground">{serviceConfig.oauthClientId}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Configuration technique */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Configuration technique
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h5 className="font-medium">Timeout</h5>
                  <p className="text-sm text-muted-foreground">
                    {serviceConfig.timeout || 30}s
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h5 className="font-medium">Timeout connexion</h5>
                  <p className="text-sm text-muted-foreground">
                    {serviceConfig.connectionTimeout || 10}s
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h5 className="font-medium">Timeout lecture</h5>
                  <p className="text-sm text-muted-foreground">
                    {serviceConfig.readTimeout || 30}s
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h5 className="font-medium">Tentatives</h5>
                  <p className="text-sm text-muted-foreground">
                    {serviceConfig.retryCount || 3} max
                  </p>
                </div>
              </div>
            </div>

            {serviceConfig.successCodes && (
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h5 className="font-medium">Codes de succès</h5>
                  <p className="text-sm text-muted-foreground font-mono">
                    {serviceConfig.successCodes}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Options */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Options configurées
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${serviceConfig.fullPaymentRequired ? 'bg-orange-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-muted-foreground">
                  {serviceConfig.fullPaymentRequired ? 'Paiement complet requis' : 'Paiements partiels autorisés'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${serviceConfig.generateReceipt ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-muted-foreground">
                  {serviceConfig.generateReceipt ? 'Génération automatique de reçu' : 'Pas de reçu automatique'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${serviceConfig.webhookNotification ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-muted-foreground">
                  {serviceConfig.webhookNotification ? 'Notifications webhook activées' : 'Pas de notifications webhook'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${serviceConfig.isTestMode ? 'bg-yellow-500' : 'bg-green-500'}`} />
                <span className="text-sm text-muted-foreground">
                  {serviceConfig.isTestMode ? 'Mode test actif' : 'Mode production actif'}
                </span>
              </div>
            </div>

            {serviceConfig.webhookNotification && serviceConfig.webhookUrl && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <Webhook className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-medium mb-2">URL du webhook</h5>
                    <p className="text-sm text-muted-foreground font-mono break-all">
                      {serviceConfig.webhookUrl}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}