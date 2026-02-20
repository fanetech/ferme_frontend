"use client";

import { useState } from "react";
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
import { CalculationFieldCardData } from "@/lib/utils/internalServiceTypes";
import { DynamicFieldRenderer } from "./DynamicFieldRenderer";
import { JsonPreview } from "./JsonPreview";
import { PlayCircle } from "lucide-react";

interface FieldTestSheetProps {
  serviceProduct: any;
  calculationFields: CalculationFieldCardData[];
}

export function FieldTestSheet({ serviceProduct, calculationFields }: FieldTestSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const form = useForm({
    defaultValues: {},
  });

  // Trier les champs par displayOrder
  const sortedFields = [...calculationFields]
    .filter(field => field.isVisible && !field.isHidden)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const handleFieldChange = (fieldKey: string, value: any) => {
    const newFormData = { ...formData, [fieldKey]: value };
    setFormData(newFormData);
    form.setValue(fieldKey, value);
  };

  const handleReset = () => {
    setFormData({});
    form.reset();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <PlayCircle className="h-4 w-4" />
          Tester les champs
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] p-0">
        <div className="flex h-full">
          {/* Partie gauche - Formulaire */}
          <div className="flex-1 border-r border-border">
            <SheetHeader className="p-6 border-b border-border">
              <SheetTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Test des champs - {serviceProduct?.name}
              </SheetTitle>
              <SheetDescription>
                Remplissez les champs pour tester la validation et voir le résultat en JSON
              </SheetDescription>
            </SheetHeader>
            
            <ScrollArea className="h-[calc(100%-120px)]">
              <div className="p-6 space-y-6">
                {sortedFields.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Aucun champ à tester</h3>
                    <p className="text-sm">
                      Ajoutez d'abord des champs de calcul dans l'onglet "Champs de calcul"
                    </p>
                  </div>
                ) : (
                  <>
                    {sortedFields.map((field) => (
                      <DynamicFieldRenderer
                        key={field.id}
                        field={field}
                        value={formData[field.fieldKey]}
                        onChange={(value) => handleFieldChange(field.fieldKey, value)}
                      />
                    ))}
                    
                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                      >
                        Réinitialiser
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Partie droite - Aperçu JSON */}
          <div className="w-1/2">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold">Aperçu JSON</h3>
              <p className="text-sm text-muted-foreground">
                Données saisies en temps réel
              </p>
            </div>
            
            <ScrollArea className="h-[calc(100%-120px)]">
              <div className="p-6">
                <JsonPreview 
                  data={formData} 
                  serviceId={serviceProduct?.id}
                />
              </div>
            </ScrollArea>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}