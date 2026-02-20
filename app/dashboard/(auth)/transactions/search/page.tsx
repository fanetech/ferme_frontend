import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Search } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Recherche avancée",
    description: "Effectuez des recherches avancées dans vos transactions.",
    canonical: "/dashboard/transactions/search"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Recherche avancée"
      description="Effectuez des recherches avancées dans vos transactions."
      icon={<Search className="mr-5 h-9 w-9 text-green-500" />}
    />
  );
}