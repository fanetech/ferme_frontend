import { generateMeta } from "@/lib/utils";

export async function generateMetadata() {
  return generateMeta({
    title: "Super Structures",
    description: "Gestion des super structures organisationnelles.",
    canonical: "/dashboard/organizations/super-structures"
  });
}

export default function SuperStructuresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}