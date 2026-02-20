import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Building } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Paramètres par structure",
    description: "Configurez les paramètres spécifiques par structure.",
    canonical: "/dashboard/settings/structure"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Paramètres par structure"
      description="Configurez les paramètres spécifiques par structure."
      icon={<Building className="mr-5 h-9 w-9 text-gray-500" />}
    />
  );
}