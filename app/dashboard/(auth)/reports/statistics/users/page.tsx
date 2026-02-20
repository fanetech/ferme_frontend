import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Users } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Analytics utilisateurs",
    description: "Analysez le comportement et l'activité des utilisateurs.",
    canonical: "/dashboard/reports/statistics/users"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Analytics utilisateurs"
      description="Analysez le comportement et l'activité des utilisateurs."
      icon={<Users className="mr-5 h-9 w-9 text-cyan-500" />}
    />
  );
}