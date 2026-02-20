import { generateMeta } from "@/lib/utils";
import ComingSoon from "@/components/coming-soon";
import { LayoutDashboard } from "lucide-react";

export async function generateMetadata() {
  return generateMeta({
    title: "Admin Dashboard",
    description:
      "The admin dashboard template offers a sleek and efficient interface for monitoring important data and user interactions. Built with shadcn/ui.",
    canonical: "/default"
  });
}

export default function Page() {
  return (
    <ComingSoon
      title="Admin Dashboard"
      description="Tableau de bord principal avec vue d'ensemble des données et statistiques importantes."
      icon={<LayoutDashboard className="mr-5 h-9 w-9 text-blue-500" />}
    />
  );
}
