import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { UserPlus } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Ajouter utilisateur",
    description: "Créez un nouveau compte utilisateur avec les permissions appropriées.",
    canonical: "/dashboard/users/create"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Ajouter utilisateur"
      description="Créez un nouveau compte utilisateur avec les permissions appropriées."
      icon={<UserPlus className="mr-5 h-9 w-9 text-green-500" />}
    />
  );
}