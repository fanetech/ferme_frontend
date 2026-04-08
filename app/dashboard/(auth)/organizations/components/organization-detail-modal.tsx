"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { OrganizationResponse } from "@/types/organization";

interface OrganizationDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: OrganizationResponse | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "bg-green-100 text-green-800" },
  INACTIVE: { label: "Inactif", className: "bg-gray-100 text-gray-800" },
  SUSPENDED: { label: "Suspendu", className: "bg-red-100 text-red-800" },
};

const typeLabels: Record<string, string> = {
  COOPERATIVE: "Coopérative",
  GROUPEMENT: "Groupement",
  ENTREPRISE: "Entreprise",
  ONG: "ONG",
};

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function OrganizationDetailModal({
  open,
  onOpenChange,
  organization,
}: OrganizationDetailModalProps) {
  if (!organization) return null;

  const status = statusConfig[organization.status] ?? { label: organization.status, className: "" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {organization.name}
            <Badge className={status.className}>{status.label}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Informations générales</h4>
            <div className="rounded-lg border p-3">
              <DetailRow label="Code" value={organization.code} />
              <DetailRow label="Type" value={typeLabels[organization.type] ?? organization.type} />
              <DetailRow label="Nombre de fermes" value={organization.farmCount} />
              {organization.description && (
                <>
                  <Separator className="my-2" />
                  <p className="text-sm text-muted-foreground">{organization.description}</p>
                </>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Contact</h4>
            <div className="rounded-lg border p-3">
              <DetailRow label="Personne de contact" value={organization.contactPerson} />
              <DetailRow label="Téléphone" value={organization.phone} />
              <DetailRow label="Téléphone alt." value={organization.alternativePhone} />
              <DetailRow label="Email" value={organization.email} />
            </div>
          </div>

          {(organization.province || organization.commune || organization.village || organization.address) && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Localisation</h4>
              <div className="rounded-lg border p-3">
                <DetailRow label="Province" value={organization.province} />
                <DetailRow label="Commune" value={organization.commune} />
                <DetailRow label="Village" value={organization.village} />
                <DetailRow label="Adresse" value={organization.address} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
