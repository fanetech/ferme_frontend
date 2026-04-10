"use client";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { UserResponse } from "@/types/user";

interface FmUserDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "bg-green-100 text-green-800" },
  INACTIVE: { label: "Inactif", className: "bg-gray-100 text-gray-800" },
  BLOCKED: { label: "Bloqué", className: "bg-red-100 text-red-800" },
  DELETED: { label: "Supprimé", className: "bg-red-200 text-red-900" },
};

const genderLabels: Record<string, string> = { M: "Homme", F: "Femme", OTHER: "Autre" };
const literacyLabels: Record<string, string> = { NONE: "Aucun", BASIC: "Basique", INTERMEDIATE: "Intermédiaire", ADVANCED: "Avancé" };

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function FmUserDetailModal({ open, onOpenChange, user }: FmUserDetailModalProps) {
  if (!user) return null;
  const status = statusConfig[user.status] ?? { label: user.status, className: "" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {user.firstName} {user.lastName}
            <Badge className={status.className}>{status.label}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Identité</h4>
            <div className="rounded-lg border p-3">
              <Row label="Code" value={user.code} />
              <Row label="Prénom" value={user.firstName} />
              <Row label="Nom" value={user.lastName} />
              <Row label="Autres noms" value={user.otherNames} />
              <Row label="Genre" value={user.gender ? genderLabels[user.gender] ?? user.gender : undefined} />
              <Row label="Date de naissance" value={user.birthDate} />
              <Row label="N° d'identité" value={user.nationalId} />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Contact</h4>
            <div className="rounded-lg border p-3">
              <Row label="Téléphone" value={user.phoneNumber} />
              <Row label="Email" value={user.email} />
              <Row label="Langue" value={user.languagePreference} />
              <Row label="Niveau d'alphabétisation" value={user.literacyLevel ? literacyLabels[user.literacyLevel] ?? user.literacyLevel : undefined} />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Activité</h4>
            <div className="rounded-lg border p-3">
              <Row label="Dernière connexion" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("fr-FR") : "Jamais"} />
              <Row label="Dernière sync" value={user.lastSyncAt ? new Date(user.lastSyncAt).toLocaleString("fr-FR") : "Jamais"} />
              <Row label="Créé le" value={new Date(user.createdAt).toLocaleString("fr-FR")} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
