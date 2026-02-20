import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ServiceProductFormModalProps {
  serviceProductId: string | null;
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
}

export function ServiceProductFormModal({
  serviceProductId,
  isOpen,
  onClose,
  mode
}: ServiceProductFormModalProps) {
  const router = useRouter();

  const handleOpenFullPage = () => {
    onClose();
    if (mode === "create") {
      const params = serviceProductId ? `?duplicateFrom=${serviceProductId}` : '';
      router.push(`/dashboard/catalog/services-products/create${params}`);
    } else {
      router.push(`/dashboard/catalog/services-products/${serviceProductId}/edit`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Créer un Service/Produit" : "Modifier le Service/Produit"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            La création et modification des services/produits se fait sur une page dédiée 
            pour gérer la complexité des configurations.
          </p>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleOpenFullPage}>
              {mode === "create" ? "Créer" : "Modifier"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}