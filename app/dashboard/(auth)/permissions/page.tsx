"use client";

import { useState, useMemo } from "react";
import { Lock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/data/roles-permissions";
import { useDebounce } from "@/hooks/useDebounce";

export default function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { data: response, isLoading } = usePermissions(0, 200);

  const allPermissions = response?.data?.content ?? [];

  // Group by module and filter
  const groupedPermissions = useMemo(() => {
    let perms = allPermissions;
    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      perms = perms.filter(
        (p) =>
          p.code.toLowerCase().includes(term) ||
          p.name.toLowerCase().includes(term) ||
          p.module.toLowerCase().includes(term)
      );
    }

    return perms.reduce<Record<string, typeof perms>>((acc, p) => {
      const mod = p.module || "OTHER";
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(p);
      return acc;
    }, {});
  }, [allPermissions, debouncedSearch]);

  const moduleCount = Object.keys(groupedPermissions).length;
  const permCount = Object.values(groupedPermissions).reduce((s, p) => s + p.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Lock className="h-6 w-6 text-amber-600" />
          Permissions
        </h1>
        <p className="text-muted-foreground">
          {permCount} permissions dans {moduleCount} modules
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une permission..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : Object.keys(groupedPermissions).length === 0 ? (
        <p className="text-muted-foreground text-center py-10">Aucune permission trouvée</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedPermissions)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([module, perms]) => (
              <Card key={module}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="uppercase tracking-wider text-muted-foreground">{module}</span>
                    <Badge variant="outline">{perms.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {perms.map((perm) => (
                      <div key={perm.id} className="rounded-md border p-2.5">
                        <p className="text-xs font-mono font-medium">{perm.code}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{perm.name}</p>
                        {perm.description && (
                          <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">{perm.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
