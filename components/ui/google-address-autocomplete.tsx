"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MapPin, Loader2 } from "lucide-react";
import { ConfigValue } from "@/lib/config";

export interface AddressComponents {
  street_number?: string;
  route?: string;
  locality?: string;
  administrative_area_level_1?: string;
  country?: string;
  postal_code?: string;
  formatted_address?: string;
}

interface GoogleAddressAutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onPlaceSelected?: (place: google.maps.places.PlaceResult, addressComponents: AddressComponents) => void;
  countryRestriction?: string | string[];
}

export const GoogleAddressAutocomplete = forwardRef<
  HTMLInputElement,
  GoogleAddressAutocompleteProps
>(({
  onPlaceSelected,
  countryRestriction,
  className,
  ...props
}, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Parse address components from Google Places result
  const parseAddressComponents = useCallback((place: google.maps.places.PlaceResult): AddressComponents => {
    const components: AddressComponents = {
      formatted_address: place.formatted_address
    };

    if (place.address_components) {
      place.address_components.forEach((component) => {
        const types = component.types;
        
        if (types.includes("street_number")) {
          components.street_number = component.long_name;
        }
        if (types.includes("route")) {
          components.route = component.long_name;
        }
        if (types.includes("locality")) {
          components.locality = component.long_name;
        }
        if (types.includes("administrative_area_level_1")) {
          components.administrative_area_level_1 = component.long_name;
        }
        if (types.includes("country")) {
          components.country = component.short_name;
        }
        if (types.includes("postal_code")) {
          components.postal_code = component.long_name;
        }
      });
    }

    return components;
  }, []);

  // Charger l'API Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true);
        return;
      }

      if (!ConfigValue.GOOGLE_MAPS_API_KEY) {
        console.warn("Clé API Google Maps non configurée dans .env.local");
        return;
      }

      setIsLoading(true);
      
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${ConfigValue.GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsLoaded(true);
        setIsLoading(false);
      };
      
      script.onerror = () => {
        console.error("Erreur lors du chargement de Google Maps API");
        setIsLoading(false);
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialiser l'autocomplete une fois l'API chargée
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    // Options pour l'autocomplete
    const options: google.maps.places.AutocompleteOptions = {
      types: ["address"],
      fields: ["address_components", "formatted_address", "geometry", "place_id"]
    };

    // Restriction par pays si spécifiée
    if (countryRestriction) {
      const countries = Array.isArray(countryRestriction) ? countryRestriction : [countryRestriction];
      options.componentRestrictions = { country: countries };
    }

    // Créer l'instance Autocomplete
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, options);

    // Listener pour la sélection d'une adresse
    const placeChangedListener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      
      if (place && onPlaceSelected) {
        const addressComponents = parseAddressComponents(place);
        onPlaceSelected(place, addressComponents);
      }
    });

    // Cleanup
    return () => {
      if (placeChangedListener) {
        google.maps.event.removeListener(placeChangedListener);
      }
    };
  }, [isLoaded, countryRestriction, onPlaceSelected, parseAddressComponents]);

  return (
    <div className="relative">
      <Input
        ref={(node) => {
          // Handle both refs
          inputRef.current = node;
          if (ref) {
            if (typeof ref === 'function') {
              ref(node);
            } else {
              ref.current = node;
            }
          }
        }}
        className={cn("pr-10", className)}
        disabled={isLoading}
        {...props}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isLoaded ? (
          <MapPin className="h-4 w-4 text-blue-500" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
      </div>
    </div>
  );
});

GoogleAddressAutocomplete.displayName = "GoogleAddressAutocomplete";

// Composant pour charger l'API Google Maps
export function GoogleMapsScript({ apiKey }: { apiKey: string }) {
  useEffect(() => {
    if (window.google && window.google.maps) {
      // Already loaded
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      // Optional: remove script on unmount
    };
  }, [apiKey]);

  return null;
}