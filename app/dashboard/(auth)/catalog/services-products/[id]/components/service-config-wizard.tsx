"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  CheckCircle, 
  Globe, 
  Key, 
  Settings, 
  Database,
  Plus,
  Trash2,
  TestTube
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Hooks
import { useCreateServiceConfig, useTestServiceConfig } from "@/data/catalog";

// Types
import { 
  ServiceProduct, 
  ServiceNature, 
  AuthType, 
  EndpointType, 
  HttpMethod, 
  DataType,
  CreateServiceConfigRequest,
  EndpointConfigDto,
  ServiceDataFieldDto,
  ResponseMappingDto
} from "@/types/catalog";

interface ServiceConfigWizardProps {
  serviceProduct: ServiceProduct;
  onCancel: () => void;
  onComplete: () => void;
}

// Schema de validation pour la configuration de base
const globalConfigSchema = z.object({
  baseUrl: z.string().url("URL invalide").min(1, "L'URL de base est obligatoire"),
  testBaseUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  authType: z.nativeEnum(AuthType),
  apiKey: z.string().optional(),
  authToken: z.string().optional(),
  authUsername: z.string().optional(),
  authPassword: z.string().optional(),
  timeout: z.number().min(5).max(300).default(60),
  retryCount: z.number().min(0).max(10).default(3),
  connectionTimeout: z.number().min(1).max(60).default(10),
  readTimeout: z.number().min(1).max(300).default(30),
  successCodes: z.string().default("200,201,202"),
  isTestMode: z.boolean().default(false),
  fullPaymentRequired: z.boolean().default(true),
  generateReceipt: z.boolean().default(true),
  webhookNotification: z.boolean().default(false),
  webhookUrl: z.string().url("URL invalide").optional().or(z.literal("")),
});

type GlobalConfigForm = z.infer<typeof globalConfigSchema>;

export function ServiceConfigWizard({ serviceProduct, onCancel, onComplete }: ServiceConfigWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [endpoints, setEndpoints] = useState<EndpointConfigDto[]>([]);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfigForm | null>(null);
  
  const { mutate: createConfig, isPending: isCreating } = useCreateServiceConfig();
  const { mutate: testConfig, isPending: isTesting } = useTestServiceConfig();

  const form = useForm<GlobalConfigForm>({
    resolver: zodResolver(globalConfigSchema),
    defaultValues: {
      authType: AuthType.API_KEY,
      timeout: 60,
      retryCount: 3,
      connectionTimeout: 10,
      readTimeout: 30,
      successCodes: "200,201,202",
      isTestMode: false,
      fullPaymentRequired: true,
      generateReceipt: true,
      webhookNotification: false,
    },
  });

  const steps = [
    { id: 0, title: "Configuration globale", description: "URL de base et authentification" },
    { id: 1, title: "Endpoints", description: "Configuration des points d'accès API" },
    { id: 2, title: "Finalisation", description: "Révision et création" }
  ];

  const handleGlobalConfigSubmit = (data: GlobalConfigForm) => {
    setGlobalConfig(data);
    setCurrentStep(1);
  };

  const addEndpoint = () => {
    const newEndpoint: EndpointConfigDto = {
      endpointType: EndpointType.CONSULTATION,
      method: HttpMethod.POST,
      path: "/consultation",
      contentType: "application/json",
      acceptType: "application/json",
      authRequired: true,
      timeout: globalConfig?.timeout || 60,
      retryCount: globalConfig?.retryCount || 3,
    };
    setEndpoints([...endpoints, newEndpoint]);
  };

  const updateEndpoint = (index: number, endpoint: EndpointConfigDto) => {
    const updated = [...endpoints];
    updated[index] = endpoint;
    setEndpoints(updated);
  };

  const removeEndpoint = (index: number) => {
    setEndpoints(endpoints.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = () => {
    if (!globalConfig) return;

    const configRequest: CreateServiceConfigRequest = {
      ...globalConfig,
      endpoints,
      dataFields: [],
      responseMappings: [],
    };

    createConfig(
      { serviceId: serviceProduct.id, data: configRequest },
      {
        onSuccess: () => {
          onComplete();
        }
      }
    );
  };

  const handleTestConfig = () => {
    if (!globalConfig) return;
    // Test avec la configuration actuelle
    testConfig(globalConfig.baseUrl);
  };

  if (serviceProduct.serviceNature !== ServiceNature.EXTERNAL_SERVICE) {
    return (
      <Alert>
        <AlertDescription>
          Ce wizard est uniquement disponible pour les services externes.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec progression */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration API - {serviceProduct.name}
          </CardTitle>
          <CardDescription>
            Assistant de configuration pour service externe
          </CardDescription>
          
          {/* Indicateur de progression */}
          <div className="flex items-center justify-between pt-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                  currentStep === index 
                    ? "border-primary bg-primary text-primary-foreground" 
                    : currentStep > index 
                      ? "border-green-500 bg-green-500 text-white" 
                      : "border-muted-foreground/30 bg-background text-muted-foreground"
                }`}>
                  {currentStep > index ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    currentStep > index ? "bg-green-500" : "bg-muted-foreground/30"
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center pt-2">
            <h3 className="font-medium">{steps[currentStep].title}</h3>
            <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
          </div>
        </CardHeader>
      </Card>

      {/* Contenu des étapes */}
      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Configuration globale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleGlobalConfigSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="baseUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de base *</FormLabel>
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
                        <FormLabel>URL de test</FormLabel>
                        <FormControl>
                          <Input placeholder="https://test-api.example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Authentification
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="authType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type d'authentification</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={AuthType.NONE}>Aucune</SelectItem>
                            <SelectItem value={AuthType.API_KEY}>Clé API</SelectItem>
                            <SelectItem value={AuthType.BEARER}>Bearer Token</SelectItem>
                            <SelectItem value={AuthType.BASIC}>Basic Auth</SelectItem>
                            <SelectItem value={AuthType.OAUTH2}>OAuth 2.0</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("authType") === AuthType.API_KEY && (
                    <FormField
                      control={form.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clé API</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="sk_..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("authType") === AuthType.BEARER && (
                    <FormField
                      control={form.control}
                      name="authToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token Bearer</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Bearer token..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("authType") === AuthType.BASIC && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="authUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom d'utilisateur</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="timeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeout (s)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="retryCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tentatives</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
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
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
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
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between pt-6">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                  <Button type="submit">
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configuration des endpoints
            </CardTitle>
            <CardDescription>
              Définissez les points d'accès de votre API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Endpoints configurés ({endpoints.length})</h3>
              <Button onClick={addEndpoint} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un endpoint
              </Button>
            </div>

            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{endpoint.method}</Badge>
                      <span className="font-medium">{endpoint.endpointType}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeEndpoint(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Type d'endpoint</Label>
                      <Select
                        value={endpoint.endpointType}
                        onValueChange={(value) => 
                          updateEndpoint(index, { ...endpoint, endpointType: value as EndpointType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={EndpointType.CONSULTATION}>Consultation</SelectItem>
                          <SelectItem value={EndpointType.VALIDATION}>Validation</SelectItem>
                          <SelectItem value={EndpointType.VERIFICATION}>Vérification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Méthode HTTP</Label>
                      <Select
                        value={endpoint.method}
                        onValueChange={(value) => 
                          updateEndpoint(index, { ...endpoint, method: value as HttpMethod })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={HttpMethod.GET}>GET</SelectItem>
                          <SelectItem value={HttpMethod.POST}>POST</SelectItem>
                          <SelectItem value={HttpMethod.PUT}>PUT</SelectItem>
                          <SelectItem value={HttpMethod.DELETE}>DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Chemin</Label>
                      <Input
                        value={endpoint.path}
                        onChange={(e) => 
                          updateEndpoint(index, { ...endpoint, path: e.target.value })
                        }
                        placeholder="/api/v1/consultation"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {endpoints.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucun endpoint configuré</p>
                  <p className="text-sm">Cliquez sur "Ajouter un endpoint" pour commencer</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentStep(0)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
              <Button 
                onClick={() => setCurrentStep(2)}
                disabled={endpoints.length === 0}
              >
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && globalConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Finalisation
            </CardTitle>
            <CardDescription>
              Vérifiez votre configuration avant la création
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Résumé de la configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Configuration globale</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">URL de base:</span>
                    <span className="font-mono">{globalConfig.baseUrl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Authentification:</span>
                    <Badge variant="outline">{globalConfig.authType}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timeout:</span>
                    <span>{globalConfig.timeout}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tentatives:</span>
                    <span>{globalConfig.retryCount}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Endpoints ({endpoints.length})</h3>
                <div className="space-y-2">
                  {endpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{endpoint.method}</Badge>
                      <span className="text-muted-foreground">{endpoint.endpointType}</span>
                      <span className="font-mono text-xs">{endpoint.path}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6">
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCurrentStep(1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConfig}
                  disabled={isTesting}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {isTesting ? "Test en cours..." : "Tester la configuration"}
                </Button>
              </div>
              
              <Button 
                onClick={handleFinalSubmit}
                disabled={isCreating}
              >
                <Save className="h-4 w-4 mr-2" />
                {isCreating ? "Création en cours..." : "Créer la configuration"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}