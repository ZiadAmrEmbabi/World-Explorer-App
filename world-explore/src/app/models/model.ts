export interface Country {
    country: string;
    iso2: string;
    iso3: string;
    cities: string[];
    population?: number; // Optional, in case it's not always provided
  }
  