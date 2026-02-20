import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Lock } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Permissions",
    description: "Configurez les permissions détaillées pour chaque rôle utilisateur.",
    canonical: "/dashboard/users/permissions"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Permissions"
      description="Configurez les permissions détaillées pour chaque rôle utilisateur."
      icon={<Lock className="mr-5 h-9 w-9 text-red-500" />}
    />
  );
}