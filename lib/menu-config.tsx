import { PERMISSIONS } from '@/lib/constants/permissions';

type FarmMenuItemType = {
  title: string;
  href: string;
  icon?: string;
  permissions: string[];
  isComing?: boolean;
  isNew?: boolean;
  isDataBadge?: string;
  newTab?: boolean;
  items?: FarmMenuItemType;
}[];

type FarmMenuSectionType = {
  title: string;
  permissions: string[];
  items: FarmMenuItemType;
};

export const menuConfig: FarmMenuSectionType[] = [
  // ================== DASHBOARD ==================
  {
    title: "Dashboard",
    permissions: [],
    items: [
      {
        title: "Vue d'ensemble",
        href: "/dashboard/default",
        icon: "LayoutDashboard",
        permissions: []
      },
    ]
  },

  // ================== EXPLOITATION ==================
  {
    title: "Exploitation",
    permissions: [PERMISSIONS.ORGANIZATION.LIST, "||", PERMISSIONS.FARM.LIST],
    items: [
      {
        title: "Organisations",
        href: "/dashboard/organizations",
        icon: "Building",
        permissions: [PERMISSIONS.ORGANIZATION.LIST]
      },
      {
        title: "Fermes",
        href: "/dashboard/farms",
        icon: "Tractor",
        permissions: [PERMISSIONS.FARM.LIST]
      },
    ]
  },

  // ================== PRODUCTION VEGETALE ==================
  {
    title: "Production Végétale",
    permissions: [PERMISSIONS.CROP.PARCEL_VIEW, "||", PERMISSIONS.CROP.CULTIVATION_VIEW],
    items: [
      {
        title: "Parcelles & Cultures",
        href: "/dashboard/crops",
        icon: "Sprout",
        permissions: [PERMISSIONS.CROP.PARCEL_VIEW],
        isNew: true,
      },
    ]
  },

  // ================== ELEVAGE ==================
  {
    title: "Élevage",
    permissions: [PERMISSIONS.LIVESTOCK.VIEW],
    items: [
      {
        title: "Animaux",
        href: "/dashboard/livestock",
        icon: "PawPrint",
        permissions: [PERMISSIONS.LIVESTOCK.VIEW],
        isNew: true,
      },
    ]
  },

  // ================== INVENTAIRE ==================
  {
    title: "Inventaire",
    permissions: [PERMISSIONS.INVENTORY.ITEM_VIEW],
    items: [
      {
        title: "Stock & Matériel",
        href: "/dashboard/inventory",
        icon: "Package",
        permissions: [PERMISSIONS.INVENTORY.ITEM_VIEW],
        isNew: true,
      },
    ]
  },

  // ================== RESSOURCES HUMAINES ==================
  {
    title: "Ressources Humaines",
    permissions: [PERMISSIONS.HR.EMPLOYEE_VIEW, "||", PERMISSIONS.HR.TASK_VIEW],
    items: [
      {
        title: "Employés",
        href: "/dashboard/hr",
        icon: "Users",
        permissions: [PERMISSIONS.HR.EMPLOYEE_VIEW],
        isNew: true,
      },
      {
        title: "Tâches",
        href: "/dashboard/hr/tasks",
        icon: "ClipboardList",
        permissions: [PERMISSIONS.HR.TASK_VIEW],
      },
      {
        title: "Présences",
        href: "/dashboard/hr/attendance",
        icon: "CalendarCheck",
        permissions: [PERMISSIONS.HR.ATTENDANCE_VIEW],
      },
    ]
  },

  // ================== MARCHÉ ==================
  {
    title: "Marché",
    permissions: [PERMISSIONS.MARKETPLACE.PRODUCT_VIEW, "||", PERMISSIONS.MARKETPLACE.ORDER_VIEW],
    items: [
      {
        title: "Produits",
        href: "/dashboard/marketplace/products",
        icon: "ShoppingBasket",
        permissions: [PERMISSIONS.MARKETPLACE.PRODUCT_VIEW],
        isNew: true,
      },
      {
        title: "Clients",
        href: "/dashboard/marketplace/customers",
        icon: "UserCheck",
        permissions: [PERMISSIONS.MARKETPLACE.CUSTOMER_VIEW],
      },
      {
        title: "Commandes",
        href: "/dashboard/marketplace/orders",
        icon: "ShoppingCart",
        permissions: [PERMISSIONS.MARKETPLACE.ORDER_VIEW],
      },
    ]
  },

  // ================== FINANCE ==================
  {
    title: "Finance",
    permissions: [PERMISSIONS.FINANCE.VIEW, "||", PERMISSIONS.FINANCE.LIST],
    items: [
      {
        title: "Revenus & Finances",
        href: "/dashboard/finance",
        icon: "Wallet",
        permissions: [PERMISSIONS.FINANCE.VIEW, "||", PERMISSIONS.FINANCE.LIST],
      },
    ]
  },

  // ================== MONITORING ==================
  {
    title: "Monitoring",
    permissions: [],
    items: [
      {
        title: "Capteurs IoT",
        href: "/dashboard/iot",
        icon: "Cpu",
        permissions: [],
      },
      {
        title: "Météo",
        href: "/dashboard/weather",
        icon: "CloudSun",
        permissions: [],
      },
      {
        title: "Notifications",
        href: "/dashboard/notifications",
        icon: "Bell",
        permissions: [],
      },
    ]
  },

  // ================== ADMINISTRATION ==================
  {
    title: "Administration",
    permissions: [PERMISSIONS.USER.LIST, "||", PERMISSIONS.ROLE.LIST],
    items: [
      {
        title: "Utilisateurs",
        href: "/dashboard/users",
        icon: "UserCog",
        permissions: [PERMISSIONS.USER.LIST],
      },
      {
        title: "Rôles",
        href: "/dashboard/roles",
        icon: "Shield",
        permissions: [PERMISSIONS.ROLE.LIST],
      },
      {
        title: "Permissions",
        href: "/dashboard/permissions",
        icon: "Lock",
        permissions: [PERMISSIONS.PERMISSION.LIST],
      },
      {
        title: "Audit & Logs",
        href: "/dashboard/audit",
        icon: "FileSearch",
        permissions: [PERMISSIONS.ROLE.MANAGE],
      },
    ]
  },

  // ================== PARAMETRES ==================
  {
    title: "Paramètres",
    permissions: [],
    items: [
      {
        title: "Paramètres",
        href: "/dashboard/settings",
        icon: "Settings",
        permissions: [],
      },
    ]
  },
];

// Fonction utilitaire pour évaluer les permissions avec conditions logiques
export const evaluatePermissions = (
  userPermissions: string[],
  requiredPermissions: string[]
): boolean => {
  // Pas de permissions requises = accessible à tous
  if (requiredPermissions.length === 0) return true;

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
    return Function(`"use strict"; return (${expression})`)();
  } catch {
    return requiredPermissions.some(permission =>
      permission !== '&&' && permission !== '||' &&
      userPermissions.includes(permission)
    );
  }
};

// Fonction pour filtrer le menu selon les permissions de l'utilisateur
export const filterMenuByPermissions = (
  menu: FarmMenuSectionType[],
  userPermissions: string[]
): FarmMenuSectionType[] => {
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
  items: FarmMenuItemType,
  userPermissions: string[]
): FarmMenuItemType => {
  return items
    .filter(item => evaluatePermissions(userPermissions, item.permissions))
    .map(item => ({
      ...item,
      items: item.items ? filterMenuItems(item.items, userPermissions) : undefined
    }));
};

// Hook pour utiliser le menu filtré
export const useMenuConfig = (userPermissions: string[]) => {
  return filterMenuByPermissions(menuConfig, userPermissions);
};
