"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useRole, usePermissions, useAddPermissionsToRole } from "@/data/roles-permissions";
import { toast } from "sonner";

export default function RoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: roleData, isLoading: roleLoading } = useRole(id);
  const { data: allPermsData, isLoading: permsLoading } = usePermissions(0, 200);
  const addPermissions = useAddPermissionsToRole();

  const [selectedPermIds, setSelectedPermIds] = useState<Set<string>>(new Set());

  const role = roleData?.data;
  const allPermissions = allPermsData?.data?.content ?? [];

  // Group permissions by module
  const permissionsByModule = allPermissions.reduce<Record<string, typeof allPermissions>>((acc, p) => {
    const mod = p.module || "OTHER";
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(p);
    return acc;
  }, {});

  const assignedPermIds = new Set(role?.permissions?.map((p) => p.id) ?? []);

  const togglePermission = (permId: string) => {
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const handleAssign = () => {
    if (selectedPermIds.size === 0) return;
    addPermissions.mutate(
      { id, permissionIds: Array.from(selectedPermIds) },
      {
        onSuccess: () => {
          setSelectedPermIds(new Set());
          toast.success("Permissions ajoutées");
        },
      }
    );
  };

  if (roleLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Rôle introuvable</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/dashboard/roles">Retour</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/roles"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold">{role.name}</h1>
            {role.isSystem && <Badge className="bg-blue-100 text-blue-800">Système</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {role.code} — Niveau {role.level ?? "—"} — {role.permissions?.length ?? 0} permissions
          </p>
          {role.description && <p className="text-sm mt-2">{role.description}</p>}
        </div>
      </div>

      {/* Current permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Permissions attribuées ({role.permissions?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {role.permissions && role.permissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((p) => (
                <Badge key={p.id} variant="outline" className="text-xs">
                  {p.code}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune permission attribuée</p>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Add permissions */}
      {!role.isSystem && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter des permissions
            </CardTitle>
            {selectedPermIds.size > 0 && (
              <Button
                size="sm"
                onClick={handleAssign}
                disabled={addPermissions.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-1 h-4 w-4" />
                Ajouter ({selectedPermIds.size})
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {permsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(permissionsByModule)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([module, perms]) => (
                    <div key={module}>
                      <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                        {module}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {perms.map((perm) => {
                          const isAssigned = assignedPermIds.has(perm.id);
                          const isSelected = selectedPermIds.has(perm.id);
                          return (
                            <label
                              key={perm.id}
                              className={`flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer transition-colors ${
                                isAssigned
                                  ? "bg-green-50 border-green-200 opacity-60"
                                  : isSelected
                                  ? "bg-blue-50 border-blue-300"
                                  : "hover:bg-muted/50"
                              }`}
                            >
                              <Checkbox
                                checked={isAssigned || isSelected}
                                disabled={isAssigned}
                                onCheckedChange={() => togglePermission(perm.id)}
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-mono truncate">{perm.code}</p>
                                {perm.name && <p className="text-xs text-muted-foreground truncate">{perm.name}</p>}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
