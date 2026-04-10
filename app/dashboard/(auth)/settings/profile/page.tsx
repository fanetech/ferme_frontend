"use client";

import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import useAuth from "@/store/useAuth";

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user, roles, permissions } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/dashboard/settings"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><User className="h-6 w-6 text-blue-600" /> Mon profil</h1>
          <p className="text-muted-foreground">Informations de votre compte</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Informations personnelles</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Identifiant" value={user?.id} />
            <InfoRow label="Code" value={user?.code} />
            <InfoRow label="Prénom" value={user?.firstName} />
            <InfoRow label="Nom" value={user?.lastName} />
            <InfoRow label="Téléphone" value={user?.phoneNumber} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Rôles & Permissions</CardTitle></CardHeader>
          <CardContent>
            <div className="mb-3">
              <p className="text-sm text-muted-foreground mb-2">Rôles</p>
              <div className="flex flex-wrap gap-2">
                {roles.length > 0 ? roles.map((role) => (
                  <Badge key={role} className="bg-indigo-100 text-indigo-800">{role}</Badge>
                )) : <span className="text-sm text-muted-foreground">Aucun rôle</span>}
              </div>
            </div>
            <Separator className="my-3" />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Permissions ({permissions.length})</p>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {permissions.length > 0 ? permissions.sort().map((perm) => (
                  <Badge key={perm} variant="outline" className="text-[10px] font-mono">{perm}</Badge>
                )) : <span className="text-sm text-muted-foreground">Aucune permission</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
