import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Coins } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Gestion des tokens",
    description: "Gérez les tokens d'authentification et d'accès.",
    canonical: "/dashboard/settings/security/tokens"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Gestion des tokens"
      description="Gérez les tokens d'authentification et d'accès."
      icon={<Coins className="mr-5 h-9 w-9 text-green-500" />}
    />
  );
}