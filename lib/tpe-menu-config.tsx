import { PERMISSIONS } from '@/lib/constants/permissions';

type TpeMenuItemType = {
  title: string;
  href: string;
  icon?: string;
  permissions: string[];
  isComing?: boolean;
  isNew?: boolean;
  isDataBadge?: string;
  newTab?: boolean;
  items?: TpeMenuItemType;
}[];

type TpeMenuSectionType = {
  title: string;
  permissions: string[];
  items: TpeMenuItemType;
};

export const tpe_menu_config: TpeMenuSectionType[] = [
  {
    title: "Dashboard",
    permissions: [PERMISSIONS.AUDIT.STATS, "||", PERMISSIONS.REPORT.VIEW],
    items: [
      {
        title: "Vue d'ensemble",
        href: "/dashboard/default",
        icon: "BarChart3",
        permissions: [PERMISSIONS.AUDIT.STATS, "||", PERMISSIONS.REPORT.VIEW]
      },
    ]
  },
  {
    title: "Gestion des Organisations",
    permissions: [PERMISSIONS.ORGANIZATION.SUPERSTRUCTURE_READ, "||", PERMISSIONS.ORGANIZATION.STRUCTURE_READ],
    items: [
      {
        title: "Super Structures",
        href: "/dashboard/organizations/super-structures",
        icon: "Building2",
        permissions: [PERMISSIONS.ORGANIZATION.SUPERSTRUCTURE_READ]
      },
      {
        title: "Structures",
        href: "/dashboard/organizations/structures",
        icon: "Building",
        permissions: [PERMISSIONS.ORGANIZATION.STRUCTURE_READ]
      },
      {
        title: "Catégories",
        href: "/dashboard/organizations/categories",
        icon: "Tags",
        permissions: [PERMISSIONS.CATALOG.SERVICE_READ]
      }
    ]
  },
  {
    title: "Gestion des Utilisateurs",
    permissions: [PERMISSIONS.USER.USER_READ, "||", PERMISSIONS.AUTH.ROLE_READ , "||", PERMISSIONS.AUDIT.READ],
    items: [
      {
        title: "Utilisateurs",
        href: "/dashboard/users",
        icon: "Users",
        permissions: [PERMISSIONS.USER.USER_LIST],
      },
      {
        title: "Rôles et permissions",
        href: "/dashboard/users/roles",
        icon: "Shield",
        permissions: [PERMISSIONS.AUTH.ROLE_READ, "||", PERMISSIONS.SPECIAL.MANAGE_ROLES],
      },
      {
        title: "Sessions actives",
        href: "/dashboard/users/sessions",
        icon: "MonitorSpeaker",
        permissions: [PERMISSIONS.AUDIT.READ]
      }
    ]
  },
  {
    title: "Gestion des cliens",
    permissions: [PERMISSIONS.CLIENT.READ, PERMISSIONS.CLIENT.SEARCH],
    items: [
      {
        title: "Clients",
        href: "/dashboard/clients",
        icon: "Users",
        permissions: [PERMISSIONS.CLIENT.LIST],
      }
    ]
  },
  {
    title: "Catalogue de Services",
    permissions: [PERMISSIONS.CATALOG.SERVICE_READ, "||", PERMISSIONS.SPECIAL.STOCK_READ],
    items: [
      {
        title: "Produits/Services",
        href: "/dashboard/catalog/services-products",
        icon: "Package",
        permissions: [PERMISSIONS.CATALOG.SERVICE_READ]
      },
    ],
  },
  {
    title: "Terminaux TPE",
    permissions: [PERMISSIONS.TERMINAL.READ, "||", PERMISSIONS.TERMINAL.LIST],
    items: [
      {
        title: "Liste des terminaux",
        href: "/dashboard/terminals",
        icon: "Smartphone",
        permissions: [PERMISSIONS.TERMINAL.READ]
      },
      /* {
         title: "Statuts et configuration",
         href: "/dashboard/terminals/config",
         icon: "Settings",
         permissions: [PERMISSIONS.TERMINAL.UPDATE, "||", PERMISSIONS.TERMINAL.ACTIVATE]
       }*/
    ]
  },
  {
    title: "Transactions",
    permissions: [PERMISSIONS.TRANSACTION.READ, "||", PERMISSIONS.PAYMENT.READ],
    items: [
      {
        title: "Liste des transactions",
        href: "/dashboard/transactions",
        icon: "CreditCard",
        permissions: [PERMISSIONS.TRANSACTION.READ]
      },
      {
        title: "Recherche avancée",
        href: "/dashboard/transactions/search",
        icon: "Search",
        permissions: [PERMISSIONS.TRANSACTION.SEARCH]
      },
      {
        title: "Données transactionnelles",
        href: "/dashboard/transactions/data",
        icon: "Database",
        permissions: [PERMISSIONS.TRANSACTION.READ]
      },
      {
        title: "Reçus",
        href: "/dashboard/transactions/receipts",
        icon: "Receipt",
        permissions: [PERMISSIONS.RECEIPT.READ]
      },
      {
        title: "Webhooks",
        href: "/dashboard/transactions/webhooks",
        icon: "Webhook",
        permissions: [PERMISSIONS.WEBHOOK.READ]
      }
    ]
  },
  {
    title: "Rapports",
    permissions: [PERMISSIONS.REPORT.VIEW, "||", PERMISSIONS.REPORT.GENERATE],
    items: [
      {
        title: "Rapports prédéfinis",
        href: "/dashboard/reports",
        icon: "FileText",
        permissions: [PERMISSIONS.REPORT.VIEW]
      },
      {
        title: "Export personnalisé",
        href: "/dashboard/reports/custom-export",
        icon: "Download",
        permissions: [PERMISSIONS.REPORT.EXPORT]
      },
/*      {
        title: "Statistiques",
        href: "/dashboard/reports/statistics",
        icon: "BarChart",
        permissions: [PERMISSIONS.AUDIT.STATS, "||", PERMISSIONS.SPECIAL.TRANSACTION_STATS],
        items: [
          {
            title: "Performance par service",
            href: "/dashboard/reports/statistics/services",
            permissions: [PERMISSIONS.CATALOG.SERVICE_READ, "&&", PERMISSIONS.AUDIT.STATS]
          },
          {
            title: "Usage des terminaux",
            href: "/dashboard/reports/statistics/terminals",
            permissions: [PERMISSIONS.TERMINAL.READ, "&&", PERMISSIONS.AUDIT.STATS]
          }
        ]
      }*/
    ]
  },
  {
    title: "Audit & Logs",
    permissions: [PERMISSIONS.AUDIT.READ, "||", PERMISSIONS.AUDIT.LIST],
    items: [
      {
        title: "Logs d'API",
        href: "/dashboard/audit/api-logs",
        icon: "Zap",
        permissions: [PERMISSIONS.AUDIT.READ],
        items: [
          {
            title: "Tous les logs API",
            href: "/dashboard/audit/api-logs",
            permissions: [PERMISSIONS.AUDIT.LIST]
          },
         /* {
            title: "Erreurs API",
            href: "/dashboard/audit/api-logs/errors",
            permissions: [PERMISSIONS.AUDIT.READ]
          },*/
        /*  {
            title: "Performance API",
            href: "/dashboard/audit/api-logs/performance",
            permissions: [PERMISSIONS.AUDIT.STATS]
          }*/
        ]
      },
/*      {
        title: "Logs de connexion",
        href: "/dashboard/audit/session-logs",
        icon: "LogIn",
        permissions: [PERMISSIONS.AUDIT.READ],
        items: [
          {
            title: "Sessions utilisateurs",
            href: "/dashboard/audit/session-logs",
            permissions: [PERMISSIONS.AUDIT.LIST]
          }
        ]
      },*/
/*      {
        title: "Historique des changements",
        href: "/dashboard/audit/trail",
        icon: "History",
        permissions: [PERMISSIONS.AUDIT.READ],
        items: [
          {
            title: "Journal d'audit",
            href: "/dashboard/audit/trail",
            permissions: [PERMISSIONS.AUDIT.LIST]
          },
          {
            title: "Modifications critiques",
            href: "/dashboard/audit/trail/critical",
            permissions: [PERMISSIONS.AUDIT.SECURITY]
          }
        ]
      }*/
    ]
  },
  {
    title: "Paramètres",
    permissions: [PERMISSIONS.SETTINGS.READ, "||", PERMISSIONS.SETTINGS.UPDATE],
    items: [
      {
        title: "Configuration système",
        href: "/dashboard/settings/system",
        icon: "Settings",
        permissions: [PERMISSIONS.SETTINGS.CONFIGURE],
        items: [
          {
            title: "Paramètres globaux",
            href: "/dashboard/settings/system",
            permissions: [PERMISSIONS.SETTINGS.CONFIGURE]
          },
         /* {
            title: "Paramètres par structure",
            href: "/dashboard/settings/structure",
            permissions: [PERMISSIONS.SETTINGS.UPDATE, "&&", PERMISSIONS.ORGANIZATION.STRUCTURE_READ]
          },*/
          {
            title: "Configuration emails",
            href: "/dashboard/settings/emails",
            permissions: [PERMISSIONS.SETTINGS.CONFIGURE]
          }
        ]
      },
     /* {
        title: "Gestion des permissions",
        href: "/dashboard/settings/permissions",
        icon: "Lock",
        permissions: [PERMISSIONS.SPECIAL.MANAGE_ROLES]
      },*/
      {
        title: "Paramètres de sécurité",
        href: "/dashboard/settings/security",
        icon: "ShieldCheck",
        permissions: [PERMISSIONS.AUDIT.SECURITY, "||", PERMISSIONS.SETTINGS.CONFIGURE],
        items: [
          {
            title: "Politiques de mot de passe",
            href: "/dashboard/settings/security/password-policy",
            permissions: [PERMISSIONS.SETTINGS.CONFIGURE]
          },
          {
            title: "Authentification à deux facteurs",
            href: "/dashboard/settings/security/2fa",
            permissions: [PERMISSIONS.SETTINGS.CONFIGURE]
          },
          /*{
            title: "Gestion des tokens",
            href: "/dashboard/settings/security/tokens",
            permissions: [PERMISSIONS.AUDIT.SECURITY]
          }*/
        ]
      }
    ]
  }
];

// Fonction utilitaire pour évaluer les permissions avec conditions logiques
export const evaluatePermissions = (
  userPermissions: string[],
  requiredPermissions: string[]
): boolean => {
  let expression = '';
  
  for (let i = 0; i < requiredPermissions.length; i++) {
    const permission = requiredPermissions[i];
    
    if (permission === '&&' || permission === '||') {
      expression += ` ${permission} `;
    } else {
      expression += userPermissions.includes(permission) ? 'true' : 'false';
    }
  }
  
  // Si pas d'opérateur logique, c'est un simple OR
  if (!expression.includes('&&') && !expression.includes('||')) {
    return requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
  }
  
  try {
    // Évaluation sécurisée de l'expression logique
    return Function(`"use strict"; return (${expression})`)();
  } catch {
    // En cas d'erreur, on utilise un OR par défaut
    return requiredPermissions.some(permission => 
      permission !== '&&' && permission !== '||' && 
      userPermissions.includes(permission)
    );
  }
};

// Fonction pour filtrer le menu selon les permissions de l'utilisateur
export const filterMenuByPermissions = (
  menu: TpeMenuSectionType[],
  userPermissions: string[]
): TpeMenuSectionType[] => {
  return menu
    .filter(section => evaluatePermissions(userPermissions, section.permissions))
    .map(section => ({
      ...section,
      items: filterMenuItems(section.items, userPermissions)
    }))
    .filter(section => section.items.length > 0);
};

// Fonction récursive pour filtrer les éléments du menu
const filterMenuItems = (
  items: TpeMenuItemType,
  userPermissions: string[]
): TpeMenuItemType => {
  return items
    .filter(item => evaluatePermissions(userPermissions, item.permissions))
    .map(item => ({
      ...item,
      items: item.items ? filterMenuItems(item.items, userPermissions) : undefined
    }));
};

// Hook pour utiliser le menu filtré
export const useTpeMenu = (userPermissions: string[]) => {
  return filterMenuByPermissions(tpe_menu_config, userPermissions);
};