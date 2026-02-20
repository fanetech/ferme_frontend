"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlayCircle, Loader2 } from "lucide-react";
import { EndpointSelector } from "./EndpointSelector";
import { DataFieldsInput } from "./DataFieldsInput";
import { JsonPreview } from "./JsonPreview";
import { ResponseMappingsPreview } from "./ResponseMappingsPreview";
import { useServiceConfig, useEndpointConfigs, useGetOrCreateServiceConfig } from "@/data/catalog";
import { type ServiceConfig, ServiceProduct } from "@/types/catalog";
import { toast } from "sonner";

interface ExternalServiceTestSheetProps {
  serviceProduct: ServiceProduct;
  serviceConfig?: ServiceConfig;
}

export function ExternalServiceTestSheet({ serviceProduct , serviceConfig}: ExternalServiceTestSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEndpointId, setSelectedEndpointId] = useState("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResponse, setSimulationResponse] = useState<any>(null);

  const form = useForm({
    defaultValues: {},
  });

  const { data: endpoints = [] } = useEndpointConfigs(
    serviceConfig?.id || "", 
    !!serviceConfig?.id
  );

  const selectedEndpoint = endpoints.find(ep => ep.id === selectedEndpointId);

  // Reset de l'interface quand l'endpoint change
  useEffect(() => {
    if (selectedEndpointId) {
      // Reset complet de l'interface
      setFormData({});
      form.reset({});
      setSimulationResponse(null);
    }
  }, [selectedEndpointId, form]);

  const handleFieldChange = (fieldKey: string, value: any) => {
    const newFormData = { ...formData, [fieldKey]: value };
    setFormData(newFormData);
    form.setValue(fieldKey, value);
  };

  const handleReset = () => {
    setFormData({});
    form.reset();
    setSimulationResponse(null);
  };

  const handleSimulate = async () => {
    if (!selectedEndpoint) {
      toast.error("Veuillez sélectionner un endpoint");
      return;
    }

    setIsSimulating(true);
    try {
      // Simuler un appel API (remplacer par un vrai appel plus tard)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simuler une réponse
      const mockResponse = {
        status: 200,
        data: {
          success: true,
          reference: "TEST-" + Date.now(),
          amount: formData.amount || 0,
          currency: "XOF",
          service_name: serviceProduct.name,
          timestamp: new Date().toISOString(),
          ...formData
        }
      };
      
      setSimulationResponse(mockResponse);
      toast.success("Simulation réussie");
    } catch (error) {
      toast.error("Erreur lors de la simulation");
      console.error(error);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <PlayCircle className="h-4 w-4" />
          Tester le service
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] p-0">
        <div className="flex h-full">
          {/* Partie gauche - Formulaire */}
          <div className="flex-1 border-r border-border">
            <SheetHeader className="p-6 border-b border-border">
              <SheetTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Test du service externe - {serviceProduct?.name}
              </SheetTitle>
              <SheetDescription>
                Sélectionnez un endpoint et remplissez les champs pour tester l'intégration
              </SheetDescription>
            </SheetHeader>
            
            <ScrollArea className="h-[calc(100%-120px)]">
              <div className="p-6 space-y-6">
                {/* Sélecteur d'endpoint */}
                <EndpointSelector
                  endpoints={endpoints}
                  selectedEndpointId={selectedEndpointId}
                  onEndpointChange={setSelectedEndpointId}
                />

                {/* Champs de données dynamiques */}
                {selectedEndpointId && (
                  <DataFieldsInput
                    endpointId={selectedEndpointId}
                    formData={formData}
                    onChange={handleFieldChange}
                  />
                )}

                {/* Bouton de réinitialisation */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Partie droite - Aperçu JSON */}
          <div className="w-1/2 min-w-0 flex flex-col">
            <div className="p-6 border-b border-border flex-shrink-0">
              <h3 className="text-lg font-semibold">Aperçu JSON</h3>
              <p className="text-sm text-muted-foreground">
                Données saisies en temps réel
              </p>
            </div>
            
            <ScrollArea className="h-[calc(100%-120px)] flex-1">
              <div className="p-6 min-w-0">
                <JsonPreview 
                  data={formData} 
                  response={simulationResponse}
                  endpoint={selectedEndpoint}
                  endpointId={selectedEndpointId}
                  onSimulate={handleSimulate}
                  isSimulating={isSimulating}
                  hasValidData={selectedEndpointId && Object.keys(formData).length > 0}
                  disabled={!selectedEndpointId}
                />
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}