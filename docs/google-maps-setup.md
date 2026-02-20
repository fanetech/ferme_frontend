# Configuration Google Maps Autocomplete

## Étapes d'installation et configuration

### 1. Installer la dépendance (optionnel)
```bash
npm install react-google-autocomplete
```

Ou utiliser le composant custom créé dans `/components/ui/google-address-autocomplete.tsx`

### 2. Obtenir une clé API Google Maps

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un projet existant
3. Activer l'API "Places API"
4. Créer une clé API dans "Credentials"
5. Restreindre la clé API :
   - **HTTP referrers** : Ajouter votre domaine (ex: `localhost:3000/*`, `*.votredomaine.com/*`)
   - **API restrictions** : Limiter à "Places API"

### 3. Configurer les variables d'environnement

Ajouter dans `.env.local` :
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=votre_clé_api_google
```

### 4. Charger le script Google Maps

Dans `app/layout.tsx` ou dans le composant qui en a besoin :

```tsx
import { GoogleMapsScript } from "@/components/ui/google-address-autocomplete";

// Dans le JSX
<GoogleMapsScript apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} />
```

### 5. Utiliser le composant

```tsx
import { GoogleAddressAutocomplete, type AddressComponents } from "@/components/ui/google-address-autocomplete";

// Dans le composant
<GoogleAddressAutocomplete
  placeholder="Rechercher une adresse..."
  countryRestriction={["BF", "CI", "SN"]} // Limiter aux pays FCFA
  onPlaceSelected={(place, components) => {
    console.log("Adresse sélectionnée:", components.formatted_address);
    console.log("Ville:", components.locality);
    console.log("Pays:", components.country);
    console.log("Code postal:", components.postal_code);
    
    // Mettre à jour le formulaire
    form.setValue("address", components.formatted_address || "");
    form.setValue("city", components.locality || "");
    form.setValue("country", components.country || "");
    form.setValue("postalCode", components.postal_code || "");
  }}
/>
```

## Intégration avec React Hook Form

```tsx
<FormField
  control={form.control}
  name="address"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Adresse</FormLabel>
      <FormControl>
        <GoogleAddressAutocomplete
          {...field}
          placeholder="Rechercher une adresse..."
          countryRestriction={selectedCountry ? [selectedCountry] : undefined}
          onPlaceSelected={(place, components) => {
            // Mettre à jour le champ adresse
            field.onChange(components.formatted_address || "");
            
            // Optionnel: Mettre à jour d'autres champs automatiquement
            if (components.locality) {
              form.setValue("city", components.locality);
            }
            if (components.postal_code) {
              form.setValue("postalCode", components.postal_code);
            }
          }}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Gestion des erreurs

Le composant fonctionne comme un Input standard si Google Maps n'est pas chargé. Vérifier la console pour les erreurs potentielles.

## Optimisations

1. **Lazy Loading** : Charger l'API uniquement quand nécessaire
2. **Quotas** : Limiter les champs retournés avec l'option `fields`
3. **Cache** : Mettre en cache les résultats fréquents
4. **Debounce** : Implémenter un délai pour réduire les appels API

## Alternatives sans clé API

Si vous ne voulez pas utiliser Google Maps, vous pouvez :

1. Utiliser une API gratuite comme [Nominatim (OpenStreetMap)](https://nominatim.org/)
2. Créer une liste statique d'adresses communes
3. Utiliser un service tiers comme [Mapbox](https://www.mapbox.com/) ou [Here](https://www.here.com/)

## Coûts

Google Places Autocomplete :
- **Gratuit** : 2,500 requêtes/mois
- **Payant** : ~0.017$ par requête au-delà

Optimiser en limitant les `fields` et en utilisant `componentRestrictions`.