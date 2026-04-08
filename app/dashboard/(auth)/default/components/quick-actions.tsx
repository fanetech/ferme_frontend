"use client";

import Link from "next/link";
import { Tractor, Building, Users, Sprout, PawPrint, Package, ShoppingBasket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const actions = [
  { label: "Nouvelle ferme", href: "/dashboard/farms", icon: Tractor, color: "text-green-600" },
  { label: "Organisation", href: "/dashboard/organizations", icon: Building, color: "text-blue-600" },
  { label: "Utilisateurs", href: "/dashboard/users", icon: Users, color: "text-purple-600" },
  { label: "Parcelles", href: "/dashboard/crops", icon: Sprout, color: "text-emerald-600" },
  { label: "Animaux", href: "/dashboard/livestock", icon: PawPrint, color: "text-orange-600" },
  { label: "Inventaire", href: "/dashboard/inventory", icon: Package, color: "text-cyan-600" },
  { label: "Produits", href: "/dashboard/marketplace/products", icon: ShoppingBasket, color: "text-pink-600" },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Accès rapide</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map((action) => (
          <Button
            key={action.href}
            variant="ghost"
            className="justify-start h-auto py-2.5"
            asChild
          >
            <Link href={action.href}>
              <action.icon className={`mr-3 h-4 w-4 ${action.color}`} />
              <span className="text-sm">{action.label}</span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
