export interface Country {
  code: string;
  name: string;
  flag: string;
  currency: string;
  cities: string[];
}

export const FCFA_COUNTRIES: Country[] = [
  {
    code: "BF",
    name: "Burkina Faso",
    flag: "🇧🇫",
    currency: "XOF",
    cities: [
      "Ouagadougou",
      "Bobo-Dioulasso", 
      "Koudougou",
      "Ouahigouya",
      "Banfora",
      "Tenkodogo",
      "Kaya",
      "Fada N'Gourma",
      "Dori",
      "Gaoua",
      "Réo",
      "Ziniaré",
      "Manga",
      "Djibo",
      "Kombissiri"
    ]
  },
  {
    code: "BJ",
    name: "Bénin",
    flag: "🇧🇯",
    currency: "XOF",
    cities: [
      "Cotonou",
      "Porto-Novo",
      "Parakou",
      "Djougou",
      "Bohicon",
      "Kandi",
      "Lokossa",
      "Ouidah",
      "Abomey",
      "Natitingou",
      "Savalou",
      "Pobè",
      "Kétou",
      "Malanville",
      "Tchaourou"
    ]
  },
  {
    code: "CI",
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    currency: "XOF",
    cities: [
      "Abidjan",
      "Yamoussoukro",
      "Bouaké",
      "Daloa",
      "Korhogo",
      "San-Pédro",
      "Man",
      "Divo",
      "Gagnoa",
      "Anyama",
      "Abengourou",
      "Agboville",
      "Grand-Bassam",
      "Bondoukou",
      "Odienné"
    ]
  },
  {
    code: "GW",
    name: "Guinée-Bissau",
    flag: "🇬🇼",
    currency: "XOF",
    cities: [
      "Bissau",
      "Bafatá",
      "Gabú",
      "Bissorã",
      "Bolama",
      "Cacheu",
      "Catió",
      "Canchungo",
      "Farim",
      "Mansôa",
      "Quinhámel",
      "Bubaque",
      "São Domingos",
      "Teixeira Pinto",
      "Bigene"
    ]
  },
  {
    code: "ML",
    name: "Mali",
    flag: "🇲🇱",
    currency: "XOF",
    cities: [
      "Bamako",
      "Sikasso",
      "Mopti",
      "Koutiala",
      "Ségou",
      "Kayes",
      "Gao",
      "Tombouctou",
      "Kati",
      "Markala",
      "Djenné",
      "Bandiagara",
      "Bla",
      "San",
      "Niono"
    ]
  },
  {
    code: "NE",
    name: "Niger",
    flag: "🇳🇪",
    currency: "XOF",
    cities: [
      "Niamey",
      "Zinder",
      "Maradi",
      "Agadez",
      "Tahoua",
      "Dosso",
      "Tillabéri",
      "Diffa",
      "Arlit",
      "Tessaoua",
      "Madaoua",
      "Dogondoutchi",
      "Birni N Konni",
      "Magaria",
      "Nguigmi"
    ]
  },
  {
    code: "SN",
    name: "Sénégal",
    flag: "🇸🇳",
    currency: "XOF",
    cities: [
      "Dakar",
      "Touba",
      "Thiès",
      "Kaolack",
      "Saint-Louis",
      "Ziguinchor",
      "Kolda",
      "Diourbel",
      "Tambacounda",
      "Mbour",
      "Rufisque",
      "Fatick",
      "Louga",
      "Kédougou",
      "Sédhiou"
    ]
  },
  {
    code: "TG",
    name: "Togo",
    flag: "🇹🇬",
    currency: "XOF",
    cities: [
      "Lomé",
      "Sokodé",
      "Kara",
      "Palimé",
      "Atakpamé",
      "Dapaong",
      "Tsévié",
      "Vogan",
      "Aného",
      "Mango",
      "Bassar",
      "Niamtougou",
      "Badou",
      "Tchamba",
      "Kétao"
    ]
  },
  {
    code: "CM",
    name: "Cameroun",
    flag: "🇨🇲",
    currency: "XAF",
    cities: [
      "Douala",
      "Yaoundé",
      "Garoua",
      "Bamenda",
      "Maroua",
      "Bafoussam",
      "Ngaoundéré",
      "Bertoua",
      "Loum",
      "Kumba",
      "Nkongsamba",
      "Buea",
      "Limbé",
      "Édéa",
      "Tiko"
    ]
  },
  {
    code: "CF",
    name: "République centrafricaine",
    flag: "🇨🇫",
    currency: "XAF",
    cities: [
      "Bangui",
      "Bimbo",
      "Berbérati",
      "Carnot",
      "Bambari",
      "Bouar",
      "Bossangoa",
      "Bria",
      "Bangassou",
      "Nola",
      "Kaga-Bandoro",
      "Sibut",
      "Mbaïki",
      "Zemio",
      "Obo"
    ]
  },
  {
    code: "TD",
    name: "Tchad",
    flag: "🇹🇩",
    currency: "XAF",
    cities: [
      "N'Djaména",
      "Moundou",
      "Sarh",
      "Abéché",
      "Kélo",
      "Koumra",
      "Pala",
      "Am Timan",
      "Bongor",
      "Mongo",
      "Doba",
      "Ati",
      "Laï",
      "Fada",
      "Moussoro"
    ]
  },
  {
    code: "CG",
    name: "République du Congo",
    flag: "🇨🇬",
    currency: "XAF",
    cities: [
      "Brazzaville",
      "Pointe-Noire",
      "Dolisie",
      "Nkayi",
      "Mossendjo",
      "Madingou",
      "Ouesso",
      "Sibiti",
      "Gamboma",
      "Impfondo",
      "Owando",
      "Kinkala",
      "Makoua",
      "Djambala",
      "Ewo"
    ]
  },
  {
    code: "GA",
    name: "Gabon",
    flag: "🇬🇦",
    currency: "XAF",
    cities: [
      "Libreville",
      "Port-Gentil",
      "Franceville",
      "Oyem",
      "Moanda",
      "Mouila",
      "Lambaréné",
      "Tchibanga",
      "Koulamoutou",
      "Makokou",
      "Bitam",
      "Gamba",
      "Mayumba",
      "Mitzic",
      "Ndendé"
    ]
  },
  {
    code: "GQ",
    name: "Guinée équatoriale",
    flag: "🇬🇶",
    currency: "XAF",
    cities: [
      "Malabo",
      "Bata",
      "Ebebiyin",
      "Aconibe",
      "Añisoc",
      "Luba",
      "Evinayong",
      "Mongomo",
      "Mengomeyén",
      "Mikomeseng",
      "Nsok",
      "Ayene",
      "Machinda",
      "Mbini",
      "Ncue"
    ]
  }
];

export const getCountryByCode = (code: string): Country | undefined => {
  return FCFA_COUNTRIES.find(country => country.code === code);
};

export const getCitiesByCountryCode = (countryCode: string): string[] => {
  const country = getCountryByCode(countryCode);
  return country ? country.cities : [];
};

export const getDefaultCountry = (): Country => {
  return FCFA_COUNTRIES.find(country => country.code === "BF") || FCFA_COUNTRIES[0];
};