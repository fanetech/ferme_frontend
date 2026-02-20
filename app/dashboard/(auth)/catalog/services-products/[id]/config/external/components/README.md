# External Service Configuration Components

Cette documentation décrit la structure des composants pour la configuration des services externes.

## Structure des dossiers

```
external/components/
├── README.md
├── DataFieldsTab.tsx
├── EndpointsTab.tsx
├── ResponseMappingsTab.tsx
├── ServiceInfoTab.tsx
├── external-service-configuration.tsx
├── cards/
│   ├── DataFieldsList.tsx
│   └── EndpointsList.tsx
├── forms/
│   ├── DataFieldFormModal.tsx
│   └── EndpointFormModal.tsx
└── ui/
    ├── DataFieldDeleteDialog.tsx
    └── EndpointDeleteDialog.tsx
```

## Organisation des composants

### 📁 **cards/**
Composants qui affichent des listes et des cartes d'information :
- `DataFieldsList.tsx` - Liste des champs de données avec recherche, filtres et actions
- `EndpointsList.tsx` - Liste des endpoints avec recherche, filtres et actions

### 📁 **forms/**
Formulaires de création et modification :
- `DataFieldFormModal.tsx` - Formulaire modal pour créer/modifier des champs de données
- `EndpointFormModal.tsx` - Formulaire modal pour créer/modifier des endpoints

### 📁 **ui/**
Composants d'interface utilisateur réutilisables :
- `DataFieldDeleteDialog.tsx` - Dialog de confirmation pour supprimer un champ
- `EndpointDeleteDialog.tsx` - Dialog de confirmation pour supprimer un endpoint

### 📄 **Tabs principales**
- `DataFieldsTab.tsx` - Tab pour la gestion des champs de données
- `EndpointsTab.tsx` - Tab pour la gestion des endpoints
- `ResponseMappingsTab.tsx` - Tab pour la gestion des mappings de réponse
- `ServiceInfoTab.tsx` - Tab pour les informations de base du service

## Hiérarchie des données

```
ServiceConfig
├── EndpointConfig[]
│   ├── ServiceDataField[]
│   └── ResponseMapping[]
└── globalHeaders, authType, etc.
```

## Flux de données

1. **ServiceConfig** - Configuration globale du service externe
2. **EndpointConfig** - Configuration spécifique de chaque endpoint
3. **ServiceDataField** - Champs de données pour chaque endpoint
4. **ResponseMapping** - Mapping des réponses pour chaque endpoint

## Utilisation

### DataFieldsTab
```tsx
// Sélection d'endpoint requise
const [selectedEndpointId, setSelectedEndpointId] = useState<string>("");

// Chaque endpoint a ses propres champs
<DataFieldsList 
  serviceConfig={serviceConfig} 
  endpointId={selectedEndpointId}
/>
```

### EndpointsTab
```tsx
// Gestion globale des endpoints
<EndpointsList 
  serviceConfig={serviceConfig} 
  onUpdate={refetch}
/>
```

## Conventions

- **Nommage** : PascalCase pour les composants, camelCase pour les fonctions
- **Structure** : Même organisation que les composants internes
- **Imports** : Chemins relatifs entre les dossiers (`../forms/`, `../ui/`)
- **Types** : Utilisation des types TypeScript stricts
- **Validation** : Schemas Zod pour tous les formulaires
- **État** : React Query pour la gestion des données serveur