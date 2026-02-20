"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapPin, Search } from "lucide-react";
import { FCFA_COUNTRIES, getCitiesByCountryCode } from "@/lib/constants/countries-cities";

interface AddressSuggestion {
  id: string;
  fullAddress: string;
  street: string;
  city: string;
  country: string;
  countryCode: string;
}

interface AddressAutocompleteProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onAddressSelected?: (suggestion: AddressSuggestion) => void;
  countryCode?: string;
}

export function AddressAutocomplete({
  onAddressSelected,
  countryCode = "BF",
  className,
  ...props
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Générer des suggestions basées sur les villes et noms de rues communs
  const generateSuggestions = (searchQuery: string, country: string): AddressSuggestion[] => {
    if (searchQuery.length < 2) return [];

    const cities = getCitiesByCountryCode(country);
    const countryInfo = FCFA_COUNTRIES.find(c => c.code === country);
    
    if (!countryInfo) return [];

    // Rues communes pour chaque pays
    const commonStreets: Record<string, string[]> = {
      BF: [
        "Avenue Kwame Nkrumah", "Avenue de l'Indépendance", "Avenue de la République",
        "Avenue Charles de Gaulle", "Avenue Dimdolobsom", "Avenue de la Nation",
        "Rue de la Poste", "Rue Maurice Yaméogo", "Rue Joseph Ki-Zerbo",
        "Boulevard de l'Unité Africaine", "Boulevard Mouammar Kadhafi", "Boulevard de la Révolution"
      ],
      CI: [
        "Boulevard de la République", "Avenue Chardy", "Avenue Houphouët-Boigny",
        "Rue des Jardins", "Boulevard de Marseille", "Avenue de France",
        "Rue du Commerce", "Boulevard Roume", "Avenue Lamblin"
      ],
      SN: [
        "Avenue Léopold Sédar Senghor", "Avenue Bourguiba", "Rue de la République",
        "Boulevard de la République", "Avenue Blaise Diagne", "Rue Mohamed V",
        "Avenue du Président Lamine Guèye", "Rue Vincens", "Avenue Roume"
      ],
      // Ajouter d'autres pays selon les besoins
    };

    const streets = commonStreets[country] || [
      "Avenue de l'Indépendance", "Rue de la République", "Boulevard Central",
      "Avenue de la Paix", "Rue du Commerce", "Avenue de la Liberté"
    ];

    const suggestions: AddressSuggestion[] = [];

    // Recherche dans les villes
    cities
      .filter(city => city.toLowerCase().includes(searchQuery.toLowerCase()))
      .forEach(city => {
        streets.forEach((street, index) => {
          if (suggestions.length < 10) { // Limiter à 10 suggestions
            suggestions.push({
              id: `${country}-${city}-${index}`,
              fullAddress: `${street}, ${city}, ${countryInfo.name}`,
              street,
              city,
              country: countryInfo.name,
              countryCode: country
            });
          }
        });
      });

    // Recherche dans les rues
    streets
      .filter(street => street.toLowerCase().includes(searchQuery.toLowerCase()))
      .forEach(street => {
        cities.slice(0, 3).forEach((city, index) => { // Prendre les 3 premières villes
          if (suggestions.length < 10) {
            suggestions.push({
              id: `${country}-${street}-${index}`,
              fullAddress: `${street}, ${city}, ${countryInfo.name}`,
              street,
              city,
              country: countryInfo.name,
              countryCode: country
            });
          }
        });
      });

    return suggestions.slice(0, 8); // Limiter à 8 suggestions max
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.length >= 2) {
        const newSuggestions = generateSuggestions(query, countryCode);
        setSuggestions(newSuggestions);
        setIsOpen(newSuggestions.length > 0);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
      setSelectedIndex(-1);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query, countryCode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    // Appeler le onChange original si fourni
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.fullAddress);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    if (onAddressSelected) {
      onAddressSelected(suggestion);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          {...props}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className={cn("pr-10", className)}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <MapPin className="h-4 w-4" />
        </div>
      </div>

      {/* Dropdown des suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              className={cn(
                "w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors",
                index === selectedIndex && "bg-accent text-accent-foreground"
              )}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{suggestion.street}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {suggestion.city}, {suggestion.country}
                </div>
              </div>
            </button>
          ))}
          
          {/* Note pour Google Maps */}
          <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border bg-muted/50">
            💡 Pour plus de précision, configurez Google Maps Autocomplete
          </div>
        </div>
      )}
    </div>
  );
}