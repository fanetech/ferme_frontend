import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormModal } from "@/components/ui/modal/FormModal";
import { Search, CreditCard, Hash } from "lucide-react";
import { toast } from "sonner";
import client from "@/data/client/index";

interface PaymentSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentFound?: (payment: any) => void;
}

interface SearchFormData {
  searchValue: string;
}

export function PaymentSearchModal({
  isOpen,
  onClose,
  onPaymentFound
}: PaymentSearchModalProps) {
  const [searchType, setSearchType] = useState<"id" | "reference">("reference");
  const [isSearching, setIsSearching] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<SearchFormData>({
    defaultValues: {
      searchValue: "",
    },
  });

  const searchValue = watch("searchValue");

  const onSubmit = async (data: SearchFormData) => {
    if (!data.searchValue.trim()) {
      toast.error("Veuillez entrer une valeur de recherche");
      return;
    }

    setIsSearching(true);
    try {
      let response;

      if (searchType === "id") {
        // Valider le format UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(data.searchValue)) {
          toast.error("Format d'ID invalide. Un UUID est requis.");
          setIsSearching(false);
          return;
        }

        response = await client.payments.getById(data.searchValue);
      } else {
        // Recherche par référence
        response = await client.payments.getByReference(data.searchValue);
      }

      if (response?.data) {
        toast.success("Paiement trouvé!");
        if (onPaymentFound) {
          onPaymentFound(response.data);
        }
        handleClose();
      } else {
        toast.error("Aucun paiement trouvé avec cette " + (searchType === "id" ? "ID" : "référence"));
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        toast.error("Aucun paiement trouvé avec cette " + (searchType === "id" ? "ID" : "référence"));
      } else {
        toast.error("Erreur lors de la recherche du paiement");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    reset();
    setSearchType("reference");
    onClose();
  };

  const titleIcon = <Search className="h-5 w-5 text-blue-600" />;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Rechercher un paiement"
      titleIcon={titleIcon}
      subtitle="Recherchez un paiement par référence ou par ID unique"
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={isSearching ? "Recherche..." : "Rechercher"}
      isSubmitting={isSearching}
      isDirty={isDirty}
      size="md"
      footerNote="Appuyez sur Entrée pour lancer la recherche rapidement."
    >
      <div className="space-y-4">
        {/* Type de recherche */}
        <div>
          <Label>Type de recherche</Label>
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant={searchType === "reference" ? "default" : "outline"}
              onClick={() => setSearchType("reference")}
              className="flex-1"
              disabled={isSearching}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Par référence
            </Button>
            <Button
              type="button"
              variant={searchType === "id" ? "default" : "outline"}
              onClick={() => setSearchType("id")}
              className="flex-1"
              disabled={isSearching}
            >
              <Hash className="mr-2 h-4 w-4" />
              Par ID
            </Button>
          </div>
        </div>

        {/* Champ de recherche */}
        <div>
          <Label htmlFor="searchValue">
            {searchType === "id" ? "ID du paiement (UUID)" : "Référence du paiement (PAY-XXXXXXXX)"} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="searchValue"
            {...register("searchValue", {
              required: "La valeur de recherche est obligatoire",
              validate: (value) => {
                if (searchType === "id") {
                  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                  if (!uuidRegex.test(value)) {
                    return "Format d'ID invalide. Un UUID est requis.";
                  }
                }
                return true;
              }
            })}
            placeholder={searchType === "id" ? "550e8400-e29b-41d4-a716-446655440000" : "PAY-20250131-123456"}
            className={`mt-1 ${errors.searchValue ? "border-red-500" : ""}`}
            disabled={isSearching}
          />
          {errors.searchValue ? (
            <p className="text-sm text-red-500 mt-1">{errors.searchValue.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              {searchType === "id"
                ? "Entrez l'identifiant unique (UUID) du paiement"
                : "Entrez la référence complète du paiement"
              }
            </p>
          )}
        </div>
      </div>
    </FormModal>
  );
}
