import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Settings } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Paramètres globaux",
    description: "Configurez les paramètres généraux du système.",
    canonical: "/dashboard/settings/system"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Paramètres globaux"
      description="Configurez les paramètres généraux du système."
      icon={<Settings className="mr-5 h-9 w-9 text-indigo-500" />}
    />
  );
}