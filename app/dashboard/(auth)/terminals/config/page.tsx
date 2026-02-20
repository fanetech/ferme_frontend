import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Settings } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Statuts et configuration",
    description: "Configurez les statuts et paramètres de vos terminaux TPE.",
    canonical: "/dashboard/terminals/config"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Statuts et configuration"
      description="Configurez les statuts et paramètres de vos terminaux TPE."
      icon={<Settings className="mr-5 h-9 w-9 text-pink-500" />}
    />
  );
}