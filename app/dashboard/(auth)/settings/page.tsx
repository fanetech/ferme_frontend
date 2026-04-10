"use client";

import { Settings, User, Lock, Key, Bell, Shield } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useAuth from "@/store/useAuth";
import { Badge } from "@/components/ui/badge";

const settingsLinks = [
  { title: "Profil", description: "Modifier vos informations personnelles", href: "/dashboard/settings/profile", icon: User, color: "text-blue-600 bg-blue-100" },
  { title: "Changer le mot de passe", description: "Mettre à jour votre mot de passe de connexion", href: "/dashboard/settings/change-password", icon: Lock, color: "text-green-600 bg-green-100" },
  { title: "Code PIN", description: "Gérer votre code PIN de sécurité", href: "/dashboard/settings/pin", icon: Key, color: "text-purple-600 bg-purple-100" },
  { title: "Sécurité", description: "Paramètres de sécurité avancés", href: "/dashboard/settings/security", icon: Shield, color: "text-red-600 bg-red-100" },
];

export default function SettingsPage() {
  const { user, roles, permissions } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-gray-600" /> Paramètres
        </h1>
        <p className="text-muted-foreground">Gérez votre compte et vos préférences</p>
      </div>

      {/* User summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <span className="text-xl font-bold text-green-700">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-muted-foreground">{user?.phoneNumber} {user?.code ? `— ${user.code}` : ""}</p>
              <div className="flex items-center gap-2 mt-1">
                {roles.map((role) => (
                  <Badge key={role} variant="outline" className="text-xs">{role}</Badge>
                ))}
                <span className="text-xs text-muted-foreground">{permissions.length} permissions</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {settingsLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardContent className="pt-6 flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
