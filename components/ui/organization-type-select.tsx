"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ORGANIZATION_TYPES, 
  getOrganizationTypeByCode,
  type OrganizationType 
} from "@/lib/constants/organization-types";

interface OrganizationTypeSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function OrganizationTypeSelect({
  value,
  onValueChange,
  placeholder = "Sélectionner un type d'organisation",
  disabled = false,
  className,
}: OrganizationTypeSelectProps) {
  const selectedType = value ? getOrganizationTypeByCode(value) : undefined;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {selectedType && (
            <div className="flex items-center gap-2">
              <span className="text-base">{selectedType.icon}</span>
              <span>{selectedType.displayName}</span>
              <span className="text-xs text-muted-foreground">
                ({selectedType.sector})
              </span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ORGANIZATION_TYPES.map((type) => (
          <SelectItem key={type.code} value={type.code}>
            <div className="flex items-center gap-2 py-1">
              <span className="text-base">{type.icon}</span>
              <div className="flex flex-col">
                <span className="font-medium">{type.displayName}</span>
                <span className="text-xs text-muted-foreground">
                  {type.sector} - {type.description}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}