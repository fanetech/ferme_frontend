import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Settings2 } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Configuration services",
    description: "Configurez les paramètres des services et APIs de votre catalogue.",
    canonical: "/dashboard/catalog/api-config"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Configuration services"
      description="Configurez les paramètres des services et APIs de votre catalogue."
      icon={<Settings2 className="mr-5 h-9 w-9 text-gray-500" />}
    />
  );
}