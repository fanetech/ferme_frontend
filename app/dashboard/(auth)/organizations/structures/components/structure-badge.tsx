import { Badge } from "@/components/ui/badge";

interface StructureBadgeProps {
  status: string;
}

export function StructureBadge({ status }: StructureBadgeProps) {
  const getVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      case 'PENDING':
        return 'outline';
      case 'SUSPENDED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'Actif';
      case 'INACTIVE':
        return 'Inactif';
      case 'PENDING':
        return 'En attente';
      case 'SUSPENDED':
        return 'Suspendu';
      default:
        return status || 'Non défini';
    }
  };

  return (
    <Badge variant={getVariant(status)} className="capitalize">
      {getLabel(status)}
    </Badge>
  );
}