import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Shield } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Authentification à deux facteurs",
    description: "Configurez l'authentification à deux facteurs.",
    canonical: "/dashboard/settings/security/2fa"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Authentification à deux facteurs"
      description="Configurez l'authentification à deux facteurs."
      icon={<Shield className="mr-5 h-9 w-9 text-blue-500" />}
    />
  );
}