"use client";

import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSuperStructuresForFilter } from "@/data/organization";
import { cn } from "@/lib/utils";

interface SuperStructureSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SuperStructureSelect({
  value,
  onValueChange,
  placeholder = "Sélectionner une super structure",
  disabled = false,
  className
}: SuperStructureSelectProps) {
  const { data: superStructuresData, isLoading } = useSuperStructuresForFilter();

  const selectedSuperStructure = superStructuresData?.content?.find(ss => ss.id === value);
  
  return (
    <Select
      key={value} // Force re-render when value changes
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={isLoading ? "Chargement..." : placeholder}>
          {selectedSuperStructure && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                {selectedSuperStructure.logoUrl ? (
                  <img
                    src={selectedSuperStructure.logoUrl}
                    alt={`Logo ${selectedSuperStructure.name}`}
                    className="h-full w-full object-cover rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <AvatarFallback className={`bg-primary/10 ${selectedSuperStructure.logoUrl ? 'hidden' : ''}`}>
                  <Building2 className="h-3 w-3 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{selectedSuperStructure.code}</span>
                <span className="text-muted-foreground">-</span>
                <span className="text-sm">{selectedSuperStructure.name}</span>
              </div>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {superStructuresData?.content?.map((superStructure) => (
          <SelectItem key={superStructure.id} value={superStructure.id}>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                {superStructure.logoUrl ? (
                  <img
                    src={superStructure.logoUrl}
                    alt={`Logo ${superStructure.name}`}
                    className="h-full w-full object-cover rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <AvatarFallback className={`bg-primary/10 ${superStructure.logoUrl ? 'hidden' : ''}`}>
                  <Building2 className="h-4 w-4 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{superStructure.code}</span>
                  <span className="text-muted-foreground">-</span>
                  <span>{superStructure.name}</span>
                </div>
                {superStructure.description && (
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {superStructure.description}
                  </span>
                )}
              </div>
            </div>
          </SelectItem>
        )) || []}
        {superStructuresData?.content?.length === 0 && (
          <SelectItem value="" disabled>
            Aucune super structure disponible
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}