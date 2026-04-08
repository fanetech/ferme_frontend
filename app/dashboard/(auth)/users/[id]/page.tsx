"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useFmUser, useChangeUserStatus } from "@/data/fm-users";

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "bg-green-100 text-green-800" },
  INACTIVE: { label: "Inactif", className: "bg-gray-100 text-gray-800" },
  BLOCKED: { label: "Bloqué", className: "bg-red-100 text-red-800" },
  DELETED: { label: "Supprimé", className: "bg-red-200 text-red-900" },
};

const genderLabels: Record<string, string> = { M: "Homme", F: "Femme", OTHER: "Autre" };

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: userData, isLoading } = useFmUser(id);
  const changeStatus = useChangeUserStatus();

  const user = userData?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Utilisateur introuvable</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard/users">Retour</Link>
        </Button>
      </div>
    );
  }

  const status = statusConfig[user.status] ?? { label: user.status, className: "" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/users"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <UserCog className="h-6 w-6 text-purple-600" />
            <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
            <Badge className={status.className}>{status.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{user.code} — {user.phoneNumber}</p>
        </div>
        <div className="flex gap-2">
          {user.status !== "ACTIVE" && (
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-600"
              onClick={() => changeStatus.mutate({ id: user.id, status: "ACTIVE" })}
              disabled={changeStatus.isPending}
            >
              Activer
            </Button>
          )}
          {user.status === "ACTIVE" && (
            <Button
              size="sm"
              variant="outline"
              className="text-orange-600 border-orange-600"
              onClick={() => changeStatus.mutate({ id: user.id, status: "INACTIVE" })}
              disabled={changeStatus.isPending}
            >
              Désactiver
            </Button>
          )}
          {user.status !== "BLOCKED" && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-600"
              onClick={() => changeStatus.mutate({ id: user.id, status: "BLOCKED" })}
              disabled={changeStatus.isPending}
            >
              Bloquer
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Informations personnelles</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Code" value={user.code} />
            <InfoRow label="Prénom" value={user.firstName} />
            <InfoRow label="Nom" value={user.lastName} />
            <InfoRow label="Autres noms" value={user.otherNames} />
            <InfoRow label="Genre" value={user.gender ? genderLabels[user.gender] : undefined} />
            <InfoRow label="Date de naissance" value={user.birthDate} />
            <InfoRow label="N° d'identité" value={user.nationalId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Contact & Préférences</CardTitle></CardHeader>
          <CardContent>
            <InfoRow label="Téléphone" value={user.phoneNumber} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Langue" value={user.languagePreference ?? "fr"} />
            <InfoRow label="Alphabétisation" value={user.literacyLevel} />
            <Separator className="my-2" />
            <InfoRow label="Dernière connexion" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("fr-FR") : "Jamais"} />
            <InfoRow label="Dernière sync" value={user.lastSyncAt ? new Date(user.lastSyncAt).toLocaleString("fr-FR") : "Jamais"} />
            <InfoRow label="Créé le" value={new Date(user.createdAt).toLocaleString("fr-FR")} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
