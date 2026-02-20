import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { ShieldCheck } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Paramètres de sécurité",
    description: "Configurez les paramètres de sécurité avancés.",
    canonical: "/dashboard/settings/security"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Paramètres de sécurité"
      description="Configurez les paramètres de sécurité avancés."
      icon={<ShieldCheck className="mr-5 h-9 w-9 text-cyan-500" />}
    />
  );
}