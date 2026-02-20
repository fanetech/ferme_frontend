"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Globe, Shield, Clock, Settings } from "lucide-react";
import { FormModal } from "@/components/ui/modal/FormModal";

// Hooks
import { useCreateEndpointConfig, useUpdateEndpointConfig } from "@/data/catalog";
import { ServiceConfig, EndpointConfig, EndpointType } from "@/types/catalog";
import { TOKEN_SOURCE_TYPES, getTokenSourceTypeConfig } from "@/lib/utils/tokenSourceTypes";
import { CONTENT_TYPES, getContentTypesArray } from "@/lib/utils/contentTypes";
import { toast } from "sonner";

interface EndpointFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceConfig: ServiceConfig;
  endpoint?: EndpointConfig | null;
  onSuccess: () => void;
}

const endpointSchema = z.object({
  endpointType: z.nativeEnum(EndpointType),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  path: z.string().min(1, "Le chemin est requis"),
  contentType: z.enum(["APPLICATION_JSON", "APPLICATION_FORM_URLENCODED", "MULTIPART_FORM_DATA", "TEXT_PLAIN", "APPLICATION_XML", "TEXT_HTML", "APPLICATION_OCTET_STREAM"]).optional(),
  acceptType: z.enum(["APPLICATION_JSON", "APPLICATION_FORM_URLENCODED", "MULTIPART_FORM_DATA", "TEXT_PLAIN", "APPLICATION_XML", "TEXT_HTML", "APPLICATION_OCTET_STREAM"]).optional(),
  authRequired: z.boolean(),
  useDifferentAuth: z.boolean(),
  specificAuthToken: z.string().optional(),
  tokenSourceType: z.enum(["SERVICE_CONFIG", "AUTHENTICATION_ENDPOINT"]).optional(),
  timeout: z.number().min(1).max(300).optional(),
  connectTimeout: z.number().min(1).max(60).optional(),
  readTimeout: z.number().min(1).max(300).optional(),
  retryCount: z.number().min(0).max(10).optional(),
  retryDelay: z.number().min(100).max(60000).optional(),
  successCodes: z.string().optional(),
  errorCodes: z.string().optional(),
  responseFormat: z.string().optional(),
  cacheEnabled: z.boolean(),
  cacheTtl: z.number().min(0).max(86400).optional(),
  headers: z.string().optional(), // JSON string
});

type EndpointFormData = z.infer<typeof endpointSchema>;

export function EndpointFormModal({ isOpen, onClose, serviceConfig, endpoint, onSuccess }: EndpointFormModalProps) {
  const { mutate: createEndpoint, isPending: isCreating } = useCreateEndpointConfig();
  const { mutate: updateEndpoint, isPending: isUpdating } = useUpdateEndpointConfig();

  const form = useForm<EndpointFormData>({
    resolver: zodResolver(endpointSchema),
    defaultValues: {
      endpointType: EndpointType.CONSULTATION,
      method: "GET",
      path: "",
      contentType: "APPLICATION_JSON",
      acceptType: "APPLICATION_JSON",
      authRequired: false,
      useDifferentAuth: false,
      specificAuthToken: "",
      tokenSourceType: "SERVICE_CONFIG",
      timeout: 30,
      connectTimeout: 10,
      readTimeout: 30,
      retryCount: 3,
      retryDelay: 1000,
      successCodes: "200,201,202",
      errorCodes: "",
      responseFormat: "json",
      cacheEnabled: false,
      cacheTtl: 300,
      headers: "",
    },
  });

  // Réinitialiser le formulaire quand la modal s'ouvre/ferme ou quand endpoint change
  useEffect(() => {
    if (isOpen) {
      if (endpoint) {
        // Mode modification : charger les données de l'endpoint
        form.reset({
          endpointType: endpoint.endpointType as EndpointType || EndpointType.CONSULTATION,
          method: endpoint.method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH" || "GET",
          path: endpoint.path || "",
          contentType: endpoint.contentType || "APPLICATION_JSON",
          acceptType: endpoint.acceptType || "APPLICATION_JSON",
          authRequired: endpoint.authRequired || false,
          useDifferentAuth: endpoint.useDifferentAuth || false,
          specificAuthToken: endpoint.specificAuthToken || "",
          tokenSourceType: endpoint.tokenSourceType || "SERVICE_CONFIG",
          timeout: endpoint.timeout || 30,
          connectTimeout: endpoint.connectTimeout || 10,
          readTimeout: endpoint.readTimeout || 30,
          retryCount: endpoint.retryCount || 3,
          retryDelay: endpoint.retryDelay || 1000,
          successCodes: endpoint.successCodes || "200,201,202",
          errorCodes: endpoint.errorCodes || "",
          responseFormat: endpoint.responseFormat || "json",
          cacheEnabled: endpoint.cacheEnabled || false,
          cacheTtl: endpoint.cacheTtl || 300,
          headers: endpoint.headers ? JSON.stringify(endpoint.headers, null, 2) : "",
        });
      } else {
        // Mode création : valeurs par défaut
        form.reset({
          endpointType: EndpointType.CONSULTATION,
          method: "GET",
          path: "",
          contentType: "APPLICATION_JSON",
          acceptType: "APPLICATION_JSON",
          authRequired: false,
          useDifferentAuth: false,
          specificAuthToken: "",
          tokenSourceType: "SERVICE_CONFIG",
          timeout: 30,
          connectTimeout: 10,
          readTimeout: 30,
          retryCount: 3,
          retryDelay: 1000,
          successCodes: "200,201,202",
          errorCodes: "",
          responseFormat: "json",
          cacheEnabled: false,
          cacheTtl: 300,
          headers: "",
        });
      }
    }
  }, [isOpen, endpoint, form]);

  const isPending = isCreating || isUpdating;

  const onSubmit = async (data: EndpointFormData) => {
    try {
      // Parse headers JSON si présent
      let parsedHeaders = {};
      if (data.headers) {
        try {
          parsedHeaders = JSON.parse(data.headers);
        } catch (error) {
          toast.error("Format JSON invalide pour les headers");
          return;
        }
      }

      const endpointData = {
        serviceConfigId: serviceConfig.id,
        endpointType: data.endpointType,
        method: data.method,
        path: data.path,
        contentType: data.contentType,
        acceptType: data.acceptType,
        authRequired: data.authRequired,
        useDifferentAuth: data.useDifferentAuth,
        specificAuthToken: data.specificAuthToken || undefined,
        tokenSourceType: data.tokenSourceType || undefined,
        timeout: data.timeout,
        connectTimeout: data.connectTimeout,
        readTimeout: data.readTimeout,
        retryCount: data.retryCount,
        retryDelay: data.retryDelay,
        successCodes: data.successCodes,
        errorCodes: data.errorCodes || undefined,
        responseFormat: data.responseFormat,
        cacheEnabled: data.cacheEnabled,
        cacheTtl: data.cacheEnabled ? data.cacheTtl : undefined,
        headers: Object.keys(parsedHeaders).length > 0 ? parsedHeaders : undefined,
      };

      if (endpoint) {
        // Modification
        updateEndpoint({
          id: endpoint.id,
          data: endpointData,
        }, {
          onSuccess: () => {
            onSuccess();
          }
        });
      } else {
        // Création
        createEndpoint(endpointData, {
          onSuccess: () => {
            onSuccess();
          }
        });
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <Globe className="h-5 w-5 text-primary" />
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={endpoint ? "Modifier l'endpoint" : "Nouvel endpoint"}
      titleIcon={titleIcon}
      subtitle={endpoint ? "Modifiez la configuration de l'endpoint" : "Ajoutez un nouvel endpoint au service"}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={endpoint ? "Modifier l'endpoint" : "Créer l'endpoint"}
      isSubmitting={isPending}
      isDirty={form.formState.isDirty}
      footerNote={endpoint ? "Les modifications seront appliquées immédiatement" : "L'endpoint sera ajouté à la configuration du service"}
    >
      <Form {...form}>
        <div className="space-y-6 p-1">
              {/* Informations de base */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Informations de base
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="endpointType"
                      render={({ field }) => (
                        <FormItem className={"w-full col-span-1"}>
                          <FormLabel>Type d'endpoint</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className={"w-full"}>
                                <SelectValue placeholder="Sélectionner un type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={EndpointType.CONSULTATION}>Consultation</SelectItem>
                              <SelectItem value={EndpointType.VALIDATION}>Validation</SelectItem>
                              <SelectItem value={EndpointType.VERIFICATION}>Vérification</SelectItem>
                              <SelectItem value={EndpointType.CANCELLATION}>Annulation</SelectItem>
                              <SelectItem value={EndpointType.WEBHOOK}>Webhook</SelectItem>
                              <SelectItem value={EndpointType.REFUND}>Remboursement</SelectItem>
                              <SelectItem value={EndpointType.AUTHENTICATION}>Authentification</SelectItem>
                              <SelectItem value={EndpointType.PING}>Ping</SelectItem>

                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="method"
                      render={({ field }) => (
                        <FormItem className={"w-full col-span-1"}>
                          <FormLabel>Méthode HTTP</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className={"w-full"}>
                                <SelectValue placeholder="Sélectionner une méthode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="GET">GET</SelectItem>
                              <SelectItem value="POST">POST</SelectItem>
                              <SelectItem value="PUT">PUT</SelectItem>
                              <SelectItem value="DELETE">DELETE</SelectItem>
                              <SelectItem value="PATCH">PATCH</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="path"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chemin de l'endpoint</FormLabel>
                        <FormControl>
                          <Input placeholder="/api/validate" {...field} />
                        </FormControl>
                        <FormDescription>
                          Le chemin sera ajouté à l'URL de base du service
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content-Type</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className={"w-full"}>
                                <SelectValue placeholder="Sélectionnez le type de contenu..." />
                              </SelectTrigger>
                              <SelectContent>
                                {getContentTypesArray().map((contentType) => (
                                  <SelectItem key={contentType.value} value={contentType.value}>
                                    <div className="flex items-center gap-2">
                                      <span>{contentType.icon}</span>
                                      <div>
                                        <div className="font-medium">{contentType.label}</div>
                                        <div className="text-xs text-muted-foreground">{contentType.mimeType}</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Type de contenu envoyé dans les requêtes
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="acceptType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accept</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className={"w-full"}>
                                <SelectValue placeholder="Sélectionnez le type accepté..." />
                              </SelectTrigger>
                              <SelectContent>
                                {getContentTypesArray().map((contentType) => (
                                  <SelectItem key={contentType.value} value={contentType.value}>
                                    <div className="flex items-center gap-2">
                                      <span>{contentType.icon}</span>
                                      <div>
                                        <div className="font-medium">{contentType.label}</div>
                                        <div className="text-xs text-muted-foreground">{contentType.mimeType}</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Type de contenu accepté dans les réponses
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Authentification - Masqué pour les endpoints d'authentification */}
              {form.watch("endpointType") !== EndpointType.AUTHENTICATION && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Authentification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="authRequired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Authentification requise</FormLabel>
                            <FormDescription>
                              Cet endpoint nécessite une authentification
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

                    <FormField
                      control={form.control}
                      name="useDifferentAuth"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Auth spécifique</FormLabel>
                            <FormDescription>
                              Utiliser une authentification différente
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
                  </div>

                  {/* Source du token - Always visible */}
                  <FormField
                    control={form.control}
                    name="tokenSourceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source du token</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.values(TOKEN_SOURCE_TYPES).map((type) => (
                              <Card 
                                key={type.value}
                                className={`cursor-pointer transition-all hover:shadow-md ${
                                  field.value === type.value 
                                    ? 'ring-2 ring-primary bg-primary/5' 
                                    : 'hover:bg-muted/50'
                                }`}
                                onClick={() => field.onChange(type.value)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="text-2xl">{type.icon}</div>
                                    <div className="flex-1">
                                      <div className="font-medium">{type.label}</div>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        {type.description}
                                      </div>
                                    </div>
                                    {field.value === type.value && (
                                      <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Choisissez comment le token est obtenu pour cet endpoint
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Auth spécifique - Only if useDifferentAuth AND not AUTHENTICATION_ENDPOINT */}
                  {form.watch("useDifferentAuth") && form.watch("tokenSourceType") !== "AUTHENTICATION_ENDPOINT" && (
                    <FormField
                      control={form.control}
                      name="specificAuthToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token spécifique</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Token pour cet endpoint" {...field} />
                          </FormControl>
                          <FormDescription>
                            Token configuré manuellement pour cet endpoint
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Info message for AUTHENTICATION_ENDPOINT */}
                  {form.watch("tokenSourceType") === "AUTHENTICATION_ENDPOINT" && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🔑</span>
                        <div>
                          <div className="font-medium text-blue-800 dark:text-blue-200">
                            Token automatique
                          </div>
                          <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Le token sera obtenu automatiquement via l'endpoint d'authentification configuré
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  </CardContent>
                </Card>
              )}

              {/* Configuration technique */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Configuration technique
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="timeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeout (secondes)</FormLabel>
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
                      name="connectTimeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeout connexion (secondes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="60"
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
                          <FormLabel>Timeout lecture (secondes)</FormLabel>
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <FormDescription>
                            Codes HTTP séparés par des virgules
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="errorCodes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Codes d'erreur</FormLabel>
                          <FormControl>
                            <Input placeholder="400,401,500" {...field} />
                          </FormControl>
                          <FormDescription>
                            Codes HTTP d'erreur séparés par des virgules
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Configuration avancée */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Configuration avancée
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cacheEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Cache activé</FormLabel>
                            <FormDescription>
                              Mettre en cache les réponses de cet endpoint
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

                    {form.watch("cacheEnabled") && (
                      <FormField
                        control={form.control}
                        name="cacheTtl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Durée du cache (secondes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="86400"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 300)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="headers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headers personnalisés (JSON)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='{"X-Custom-Header": "value"}'
                            className="min-h-[80px] font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Headers HTTP additionnels au format JSON
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

        </div>
      </Form>
    </FormModal>
  );
}