# Architecture des Composants Internal Service Configuration

## 📁 Structure des Dossiers

```
components/
├── InternalServiceConfiguration.tsx     # Composant principal (orchestration)
├── PricingRulesTab.tsx                 # Onglet des règles de pricing
├── CalculationFieldsTab.tsx            # Onglet des champs de calcul
├── forms/
│   ├── PricingRuleForm.tsx             # Formulaire pricing rule (create/update)
│   ├── CalculationFieldForm.tsx        # Formulaire champ de calcul
│   ├── ConditionEditor.tsx             # Éditeur de conditions JSON avancé
│   └── FormulaEditor.tsx               # Éditeur de formules personnalisées
├── cards/
│   ├── PricingRuleCard.tsx             # Affichage d'une règle de pricing
│   ├── PricingRulesList.tsx            # Liste des règles avec actions
│   ├── CalculationFieldCard.tsx        # Affichage d'un champ de calcul
│   └── CalculationFieldsList.tsx       # Liste des champs avec actions
└── ui/
    ├── DeleteConfirmationModal.tsx     # Modal de confirmation suppression
    ├── FieldSelector.tsx               # Sélecteur de champs disponibles
    └── OperatorSelector.tsx            # Sélecteur d'opérateurs MongoDB/Math
```

## 🚀 Fonctionnalités Implémentées

### ✅ **Pricing Rules**
- **Création** de règles avec formulaire avancé
- **Modification** avec formulaire pré-rempli
- **Suppression** avec modal de confirmation
- **Affichage** détaillé des conditions formatées
- **Validation** en temps réel des conditions JSON et formules

### ✅ **Calculation Fields**
- **Création** de champs avec types et rôles
- **Modification** de champs existants
- **Suppression** avec modal de confirmation
- **Gestion** des ordres d'affichage et visibilité

### ✅ **Éditeurs Avancés**
- **Condition Editor** : Interface visuelle pour créer des conditions MongoDB
- **Formula Editor** : Éditeur de formules avec validation syntaxique
- **Field/Operator Selectors** : Sélecteurs visuels pour champs et opérateurs

## 🎯 Composants Principaux

### **InternalServiceConfiguration.tsx**
- Composant racine orchestrant les onglets
- Gestion du state minimal (juste les onglets)
- Délégation aux composants spécialisés

### **PricingRulesTab.tsx**
- Gestion complète des règles de pricing
- Intégration avec les hooks React Query
- Gestion des modals create/update
- Actions CRUD complètes

### **CalculationFieldsTab.tsx**
- Gestion complète des champs de calcul
- Intégration avec les hooks React Query
- Gestion des modals create/update
- Actions CRUD complètes

## 🔧 Utilitaires et Hooks

### **@hooks/**
- `useFormValidation.ts` : Validation temps réel conditions/formules
- `usePricingRuleActions.ts` : Actions CRUD pricing rules

### **@lib/utils/**
- `internalServiceTypes.ts` : Types TypeScript spécifiques
- `formValidators.ts` : Schemas Zod pour validation
- `pricingRuleUtils.ts` : Utilitaires formatage/parsing

## 🎨 Avantages de cette Architecture

1. **Maintenabilité** : Chaque composant a une responsabilité claire
2. **Réutilisabilité** : Formulaires et composants réutilisables
3. **Testabilité** : Composants isolés et testables individuellement
4. **Performance** : Optimisations avec React Query et états locaux
5. **Évolutivité** : Ajout facile de nouvelles fonctionnalités

## 📝 Utilisation

```tsx
import { InternalServiceConfiguration } from "./components/InternalServiceConfiguration";

<InternalServiceConfiguration serviceProduct={serviceProduct} />
```

## 🚨 Points d'Attention

- Tous les composants respectent le mode sombre/jour
- Validation complète côté client et serveur
- Gestion d'erreurs avec toasts et modals
- Confirmation obligatoire pour les suppressions
- Sauvegarde automatique des données via React Query