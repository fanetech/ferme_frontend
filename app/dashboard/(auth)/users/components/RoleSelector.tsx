"use client";

import { Check, ChevronsUpDown, X, Shield, Crown, Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAvailableRoles } from "@/data/users";
import type { Role } from "@/types/auth";

interface RoleSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  organizationType: "STRUCTURE" | "SUPER_STRUCTURE";
  organizationId: string;
  error?: string;
  disabled?: boolean;
}

export function RoleSelector({
  value = [],
  onChange,
  organizationType,
  organizationId,
  error,
  disabled = false
}: RoleSelectorProps) {

  // Récupérer les rôles assignables
  const { data: availableRoles = [], isLoading, error: fetchError } = useAvailableRoles({
    targetOrganizationType: organizationType,
    targetOrganizationId: organizationId
  });


  // S'assurer que availableRoles est toujours un tableau
  const safeAvailableRoles = Array.isArray(availableRoles) ? availableRoles : [];
  const selectedRoles = safeAvailableRoles.filter(role => value.includes(role.id));

  const handleSelectRole = (roleId: string) => {
    if (!value.includes(roleId)) {
      onChange([...value, roleId]);
    }
  };

  const handleRemoveRole = (roleId: string) => {
    onChange(value.filter(id => id !== roleId));
  };

  const getRoleIcon = (role: Role) => {
    if (role.hierarchyLevel >= 30) return <Crown className="h-3 w-3" />;
    if (role.hierarchyLevel >= 20) return <Shield className="h-3 w-3" />;
    return <Eye className="h-3 w-3" />;
  };

  const getRoleColor = (role: Role) => {
    if (role.color) return role.color;
    if (role.hierarchyLevel >= 30) return "#f59e0b"; // amber
    if (role.hierarchyLevel >= 20) return "#3b82f6"; // blue
    return "#6b7280"; // gray
  };

  if (fetchError) {
    return (
      <div className="text-sm text-destructive">
        Erreur lors du chargement des rôles disponibles
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Select pour ajouter des rôles */}
      <Select
        value=""
        onValueChange={handleSelectRole}
        disabled={disabled || isLoading || !organizationId}
      >
        <SelectTrigger 
          className={cn(
            "w-full",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        >
          <SelectValue placeholder={
            !organizationId 
              ? "Sélectionnez d'abord une organisation" 
              : isLoading
              ? "Chargement des rôles..."
              : "Ajouter un rôle..."
          }>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {safeAvailableRoles.length === 0 ? (
            <div className="p-2 text-center text-sm text-muted-foreground">
              Aucun rôle disponible
            </div>
          ) : (
            safeAvailableRoles
              .filter(role => !value.includes(role.id)) // Ne montrer que les rôles non sélectionnés
              .map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="p-1 rounded"
                      style={{ backgroundColor: `${getRoleColor(role)}20` }}
                    >
                      {getRoleIcon(role)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.name}</span>
                        <Badge variant="outline" className="text-xs">
                          Niv. {role.hierarchyLevel}
                        </Badge>
                        {role.isSystem && (
                          <Badge variant="secondary" className="text-xs">
                            Système
                          </Badge>
                        )}
                      </div>
                      {role.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {role.description}
                        </p>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))
          )}
        </SelectContent>
      </Select>

      {/* Affichage des rôles sélectionnés */}
      {selectedRoles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Rôles sélectionnés :</p>
          <div className="flex flex-wrap gap-2">
            {selectedRoles.map((role) => (
              <Badge
                key={role.id}
                variant="secondary"
                className="gap-1 pr-1"
                style={{ borderColor: getRoleColor(role) }}
              >
                {getRoleIcon(role)}
                <span className="text-sm">{role.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent ml-1"
                  onClick={() => handleRemoveRole(role.id)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {selectedRoles.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedRoles.length} rôle{selectedRoles.length > 1 ? 's' : ''} sélectionné{selectedRoles.length > 1 ? 's' : ''}
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}