export interface OrganizationType {
  code: string;
  displayName: string;
  description: string;
  icon: string;
  sector: string;
  color: string;
}

export const ORGANIZATION_TYPES: OrganizationType[] = [
  // === SECTEUR PUBLIC ===
  {
    code: "GOVERNMENT_MINISTRY",
    displayName: "Ministère",
    description: "Ministères et départements gouvernementaux",
    icon: "🏛️",
    sector: "Public",
    color: "#1B4F72"
  },
  {
    code: "GOVERNMENT_AGENCY",
    displayName: "Agence Gouvernementale",
    description: "Agences et directions générales de l'État",
    icon: "🏢",
    sector: "Public",
    color: "#1B4F72"
  },
  {
    code: "PUBLIC_SERVICE",
    displayName: "Service Public",
    description: "Services publics et administrations",
    icon: "🏛️",
    sector: "Public",
    color: "#1B4F72"
  },
  {
    code: "MUNICIPALITY",
    displayName: "Collectivité",
    description: "Mairies et collectivités territoriales",
    icon: "🏘️",
    sector: "Public",
    color: "#7D3C98"
  },
  
  // === SECTEUR SEMI-PUBLIC ===
  {
    code: "STATE_ENTERPRISE",
    displayName: "Entreprise d'État",
    description: "Sociétés nationales et entreprises publiques",
    icon: "🏭",
    sector: "Semi-Public",
    color: "#D35400"
  },
  {
    code: "PUBLIC_UTILITY",
    displayName: "Service d'Utilité Publique",
    description: "Électricité, eau, télécoms publics",
    icon: "⚡",
    sector: "Semi-Public",
    color: "#D35400"
  },
  
  // === SECTEUR PRIVÉ ===
  {
    code: "PRIVATE_COMPANY",
    displayName: "Entreprise Privée",
    description: "Sociétés privées et commerciales",
    icon: "🏢",
    sector: "Privé",
    color: "#2ECC71"
  },
  {
    code: "TELECOMMUNICATIONS",
    displayName: "Télécommunications",
    description: "Opérateurs télécom et services numériques",
    icon: "📱",
    sector: "Privé",
    color: "#FF7900"
  },
  {
    code: "FINANCIAL_INSTITUTION",
    displayName: "Institution Financière",
    description: "Banques, assurances, microfinance",
    icon: "🏦",
    sector: "Privé",
    color: "#F39C12"
  },
  {
    code: "RETAIL_CHAIN",
    displayName: "Chaîne de Distribution",
    description: "Supermarchés, magasins, centres commerciaux",
    icon: "🛒",
    sector: "Privé",
    color: "#27AE60"
  },
  
  // === SECTEUR ASSOCIATIF ===
  {
    code: "NGO",
    displayName: "ONG",
    description: "Organisations non gouvernementales",
    icon: "🤝",
    sector: "Associatif",
    color: "#E74C3C"
  },
  {
    code: "COOPERATIVE",
    displayName: "Coopérative",
    description: "Coopératives et mutuelles",
    icon: "👥",
    sector: "Associatif",
    color: "#E74C3C"
  },
  
  // === SECTEUR INTERNATIONAL ===
  {
    code: "INTERNATIONAL_ORG",
    displayName: "Organisation Internationale",
    description: "Organismes internationaux et ambassades",
    icon: "🌍",
    sector: "International",
    color: "#3498DB"
  },
  
  // === AUTRE ===
  {
    code: "OTHER",
    displayName: "Autre",
    description: "Autres types d'organisation",
    icon: "❓",
    sector: "Autre",
    color: "#95A5A6"
  }
];

export const ORGANIZATION_SECTORS = [
  "Public",
  "Semi-Public",
  "Privé",
  "Associatif",
  "International",
  "Autre"
];

export const getOrganizationTypeByCode = (code: string): OrganizationType | undefined => {
  return ORGANIZATION_TYPES.find(type => type.code === code);
};

export const getOrganizationTypesBySector = (sector: string): OrganizationType[] => {
  return ORGANIZATION_TYPES.filter(type => type.sector === sector);
};

export const getDefaultOrganizationType = (): OrganizationType => {
  return ORGANIZATION_TYPES.find(type => type.code === "OTHER") || ORGANIZATION_TYPES[0];
};