import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { UserCheck } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Assignations",
    description: "Assignez des rôles et permissions aux utilisateurs.",
    canonical: "/dashboard/users/assignments"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Assignations"
      description="Assignez des rôles et permissions aux utilisateurs."
      icon={<UserCheck className="mr-5 h-9 w-9 text-pink-500" />}
    />
  );
}