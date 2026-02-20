import type { User } from "@/types/users";

export interface StatusConfig {
  variant: "default" | "secondary" | "destructive" | "outline";
  label: string;
  description: string;
  className: string;
  color: string;
  icon: string;
}

export const USER_STATUS_MAPPER: Record<User['accountStatus'], StatusConfig> = {
  ACTIVE: {
    variant: "default",
    label: "Actif",
    description: "Le compte utilisateur est actif et peut se connecter normalement. Toutes les fonctionnalités sont disponibles.",
    className: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300",
    color: "green",
    icon: "CheckCircle"
  },
  INACTIVE: {
    variant: "secondary",
    label: "Inactif",
    description: "Le compte utilisateur est désactivé. L'utilisateur ne peut pas se connecter mais ses données sont conservées.",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300",
    color: "gray",
    icon: "MinusCircle"
  },
  SUSPENDED: {
    variant: "destructive",
    label: "Suspendu",
    description: "Le compte utilisateur est temporairement suspendu suite à une violation ou pour des raisons de sécurité.",
    className: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300",
    color: "red",
    icon: "XCircle"
  },
  LOCKED: {
    variant: "destructive",
    label: "Verrouillé",
    description: "Le compte utilisateur est verrouillé, généralement après plusieurs tentatives de connexion échouées.",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300",
    color: "orange",
    icon: "Lock"
  },
  PENDING: {
    variant: "outline",
    label: "En attente",
    description: "Le compte utilisateur est en cours de validation ou d'activation. L'utilisateur doit confirmer son email ou attendre l'approbation.",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300",
    color: "yellow",
    icon: "Clock"
  }
};

export function getUserStatusConfig(status: User['accountStatus']): StatusConfig {
  return USER_STATUS_MAPPER[status] || {
    variant: "secondary",
    label: "Inconnu",
    description: "Statut de compte non reconnu.",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300",
    color: "gray",
    icon: "HelpCircle"
  };
}

// Actions disponibles selon le statut
export const STATUS_ACTIONS: Record<User['accountStatus'], string[]> = {
  ACTIVE: ["deactivate", "suspend", "lock"],
  INACTIVE: ["activate"],
  SUSPENDED: ["activate", "deactivate"],
  LOCKED: ["unlock"],
  PENDING: ["activate", "reject"]
};

export function getAvailableActions(status: User['accountStatus']): string[] {
  return STATUS_ACTIONS[status] || [];
}

// Obtenir les actions disponibles basées sur les booléens active/locked
export function getAvailableActionsByFlags(user: { active: boolean; locked: boolean; accountStatus?: string }): string[] {
  const actions: string[] = [];
  
  // Si le compte est verrouillé
  if (user.locked) {
    actions.push("unlock");
    return actions; // Un compte verrouillé ne peut qu'être déverrouillé
  }
  
  // Si le compte est actif
  if (user.active) {
    actions.push("deactivate", "suspend", "lock");
  } else {
    // Si le compte est inactif
    actions.push("activate");
  }
  
  // Si c'est un compte en attente (PENDING), ajouter l'option de rejet
  if (user.accountStatus === "PENDING") {
    actions.push("reject");
  }
  
  return actions;
}