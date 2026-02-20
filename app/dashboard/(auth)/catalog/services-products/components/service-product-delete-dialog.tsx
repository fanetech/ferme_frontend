import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteServiceProduct } from "@/data/catalog";
import type { ServiceProduct } from "@/types/catalog";

interface ServiceProductDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceProduct: ServiceProduct | null;
}

export function ServiceProductDeleteDialog({
  isOpen,
  onClose,
  serviceProduct
}: ServiceProductDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const { mutate: deleteServiceProduct, isPending } = useDeleteServiceProduct();

  const handleDelete = () => {
    if (serviceProduct && confirmText === serviceProduct.name) {
      deleteServiceProduct(serviceProduct.id, {
        onSuccess: () => {
          onClose();
          setConfirmText("");
        }
      });
    }
  };

  const isConfirmValid = confirmText === serviceProduct?.name;

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  if (!serviceProduct) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le service/produit</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Êtes-vous sûr de vouloir supprimer <strong>{serviceProduct.name}</strong> ?
            </p>
            <p className="text-sm text-red-600">
              ⚠️ Cette action est irréversible et peut affecter :
            </p>
            <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
              <li>Les transactions en cours</li>
              <li>L'historique des ventes</li>
              <li>Les configurations associées</li>
              {serviceProduct.serviceNature === "PRODUCT" && (
                <li>La gestion de stock</li>
              )}
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-2">
          <Label htmlFor="confirm">
            Pour confirmer, tapez le nom du service/produit : <strong>{serviceProduct.name}</strong>
          </Label>
          <Input
            id="confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={serviceProduct.name}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmValid || isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? "Suppression..." : "Supprimer définitivement"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}