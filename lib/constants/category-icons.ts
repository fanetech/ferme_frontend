import { 
  // Business & Finance
  Building, Building2, Briefcase, CreditCard, Banknote, Coins, Wallet, 
  Receipt, Calculator,
  
  // Communication & Tech
  Phone, Smartphone, Mail, Wifi, Globe, Monitor, Laptop,
  Cloud, Server,
  
  // Transportation
  Car, Truck, Plane, Bike, Fuel,
  
  // Identity & Documents
  IdCard, FileText, Award, Shield, Lock, Key,
  
  // Services & Utilities
  Zap, Lightbulb, Plug, Home, Factory, Settings, Wrench, 
  Eye, Users,
  
  // Health & Beauty
  Heart, Plus, Star, Gem, Sparkles, Shirt,
  
  // Food & Shopping
  ShoppingCart, ShoppingBag, Store, Utensils, Coffee, 
  Apple, Wheat,
  
  // Entertainment & Leisure
  Music, Play, Film, Tv, Gift,
  
  // Nature & Environment
  Leaf, Trees, Sun, Droplets,
  
  // Icons génériques
  Tag
  
} from "lucide-react";

export interface CategoryIcon {
  component: any;
  label: string;
  category: string;
  keywords: string[];
}

// Base d'icônes simplifiée avec seulement les icônes qui existent vraiment
export const CATEGORY_ICONS: Record<string, CategoryIcon> = {
  // BUSINESS & FINANCE
  building: { 
    component: Building, 
    label: "Bâtiment", 
    category: "business",
    keywords: ["entreprise", "bureau", "société", "immeuble", "commercial"]
  },
  building2: { 
    component: Building2, 
    label: "Bâtiment moderne", 
    category: "business",
    keywords: ["entreprise", "bureau", "société", "gratte-ciel", "moderne"]
  },
  briefcase: { 
    component: Briefcase, 
    label: "Mallette", 
    category: "business",
    keywords: ["travail", "business", "professionnel", "bureau", "affaires"]
  },
  credit_card: { 
    component: CreditCard, 
    label: "Carte de crédit", 
    category: "finance",
    keywords: ["paiement", "banque", "argent", "transaction", "visa", "mastercard"]
  },
  banknote: { 
    component: Banknote, 
    label: "Billet", 
    category: "finance",
    keywords: ["argent", "cash", "monnaie", "devise", "franc", "cfa"]
  },
  coins: { 
    component: Coins, 
    label: "Pièces", 
    category: "finance",
    keywords: ["argent", "monnaie", "change", "devise", "franc"]
  },
  wallet: { 
    component: Wallet, 
    label: "Portefeuille", 
    category: "finance",
    keywords: ["argent", "paiement", "porte-monnaie", "finances"]
  },
  receipt: { 
    component: Receipt, 
    label: "Reçu", 
    category: "finance",
    keywords: ["facture", "ticket", "paiement", "achat", "transaction"]
  },
  calculator: { 
    component: Calculator, 
    label: "Calculatrice", 
    category: "finance",
    keywords: ["calcul", "comptabilité", "finance", "mathématiques"]
  },

  // COMMUNICATION & TECH
  phone: { 
    component: Phone, 
    label: "Téléphone", 
    category: "communication",
    keywords: ["appel", "communication", "mobile", "contact", "numéro"]
  },
  smartphone: { 
    component: Smartphone, 
    label: "Smartphone", 
    category: "communication",
    keywords: ["mobile", "téléphone", "portable", "android", "ios"]
  },
  mail: { 
    component: Mail, 
    label: "Email", 
    category: "communication",
    keywords: ["courrier", "message", "email", "contact", "communication"]
  },
  wifi: { 
    component: Wifi, 
    label: "WiFi", 
    category: "technology",
    keywords: ["internet", "connexion", "réseau", "sans-fil", "wireless"]
  },
  globe: { 
    component: Globe, 
    label: "Internet", 
    category: "technology",
    keywords: ["web", "mondial", "planète", "internet", "global"]
  },
  monitor: { 
    component: Monitor, 
    label: "Écran", 
    category: "technology",
    keywords: ["ordinateur", "affichage", "moniteur", "pc", "desktop"]
  },
  laptop: { 
    component: Laptop, 
    label: "Ordinateur portable", 
    category: "technology",
    keywords: ["pc", "ordinateur", "portable", "laptop", "informatique"]
  },
  cloud: { 
    component: Cloud, 
    label: "Cloud", 
    category: "technology",
    keywords: ["stockage", "sauvegarde", "serveur", "données", "internet"]
  },
  server: { 
    component: Server, 
    label: "Serveur", 
    category: "technology",
    keywords: ["datacenter", "hébergement", "réseau", "informatique"]
  },

  // TRANSPORTATION
  car: { 
    component: Car, 
    label: "Voiture", 
    category: "transport",
    keywords: ["véhicule", "automobile", "transport", "conduite", "route"]
  },
  truck: { 
    component: Truck, 
    label: "Camion", 
    category: "transport",
    keywords: ["véhicule", "livraison", "transport", "fret", "marchandises"]
  },
  plane: { 
    component: Plane, 
    label: "Avion", 
    category: "transport",
    keywords: ["vol", "voyage", "aérien", "aéroport", "aviation"]
  },
  bike: { 
    component: Bike, 
    label: "Vélo", 
    category: "transport",
    keywords: ["cyclisme", "sport", "écologique", "transport", "pédale"]
  },
  fuel: { 
    component: Fuel, 
    label: "Carburant", 
    category: "transport",
    keywords: ["essence", "gasoil", "station", "pétrole", "pompe"]
  },

  // IDENTITY & DOCUMENTS
  id_card: { 
    component: IdCard, 
    label: "Carte d'identité", 
    category: "documents",
    keywords: ["identité", "cnib", "passeport", "officiel", "papiers"]
  },
  file_text: { 
    component: FileText, 
    label: "Document", 
    category: "documents",
    keywords: ["fichier", "texte", "papier", "formulaire", "dossier"]
  },
  award: { 
    component: Award, 
    label: "Certificat", 
    category: "documents",
    keywords: ["diplôme", "attestation", "officiel", "qualification"]
  },
  shield: { 
    component: Shield, 
    label: "Sécurité", 
    category: "security",
    keywords: ["protection", "sûreté", "garde", "défense", "sécurisé"]
  },
  lock: { 
    component: Lock, 
    label: "Verrouillage", 
    category: "security",
    keywords: ["sécurité", "privé", "protégé", "fermé", "confidentiel"]
  },
  key: { 
    component: Key, 
    label: "Clé", 
    category: "security",
    keywords: ["accès", "sécurité", "ouverture", "autorisation", "déverrouillage"]
  },

  // SERVICES & UTILITIES
  zap: { 
    component: Zap, 
    label: "Électricité", 
    category: "utilities",
    keywords: ["énergie", "courant", "sonabel", "facture", "branchement"]
  },
  lightbulb: { 
    component: Lightbulb, 
    label: "Ampoule", 
    category: "utilities",
    keywords: ["éclairage", "idée", "lumière", "électricité", "innovation"]
  },
  plug: { 
    component: Plug, 
    label: "Prise électrique", 
    category: "utilities",
    keywords: ["électricité", "branchement", "connexion", "alimentation"]
  },
  home: { 
    component: Home, 
    label: "Maison", 
    category: "utilities",
    keywords: ["domicile", "résidence", "habitation", "logement", "foyer"]
  },
  factory: { 
    component: Factory, 
    label: "Usine", 
    category: "utilities",
    keywords: ["industrie", "production", "manufacture", "entreprise"]
  },
  settings: { 
    component: Settings, 
    label: "Paramètres", 
    category: "utilities",
    keywords: ["configuration", "réglages", "options", "préférences"]
  },
  wrench: { 
    component: Wrench, 
    label: "Outil", 
    category: "utilities",
    keywords: ["réparation", "maintenance", "bricolage", "mécanique"]
  },

  // HEALTH & BEAUTY
  heart: { 
    component: Heart, 
    label: "Santé", 
    category: "health",
    keywords: ["médical", "soins", "hôpital", "clinique", "santé"]
  },
  plus: { 
    component: Plus, 
    label: "Croix médicale", 
    category: "health",
    keywords: ["médical", "urgence", "soins", "hôpital", "santé"]
  },
  sparkles: { 
    component: Sparkles, 
    label: "Beauté", 
    category: "beauty",
    keywords: ["cosmétique", "soin", "esthétique", "parfum", "maquillage"]
  },
  star: { 
    component: Star, 
    label: "Étoile", 
    category: "beauty",
    keywords: ["qualité", "excellence", "premium", "favoris", "notation"]
  },
  gem: { 
    component: Gem, 
    label: "Bijou", 
    category: "beauty",
    keywords: ["précieux", "diamant", "luxe", "joaillerie", "or"]
  },
  shirt: { 
    component: Shirt, 
    label: "Vêtement", 
    category: "beauty",
    keywords: ["mode", "textile", "habillement", "fashion", "boutique"]
  },

  // FOOD & SHOPPING
  shopping_cart: { 
    component: ShoppingCart, 
    label: "Panier", 
    category: "shopping",
    keywords: ["achat", "magasin", "courses", "commerce", "supermarché"]
  },
  shopping_bag: { 
    component: ShoppingBag, 
    label: "Sac shopping", 
    category: "shopping",
    keywords: ["achat", "magasin", "boutique", "commerce", "shopping"]
  },
  store: { 
    component: Store, 
    label: "Magasin", 
    category: "shopping",
    keywords: ["boutique", "commerce", "vente", "retail", "shop"]
  },
  utensils: { 
    component: Utensils, 
    label: "Restaurant", 
    category: "food",
    keywords: ["nourriture", "repas", "cuisine", "restaurant", "manger"]
  },
  coffee: { 
    component: Coffee, 
    label: "Café", 
    category: "food",
    keywords: ["boisson", "bar", "café", "petit-déjeuner", "thé"]
  },
  apple: { 
    component: Apple, 
    label: "Fruit", 
    category: "food",
    keywords: ["alimentation", "fruit", "sain", "bio", "naturel"]
  },
  wheat: { 
    component: Wheat, 
    label: "Céréales", 
    category: "food",
    keywords: ["agriculture", "grain", "alimentation", "blé", "récolte"]
  },

  // ENTERTAINMENT & LEISURE
  music: { 
    component: Music, 
    label: "Musique", 
    category: "entertainment",
    keywords: ["audio", "son", "chanson", "mélodie", "artiste"]
  },
  play: { 
    component: Play, 
    label: "Lecture", 
    category: "entertainment",
    keywords: ["vidéo", "audio", "média", "streaming", "démarrer"]
  },
  film: { 
    component: Film, 
    label: "Cinéma", 
    category: "entertainment",
    keywords: ["movie", "vidéo", "film", "divertissement", "streaming"]
  },
  tv: { 
    component: Tv, 
    label: "Télévision", 
    category: "entertainment",
    keywords: ["télé", "média", "chaîne", "programme", "écran"]
  },
  gift: { 
    component: Gift, 
    label: "Cadeau", 
    category: "entertainment",
    keywords: ["présent", "surprise", "fête", "anniversaire", "offrir"]
  },

  // NATURE & ENVIRONMENT
  leaf: { 
    component: Leaf, 
    label: "Écologie", 
    category: "nature",
    keywords: ["nature", "vert", "environnement", "bio", "durable"]
  },
  tree: { 
    component: Trees, 
    label: "Arbre", 
    category: "nature",
    keywords: ["nature", "forêt", "environnement", "vert", "plante"]
  },
  sun: { 
    component: Sun, 
    label: "Soleil", 
    category: "nature",
    keywords: ["météo", "temps", "lumineux", "énergie", "solaire"]
  },
  droplets: { 
    component: Droplets, 
    label: "Eau", 
    category: "nature",
    keywords: ["liquide", "hydratation", "pluie", "ressource", "vital"]
  },

  // POPULAR/COMMON
  tag: { 
    component: Tag, 
    label: "Étiquette", 
    category: "general",
    keywords: ["catégorie", "label", "classification", "tag", "marqueur"]
  },
  users: { 
    component: Users, 
    label: "Utilisateurs", 
    category: "general",
    keywords: ["personnes", "groupe", "équipe", "communauté", "clients"]
  },
  eye: { 
    component: Eye, 
    label: "Voir", 
    category: "general",
    keywords: ["regarder", "voir", "observer", "vision", "surveillance"]
  },

  // DEFAULT
  default: { 
    component: Building, 
    label: "Défaut", 
    category: "default",
    keywords: ["général", "standard", "basique", "par défaut"]
  }
};

// Listes organisées par catégorie pour l'interface
export const ICON_CATEGORIES = {
  business: "Entreprise & Business",
  finance: "Finance & Banque", 
  communication: "Communication",
  technology: "Technologie",
  transport: "Transport",
  documents: "Documents",
  security: "Sécurité",
  utilities: "Services & Utilitaires",
  health: "Santé",
  beauty: "Beauté & Mode",
  shopping: "Shopping & Commerce",
  food: "Alimentation",
  entertainment: "Divertissement",
  nature: "Nature & Environnement",
  general: "Général",
  default: "Défaut"
};

// Fonction utilitaire pour obtenir une icône
export const getCategoryIcon = (iconCode?: string) => {
  if (!iconCode || !CATEGORY_ICONS[iconCode]) {
    return CATEGORY_ICONS.default;
  }
  return CATEGORY_ICONS[iconCode];
};

// Fonction pour rechercher des icônes par mots-clés
export const searchIcons = (query: string): string[] => {
  const lowerQuery = query.toLowerCase();
  return Object.entries(CATEGORY_ICONS)
    .filter(([_, icon]) => 
      icon.label.toLowerCase().includes(lowerQuery) ||
      icon.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
    )
    .map(([code]) => code);
};

// Liste des icônes les plus utilisées pour les suggestions
export const POPULAR_CATEGORY_ICONS = [
  "building", "credit_card", "phone", "wifi", "car", "id_card", 
  "zap", "shopping_cart", "utensils", "heart", "sparkles", "music",
  "tag", "users", "eye", "star", "gift", "home"
];