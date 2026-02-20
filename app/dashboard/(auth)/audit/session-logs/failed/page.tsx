import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { UserX } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Connexions échouées",
    description: "Analysez les tentatives de connexion échouées.",
    canonical: "/dashboard/audit/session-logs/failed"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Connexions échouées"
      description="Analysez les tentatives de connexion échouées."
      icon={<UserX className="mr-5 h-9 w-9 text-red-500" />}
    />
  );
}