import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";

interface SuperStructureFiltersProps {
  searchTerm: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCreateClick: () => void;
}

export function SuperStructureFilters({
  searchTerm,
  status,
  onSearchChange,
  onStatusChange,
  onCreateClick,
}: SuperStructureFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, code, email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Tous les statuts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Tous les statuts</SelectItem>
          <SelectItem value="ACTIVE">Actif</SelectItem>
          <SelectItem value="INACTIVE">Inactif</SelectItem>
          <SelectItem value="PENDING">En attente</SelectItem>
          <SelectItem value="SUSPENDED">Suspendu</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={onCreateClick} className="gap-2">
        <PlusCircle className="h-4 w-4" />
        Nouvelle Super Structure
      </Button>
    </div>
  );
}