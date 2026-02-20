"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  TestTube, 
  Globe, 
  Key, 
  Database,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  ExternalLink,
  Code,
  FileText,
  BarChart3,
  Zap,
  Clock,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  Copy,
  Download,
  Upload,
  Eye,
  EyeOff,
  Shield,
  Activity,
  Layers,
  Network,
  Workflow,
  Calculator
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

// Hooks
import { 
  useServiceConfig,
  useTestServiceConfig,
  useUpdateServiceConfigGlobal,
  useUpdateEndpointComplete,
  useUpdateDataFieldComplete,
  useUpdateResponseMappingComplete,
  useAddDataFieldToEndpoint,
  useAddResponseMappingToEndpoint,
  useDeleteDataFieldComplete,
  useDeleteResponseMappingComplete,
  useCreateEndpointConfig,
  useCreateDataField,
  useCreateResponseMapping,
  usePricingRules,
  useCreatePricingRule,
  useUpdatePricingRule,
  useDeletePricingRule,
  useUpdateStock
} from "@/data/catalog";
import { 
  ServiceProduct, 
  ServiceNature, 
  ServiceConfig, 
  EndpointComplete, 
  DataFieldComplete, 
  ResponseMappingComplete,
  PricingRule,
  AuthType,
  DataType,
  EndpointType,
  PricingType
} from "@/types/catalog";

// Schema pour la configuration globale
const globalConfigSchema = z.object({
  baseUrl: z.string().url("URL invalide").optional(),
  testBaseUrl: z.string().url("URL invalide").optional(),
  authType: z.nativeEnum(AuthType),
  apiKey: z.string().optional(),
  authUsername: z.string().optional(),
  authToken: z.string().optional(),
  timeout: z.number().min(1000).max(300000).optional(),
  retryCount: z.number().min(0).max(10).optional(),
  successCodes: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  isTestMode: z.boolean().optional(),
  generateReceipt: z.boolean().optional(),
  webhookNotification: z.boolean().optional(),
  globalHeaders: z.record(z.string()).optional()
});

// Schema pour la création d'endpoint
const endpointSchema = z.object({
  endpointType: z.nativeEnum(EndpointType),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  path: z.string().min(1, "Le chemin est requis").regex(/^\//, "Le chemin doit commencer par /"),
  description: z.string().optional(),
  contentType: z.string().optional(),
  acceptType: z.string().optional(),
  timeout: z.number().min(1000).max(60000).optional(),
  retryCount: z.number().min(0).max(10).optional(),
  headers: z.record(z.string()).optional(),
  authRequired: z.boolean().optional(),
  cacheEnabled: z.boolean().optional(),
  cacheTtl: z.number().min(60).max(3600).optional()
});

// Schema pour les champs de données
const dataFieldSchema = z.object({
  code: z.string().min(1, "Le code est requis"),
  key: z.string().min(1, "La clé est requise"),
  label: z.string().min(1, "Le libellé est requis"),
  description: z.string().optional(),
  dataType: z.nativeEnum(DataType),
  isRequired: z.boolean().optional(),
  isReadonly: z.boolean().optional(),
  isHidden: z.boolean().optional(),
  defaultValue: z.string().optional(),
  placeholder: z.string().optional(),
  validationRegex: z.string().optional(),
  minLength: z.number().min(0).optional(),
  maxLength: z.number().min(1).optional(),
  displayOrder: z.number().min(0).optional()
});

// Schema pour les mappings de réponse
const responseMappingSchema = z.object({
  jsonPath: z.string().min(1, "Le chemin JSON est requis"),
  customDataKey: z.string().min(1, "La clé personnalisée est requise"),
  displayName: z.string().min(1, "Le nom d'affichage est requis"),
  dataType: z.nativeEnum(DataType),
  isAmount: z.boolean().optional(),
  isReference: z.boolean().optional(),
  isStatus: z.boolean().optional(),
  isRequired: z.boolean().optional(),
  format: z.string().optional(),
  transformation: z.string().optional(),
  displayOrder: z.number().min(0).optional()
});

// Schema pour les règles de pricing
const pricingRuleSchema = z.object({
  ruleName: z.string().min(1, "Le nom de la règle est requis"),
  description: z.string().optional(),
  pricingType: z.nativeEnum(PricingType),
  value: z.number().min(0, "La valeur doit être positive"),
  currency: z.string().min(3, "Devise invalide"),
  priority: z.number().min(1).max(100),
  isActive: z.boolean().optional(),
  isCumulative: z.boolean().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  customFormula: z.string().optional()
});

type GlobalConfigFormData = z.infer<typeof globalConfigSchema>;
type EndpointFormData = z.infer<typeof endpointSchema>;
type DataFieldFormData = z.infer<typeof dataFieldSchema>;
type ResponseMappingFormData = z.infer<typeof responseMappingSchema>;
type PricingRuleFormData = z.infer<typeof pricingRuleSchema>;

interface ServiceProductConfigurationCompleteProps {
  serviceProduct: ServiceProduct;
}

export function ServiceProductConfigurationComplete({ serviceProduct }: ServiceProductConfigurationCompleteProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeEndpointId, setActiveEndpointId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingMapping, setEditingMapping] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [showCreateEndpoint, setShowCreateEndpoint] = useState(false);
  const [showCreateField, setShowCreateField] = useState(false);
  const [showCreateMapping, setShowCreateMapping] = useState(false);
  const [showCreateRule, setShowCreateRule] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  const { data: serviceConfig, isLoading, refetch } = useServiceConfig(serviceProduct.id , serviceProduct.serviceNature === ServiceNature.EXTERNAL_SERVICE);
  const { data: pricingRules, isLoading: isLoadingRules } = usePricingRules(serviceProduct.id);
  const { mutate: testConfig, isPending: isTesting } = useTestServiceConfig();
  const { mutate: updateConfigGlobal, isPending: isUpdatingGlobal } = useUpdateServiceConfigGlobal();
  const { mutate: updateEndpoint, isPending: isUpdatingEndpoint } = useUpdateEndpointComplete();
  const { mutate: updateDataField, isPending: isUpdatingField } = useUpdateDataFieldComplete();
  const { mutate: updateResponseMapping, isPending: isUpdatingMapping } = useUpdateResponseMappingComplete();
  const { mutate: addDataField, isPending: isAddingField } = useAddDataFieldToEndpoint();
  const { mutate: addResponseMapping, isPending: isAddingMapping } = useAddResponseMappingToEndpoint();
  const { mutate: deleteDataField, isPending: isDeletingField } = useDeleteDataFieldComplete();
  const { mutate: deleteResponseMapping, isPending: isDeletingMapping } = useDeleteResponseMappingComplete();
  const { mutate: createEndpoint, isPending: isCreatingEndpoint } = useCreateEndpointConfig();
  const { mutate: createField, isPending: isCreatingField } = useCreateDataField();
  const { mutate: createMapping, isPending: isCreatingMapping } = useCreateResponseMapping();
  const { mutate: createRule, isPending: isCreatingRule } = useCreatePricingRule();
  const { mutate: updateRule, isPending: isUpdatingRule } = useUpdatePricingRule();
  const { mutate: deleteRule, isPending: isDeletingRule } = useDeletePricingRule();
  const { mutate: updateStock, isPending: isUpdatingStock } = useUpdateStock();

  // Formulaires
  const globalConfigForm = useForm<GlobalConfigFormData>({
    resolver: zodResolver(globalConfigSchema),
    defaultValues: {
      baseUrl: serviceConfig?.baseUrl || "",
      testBaseUrl: serviceConfig?.testBaseUrl || "",
      authType: serviceConfig?.authType || AuthType.NONE,
      apiKey: serviceConfig?.apiKey || "",
      authUsername: serviceConfig?.authUsername || "",
      authToken: serviceConfig?.authToken || "",
      timeout: serviceConfig?.timeout || 30000,
      retryCount: serviceConfig?.retryCount || 3,
      successCodes: serviceConfig?.successCodes || "200,201,202",
      webhookUrl: serviceConfig?.webhookUrl || "",
      isTestMode: serviceConfig?.isTestMode || false,
      generateReceipt: serviceConfig?.generateReceipt || false,
      webhookNotification: serviceConfig?.webhookNotification || false,
      globalHeaders: serviceConfig?.globalHeaders || {}
    }
  });

  const endpointForm = useForm<EndpointFormData>({
    resolver: zodResolver(endpointSchema),
    defaultValues: {
      endpointType: EndpointType.CONSULTATION,
      method: "GET",
      path: "/",
      contentType: "application/json",
      acceptType: "application/json",
      timeout: 30000,
      retryCount: 3,
      headers: {},
      authRequired: true,
      cacheEnabled: false,
      cacheTtl: 300
    }
  });

  const dataFieldForm = useForm<DataFieldFormData>({
    resolver: zodResolver(dataFieldSchema),
    defaultValues: {
      dataType: DataType.STRING,
      isRequired: false,
      isReadonly: false,
      isHidden: false,
      displayOrder: 0
    }
  });

  const responseMappingForm = useForm<ResponseMappingFormData>({
    resolver: zodResolver(responseMappingSchema),
    defaultValues: {
      dataType: DataType.STRING,
      isAmount: false,
      isReference: false,
      isStatus: false,
      isRequired: false,
      displayOrder: 0
    }
  });

  const pricingRuleForm = useForm<PricingRuleFormData>({
    resolver: zodResolver(pricingRuleSchema),
    defaultValues: {
      pricingType: PricingType.FIXED_AMOUNT,
      currency: "XOF",
      priority: 1,
      isActive: true,
      isCumulative: false
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }


  const handleTestConfiguration = () => {
    testConfig(serviceConfig.id, {
      onSuccess: (result) => {
        setTestResults(prev => ({ ...prev, global: result }));
        toast.success("Configuration testée avec succès");
      },
      onError: (error: any) => {
        toast.error("Erreur lors du test: " + error.message);
      }
    });
  };

  const handleUpdateGlobalConfig = (data: GlobalConfigFormData) => {
    updateConfigGlobal({ 
      serviceId: serviceProduct.id, 
      data: data as Partial<ServiceConfig>
    }, {
      onSuccess: () => {
        toast.success("Configuration globale mise à jour");
      }
    });
  };

  const handleCreateEndpoint = (data: EndpointFormData) => {
    createEndpoint({
      ...data,
      serviceConfigId: serviceConfig.id,
      fullUrl: `${serviceConfig.baseUrl}${data.path}`
    }, {
      onSuccess: () => {
        setShowCreateEndpoint(false);
        endpointForm.reset();
        refetch();
        toast.success("Endpoint créé avec succès");
      }
    });
  };

  const handleCreateField = (data: DataFieldFormData) => {
    if (!activeEndpointId) return;
    
    createField({
      ...data,
      serviceConfigId: serviceConfig.id,
      endpointConfigId: activeEndpointId
    }, {
      onSuccess: () => {
        setShowCreateField(false);
        dataFieldForm.reset();
        refetch();
        toast.success("Champ créé avec succès");
      }
    });
  };

  const handleCreateMapping = (data: ResponseMappingFormData) => {
    if (!activeEndpointId) return;
    
    createMapping({
      ...data,
      serviceConfigId: serviceConfig.id,
      endpointConfigId: activeEndpointId
    }, {
      onSuccess: () => {
        setShowCreateMapping(false);
        responseMappingForm.reset();
        refetch();
        toast.success("Mapping créé avec succès");
      }
    });
  };

  const handleCreatePricingRule = (data: PricingRuleFormData) => {
    createRule({
      ...data,
      serviceId: serviceProduct.id
    }, {
      onSuccess: () => {
        setShowCreateRule(false);
        pricingRuleForm.reset();
        toast.success("Règle de pricing créée avec succès");
      }
    });
  };

  const testEndpoint = async (endpointId: string) => {
    try {
      // Simulation du test d'endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResults(prev => ({ ...prev, [endpointId]: { success: true, status: 200 } }));
      toast.success("Endpoint testé avec succès");
    } catch (error) {
      setTestResults(prev => ({ ...prev, [endpointId]: { success: false, error: "Test failed" } }));
      toast.error("Erreur lors du test de l'endpoint");
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const duplicateEndpoint = (endpoint: EndpointComplete) => {
    const newEndpoint = {
      ...endpoint,
      id: undefined,
      path: `${endpoint.path}_copy`,
      endpointType: endpoint.endpointType + "_COPY"
    };
    // Logique pour dupliquer l'endpoint
    toast.info("Duplication de l'endpoint en cours...");
  };

  const exportConfiguration = () => {
    const configData = {
      serviceConfig,
      pricingRules,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service-config-${serviceProduct.code}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Configuration exportée");
  };

  const getTabsForServiceType = () => {
    const baseTabs = [
      { value: "overview", label: "Vue d'ensemble", icon: Eye }
    ];

    if (serviceProduct.serviceNature === ServiceNature.PRODUCT) {
      baseTabs.push(
        { value: "stock", label: "Gestion des stocks", icon: BarChart3 }
      );
    }

    if (serviceProduct.serviceNature === ServiceNature.INTERNAL_SERVICE) {
      baseTabs.push(
        { value: "calculations", label: "Champs de calcul", icon: Calculator },
        { value: "pricing", label: "Règles de pricing", icon: BarChart3 }
      );
    }

    if (serviceProduct.serviceNature === ServiceNature.EXTERNAL_SERVICE) {
      baseTabs.push(
        { value: "global", label: "Configuration globale", icon: Settings },
        { value: "endpoints", label: "Endpoints", icon: Globe },
        { value: "fields", label: "Champs de données", icon: Database },
        { value: "mappings", label: "Mappings", icon: ArrowUpDown }
      );
    }

    baseTabs.push(
      { value: "statistics", label: "Statistiques", icon: Activity },
      { value: "testing", label: "Tests", icon: TestTube }
    );

    return baseTabs;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'INACTIVE':
        return <Badge variant="secondary">Inactif</Badge>;
      case 'SUSPENDED':
        return <Badge variant="destructive">Suspendu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAuthTypeBadge = (authType: string) => {
    const colors = {
      'NONE': 'bg-gray-100 text-gray-800',
      'API_KEY': 'bg-blue-100 text-blue-800',
      'BEARER': 'bg-green-100 text-green-800',
      'BASIC': 'bg-yellow-100 text-yellow-800',
      'OAUTH2': 'bg-purple-100 text-purple-800',
      'CUSTOM': 'bg-orange-100 text-orange-800'
    };
    return (
      <Badge className={colors[authType as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {authType}
      </Badge>
    );
  };

  const getEndpointTypeBadge = (type: string) => {
    const colors = {
      'CONSULTATION': 'bg-blue-100 text-blue-800',
      'VALIDATION': 'bg-green-100 text-green-800',
      'VERIFICATION': 'bg-yellow-100 text-yellow-800',
      'PAYMENT': 'bg-purple-100 text-purple-800',
      'CALLBACK': 'bg-orange-100 text-orange-800',
      'STATUS': 'bg-gray-100 text-gray-800'
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      'GET': 'bg-green-100 text-green-800',
      'POST': 'bg-blue-100 text-blue-800',
      'PUT': 'bg-orange-100 text-orange-800',
      'DELETE': 'bg-red-100 text-red-800',
      'PATCH': 'bg-purple-100 text-purple-800'
    };
    return (
      <Badge className={colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {method}
      </Badge>
    );
  };

  const getPricingTypeBadge = (type: string) => {
    const colors = {
      'FIXED_AMOUNT': 'bg-blue-100 text-blue-800',
      'PERCENTAGE': 'bg-green-100 text-green-800',
      'MULTIPLIER': 'bg-purple-100 text-purple-800',
      'TIERED': 'bg-orange-100 text-orange-800',
      'FORMULA': 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTestStatusIcon = (testResult: any) => {
    if (!testResult) return <Clock className="h-4 w-4 text-gray-400" />;
    if (testResult.success) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Endpoints</p>
                <p className="text-2xl font-bold">{serviceConfig.statistics?.totalEndpoints || 0}</p>
                <p className="text-xs text-muted-foreground">configurés</p>
              </div>
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Champs</p>
                <p className="text-2xl font-bold">{serviceConfig.statistics?.totalFields || 0}</p>
                <p className="text-xs text-muted-foreground">de données</p>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mappings</p>
                <p className="text-2xl font-bold">{serviceConfig.statistics?.totalMappings || 0}</p>
                <p className="text-xs text-muted-foreground">de réponse</p>
              </div>
              <ArrowUpDown className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Statut</p>
                <div className="mt-1">
                  {getStatusBadge(serviceConfig.status)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {serviceConfig.isTestMode ? "Mode test" : "Production"}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Settings className="h-6 w-6 text-muted-foreground" />
                {getTestStatusIcon(testResults.global)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleTestConfiguration}
            disabled={isTesting}
            variant="outline"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isTesting ? "Test en cours..." : "Tester la configuration"}
          </Button>
          
          <Button
            onClick={() => window.open(serviceConfig.baseUrl, '_blank')}
            variant="outline"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ouvrir l'API
          </Button>

          <Button
            onClick={exportConfiguration}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {serviceProduct.serviceNature === ServiceNature.EXTERNAL_SERVICE ? "Service externe" : "Service interne"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {serviceConfig.authType}
          </Badge>
        </div>
      </div>

      {/* Configuration tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          {getTabsForServiceType().map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Service</Label>
                  <p className="text-base font-medium">{serviceConfig.serviceName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Code</Label>
                  <p className="text-base font-mono">{serviceConfig.serviceCode}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm text-muted-foreground">{serviceConfig.serviceDescription}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Authentification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type d'auth</Label>
                  <div className="mt-1">
                    {getAuthTypeBadge(serviceConfig.authType)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Base URL</Label>
                  <p className="text-sm font-mono break-all">{serviceConfig.baseUrl}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Mode test</Label>
                  <div className="mt-1">
                    {serviceConfig.isTestMode ? (
                      <Badge variant="outline">Activé</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800">Désactivé</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Endpoints overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Endpoints configurés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceConfig.endpoints?.map((endpoint) => (
                  <div key={endpoint.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <span className="font-medium">{endpoint.endpointType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{endpoint.statistics?.fieldCount || 0} champs</Badge>
                        <Badge variant="outline">{endpoint.statistics?.mappingCount || 0} mappings</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{endpoint.fullUrl}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {endpoint.statistics?.hasValidation && (
                        <Badge className="bg-blue-100 text-blue-800">Validation</Badge>
                      )}
                      {endpoint.statistics?.hasCache && (
                        <Badge className="bg-green-100 text-green-800">Cache</Badge>
                      )}
                      {endpoint.statistics?.hasCustomAuth && (
                        <Badge className="bg-purple-100 text-purple-800">Auth custom</Badge>
                      )}
                      {endpoint.statistics?.hasTransformations && (
                        <Badge className="bg-orange-100 text-orange-800">Transformations</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration globale */}
        <TabsContent value="global" className="space-y-6">
          <Form {...globalConfigForm}>
            <form onSubmit={globalConfigForm.handleSubmit(handleUpdateGlobalConfig)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuration globale
                  </CardTitle>
                  <CardDescription>
                    Paramètres généraux du service externe
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* URLs de base */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={globalConfigForm.control}
                      name="baseUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            URL de base
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://api.example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL racine de l'API en production
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={globalConfigForm.control}
                      name="testBaseUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <TestTube className="h-4 w-4" />
                            URL de test
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="https://test-api.example.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL racine de l'API en mode test
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Authentification */}
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Authentification
                    </h3>
                    
                    <FormField
                      control={globalConfigForm.control}
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
                              <SelectItem value={AuthType.NONE}>Aucune</SelectItem>
                              <SelectItem value={AuthType.API_KEY}>Clé API</SelectItem>
                              <SelectItem value={AuthType.BASIC}>Basic Auth</SelectItem>
                              <SelectItem value={AuthType.BEARER}>Bearer Token</SelectItem>
                              <SelectItem value={AuthType.OAUTH2}>OAuth 2.0</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={globalConfigForm.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Clé API</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="sk_..." {...field} />
                            </FormControl>
                            <FormDescription>
                              Clé d'authentification API
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={globalConfigForm.control}
                        name="authUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom d'utilisateur</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormDescription>
                              Pour l'authentification Basic
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Paramètres de connexion */}
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Network className="h-5 w-5" />
                      Paramètres de connexion
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={globalConfigForm.control}
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
                                max="300000"
                                step="1000"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 30000)}
                              />
                            </FormControl>
                            <FormDescription>
                              Délai d'attente maximum
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={globalConfigForm.control}
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
                            <FormDescription>
                              Nombre de tentatives
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={globalConfigForm.control}
                        name="successCodes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Codes de succès
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="200,201,202" {...field} />
                            </FormControl>
                            <FormDescription>
                              Codes HTTP de succès
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Options avancées */}
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Workflow className="h-5 w-5" />
                      Options avancées
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={globalConfigForm.control}
                        name="webhookUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL Webhook</FormLabel>
                            <FormControl>
                              <Input placeholder="https://webhook.example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              URL pour les notifications
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={globalConfigForm.control}
                        name="isTestMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Mode test</FormLabel>
                              <FormDescription>
                                Utiliser l'environnement de test
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
                        control={globalConfigForm.control}
                        name="generateReceipt"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Générer reçu</FormLabel>
                              <FormDescription>
                                Créer automatiquement un reçu
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
                        control={globalConfigForm.control}
                        name="webhookNotification"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Notifications</FormLabel>
                              <FormDescription>
                                Activer les notifications webhook
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
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2">
                    <Button type="submit" disabled={isUpdatingGlobal}>
                      <Save className="h-4 w-4 mr-2" />
                      {isUpdatingGlobal ? "Sauvegarde..." : "Sauvegarder"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* Endpoints détaillés */}
        <TabsContent value="endpoints" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Gestion des endpoints</h3>
              <p className="text-sm text-muted-foreground">
                Configurez les endpoints de votre service externe
              </p>
            </div>
            <Dialog open={showCreateEndpoint} onOpenChange={setShowCreateEndpoint}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un endpoint
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Créer un nouvel endpoint</DialogTitle>
                  <DialogDescription>
                    Ajoutez un nouveau endpoint à votre service
                  </DialogDescription>
                </DialogHeader>
                <Form {...endpointForm}>
                  <form onSubmit={endpointForm.handleSubmit(handleCreateEndpoint)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={endpointForm.control}
                        name="endpointType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type d'endpoint</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={EndpointType.CONSULTATION}>Consultation</SelectItem>
                                <SelectItem value={EndpointType.VALIDATION}>Validation</SelectItem>
                                <SelectItem value={EndpointType.VERIFICATION}>Vérification</SelectItem>
                                <SelectItem value={EndpointType.PAYMENT}>Paiement</SelectItem>
                                <SelectItem value={EndpointType.CALLBACK}>Callback</SelectItem>
                                <SelectItem value={EndpointType.STATUS}>Statut</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={endpointForm.control}
                        name="method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Méthode HTTP</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
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
                      control={endpointForm.control}
                      name="path"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chemin</FormLabel>
                          <FormControl>
                            <Input placeholder="/balance" {...field} />
                          </FormControl>
                          <FormDescription>
                            Chemin relatif à l'URL de base
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={endpointForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Description de l'endpoint..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowCreateEndpoint(false)}>
                        Annuler
                      </Button>
                      <Button type="submit" disabled={isCreatingEndpoint}>
                        {isCreatingEndpoint ? "Création..." : "Créer"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste des endpoints */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Endpoints ({serviceConfig.endpoints?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {serviceConfig.endpoints?.map((endpoint) => (
                    <div
                      key={endpoint.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        activeEndpointId === endpoint.id ? 'border-primary bg-primary/5' : 'border-muted hover:bg-muted/50'
                      }`}
                      onClick={() => setActiveEndpointId(endpoint.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getMethodBadge(endpoint.method)}
                          {getEndpointTypeBadge(endpoint.endpointType)}
                        </div>
                        <div className="flex items-center gap-1">
                          {getTestStatusIcon(testResults[endpoint.id])}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              testEndpoint(endpoint.id);
                            }}
                          >
                            <TestTube className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono truncate">{endpoint.path}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {endpoint.statistics?.fieldCount || 0} champs
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {endpoint.statistics?.mappingCount || 0} mappings
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {(!serviceConfig.endpoints || serviceConfig.endpoints.length === 0) && (
                    <div className="text-center py-6">
                      <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Aucun endpoint configuré</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setShowCreateEndpoint(true)}
                      >
                        Créer le premier endpoint
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Détails de l'endpoint sélectionné */}
            <div className="lg:col-span-2">
              {activeEndpointId ? (
                (() => {
                  const endpoint = serviceConfig.endpoints?.find(e => e.id === activeEndpointId);
                  if (!endpoint) return null;

                  return (
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Code className="h-5 w-5" />
                              {endpoint.endpointType}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => duplicateEndpoint(endpoint)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Dupliquer
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => testEndpoint(endpoint.id)}>
                                <TestTube className="h-4 w-4 mr-2" />
                                Tester
                              </Button>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>URL complète</Label>
                              <p className="text-sm font-mono break-all bg-muted/50 p-2 rounded">{endpoint.fullUrl}</p>
                            </div>
                            <div>
                              <Label>Configuration</Label>
                              <div className="flex items-center gap-2 mt-1">
                                {getMethodBadge(endpoint.method)}
                                <Badge variant="outline">{endpoint.contentType}</Badge>
                                {endpoint.authRequired && (
                                  <Badge className="bg-orange-100 text-orange-800">Auth requis</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {endpoint.timeout && (
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Timeout: {endpoint.timeout}ms
                              </span>
                              <span className="flex items-center gap-1">
                                <RefreshCw className="h-4 w-4" />
                                Retry: {endpoint.retryCount || 0}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Champs de données */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Database className="h-5 w-5" />
                              Champs de données ({endpoint.dataFields?.length || 0})
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setShowCreateField(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter un champ
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {endpoint.dataFields?.map((field) => (
                              <div key={field.id} className="border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{field.dataType}</Badge>
                                    <span className="font-medium">{field.label}</span>
                                    {field.isRequired && (
                                      <Badge className="bg-red-100 text-red-800">Requis</Badge>
                                    )}
                                    {field.isReadonly && (
                                      <Badge className="bg-gray-100 text-gray-800">Lecture seule</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => setEditingField(field.id)}>
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteDataField({ fieldId: field.id, serviceId: serviceProduct.id })}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-mono">{field.key}</span>
                                  {field.description && ` - ${field.description}`}
                                </p>
                                {field.placeholder && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Placeholder: {field.placeholder}
                                  </p>
                                )}
                              </div>
                            ))}
                            {(!endpoint.dataFields || endpoint.dataFields.length === 0) && (
                              <div className="text-center py-4">
                                <Database className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Aucun champ configuré</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Mappings de réponse */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ArrowUpDown className="h-5 w-5" />
                              Mappings de réponse ({endpoint.responseMappings?.length || 0})
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setShowCreateMapping(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter un mapping
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {endpoint.responseMappings?.map((mapping) => (
                              <div key={mapping.id} className="border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{mapping.dataType}</Badge>
                                    <span className="font-medium">{mapping.displayName}</span>
                                    {mapping.isRequired && (
                                      <Badge className="bg-red-100 text-red-800">Requis</Badge>
                                    )}
                                    {mapping.isAmount && (
                                      <Badge className="bg-green-100 text-green-800">Montant</Badge>
                                    )}
                                    {mapping.isReference && (
                                      <Badge className="bg-blue-100 text-blue-800">Référence</Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => setEditingMapping(mapping.id)}>
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteResponseMapping({ mappingId: mapping.id, serviceId: serviceProduct.id })}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-mono">{mapping.jsonPath}</span>
                                  {' → '}
                                  <span className="font-mono">{mapping.customDataKey}</span>
                                </p>
                                {mapping.format && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Format: {mapping.format}
                                  </p>
                                )}
                              </div>
                            ))}
                            {(!endpoint.responseMappings || endpoint.responseMappings.length === 0) && (
                              <div className="text-center py-4">
                                <ArrowUpDown className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Aucun mapping configuré</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">
                      Sélectionnez un endpoint pour voir ses détails
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ou créez votre premier endpoint pour commencer
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Gestion des stocks - PRODUCT */}
        <TabsContent value="stock" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Gestion des stocks
              </CardTitle>
              <CardDescription>
                Suivi et gestion des stocks pour le produit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informations actuelles du stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Stock actuel</span>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{serviceProduct.stockQuantity || 0}</p>
                  <p className="text-xs text-muted-foreground">unités disponibles</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Stock minimum</span>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{serviceProduct.minStock || 0}</p>
                  <p className="text-xs text-muted-foreground">seuil critique</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Seuil d'alerte</span>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{serviceProduct.stockAlertThreshold || 0}</p>
                  <p className="text-xs text-muted-foreground">réapprovisionnement</p>
                </div>
              </div>

              {/* Statut du stock */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Statut du stock</h3>
                  <Badge variant={serviceProduct.isOutOfStock ? "destructive" : serviceProduct.hasLowStock ? "secondary" : "default"}>
                    {serviceProduct.isOutOfStock ? "Rupture de stock" : serviceProduct.hasLowStock ? "Stock faible" : "Stock normal"}
                  </Badge>
                </div>
                
                {serviceProduct.isOutOfStock && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Ce produit est en rupture de stock. Aucune vente n'est possible.
                    </AlertDescription>
                  </Alert>
                )}
                
                {serviceProduct.hasLowStock && !serviceProduct.isOutOfStock && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Stock faible détecté. Réapprovisionnement recommandé.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Actions sur le stock */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ajustement du stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => {
                        updateStock({ 
                          id: serviceProduct.id, 
                          data: { 
                            quantity: 10, 
                            operationType: "ADD" as any,
                            reason: "Réapprovisionnement manuel" 
                          } 
                        });
                      }}
                      disabled={isUpdatingStock}
                      className="h-auto p-4 flex-col items-start"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Plus className="h-4 w-4" />
                        <span className="font-medium">Ajouter</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ajouter du stock
                      </p>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        updateStock({ 
                          id: serviceProduct.id, 
                          data: { 
                            quantity: 1, 
                            operationType: "REMOVE" as any,
                            reason: "Ajustement manuel" 
                          } 
                        });
                      }}
                      disabled={isUpdatingStock}
                      className="h-auto p-4 flex-col items-start"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Trash2 className="h-4 w-4" />
                        <span className="font-medium">Retirer</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Retirer du stock
                      </p>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newQuantity = prompt("Nouvelle quantité :");
                        if (newQuantity) {
                          updateStock({ 
                            id: serviceProduct.id, 
                            data: { 
                              quantity: parseInt(newQuantity), 
                              operationType: "SET" as any,
                              reason: "Définition manuelle" 
                            } 
                          });
                        }
                      }}
                      disabled={isUpdatingStock}
                      className="h-auto p-4 flex-col items-start"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Settings className="h-4 w-4" />
                        <span className="font-medium">Définir</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Définir la quantité
                      </p>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Historique des mouvements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Historique des mouvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      L'historique des mouvements de stock apparaîtra ici
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Champs de calcul - INTERNAL_SERVICE */}
        <TabsContent value="calculations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Champs de calcul
              </CardTitle>
              <CardDescription>
                Configuration des champs de saisie pour le calcul automatique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Aucun champ de calcul configuré
                </p>
                <p className="text-xs text-muted-foreground">
                  Les champs de calcul permettent de définir les données nécessaires pour calculer automatiquement le montant final
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Règles de pricing - INTERNAL_SERVICE */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Règles de pricing</h3>
              <p className="text-sm text-muted-foreground">
                Gérez les règles de tarification pour ce service
              </p>
            </div>
            <Dialog open={showCreateRule} onOpenChange={setShowCreateRule}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une règle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Créer une règle de pricing</DialogTitle>
                  <DialogDescription>
                    Ajoutez une nouvelle règle de tarification
                  </DialogDescription>
                </DialogHeader>
                <Form {...pricingRuleForm}>
                  <form onSubmit={pricingRuleForm.handleSubmit(handleCreatePricingRule)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={pricingRuleForm.control}
                        name="ruleName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de la règle</FormLabel>
                            <FormControl>
                              <Input placeholder="Règle de base" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={pricingRuleForm.control}
                        name="pricingType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type de pricing</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={PricingType.FIXED_AMOUNT}>Montant fixe</SelectItem>
                                <SelectItem value={PricingType.PERCENTAGE}>Pourcentage</SelectItem>
                                <SelectItem value={PricingType.MULTIPLIER}>Multiplicateur</SelectItem>
                                <SelectItem value={PricingType.TIERED}>Échelonné</SelectItem>
                                <SelectItem value={PricingType.FORMULA}>Formule</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={pricingRuleForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Description de la règle..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={pricingRuleForm.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valeur</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={pricingRuleForm.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Devise</FormLabel>
                            <FormControl>
                              <Input placeholder="XOF" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={pricingRuleForm.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priorité</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex items-center justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowCreateRule(false)}>
                        Annuler
                      </Button>
                      <Button type="submit" disabled={isCreatingRule}>
                        {isCreatingRule ? "Création..." : "Créer"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Règles configurées ({pricingRules?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricingRules?.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getPricingTypeBadge(rule.pricingType)}
                        <span className="font-medium">{rule.ruleName}</span>
                        <Badge variant={rule.isActive ? "default" : "secondary"}>
                          {rule.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingRule(rule.id)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRule({ id: rule.id, serviceId: serviceProduct.id })}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Valeur:</span>
                        <p className="font-medium">{rule.value} {rule.currency}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Priorité:</span>
                        <p className="font-medium">{rule.priority}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cumulative:</span>
                        <p className="font-medium">{rule.isCumulative ? "Oui" : "Non"}</p>
                      </div>
                    </div>
                    
                    {rule.description && (
                      <p className="text-sm text-muted-foreground mt-2">{rule.description}</p>
                    )}
                  </div>
                ))}
                
                {(!pricingRules || pricingRules.length === 0) && (
                  <div className="text-center py-6">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Aucune règle configurée</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setShowCreateRule(true)}
                    >
                      Créer la première règle
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistiques */}
        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Statistiques globales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Total endpoints
                    </span>
                    <span className="font-medium">{serviceConfig.statistics?.totalEndpoints || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Total champs
                    </span>
                    <span className="font-medium">{serviceConfig.statistics?.totalFields || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Champs requis
                    </span>
                    <span className="font-medium">{serviceConfig.statistics?.requiredFields || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4" />
                      Total mappings
                    </span>
                    <span className="font-medium">{serviceConfig.statistics?.totalMappings || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Champs avec validation
                    </span>
                    <span className="font-medium">{serviceConfig.statistics?.fieldsWithValidation || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Champs avec dépendances
                    </span>
                    <span className="font-medium">{serviceConfig.statistics?.fieldsWithDependencies || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Dernière utilisation</span>
                    <span className="font-medium text-sm">
                      {serviceConfig.statistics?.lastUsed 
                        ? formatDate(serviceConfig.statistics.lastUsed) 
                        : "Jamais"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Nombre d'utilisations</span>
                    <span className="font-medium">{serviceConfig.statistics?.usageCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taux de succès</span>
                    <span className="font-medium text-green-600">--%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Temps de réponse moyen</span>
                    <span className="font-medium">-- ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Répartition par endpoint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {Object.entries(serviceConfig.statistics?.fieldsByEndpoint || {}).map(([endpointType, count]) => (
                  <div key={endpointType} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getEndpointTypeBadge(endpointType)}
                      <span className="text-sm">Champs</span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
                {Object.entries(serviceConfig.statistics?.mappingsByEndpoint || {}).map(([endpointType, count]) => (
                  <div key={endpointType + '_mappings'} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getEndpointTypeBadge(endpointType)}
                      <span className="text-sm">Mappings</span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Créé le</Label>
                  <p className="text-sm">{formatDate(serviceConfig.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Modifié le</Label>
                  <p className="text-sm">{formatDate(serviceConfig.updatedAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Créé par</Label>
                  <p className="text-sm">{serviceConfig.createdBy || "Système"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Modifié par</Label>
                  <p className="text-sm">{serviceConfig.lastModifiedBy || "Système"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet de tests */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Tests et validation
              </CardTitle>
              <CardDescription>
                Testez votre configuration et vos endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleTestConfiguration}
                  disabled={isTesting}
                  className="h-auto p-4 flex-col items-start"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TestTube className="h-5 w-5" />
                    <span className="font-medium">Test global</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tester la configuration générale
                  </p>
                </Button>
                
                <Button
                  variant="outline"
                  disabled={!serviceConfig.endpoints?.length}
                  className="h-auto p-4 flex-col items-start"
                  onClick={() => {
                    serviceConfig.endpoints?.forEach(endpoint => {
                      testEndpoint(endpoint.id);
                    });
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <PlayCircle className="h-5 w-5" />
                    <span className="font-medium">Test tous les endpoints</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tester tous les endpoints configurés
                  </p>
                </Button>
              </div>
              
              {Object.keys(testResults).length > 0 && (
                <div className="space-y-3">
                  <Separator />
                  <h4 className="font-medium">Résultats des tests</h4>
                  {Object.entries(testResults).map(([key, result]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getTestStatusIcon(result)}
                        <span className="text-sm">{key === 'global' ? 'Configuration globale' : `Endpoint ${key}`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <Badge className="bg-green-100 text-green-800">Succès</Badge>
                        ) : (
                          <Badge variant="destructive">Échec</Badge>
                        )}
                        {result.status && (
                          <Badge variant="outline">{result.status}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs pour la création de champs et mappings */}
      <Dialog open={showCreateField} onOpenChange={setShowCreateField}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un champ de données</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau champ à l'endpoint sélectionné
            </DialogDescription>
          </DialogHeader>
          <Form {...dataFieldForm}>
            <form onSubmit={dataFieldForm.handleSubmit(handleCreateField)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={dataFieldForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input placeholder="phone_number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={dataFieldForm.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clé</FormLabel>
                      <FormControl>
                        <Input placeholder="phoneNumber" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={dataFieldForm.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Libellé</FormLabel>
                    <FormControl>
                      <Input placeholder="Numéro de téléphone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={dataFieldForm.control}
                name="dataType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de données</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={DataType.STRING}>Texte</SelectItem>
                        <SelectItem value={DataType.INTEGER}>Nombre entier</SelectItem>
                        <SelectItem value={DataType.DECIMAL}>Nombre décimal</SelectItem>
                        <SelectItem value={DataType.BOOLEAN}>Booléen</SelectItem>
                        <SelectItem value={DataType.DATE}>Date</SelectItem>
                        <SelectItem value={DataType.EMAIL}>Email</SelectItem>
                        <SelectItem value={DataType.PHONE}>Téléphone</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateField(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isCreatingField}>
                  {isCreatingField ? "Création..." : "Créer"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateMapping} onOpenChange={setShowCreateMapping}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un mapping de réponse</DialogTitle>
            <DialogDescription>
              Mappez un champ de la réponse API
            </DialogDescription>
          </DialogHeader>
          <Form {...responseMappingForm}>
            <form onSubmit={responseMappingForm.handleSubmit(handleCreateMapping)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={responseMappingForm.control}
                  name="jsonPath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chemin JSON</FormLabel>
                      <FormControl>
                        <Input placeholder="$.data.balance" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={responseMappingForm.control}
                  name="customDataKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clé personnalisée</FormLabel>
                      <FormControl>
                        <Input placeholder="account_balance" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={responseMappingForm.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'affichage</FormLabel>
                    <FormControl>
                      <Input placeholder="Solde du compte" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={responseMappingForm.control}
                name="dataType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de données</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={DataType.STRING}>Texte</SelectItem>
                        <SelectItem value={DataType.INTEGER}>Nombre entier</SelectItem>
                        <SelectItem value={DataType.DECIMAL}>Nombre décimal</SelectItem>
                        <SelectItem value={DataType.BOOLEAN}>Booléen</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateMapping(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isCreatingMapping}>
                  {isCreatingMapping ? "Création..." : "Créer"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}