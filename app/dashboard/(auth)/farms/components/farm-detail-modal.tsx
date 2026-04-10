"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { FarmResponse } from "@/types/farm";

interface FarmDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farm: FarmResponse | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Actif", className: "bg-green-100 text-green-800" },
  INACTIVE: { label: "Inactif", className: "bg-gray-100 text-gray-800" },
  ABANDONED: { label: "Abandonné", className: "bg-red-100 text-red-800" },
};

const typeLabels: Record<string, string> = {
  CROP: "Culture",
  LIVESTOCK: "Élevage",
  MIXED: "Mixte",
  AQUACULTURE: "Aquaculture",
};

const soilLabels: Record<string, string> = {
  CLAY: "Argileux", SANDY: "Sableux", LOAM: "Limoneux", SILTY: "Silteux",
  PEATY: "Tourbeux", CHALKY: "Calcaire", OTHER: "Autre",
};

const waterLabels: Record<string, string> = {
  WELL: "Puits", RIVER: "Rivière", RAIN: "Pluie", IRRIGATION_CANAL: "Canal d'irrigation",
};

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function FarmDetailModal({ open, onOpenChange, farm }: FarmDetailModalProps) {
  if (!farm) return null;

  const status = statusConfig[farm.status] ?? { label: farm.status, className: "" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {farm.name}
            <Badge className={status.className}>{status.label}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Informations générales</h4>
            <div className="rounded-lg border p-3">
              <Row label="Code" value={farm.code} />
              <Row label="Type" value={typeLabels[farm.type] ?? farm.type} />
              <Row label="Organisation" value={farm.organizationName} />
              <Row label="Superficie totale" value={farm.totalAreaHectares ? `${farm.totalAreaHectares} ha` : undefined} />
              <Row label="Superficie cultivable" value={farm.cultivableAreaHectares ? `${farm.cultivableAreaHectares} ha` : undefined} />
              <Row label="Date d'établissement" value={farm.establishmentDate} />
              <Row label="Certification" value={farm.certificationStatus} />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Propriétaire</h4>
            <div className="rounded-lg border p-3">
              <Row label="Nom" value={farm.ownerName} />
              <Row label="Téléphone" value={farm.ownerPhone} />
              <Row label="Gestionnaire" value={farm.managerName} />
            </div>
          </div>

          {(farm.province || farm.commune || farm.village || farm.address) && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Localisation</h4>
              <div className="rounded-lg border p-3">
                <Row label="Province" value={farm.province} />
                <Row label="Commune" value={farm.commune} />
                <Row label="Village" value={farm.village} />
                <Row label="Adresse" value={farm.address} />
              </div>
            </div>
          )}

          {(farm.soilType || farm.waterSource) && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Caractéristiques</h4>
              <div className="rounded-lg border p-3">
                <Row label="Type de sol" value={farm.soilType ? soilLabels[farm.soilType] ?? farm.soilType : undefined} />
                <Row label="Source d'eau" value={farm.waterSource ? waterLabels[farm.waterSource] ?? farm.waterSource : undefined} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
