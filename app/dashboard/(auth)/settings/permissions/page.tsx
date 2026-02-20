import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Lock } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Gestion des permissions",
    description: "Administrez les permissions globales du système.",
    canonical: "/dashboard/settings/permissions"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Gestion des permissions"
      description="Administrez les permissions globales du système."
      icon={<Lock className="mr-5 h-9 w-9 text-teal-500" />}
    />
  );
}