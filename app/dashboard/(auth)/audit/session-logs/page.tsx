import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { LogIn } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Sessions utilisateurs",
    description: "Consultez les logs de sessions utilisateurs.",
    canonical: "/dashboard/audit/session-logs"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Sessions utilisateurs"
      description="Consultez les logs de sessions utilisateurs."
      icon={<LogIn className="mr-5 h-9 w-9 text-purple-500" />}
    />
  );
}