# DataFieldFormModal - Documentation

## Vue d'ensemble

Le `DataFieldFormModal` a été refactorisé pour correspondre au design et au comportement intelligent du `CalculationFieldForm` interne, offrant une interface contextuelle et adaptative.

## Fonctionnalités principales

### 1. Interface intelligente et contextuelle

Le formulaire s'adapte automatiquement selon le type de données sélectionné :

- **STRING** : Propose le mode "Texte libre" ou "Liste de choix"
- **INTEGER/DECIMAL** : Propose le mode "Saisie libre" ou "Liste de choix" avec support des nombres
- **BOOLEAN** : Affiche automatiquement en mode case à cocher

### 2. Modes de saisie dynamiques

```tsx
const [fieldMode, setFieldMode] = useState<"text" | "select" | "checkbox">("text");
```

- **Mode text** : Saisie libre avec validation min/max
- **Mode select** : Liste déroulante avec options configurables
- **Mode checkbox** : Case à cocher pour les booléens

### 3. Champ montant (isAmountField)

Pour les champs numériques (INTEGER/DECIMAL), possibilité d'activer le formatage monétaire :

```tsx
<FormField
  control={form.control}
  name="isAmountField"
  render={({ field }) => (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
      <div className="space-y-0.5">
        <FormLabel className="flex items-center gap-2">
          💰 Champ montant
        </FormLabel>
        <FormDescription>
          Affichage spécialisé pour les montants avec formatage monétaire
        </FormDescription>
      </div>
      <FormControl>
        <Switch checked={field.value} onCheckedChange={field.onChange} />
      </FormControl>
    </FormItem>
  )}
/>
```

### 4. Gestion intelligente des options

Le composant gère automatiquement les différents formats de données du backend :

```typescript
// Support des structures imbriquées et directes
if (parsedOptions.options && Array.isArray(parsedOptions.options)) {
  setFieldOptions(parsedOptions.options);
} else if (Array.isArray(parsedOptions)) {
  setFieldOptions(parsedOptions);
}
```

### 5. Validation contextuelle

La validation s'adapte au type de données :

- **STRING** : minLength/maxLength
- **INTEGER/DECIMAL** : minValue/maxValue
- **Saisie libre** : Validation numérique ou textuelle
- **Liste de choix** : Validation contre les options définies

## Structure des données

### Options (mode select)

Les options sont stockées directement dans le champ `options` :

```json
[
  { "value": "100", "label": "Boutique" },
  { "value": "200", "label": "Kiosque" },
  { "value": "500", "label": "Supermarché" }
]
```

### Soumission des données

```typescript
const fieldData: any = {
  ...data,
  endpointConfigId: endpointId,
};

// Envoi direct des options si mode select
if (fieldMode === "select" && fieldOptions.length > 0) {
  fieldData.options = JSON.stringify(fieldOptions);
}
```

## Types de données supportés

- **STRING** : Texte libre ou liste de choix
- **INTEGER** : Nombre entier avec validation min/max
- **DECIMAL** : Nombre décimal avec validation min/max
- **BOOLEAN** : Case à cocher
- **DATE** : Sélecteur de date
- **EMAIL** : Validation email
- **PHONE** : Validation téléphone
- **URL** : Validation URL

## Différences avec CalculationFieldForm

1. **Pas de fieldRole** : Les champs externes n'ont pas de rôle (INPUT/OUTPUT/INTERMEDIATE)
2. **Pas de isBaseAmount** : Spécifique aux calculs internes
3. **Pas de formula** : Les champs externes ne supportent pas les formules
4. **Types supplémentaires** : EMAIL, PHONE, URL pour les services externes

## Utilisation

```tsx
<DataFieldFormModal
  isOpen={isCreateOpen}
  onClose={() => setIsCreateOpen(false)}
  serviceConfig={serviceConfig}
  endpointId={selectedEndpointId}
  dataField={editingField}
  onSuccess={() => {
    setIsCreateOpen(false);
    setEditingField(null);
    refetch();
  }}
/>
```

## Bonnes pratiques

1. **Auto-génération du code** : Le code est généré automatiquement à partir de la clé
2. **Validation progressive** : La validation s'adapte en temps réel au type sélectionné
3. **Interface épurée** : Seuls les champs pertinents sont affichés selon le contexte
4. **Gestion d'erreurs** : Messages d'erreur clairs et contextuel