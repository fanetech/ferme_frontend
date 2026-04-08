"use client";

import Link from "next/link";
import { Tractor, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { FarmResponse } from "@/types/farm";

interface RecentFarmsProps {
  farms: FarmResponse[];
  loading: boolean;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  ABANDONED: "bg-red-100 text-red-800",
};

const typeLabels: Record<string, string> = {
  CROP: "Culture",
  LIVESTOCK: "Élevage",
  MIXED: "Mixte",
  AQUACULTURE: "Aquaculture",
};

export function RecentFarms({ farms, loading }: RecentFarmsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Fermes récentes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/farms">
            Voir tout <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : farms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Tractor className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">Aucune ferme enregistrée</p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link href="/dashboard/farms">Ajouter une ferme</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {farms.map((farm) => (
              <Link
                key={farm.id}
                href={`/dashboard/farms/${farm.id}`}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                    <Tractor className="h-4 w-4 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{farm.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {typeLabels[farm.type] ?? farm.type}
                      {farm.province && ` — ${farm.province}`}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={statusColors[farm.status] ?? ""}>
                  {farm.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
