import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Package } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Produits/Services",
    description: "Gestion du catalogue de produits et services.",
    canonical: "/dashboard/catalog/services"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Produits/Services"
      description="Gérez votre catalogue de produits et services. Ajoutez, modifiez et organisez votre offre commerciale."
      icon={<Package className="mr-5 h-9 w-9 text-orange-500" />}
    />
  );
}