import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { User } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Profils utilisateurs",
    description: "Consultez et gérez les profils utilisateurs de votre plateforme.",
    canonical: "/dashboard/users/profiles"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Profils utilisateurs"
      description="Consultez et gérez les profils utilisateurs de votre plateforme."
      icon={<User className="mr-5 h-9 w-9 text-blue-500" />}
    />
  );
}