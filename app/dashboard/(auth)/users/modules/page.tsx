import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { Grid3X3 } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Modules",
    description: "Gérez les modules accessibles selon les rôles utilisateurs.",
    canonical: "/dashboard/users/modules"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Modules"
      description="Gérez les modules accessibles selon les rôles utilisateurs."
      icon={<Grid3X3 className="mr-5 h-9 w-9 text-yellow-500" />}
    />
  );
}